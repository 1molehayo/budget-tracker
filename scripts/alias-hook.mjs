import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const srcRoot = path.join(process.cwd(), "src");

export async function resolve(specifier, context, nextResolve) {
  if (!specifier.startsWith("@/")) {
    return nextResolve(specifier, context);
  }

  const base = path.join(srcRoot, specifier.slice(2));
  const candidates = [base, `${base}.ts`, `${base}.tsx`, path.join(base, "index.ts")];
  const file = candidates.find((candidate) => existsSync(candidate));

  if (!file) {
    return nextResolve(specifier, context);
  }

  return nextResolve(pathToFileURL(file).href, context);
}
