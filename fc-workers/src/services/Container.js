class Container {
  constructor() {
    this.services = {};
    this.instanciators = {};
  }

  /**
   * @param {String} instanceName
   * @param {Object} instance Instance of the service
   * @returns {Container} container instance
   */
  add(instanceName, instanciator) {
    if (typeof this.instanciators[instanceName] !== 'undefined') {
      throw new Error('A service with this name already exists');
    }

    this.instanciators[instanceName] = instanciator;

    return this;
  }

  getMultiples(names) {
    return names.reduce((services, name) => {
      // eslint-disable-next-line no-param-reassign
      services[name] = this.get(name);
      return services;
    }, {});
  }

  /**
   * @param {String} instanceName
   * @returns {Object} service instance
   */
  get(instanceName) {
    if (Array.isArray(instanceName)) {
      return this.getMultiples(instanceName);
    }

    if (typeof this.instanciators[instanceName] === 'function') {
      this.services[instanceName] = this.instanciators[instanceName].call();
      delete this.instanciators[instanceName];
    }

    if (typeof this.services[instanceName] !== 'undefined') {
      return this.services[instanceName];
    }

    throw new Error(`No service registred for this name: ${instanceName}`);
  }

  /**
   * @param {String} instanceName
   * @returns {Container} container instance
   */
  remove(instanceName) {
    if (typeof this.services[instanceName] === 'undefined') {
      throw new Error('Tried to remove a non-existing service');
    }

    delete this.services[instanceName];

    return this;
  }
}

export default Container;
