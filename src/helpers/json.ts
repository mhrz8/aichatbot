export function safeJSONStringify(obj: any, maxLength = 100) {
  try {
    const str = JSON.stringify(obj);
    return str.length > maxLength ? str.slice(0, maxLength) + '... [truncated]' : str;
  } catch {
    return '[Unserializable Object]';
  }
}
