export function isLibraryId(id: string): boolean {
  return id.startsWith('l.') || id.startsWith('i.') || id.startsWith('p.');
}
