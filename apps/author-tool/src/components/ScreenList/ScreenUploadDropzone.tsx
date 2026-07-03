import { useRef, useState } from "react";
import type { DragEvent } from "react";
import { useTrainerStore } from "../../store/trainer-store.js";

export function ScreenUploadDropzone() {
  const addScreen = useTrainerStore((s) => s.addScreen);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function uploadFiles(files: FileList | File[]) {
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        await addScreen(file);
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      className={isDragging ? "upload-dropzone upload-dropzone--active" : "upload-dropzone"}
      onDragOver={(e: DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        void uploadFiles(e.dataTransfer.files);
      }}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        hidden
        onChange={(e) => e.target.files && void uploadFiles(e.target.files)}
      />
      {uploading ? "Загрузка..." : "Перетащите скриншоты сюда или нажмите, чтобы выбрать файлы"}
    </div>
  );
}
