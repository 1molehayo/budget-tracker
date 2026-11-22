import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const srcRoot = path.join(process.cwd(), "src");
const phosphorStub = pathToFileURL(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "phosphor-stub.mjs"),
).href;

export async function resolve(specifier, context, nextResolve) {
  if (
    specifier === "@phosphor-icons/react" ||
    specifier.startsWith("@phosphor-icons/react/")
  ) {
    return {
      shortCircuit: true,
      url: phosphorStub,
    };
  }

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
