import { createReadStream } from "node:fs";
import { mkdir, readFile, rm } from "node:fs/promises";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import type { StorageAdapter } from "./storage.interface.js";

export class LocalFsStorageAdapter implements StorageAdapter {
  constructor(
    private readonly rootDir: string,
    private readonly publicPrefix: string = "/uploads",
  ) {}

  async putObject(buffer: Buffer, key: string): Promise<{ url: string; key: string }> {
    const filePath = path.join(this.rootDir, key);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, buffer);
    return { url: `${this.publicPrefix}/${key.split(path.sep).join("/")}`, key };
  }

  getObjectStream(key: string) {
    return createReadStream(path.join(this.rootDir, key));
  }

  async getObjectBuffer(key: string): Promise<Buffer> {
    return readFile(path.join(this.rootDir, key));
  }

  async deleteObject(key: string): Promise<void> {
    await rm(path.join(this.rootDir, key), { force: true });
  }

  keyFromPublicUrl(url: string): string {
    const prefix = `${this.publicPrefix}/`;
    if (!url.startsWith(prefix)) {
      throw new Error(`URL "${url}" is not under this adapter's public prefix "${this.publicPrefix}"`);
    }
    return url.slice(prefix.length);
  }
}
