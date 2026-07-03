export interface ExportAsset {
  screenId: string;
  buffer: Buffer;
}

export interface ExportOptions {
  playerBundleDir: string;
  imageMaxDimension?: number;
  imageQuality?: number;
  maxPackageSizeBytes?: number;
}

export interface ExportResult {
  zipBuffer: Buffer;
  sizeBytes: number;
  warnings: string[];
}
