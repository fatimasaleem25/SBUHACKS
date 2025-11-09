import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // Auth0 user ID
  email: { type: String, required: true, unique: true },
  name: { type: String },
  picture: { type: String },
  bio: { type: String, default: '' },
  location: { type: String, default: '' },
  website: { type: String, default: '' },
  // Privacy settings
  privacySettings: {
    profileVisibility: { type: String, enum: ['public', 'private', 'friends'], default: 'public' },
    showEmail: { type: Boolean, default: true },
    allowInvites: { type: Boolean, default: true },
    showActivity: { type: Boolean, default: true }
  },
  // Security settings
  securitySettings: {
    twoFactorEnabled: { type: Boolean, default: false },
    loginAlerts: { type: Boolean, default: true },
    sessionTimeout: { type: Number, default: 30 }
  },
  // Notification settings
  notificationSettings: {
    emailNotifications: { type: Boolean, default: true },
    projectInvites: { type: Boolean, default: true },
    collaborationUpdates: { type: Boolean, default: true },
    aiInsights: { type: Boolean, default: true },
    weeklyDigest: { type: Boolean, default: false }
  },
  lastLogin: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update lastLogin when user logs in
UserSchema.statics.findOrCreate = async function(auth0UserData) {
  const userId = auth0UserData.sub || auth0UserData.userId;
  let user = await this.findOne({ userId });
  if (!user) {
    user = await this.create({
      userId: userId,
      email: auth0UserData.email,
      name: auth0UserData.name,
      picture: auth0UserData.picture
    });
  } else {
    // Update last login
    user.lastLogin = Date.now();
    if (auth0UserData.name) user.name = auth0UserData.name;
    if (auth0UserData.picture) user.picture = auth0UserData.picture;
    if (auth0UserData.email) user.email = auth0UserData.email;
    await user.save();
  }
  return user;
};

export default mongoose.model('User', UserSchema);
