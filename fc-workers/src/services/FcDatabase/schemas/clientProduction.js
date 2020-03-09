import { Schema } from 'mongoose';

export const clientProductionSchema = new Schema({
  client: { type: String, ref: 'Client' },
  name: String,
  support: String,
  redirect_uris: [String],
  post_logout_redirect_uris: [String],
  logo: Schema.Types.Mixed,
  IPServerAddressesAndRanges: [String],
  active: { type: Boolean, default: false },
  idEmail: String,
  secretKeyPhone: String,
  contacts: [Schema.Types.Mixed],
  site: [String],
  signup_id: String,
  editorName: String,
});
