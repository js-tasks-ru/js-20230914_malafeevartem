/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
const sortAsc = (a, b) => a.localeCompare(b, ['ru', 'en'], { caseFirst: 'upper' });
const sortDesc = (a, b) => b.localeCompare(a, ['ru', 'en'], { caseFirst: 'upper' });

export const sortStrings = (arr, param = 'asc') => {
  const sortFn = (param === 'asc') ? sortAsc : sortDesc;
  return [...arr].sort(sortFn);
};
