// Validation rules for the application form. Pure functions (no DOM, no server APIs) so the
// same rules can run in the browser now and again on the server when submission is wired up.
// Each returns an error reason, or undefined when the value is valid.

export const MIN_AGE = 18; // TODO: confirm with owner (site 18+, events possibly 21+)
export const MIN_PHOTOS = 1; // TODO: confirm with owner (previously one face + one shirtless photo)
export const MAX_PHOTOS = 5;
/** Largest photo someone can pick; it is compressed in the browser before upload. */
export const MAX_SOURCE_IMAGE_BYTES = 25 * 1024 * 1024;
/** Largest photo the server accepts after compression. 5 × 1 MB stays under Netlify's 6 MB body limit. */
export const MAX_UPLOAD_IMAGE_BYTES = 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png"];

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
  if (age < MIN_AGE) return `You must be ${MIN_AGE} or older to apply.`;
}

export function validateEvent(value: string): string | undefined {
  if (!value) return "Select the event you're applying to.";
}

/** Checks one picked photo before it is compressed. */
export function validateImage(file: File, maxBytes = MAX_SOURCE_IMAGE_BYTES): string | undefined {
  const isAccepted =
    ACCEPTED_IMAGE_TYPES.includes(file.type) && /\.(jpe?g|png)$/i.test(file.name);
  if (!isAccepted) return `${file.name} isn't a JPG or PNG image.`;
  if (file.size > maxBytes) {
    return `${file.name} is too large. Max size is ${maxBytes / 1024 / 1024} MB.`;
  }
}

/** Checks the set of photos being submitted (run again on the server against the compressed files). */
export function validatePhotos(files: File[], maxBytes = MAX_SOURCE_IMAGE_BYTES): string | undefined {
  if (files.length < MIN_PHOTOS) {
    return MIN_PHOTOS === 1 ? "Upload at least one photo." : `Upload at least ${MIN_PHOTOS} photos.`;
  }
  if (files.length > MAX_PHOTOS) return `Upload no more than ${MAX_PHOTOS} photos.`;
  for (const file of files) {
    const problem = validateImage(file, maxBytes);
    if (problem) return problem;
  }
}

export function validateConsent(checked: boolean): string | undefined {
  if (!checked) return "You need to agree to the waiver and policies to apply.";
}
