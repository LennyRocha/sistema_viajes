import { ConductorImageCategory } from "../api/conductorApi";

type UploadImage = (request: {
  file: File;
  category: ConductorImageCategory;
}) => { unwrap: () => Promise<{ url: string }> };

export async function persistConductorImage(
  value: string,
  category: ConductorImageCategory,
  uploadImage: UploadImage,
) {
  if (!value.startsWith("data:image/")) return value;

  const response = await fetch(value);
  const blob = await response.blob();
  const extension = blob.type.split("/")[1] || "jpg";
  const file = new File(
    [blob],
    `${category}-${Date.now()}.${extension}`,
    { type: blob.type },
  );

  const uploaded = await uploadImage({ file, category }).unwrap();
  return uploaded.url;
}
