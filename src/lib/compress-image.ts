// Browser-only: shrinks a photo before upload. Redrawing through a canvas also drops EXIF
// metadata (GPS location, device), which applicants shouldn't have to think about.

import { MAX_UPLOAD_IMAGE_BYTES } from "./apply-validation";

// Longest side in px, largest first: 1600 is plenty for reviewing a guestlist photo; the smaller
// sizes only kick in for very detailed photos that won't fit the byte budget otherwise.
const EDGES = [1600, 1280, 1024];
const QUALITIES = [0.82, 0.72, 0.62];

function toBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}

function isHeic(file: File): boolean {
  return /^image\/hei[cf]$/.test(file.type) || /\.hei[cf]$/i.test(file.name);
}

async function decode(file: File): Promise<ImageBitmap> {
  try {
    // "from-image" applies EXIF rotation so phone photos aren't sideways once metadata is gone.
    // Safari decodes HEIC natively here too.
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch (error) {
    if (!isHeic(file)) throw error;
    // Other browsers can't read HEIC; convert with libheif (WebAssembly, ~3 MB), loaded only when needed.
    const { heicTo } = await import("heic-to/next");
    return heicTo({ blob: file, type: "bitmap" });
  }
}

/** Returns a JPEG no larger than MAX_UPLOAD_IMAGE_BYTES (and 1600px). Throws if it can't. */
export async function compressImage(file: File): Promise<File> {
  const bitmap = await decode(file);
  const baseName = file.name.replace(/\.[^.]+$/, "") || "photo";
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available.");

  try {
    for (const edge of EDGES) {
      const scale = Math.min(1, edge / Math.max(bitmap.width, bitmap.height));
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      for (const quality of QUALITIES) {
        const blob = await toBlob(canvas, quality);
        if (blob && blob.size <= MAX_UPLOAD_IMAGE_BYTES) {
          return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
        }
      }
    }
  } finally {
    bitmap.close();
  }
  throw new Error("Image could not be compressed enough.");
}
