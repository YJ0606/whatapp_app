import axios from "axios";

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const msg = error.response?.data?.message;
    if (Array.isArray(msg)) return msg[0] ?? fallback;
    if (typeof msg === "string") return msg;
  }
  return fallback;
}
