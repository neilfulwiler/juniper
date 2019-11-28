export function replace<T>(elements: T[], predicate: ((t: T) => boolean), overrides: Partial<T>) {
  const idx = elements.findIndex(predicate);
  return elements.slice(0, idx).concat(
    [
      { ...elements[idx], ...overrides },
    ],
  ).concat(elements.slice(idx + 1, elements.length));
}
