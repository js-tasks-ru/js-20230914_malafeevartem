/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size === 0) {
    return '';
  }

  if (!size) {
    return string;
  }

  const totalSymbols = [];

  let counter;
  let activeSymbol;

  for (const symbol of string) {
    if (symbol !== activeSymbol) {
      counter = 0;
      activeSymbol = symbol;
    }

    if (counter >= size) {
      continue;
    }

    counter += 1;
    totalSymbols.push(activeSymbol);
  }

  return totalSymbols.join('');
}
