import { Schema, model, models } from 'mongoose';

const HeroSlideSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
});

const LandingSettingSchema = new Schema({
  heroSlides: [HeroSlideSchema],
});

const LandingSetting = models.LandingSetting || model('LandingSetting', LandingSettingSchema);
export default LandingSetting;
