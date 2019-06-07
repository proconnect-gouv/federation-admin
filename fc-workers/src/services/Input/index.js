import * as validators from './validators';
import * as errors from './errors';

class Input {
  static getMissingMandatories(schema, input) {
    return Object.keys(schema).filter(
      key => schema[key].mandatory && typeof input[key] === 'undefined'
    );
  }

  static getInvalidInputs(schema, input) {
    return Object.keys(schema).filter(key => {
      const { type } = schema[key];

      // Consider no type declaration as "any type allowed"
      if (!type) {
        return false;
      }

      if (typeof validators[type] === 'undefined') {
        throw new errors.MissingValidatorError(
          `Schema error: No validator defined for type <${type}>`
        );
      }

      return !validators[type].call(null, input[key]);
    });
  }

  static getSchemaValues(schema, input) {
    const values = {};
    Object.keys(schema).forEach(key => {
      values[key] = input[key];
    });

    return values;
  }

  static get(schema, input) {
    const missings = this.getMissingMandatories(schema, input);
    if (missings.length > 0) {
      throw new errors.MissingInputError(missings, 'Missing mandatory inputs');
    }

    const invalids = this.getInvalidInputs(schema, input);
    if (invalids.length > 0) {
      throw new errors.InvalidInputError(invalids, 'invalids inputs');
    }

    return this.getSchemaValues(schema, input);
  }
}

export default Input;
