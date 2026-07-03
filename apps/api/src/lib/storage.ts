import path from "node:path";
import { LocalFsStorageAdapter } from "../services/storage/local-fs-storage.js";
import { env } from "./env.js";

export const storage = new LocalFsStorageAdapter(path.resolve(env.UPLOAD_DIR));
