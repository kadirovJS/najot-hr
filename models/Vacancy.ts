import mongoose, { Schema, model, models } from 'mongoose';

const VacancySchema = new Schema({
  title: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['IT', 'HR', "O'quv bo'limi", 'Marketing', 'Sotuv', 'Boshqa']
  },
  location: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['Full-time', 'Part-time', 'Remote', 'Internship']
  },
  salary: { type: String, required: true },
  description: { type: String, required: true },
  requirements: [{ type: String }],
  benefits: [{ type: String }],
  isVisible: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const Vacancy = models.Vacancy || model('Vacancy', VacancySchema);
export default Vacancy;
