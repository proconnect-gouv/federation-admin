export class MissingInputError extends Error {
  constructor(missings, ...params) {
    super(...params);
    this.name = 'MissingInputError';
    this.type = 'input';
    this.stack = missings;
  }
}

export class MissingValidatorError extends Error {}

export class InvalidInputError extends Error {
  constructor(invalids, ...params) {
    super(...params);
    this.name = 'InvalidInputError';
    this.type = 'input';
    this.stack = invalids;
  }
}
