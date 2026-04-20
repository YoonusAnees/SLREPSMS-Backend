export function makeReceiptNo() {
  // Example: SLREPMS-20260228-8H2K9Q
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `SLREPMS-${y}${m}${day}-${rand}`;
}