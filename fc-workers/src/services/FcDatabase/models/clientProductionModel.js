import mongoose from 'mongoose';
import { clientProductionSchema } from '../schemas/clientProduction';

export const accountModel = mongoose.model('clientProduction', clientProductionSchema, 'clientProduction');