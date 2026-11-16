// Validation rules for the application form. Pure functions (no DOM, no server APIs) so the
// same rules can run in the browser now and again on the server when submission is wired up.
// Each returns an error reason, or undefined when the value is valid.

export const MIN_AGE = 18; // Site and events are 18+.
export const UNDERAGE_MESSAGE = `You must be ${MIN_AGE} or older to apply.`;
export const MIN_PHOTOS = 1; // TODO: confirm with owner (previously one face + one shirtless photo)
export const MAX_PHOTOS = 4; // Guide: upload area takes a maximum of four photos.
/** Largest photo someone can pick; it is compressed in the browser before upload. */
export const MAX_SOURCE_IMAGE_BYTES = 25 * 1024 * 1024;
/**
 * Budget for all photos together after compression. Under ~4 MB keeps the request inside the
 * host's function body limit (Netlify 6 MB, which base64-encodes binary bodies; Vercel 4.5 MB).
 */
export const MAX_UPLOAD_TOTAL_BYTES = 3.5 * 1024 * 1024;
/** Largest single photo after compression, so a full set always fits the total budget. */
export const MAX_UPLOAD_IMAGE_BYTES = Math.floor(MAX_UPLOAD_TOTAL_BYTES / MAX_PHOTOS);
/** What is uploaded: compression always outputs JPEG; PNG is still accepted. */
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png"];
/** What can be picked. HEIC/HEIF (iPhone) is converted to JPEG in the browser. */
export const SOURCE_IMAGE_TYPES = [...ACCEPTED_IMAGE_TYPES, "image/heic", "image/heif"];

/** Form fields an error can point at. */
export type ApplyField = "name" | "email" | "dob" | "event" | "photos" | "consent";

/** What POST /api/apply returns to the browser. */
export type ApplyResponse =
  | { ok: true; submissionId?: string }
  | { ok: false; error: string; message: string; field?: ApplyField };

export function validateName(value: string): string | undefined {
  const name = value.trim();
  if (!name) return "Enter your name.";
  if (name.length > 100) return "Name must be 100 characters or fewer.";
}

export function validateEmail(value: string): string | undefined {
  const email = value.trim();
  if (!email) return "Enter your email address.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return "Enter a valid email, like alex@example.com.";
}

/** Keeps digits only and inserts slashes as the user types: MM/DD/YYYY. */
export function formatDobInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/** "04/12/1995" → "1995-04-12". Only call on a value that passed validateDob. */
export function dobToIso(value: string): string {
  const [month, day, year] = value.trim().split("/");
  return `${year}-${month}-${day}`;
}

export function validateDob(value: string, now = new Date()): string | undefined {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) return "Enter your date of birth as MM/DD/YYYY.";
  const [month, day, year] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(year, month - 1, day);
  const isRealDate =
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  if (!isRealDate || year < 1900) return "Enter a real date of birth as MM/DD/YYYY.";
  if (date > now) return "Date of birth can't be in the future.";
  const hadBirthday =
    now.getMonth() > date.getMonth() ||
    (now.getMonth() === date.getMonth() && now.getDate() >= date.getDate());
  const age = now.getFullYear() - year - (hadBirthday ? 0 : 1);
  if (age < MIN_AGE) return UNDERAGE_MESSAGE;
}

export function validateEvent(value: string): string | undefined {
  if (!value) return "Select the event you're applying to.";
}

/** Checks one picked photo before it is compressed. */
export function validateSourceImage(file: File): string | undefined {
  // Some browsers (Chrome on Windows, Firefox) report HEIC files with an empty type.
  const isAccepted =
    /\.(jpe?g|png|heic|heif)$/i.test(file.name) && (file.type === "" || SOURCE_IMAGE_TYPES.includes(file.type));
  if (!isAccepted) return `${file.name} isn't a JPG, PNG or HEIC image.`;
  if (file.size > MAX_SOURCE_IMAGE_BYTES) {
    return `${file.name} is too large. Max size is ${MAX_SOURCE_IMAGE_BYTES / 1024 / 1024} MB.`;
  }
}

/** Checks one compressed photo as it will be uploaded. */
export function validateImage(file: File): string | undefined {
  const isAccepted = ACCEPTED_IMAGE_TYPES.includes(file.type) && /\.(jpe?g|png)$/i.test(file.name);
  if (!isAccepted) return `${file.name} isn't a JPG or PNG image.`;
  if (file.size > MAX_UPLOAD_IMAGE_BYTES) return `${file.name} is too large to upload.`;
}

/** Checks the set of compressed photos being submitted (run in the browser and again on the server). */
export function validatePhotos(files: File[]): string | undefined {
  if (files.length < MIN_PHOTOS) {
    return MIN_PHOTOS === 1 ? "Upload at least one photo." : `Upload at least ${MIN_PHOTOS} photos.`;
  }
  if (files.length > MAX_PHOTOS) return `Upload no more than ${MAX_PHOTOS} photos.`;
  for (const file of files) {
    const problem = validateImage(file);
    if (problem) return problem;
  }
  const total = files.reduce((sum, file) => sum + file.size, 0);
  if (total > MAX_UPLOAD_TOTAL_BYTES) return "Your photos are too large together. Remove one and try again.";
}

export function validateConsent(checked: boolean): string | undefined {
  if (!checked) return "You need to agree to the waiver and policies to apply.";
}
