export function firstZodIssueMessage(error, fallback = "Validation failed") {
  const list = error?.issues ?? error?.errors;
  const msg = Array.isArray(list) ? list[0]?.message : undefined;
  return msg || fallback;
}
