const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const userActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['login', 'logout', 'create', 'update', 'delete', 'import', 'export', 'role_change', 'status_change','register']
  },
  details: {
    type: Object,
    default: {}
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for performance
userActivitySchema.index({ user: 1 });
userActivitySchema.index({ action: 1 });
userActivitySchema.index({ createdAt: -1 });

// Apply pagination plugin
userActivitySchema.plugin(mongoosePaginate);

module.exports = mongoose.model('UserActivity', userActivitySchema);
