import { v4 as uuidv4 } from "uuid";

export function makeRef(prefix: string) {
  return `${prefix}-${Date.now().toString().slice(-10)}-${uuidv4().slice(0, 6).toUpperCase()}`;
}
