import mongoose from 'mongoose';
import { clientSchema } from '../schemas/clientSchema';

export const clientModel = mongoose.model('client', clientSchema, 'client');
