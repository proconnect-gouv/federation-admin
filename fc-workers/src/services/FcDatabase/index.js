import mongoose from 'mongoose';
import './models/accountModel';
import './models/clientModel';

class FcDatabase {
  static getInstance(config) {
    const { uri, ...options } = config;

    return mongoose.connect(uri, options);
  }
}

export default FcDatabase;
