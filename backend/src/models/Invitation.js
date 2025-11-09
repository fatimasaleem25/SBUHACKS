import mongoose from "mongoose";

const InvitationSchema = new mongoose.Schema({
  projectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true 
  },
  inviterId: { type: String, required: true }, // Auth0 user ID of person sending invite
  inviterEmail: { type: String, required: true },
  inviteeEmail: { type: String, required: true }, // Email of person being invited
  inviteeUserId: { type: String }, // Auth0 user ID (set when user accepts)
  role: { type: String, enum: ['admin', 'member', 'viewer'], default: 'member' },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected', 'cancelled'], 
    default: 'pending' 
  },
  message: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  respondedAt: { type: Date },
  expiresAt: { type: Date, default: () => Date.now() + 30 * 24 * 60 * 60 * 1000 } // 30 days
});

// Index for efficient queries
InvitationSchema.index({ inviteeEmail: 1, status: 1 });
InvitationSchema.index({ projectId: 1, status: 1 });

export default mongoose.model('Invitation', InvitationSchema);

