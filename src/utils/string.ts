/**
 * For example, if you have a string "café":
 * - after trim(), it remains "café".
 * - after normalize("NFD"), it becomes "café" (where "é" is split into "e" and "´").
 * - after replace(/[\u0300-\u036f]/g, ""), it becomes "cafe" (with the diacritic mark "´" removed).
 */
export const removeDiacritics = (str: string) => {
  // Trim leading and trailing whitespace from the string
  return str.trim()
    // Normalize the string into Unicode Normalization Form D (NFD)
    .normalize("NFD")
    // Replace combining diacritical marks with empty string
    // https://www.compart.com/en/unicode/block/U+0300
    .replace(/[\u0300-\u036f]/g, "")
}