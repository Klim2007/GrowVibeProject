import archiver from "archiver";

export interface ZipEntry {
  path: string;
  content: Buffer;
}

export interface ZipDirectory {
  sourceDir: string;
  destDir: string;
}

export async function assembleZip(entries: ZipEntry[], directories: ZipDirectory[] = []): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const archive = archiver("zip", { zlib: { level: 9 } });
    const chunks: Buffer[] = [];

    archive.on("data", (chunk: Buffer) => chunks.push(chunk));
    archive.on("warning", (err) => {
      if (err.code !== "ENOENT") reject(err);
    });
    archive.on("error", reject);
    archive.on("end", () => resolve(Buffer.concat(chunks)));

    for (const dir of directories) {
      archive.directory(dir.sourceDir, dir.destDir);
    }
    for (const entry of entries) {
      archive.append(entry.content, { name: entry.path });
    }

    void archive.finalize();
  });
}
