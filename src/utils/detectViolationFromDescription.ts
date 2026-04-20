export function detectViolationFromDescription(description?: string | null): string | null {
  if (!description) return null;

  const text = description.toLowerCase();

  if (
    text.includes("drunk") ||
    text.includes("drunken") ||
    text.includes("drink drive") ||
    text.includes("drunk driving")
  ) {
    return "DRUNK_DRIVE";
  }

  if (
    text.includes("reckless") ||
    text.includes("dangerous driving")
  ) {
    return "RECKLESS_DRIVING";
  }

  if (
    text.includes("no helmet") ||
    text.includes("without helmet")
  ) {
    return "NO_HELMET";
  }

  if (
    text.includes("red light") ||
    text.includes("signal jump")
  ) {
    return "RED_LIGHT_VIOLATION";
  }

  return null;
}