import { Schema, model, models } from 'mongoose';
import { DEFAULT_SHOWCASE } from '@/lib/landing';

const HeroSlideSchema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  image: { type: String, required: true, trim: true },
});

const ShowcaseMetricSchema = new Schema({
  value: { type: String, required: true, trim: true },
  label: { type: String, required: true, trim: true },
}, { _id: false });

const ShowcaseSchema = new Schema({
  eyebrow: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  primaryCtaLabel: { type: String, required: true, trim: true },
  primaryCtaHref: { type: String, required: true, trim: true },
  secondaryCtaLabel: { type: String, required: true, trim: true },
  secondaryCtaHref: { type: String, required: true, trim: true },
  metrics: { type: [ShowcaseMetricSchema], default: () => DEFAULT_SHOWCASE.metrics },
}, { _id: false });

const LandingSettingSchema = new Schema({
  showcase: { type: ShowcaseSchema, default: () => DEFAULT_SHOWCASE },
  heroSlides: { type: [HeroSlideSchema], default: [] },
});

const LandingSetting = models.LandingSetting || model('LandingSetting', LandingSettingSchema);
export default LandingSetting;
