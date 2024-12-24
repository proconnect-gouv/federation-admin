// Inputs to be casted as `true`
const truthy = ['true', 'on', '1', true, 1];

// Inputs to be casted as `false`
const falsy = ['false', 'off', '0', false, 0];

/**
 * parse input and return the boolean value according to mapping defined
 * in `truthy` and `falsy` variable defined above.
 *
 * Any input not in those mappings will result in an `undefined` result
 *
 * This helper function is used to cast data from process.env in config files.
 */
export default function parseBoolean(property) {
  let input = property;

  if (input instanceof String || typeof input === 'string') {
    input = input.toLowerCase();
  }

  if (truthy.includes(input)) {
    return true;
  }
  if (falsy.includes(input)) {
    return false;
  }
  return undefined;
}
