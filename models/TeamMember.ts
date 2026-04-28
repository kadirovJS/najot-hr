import { Schema, model, models } from 'mongoose';

const TeamMemberSchema = new Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  image: { type: String, required: true },
  order: { type: Number, default: 0 },
});

const TeamMember = models.TeamMember || model('TeamMember', TeamMemberSchema);
export default TeamMember;
