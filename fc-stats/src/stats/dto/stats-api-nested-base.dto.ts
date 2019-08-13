export class BaseNestedDTO {
  constructor(properties) {
    Object.keys(properties).forEach(name => {
      this[name] = properties[name];
    });
  }
}
