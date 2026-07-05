export function normalizeIconName(name: string) {
  return name.replaceAll("-", "_");
}

export function denormalizeIconName(name: string) {
  return name.replaceAll("_", "-");
}