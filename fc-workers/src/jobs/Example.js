import Job from './Job';

class Example extends Job {
  static usage() {
    return 'I am just an example';
  }

  static run() {
    // This is an example let's keep it dumb
    // eslint-disable-next-line no-console
    console.log('I do nothing... but I nail it!');
  }
}

Example.description = 'An example job';

export default Example;
