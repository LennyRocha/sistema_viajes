import { BadRequestException } from '@nestjs/common';
import { LicenciasService } from './licencias.service';

describe('LicenciasService', () => {
  let service: LicenciasService;
  let prisma: {
    licencia: {
      update: jest.Mock;
      create: jest.Mock;
      updateMany: jest.Mock;
      findFirst: jest.Mock;
      findUnique: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let redis: {
    del: jest.Mock;
  };
  let conductores: {
    findOne: jest.Mock;
  };

  const currentLicencia = {
    id: 12,
    conductor_id: 7,
    numero_licencia: 'A123456789',
    categoria: 'TIPO A',
    fecha_expedicion: new Date('2024-01-15T00:00:00.000Z'),
    fecha_vencimiento: new Date('2027-01-14T00:00:00.000Z'),
    estado_emisor: 'Cdmx',
    imagen_licencia: 'https://ejemplo.com/anterior.jpg',
    vigente: true,
  };

  beforeEach(() => {
    prisma = {
      licencia: {
        update: jest.fn(),
        create: jest.fn(),
        updateMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    redis = {
      del: jest.fn().mockResolvedValue(undefined),
    };

    conductores = {
      findOne: jest.fn().mockResolvedValue({
        id: 7,
        institucion_id: 3,
      }),
    };

    const logger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    service = new LicenciasService(
      prisma as any,
      redis as any,
      conductores as any,
      logger as any,
    );
  });

  it('actualiza por conductor apuntando siempre a la licencia vigente', async () => {
    jest.spyOn(service, 'findVigenteByConductor').mockResolvedValue(currentLicencia as any);
    const updateSpy = jest
      .spyOn(service, 'update')
      .mockResolvedValue({ ...currentLicencia, estado_emisor: 'Puebla' } as any);

    await service.updateVigenteByConductor(7, {
      conductor_id: 99,
      estado_emisor: 'Puebla',
      vigente: false,
    });

    expect(updateSpy).toHaveBeenCalledWith(12, {
      estado_emisor: 'Puebla',
      conductor_id: 7,
      vigente: true,
    });
  });

  it('renueva creando historial y desactivando la licencia anterior', async () => {
    jest.spyOn(service, 'findVigenteByConductor').mockResolvedValue(currentLicencia as any);

    prisma.$transaction.mockImplementation(async (callback) =>
      callback({
        licencia: {
          update: prisma.licencia.update.mockResolvedValue({
            ...currentLicencia,
            vigente: false,
          }),
          create: prisma.licencia.create.mockResolvedValue({
            ...currentLicencia,
            id: 13,
            fecha_expedicion: new Date('2027-01-15T00:00:00.000Z'),
            fecha_vencimiento: new Date('2030-01-14T00:00:00.000Z'),
            imagen_licencia: 'https://ejemplo.com/nueva.jpg',
          }),
        },
      }),
    );

    const result = await service.renewVigenteByConductor(7, {
      fecha_expedicion: new Date('2027-01-15T00:00:00.000Z'),
      fecha_vencimiento: new Date('2030-01-14T00:00:00.000Z'),
      imagen_licencia: 'https://ejemplo.com/nueva.jpg',
    });

    expect(prisma.licencia.update).toHaveBeenCalledWith({
      where: { id: 12 },
      data: { vigente: false },
    });
    expect(prisma.licencia.create).toHaveBeenCalledWith({
      data: {
        conductor_id: 7,
        numero_licencia: 'A123456789',
        categoria: 'TIPO A',
        fecha_expedicion: expect.any(Date),
        fecha_vencimiento: expect.any(Date),
        estado_emisor: 'Cdmx',
        imagen_licencia: 'https://ejemplo.com/nueva.jpg',
        vigente: true,
      },
    });
    expect(result.id).toBe(13);
    expect(redis.del).toHaveBeenCalledWith('licencias:list:all');
    expect(redis.del).toHaveBeenCalledWith('conductores:list:all');
  });

  it('rechaza renovaciones con vencimiento menor o igual a expedicion', async () => {
    jest.spyOn(service, 'findVigenteByConductor').mockResolvedValue(currentLicencia as any);

    await expect(
      service.renewVigenteByConductor(7, {
        fecha_expedicion: new Date('2027-01-15T00:00:00.000Z'),
        fecha_vencimiento: new Date('2027-01-15T00:00:00.000Z'),
        imagen_licencia: 'https://ejemplo.com/nueva.jpg',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
