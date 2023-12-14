import mongoose from 'mongoose';
import './models/accountModel';
import './models/clientModel';

class FcDatabase {
  static getInstance(config) {
    return mongoose.connect(config, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    });
  }
}

export default FcDatabase;
