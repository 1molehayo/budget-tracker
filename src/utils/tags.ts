export function getTagDisplayName(tag?: { code: string; label?: string | null } | null) {
  if (!tag) return "Unassigned";
  return tag.label?.trim() || tag.code;
}
