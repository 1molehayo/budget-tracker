export function readActionError(result: void | { error?: string }) {
  if (result && typeof result === "object" && "error" in result && typeof result.error === "string") {
    return result.error;
  }

  return undefined;
}
