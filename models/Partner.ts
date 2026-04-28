import { Schema, model, models } from 'mongoose';

const PartnerSchema = new Schema({
  name: { type: String, required: true },
  logo: { type: String, required: true },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const Partner = models.Partner || model('Partner', PartnerSchema);
export default Partner;
