import { Schema } from 'mongoose';

export const accountSchema = new Schema({
  id: String,
  identityHash: { type: String, index: true },
  federationKeys: Array,
  servicesProvidersFederationKeys: Array,
  active: { type: Boolean, default: true },
  noDisplayConfirmation: Boolean,
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now, index: { expires: '3y' } },
});
