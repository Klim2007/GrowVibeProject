import sharp from "sharp";

export interface OptimizeResult {
  buffer: Buffer;
  originalBytes: number;
  optimizedBytes: number;
  extension: "png" | "jpg";
}

export async function optimizeImage(buffer: Buffer, maxDimension: number, quality: number): Promise<OptimizeResult> {
  const originalBytes = buffer.length;
  const image = sharp(buffer).rotate();
  const metadata = await image.metadata();
  const needsResize = (metadata.width ?? 0) > maxDimension || (metadata.height ?? 0) > maxDimension;

  const pipeline = needsResize
    ? image.resize({ width: maxDimension, height: maxDimension, fit: "inside", withoutEnlargement: true })
    : image;

  const keepAsPng = metadata.format === "png";
  const optimized = keepAsPng
    ? await pipeline.png({ quality, compressionLevel: 9 }).toBuffer()
    : await pipeline.jpeg({ quality }).toBuffer();

  return {
    buffer: optimized,
    originalBytes,
    optimizedBytes: optimized.length,
    extension: keepAsPng ? "png" : "jpg",
  };
}
