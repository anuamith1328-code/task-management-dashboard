const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  project_name: { type: String, required: true, trim: true, maxlength: 150 },
  description: { type: String, default: '' },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Project', projectSchema);
