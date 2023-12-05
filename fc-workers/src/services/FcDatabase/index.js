import mongoose from 'mongoose';
import './models/accountModel';
import './models/clientModel';

class FcDatabase {
  static getInstance(config) {
    /**
     * Disable deprecated behavior
     * @see https://github.com/Automattic/mongoose/issues/12666
     */
    mongoose.set('strictQuery', true);

    return mongoose.connect(config, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      authSource: process.env.FC_DB_DATABASE,
      tls: true,
      tlsCAFile: process.env.FC_DB_TLS_CA_FILE,
      tlsAllowInvalidHostnames: false,
    });
  }
}

export default FcDatabase;
