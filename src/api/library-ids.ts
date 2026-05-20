import { throwInvalidLibraryIdError } from './call-native';

/** True when `id` uses an Apple Music library prefix (`i.`, `l.`, `p.`). */
export function isLibraryId(id: string): boolean {
  return id.startsWith('l.') || id.startsWith('i.') || id.startsWith('p.');
}

export function assertLibraryId(id: string, label: string): void {
  if (!isLibraryId(id)) {
    throwInvalidLibraryIdError(label, id);
  }
}
