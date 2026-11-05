// Browser-only: shrinks a photo before upload. Redrawing through a canvas also drops EXIF
// metadata (GPS location, device), which applicants shouldn't have to think about.

import { MAX_UPLOAD_IMAGE_BYTES } from "./apply-validation";

const MAX_EDGE = 1600; // px on the longest side — plenty for reviewing a guestlist photo
const QUALITIES = [0.82, 0.72, 0.62, 0.5];

function toBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}

/** Returns a JPEG no larger than MAX_EDGE px and MAX_UPLOAD_IMAGE_BYTES. Throws if it can't. */
export async function compressImage(file: File): Promise<File> {
  // "from-image" applies EXIF rotation so phone photos aren't sideways once metadata is gone.
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available.");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const baseName = file.name.replace(/\.[^.]+$/, "") || "photo";
  for (const quality of QUALITIES) {
    const blob = await toBlob(canvas, quality);
    if (blob && blob.size <= MAX_UPLOAD_IMAGE_BYTES) {
      return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
    }
  }
  throw new Error("Image could not be compressed enough.");
}
