import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";
import { HttpError } from "../lib/http-error.js";
import { storage } from "../lib/storage.js";

const ALLOWED_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

export async function storeUploadedScreenImage(
  trainerId: string,
  buffer: Buffer,
): Promise<{ url: string; width: number; height: number }> {
  const detected = await fileTypeFromBuffer(buffer);
  if (!detected || !ALLOWED_MIME_TYPES.has(detected.mime)) {
    throw new HttpError(400, "unsupported_image_type");
  }

  const metadata = await sharp(buffer).metadata();
  if (!metadata.width || !metadata.height) {
    throw new HttpError(400, "unreadable_image");
  }

  const safeExt = detected.ext;
  const key = `${trainerId}/${crypto.randomUUID()}.${safeExt}`;
  const { url } = await storage.putObject(buffer, key);

  return { url, width: metadata.width, height: metadata.height };
}
