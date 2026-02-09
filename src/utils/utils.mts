export function extractSDP(message: string): string | null {
  const parts = message.split("\r\n\r\n");
  if (parts.length > 1 && parts[1] !== undefined) {
    return ensureEndsWithCRLF(parts[1].trim());
  }
  return null;
}

function ensureEndsWithCRLF(str: string): string {
  return str.endsWith("\r\n") ? str : str + "\r\n";
}
