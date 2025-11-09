import express from 'express';
import Project from '../models/Project.js';
import Invitation from '../models/Invitation.js';
import User from '../models/User.js';
import { getUserEmail, getUserData } from '../utils/authHelper.js';
import { sendInvitationEmail } from '../services/emailService.js';

const router = express.Router();

// Send invitation to collaborate on a project
router.post('/invite', async (req, res) => {
  try {
    const { projectId, inviteeEmail, role = 'member', message = '' } = req.body;
    const inviterId = req.auth.sub;
    let inviterEmail = getUserEmail(req);

    if (!projectId || !inviteeEmail) {
      return res.status(400).json({ error: 'Project ID and invitee email are required' });
    }

    // Check if project exists and user is owner or admin
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Fallback: If inviterEmail is not in token, try multiple strategies
    if (!inviterEmail || (typeof inviterEmail === 'string' && inviterEmail.trim() === '')) {
      console.log('⚠️ Email not found in token, trying fallbacks...');
      console.log('Initial inviterEmail:', inviterEmail);
      console.log('Auth object keys:', Object.keys(req.auth || {}));
      console.log('Full auth object:', JSON.stringify(req.auth, null, 2));
      
      // Helper function to validate email format
      const isValidEmail = (email) => {
        if (!email || typeof email !== 'string') return false;
        const trimmed = email.trim();
        // Basic email regex: must have @ and ., and not be a userId format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // Don't accept userId-like formats (auth0|xxx, google-oauth2|xxx, etc.)
        if (trimmed.match(/^(auth0|google-oauth2|facebook|github|twitter)\|/)) return false;
        // Must be at least 5 characters (a@b.c)
        if (trimmed.length < 5) return false;
        return emailRegex.test(trimmed);
      };
      
      // Strategy 1: Try to get from project owner if the inviter is the owner
      if (project.ownerId === inviterId) {
        if (isValidEmail(project.ownerEmail)) {
          console.log('✅ Using project owner email as fallback:', project.ownerEmail);
          inviterEmail = project.ownerEmail.trim();
        } else {
          console.warn('⚠️ Project owner email is invalid or missing:', project.ownerEmail);
        }
      }
      
      // Strategy 2: Try to find collaborator email if user is a collaborator
      if (!isValidEmail(inviterEmail)) {
        const collaborator = project.collaborators.find(collab => collab.userId === inviterId);
        if (collaborator && isValidEmail(collaborator.email)) {
          console.log('✅ Using collaborator email as fallback:', collaborator.email);
          inviterEmail = collaborator.email.trim();
        }
      }
      
      // Strategy 3: Try to extract from Auth0 token directly (multiple possible locations)
      if (!isValidEmail(inviterEmail)) {
        const tokenEmail = req.auth?.email || 
                          req.auth?.['https://mindmesh.app/email'] ||
                          req.auth?.['https://mindmesh.us.auth0.com/email'] ||
                          req.auth?.user_email ||
                          req.user?.email;
        
        if (isValidEmail(tokenEmail)) {
          console.log('✅ Using email from token:', tokenEmail);
          inviterEmail = tokenEmail.trim();
        }
      }
      
      // Strategy 4: Try to get from User model in database
      if (!isValidEmail(inviterEmail)) {
        try {
          const user = await User.findOne({ userId: inviterId });
          if (user && isValidEmail(user.email)) {
            console.log('✅ Using user email from database as fallback:', user.email);
            inviterEmail = user.email.trim();
          }
        } catch (dbError) {
          console.error('Error fetching user from database:', dbError);
        }
      }
      
      // If still no valid email, return error with helpful message
      if (!isValidEmail(inviterEmail)) {
        console.error('❌ Could not extract valid inviter email from any source:', {
          inviterId,
          inviterEmail,
          authKeys: Object.keys(req.auth || {}),
          authEmail: req.auth?.email,
          projectOwnerEmail: project.ownerEmail,
          projectOwnerId: project.ownerId,
          isOwner: project.ownerId === inviterId,
          hasCollaborators: project.collaborators.length > 0
        });
        return res.status(400).json({ 
          error: 'Unable to determine your email address. Please log out and log back in to refresh your authentication token.',
          details: 'Your account may not have an email address configured, or the email scope may not be included in your authentication token. Please check your Auth0 profile settings.'
        });
      }
    }
    
    // Ensure email is a string and trimmed
    if (inviterEmail) {
      inviterEmail = String(inviterEmail).trim();
    }
    
    // Validate email format with proper regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!inviterEmail || inviterEmail === '' || !emailRegex.test(inviterEmail)) {
      console.error('❌ Invalid email format after all fallbacks:', {
        inviterEmail,
        inviterEmailType: typeof inviterEmail,
        inviterEmailLength: inviterEmail?.length,
        containsAt: inviterEmail?.includes('@'),
        matchesRegex: emailRegex.test(inviterEmail || ''),
        authObject: {
          keys: Object.keys(req.auth || {}),
          email: req.auth?.email,
          sub: req.auth?.sub
        },
        projectOwnerEmail: project.ownerEmail,
        isOwner: project.ownerId === inviterId
      });
      return res.status(400).json({ 
        error: `Invalid email address format: "${inviterEmail || 'empty'}". Please ensure your account has a valid email address.`,
        details: 'The system could not find a valid email address for your account. Please log out and log back in, or contact support if the issue persists.',
        debug: process.env.NODE_ENV !== 'production' ? {
          inviterEmail,
          projectOwnerEmail: project.ownerEmail,
          isOwner: project.ownerId === inviterId
        } : undefined
      });
    }
    
    console.log('✅ Using inviter email:', inviterEmail);

    const isOwner = project.ownerId === inviterId;
    const isAdmin = project.collaborators.some(
      collab => collab.userId === inviterId && collab.role === 'admin'
    );

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Only project owners and admins can send invitations' });
    }

    // Check if user is already a collaborator
    const existingCollaborator = project.collaborators.find(
      collab => collab.email === inviteeEmail
    );
    if (existingCollaborator) {
      return res.status(400).json({ error: 'User is already a collaborator on this project' });
    }

    // Check if there's already a pending invitation
    const existingInvitation = await Invitation.findOne({
      projectId,
      inviteeEmail,
      status: 'pending'
    });
    if (existingInvitation) {
      return res.status(400).json({ error: 'An invitation has already been sent to this email' });
    }

    // Validate inviterEmail before creating invitation
    if (!inviterEmail || inviterEmail.trim() === '') {
      console.error('❌ Inviter email is required but not found:', {
        inviterId,
        authKeys: Object.keys(req.auth || {}),
        projectOwnerEmail: project.ownerEmail
      });
      return res.status(400).json({ 
        error: 'Unable to determine inviter email. Please contact support or ensure your account has an email address.' 
      });
    }

    // Create invitation
    const invitation = new Invitation({
      projectId,
      inviterId,
      inviterEmail: inviterEmail.trim(),
      inviteeEmail: inviteeEmail.trim(),
      role,
      message: message.trim()
    });

    await invitation.save();

    // Populate project details
    await invitation.populate('projectId', 'title description');

    // Send invitation email (non-blocking)
    try {
      const emailResult = await sendInvitationEmail(
        invitation,
        project,
        inviterEmail
      );
      if (!emailResult.success) {
        console.warn('Failed to send invitation email:', emailResult.error);
        // Don't fail the request if email fails - invitation is still saved
      }
    } catch (emailError) {
      console.error('Error sending invitation email:', emailError);
      // Don't fail the request if email fails - invitation is still saved
    }

    res.status(201).json({
      message: 'Invitation sent successfully',
      invitation
    });
  } catch (error) {
    console.error('Error sending invitation:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get invitations for current user (pending invitations they've received)
router.get('/invitations', async (req, res) => {
  try {
    const userEmail = getUserEmail(req);
    
    if (!userEmail) {
      return res.status(400).json({ error: 'User email not found in token' });
    }

    const invitations = await Invitation.find({
      inviteeEmail: userEmail,
      status: 'pending'
    })
      .populate('projectId', 'title description ownerEmail')
      .sort({ createdAt: -1 });

    res.json(invitations);
  } catch (error) {
    console.error('Error fetching invitations:', error);
    res.status(500).json({ error: error.message });
  }
});

// Accept invitation
router.post('/invitations/:invitationId/accept', async (req, res) => {
  try {
    const { invitationId } = req.params;
    const userId = req.auth.sub;
    const userEmail = getUserEmail(req);
    
    if (!userEmail) {
      return res.status(400).json({ error: 'User email not found in token' });
    }

    const invitation = await Invitation.findById(invitationId);
    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    if (invitation.inviteeEmail !== userEmail) {
      return res.status(403).json({ error: 'You are not authorized to accept this invitation' });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ error: 'Invitation has already been responded to' });
    }

    // Update invitation
    invitation.status = 'accepted';
    invitation.inviteeUserId = userId;
    invitation.respondedAt = Date.now();
    await invitation.save();

    // Add user as collaborator to project
    const project = await Project.findById(invitation.projectId);
    if (project) {
      project.collaborators.push({
        userId,
        email: userEmail,
        role: invitation.role,
        joinedAt: Date.now()
      });
      await project.save();
    }

    // Create or update user record
    await User.findOrCreate(getUserData(req));

    res.json({
      message: 'Invitation accepted successfully',
      project
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reject invitation
router.post('/invitations/:invitationId/reject', async (req, res) => {
  try {
    const { invitationId } = req.params;
    const userEmail = getUserEmail(req);
    
    if (!userEmail) {
      return res.status(400).json({ error: 'User email not found in token' });
    }

    const invitation = await Invitation.findById(invitationId);
    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    if (invitation.inviteeEmail !== userEmail) {
      return res.status(403).json({ error: 'You are not authorized to reject this invitation' });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ error: 'Invitation has already been responded to' });
    }

    invitation.status = 'rejected';
    invitation.respondedAt = Date.now();
    await invitation.save();

    res.json({ message: 'Invitation rejected' });
  } catch (error) {
    console.error('Error rejecting invitation:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get collaborators for a project
router.get('/projects/:projectId/collaborators', async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.auth.sub;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user has access to this project
    const hasAccess = project.ownerId === userId || 
      project.collaborators.some(collab => collab.userId === userId);

    if (!hasAccess) {
      return res.status(403).json({ error: 'You do not have access to this project' });
    }

    res.json({
      owner: {
        userId: project.ownerId,
        email: project.ownerEmail
      },
      collaborators: project.collaborators
    });
  } catch (error) {
    console.error('Error fetching collaborators:', error);
    res.status(500).json({ error: error.message });
  }
});

// Remove collaborator from project
router.delete('/projects/:projectId/collaborators/:collaboratorId', async (req, res) => {
  try {
    const { projectId, collaboratorId } = req.params;
    const userId = req.auth.sub;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is owner or admin
    const isOwner = project.ownerId === userId;
    const isAdmin = project.collaborators.some(
      collab => collab.userId === userId && collab.role === 'admin'
    );

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Only project owners and admins can remove collaborators' });
    }

    // Cannot remove owner
    if (project.ownerId === collaboratorId) {
      return res.status(400).json({ error: 'Cannot remove project owner' });
    }

    project.collaborators = project.collaborators.filter(
      collab => collab.userId !== collaboratorId
    );
    await project.save();

    res.json({ message: 'Collaborator removed successfully' });
  } catch (error) {
    console.error('Error removing collaborator:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update collaborator role
router.patch('/projects/:projectId/collaborators/:collaboratorId/role', async (req, res) => {
  try {
    const { projectId, collaboratorId } = req.params;
    const { role } = req.body;
    const userId = req.auth.sub;

    if (!['admin', 'member', 'viewer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Only owner can update roles
    if (project.ownerId !== userId) {
      return res.status(403).json({ error: 'Only project owner can update collaborator roles' });
    }

    // Cannot change owner's role
    if (project.ownerId === collaboratorId) {
      return res.status(400).json({ error: 'Cannot change owner role' });
    }

    const collaborator = project.collaborators.find(
      collab => collab.userId === collaboratorId
    );

    if (!collaborator) {
      return res.status(404).json({ error: 'Collaborator not found' });
    }

    collaborator.role = role;
    await project.save();

    res.json({ message: 'Collaborator role updated successfully', collaborator });
  } catch (error) {
    console.error('Error updating collaborator role:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

