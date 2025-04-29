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

// https://regex101.com/r/Y1UQsG/1
// https://unicode.org/Public/emoji/latest/
// https://github.com/slevithan/emoji-regex-xs/blob/main/regex.mjs
export const removeEmojis = (str: string) => {
  const r = String.raw;
  const base = r`\p{Emoji}(?:\p{EMod}|[\u{E0020}-\u{E007E}]+\u{E007F}|\uFE0F?\u20E3?)`;
  const regex = new RegExp(r`\p{RI}{2}|(?![#*\d](?!\uFE0F?\u20E3))${base}(?:\u200D${base})*`, 'gu');
  // Remove emojis from the string using a regular expression
  return str.replace(regex, "")
}