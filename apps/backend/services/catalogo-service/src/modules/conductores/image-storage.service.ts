import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'node:crypto';

export type ImageCategory = 'profiles' | 'licenses';

export type UploadedImage = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
};

const EXTENSIONS_BY_MIME_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

@Injectable()
export class ImageStorageService {
  private readonly bucket = process.env.S3_IMAGES_BUCKET?.trim();
  private readonly region = process.env.AWS_REGION?.trim() || 'us-east-1';
  private readonly publicBaseUrl = process.env.S3_PUBLIC_BASE_URL?.trim().replace(/\/$/, '');
  private readonly storageMode = (
    process.env.IMAGE_STORAGE_MODE || (this.bucket ? 's3' : 'database')
  ).toLowerCase();
  private readonly s3 = this.bucket ? new S3Client({ region: this.region }) : null;

  async upload(file: UploadedImage | undefined, category: string | undefined) {
    if (!file) {
      throw new BadRequestException('Selecciona una imagen');
    }

    const extension = EXTENSIONS_BY_MIME_TYPE[file.mimetype];
    if (!extension) {
      throw new BadRequestException('La imagen debe ser JPG, PNG o WEBP');
    }

    const normalizedCategory = this.normalizeCategory(category);

    if (this.storageMode !== 's3') {
      return {
        url: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        storage: 'database' as const,
      };
    }

    if (!this.bucket || !this.s3) {
      throw new ServiceUnavailableException(
        'El almacenamiento S3 no esta configurado',
      );
    }

    if (normalizedCategory === 'profiles' && !this.publicBaseUrl) {
      throw new ServiceUnavailableException(
        'S3_PUBLIC_BASE_URL es obligatorio para publicar fotos de perfil',
      );
    }

    const now = new Date();
    const key = [
      'conductores',
      normalizedCategory,
      String(now.getUTCFullYear()),
      String(now.getUTCMonth() + 1).padStart(2, '0'),
      `${randomUUID()}.${extension}`,
    ].join('/');

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        CacheControl: 'public, max-age=31536000, immutable',
        ServerSideEncryption: 'AES256',
      }),
    );

    return {
      url:
        normalizedCategory === 'profiles'
          ? `${this.publicBaseUrl}/${key}`
          : `s3://${this.bucket}/${key}`,
      key,
      storage: 's3' as const,
    };
  }

  private normalizeCategory(category?: string): ImageCategory {
    if (category === 'profiles' || category === 'licenses') {
      return category;
    }

    throw new BadRequestException('La categoria de imagen no es valida');
  }
}
