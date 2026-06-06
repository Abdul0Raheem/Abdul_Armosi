/** Max characters for an inline image stored in Firestore (~300KB). */
export const MAX_INLINE_IMAGE_LENGTH = 300_000;

export function prepareProductImage(image: string, previousImage?: string) {
  const trimmed = image.trim();
  if (!trimmed) return "";

  if (trimmed === previousImage?.trim()) {
    return trimmed;
  }

  if (trimmed.length > MAX_INLINE_IMAGE_LENGTH) {
    throw new Error(
      "Image is too large to save. Use a smaller photo or paste an image URL instead.",
    );
  }

  return trimmed;
}

export function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    }),
  ]);
}
