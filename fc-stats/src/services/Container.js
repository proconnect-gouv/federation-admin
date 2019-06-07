class Container {
  constructor() {
    this.services = {};
  }

  /**
   * @param {String} instanceName
   * @param {Object} instance Instance of the service
   * @returns {Container} container instance
   */
  add(instanceName, instance) {
    if (typeof this.services[instanceName] !== 'undefined') {
      throw new Error('A service with this name already exists');
    }

    this.services[instanceName] = instance;

    return this;
  }

  /**
   * @param {String} instanceName
   * @returns {Object} service instance
   */
  get(instanceName) {
    if (typeof this.services[instanceName] !== 'undefined') {
      return this.services[instanceName];
    }

    throw new Error('No service registred for this name');
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
