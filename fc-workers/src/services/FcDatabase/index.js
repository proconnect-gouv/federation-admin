import mongoose from 'mongoose';
import './models/accountModel';

class FcDatabase {
  static getInstance(config) {
    return mongoose.connect(config, {
      useNewUrlParser: true,
      useCreateIndex: true,
    });
  }
}

export default FcDatabase;
