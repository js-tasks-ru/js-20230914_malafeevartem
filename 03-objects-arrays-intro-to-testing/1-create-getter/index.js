/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const properties = path.split('.');
  const walk = (object) => {
    const iter = (currentValue, [property, ...properties]) => {
      if (!property) {
        return currentValue;
      }

      if (currentValue.hasOwnProperty(property)) {
        return iter(currentValue[property], properties);
      }
    };

    return iter(object, properties);
  };

  return walk;
}
