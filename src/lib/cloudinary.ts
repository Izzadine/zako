import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const HAS_CLOUDINARY = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

// Upload avec compression agressive (clé pour la faible bande passante).
export async function uploadImage(fileBuffer: Buffer): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "zako",
          transformation: [
            { width: 1000, crop: "limit" },
            { quality: "auto:low" },
            { fetch_format: "auto" },
          ],
        },
        (err, res) =>
          err || !res ? reject(err ?? new Error("upload failed")) : resolve({ url: res.secure_url, publicId: res.public_id })
      )
      .end(fileBuffer);
  });
}

export async function deleteImage(publicId: string): Promise<void> {
  if (!publicId || publicId === "demo") return;
  await cloudinary.uploader.destroy(publicId);
}
