import mongoose from 'mongoose';
import { accountSchema } from '../schemas/accountSchema';

export const accountModel = mongoose.model('account', accountSchema, 'account');
