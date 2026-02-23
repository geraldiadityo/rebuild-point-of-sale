export function getAbbreviation(name: string, singleWordLength: number = 2): string {
  if (!name) return '';

  const words = name.trim().split(/\s+/);
  let abbreviation = '';

  if (words.length > 1) {
    // Contoh: "Susu UHT" -> ["Susu", "UHT"] -> "SU"
    abbreviation = words.map(word => word[0]).join('');
  } else {
    // Contoh: "Minuman" -> "MI"
    abbreviation = words[0].substring(0, singleWordLength);
  }

  return abbreviation.toUpperCase();
}

export function compareArrays<T, K>(
  originalArray: T[],
  newArray: T[],
  getKey: (item: T) => K
): { toCreate: T[]; toUpdate: T[]; toDelete: T[] } {
  const originalKeys = new Set(originalArray.map(getKey));
  const newKeys = new Set(newArray.map(getKey));

  const toCreate = newArray.filter((item) => !originalKeys.has(getKey(item)));
  const toUpdate = newArray.filter((item) => originalKeys.has(getKey(item)));
  const toDelete = originalArray.filter((item) => !newKeys.has(getKey(item)));

  return { toCreate, toUpdate, toDelete };
}