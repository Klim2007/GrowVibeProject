import type { Readable } from "node:stream";

export interface StorageAdapter {
  putObject(buffer: Buffer, key: string): Promise<{ url: string; key: string }>;
  getObjectStream(key: string): Readable;
  getObjectBuffer(key: string): Promise<Buffer>;
  deleteObject(key: string): Promise<void>;
  keyFromPublicUrl(url: string): string;
}
