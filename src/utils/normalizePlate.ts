export function normalizePlate(input: string) {
  // Example: " caa-1234 " -> "CAA1234"
  return input
    .trim()
    .toUpperCase()
    .replace(/[\s-]/g, "");
}