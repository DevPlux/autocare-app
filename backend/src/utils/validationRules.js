import { z } from 'zod';

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email().max(254));

export const timeSlotPattern =
  /^([01]\d|2[0-3]):[0-5]\d-([01]\d|2[0-3]):[0-5]\d$/;

export function isValidTimeSlot(value) {
  return (
    typeof value === 'string' &&
    timeSlotPattern.test(value) &&
    value.slice(0, 5) < value.slice(6)
  );
}

export function isCalendarDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return (
    Number.isFinite(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

export function isUtcMidnight(value) {
  return (
    value instanceof Date &&
    Number.isFinite(value.getTime()) &&
    value.getUTCHours() === 0 &&
    value.getUTCMinutes() === 0 &&
    value.getUTCSeconds() === 0 &&
    value.getUTCMilliseconds() === 0
  );
}

export function isCloudinaryImageUrl(value) {
  // Images are optional until one is uploaded through the API.
  if (value === '') return true;
  if (typeof value !== 'string') return false;

  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      url.hostname === 'res.cloudinary.com' &&
      !url.username &&
      !url.password &&
      !url.port &&
      /^\/[^/]+\/image\/upload\/.+/.test(url.pathname)
    );
  } catch {
    return false;
  }
}
