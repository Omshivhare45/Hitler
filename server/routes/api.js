const express = require('express');
const router = express.Router();
const axios = require('axios');
const { ClerkExpressRequireAuth, clerkClient } = require('@clerk/clerk-sdk-node');
const Target = require('../models/Target');
const Log = require('../models/Log');

// Apply Clerk middleware to all API routes
router.use(ClerkExpressRequireAuth());

// Error handler for unauthorized requests
router.use((err, req, res, next) => {
  if (err.message === 'Unauthenticated') {
    res.status(401).json({ error: 'Unauthenticated' });
  } else {
    next(err);
  }
});

// Get all targets for the logged in user
router.get('/targets', async (req, res) => {
  try {
    const userId = req.auth.userId;
    const targets = await Target.find({ userId }).sort({ createdAt: -1 });
    res.json(targets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a target
router.post('/targets', async (req, res) => {
  try {
    const { name, url, interval } = req.body;
    const userId = req.auth.userId;
    const target = new Target({ name, url, interval, userId });
    await target.save();
    res.status(201).json(target);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a target
router.delete('/targets/:id', async (req, res) => {
  try {
    const target = await Target.findById(req.params.id);
    if (!target) return res.status(404).json({ error: 'Not found' });
    if (target.userId !== req.auth.userId) return res.status(403).json({ error: 'Unauthorized' });
    
    await Target.findByIdAndDelete(req.params.id);
    await Log.deleteMany({ targetId: req.params.id });
    res.json({ message: 'Target deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle a target's active status
router.put('/targets/:id/toggle', async (req, res) => {
  try {
    const target = await Target.findById(req.params.id);
    if (!target) return res.status(404).json({ error: 'Not found' });
    if (target.userId !== req.auth.userId) return res.status(403).json({ error: 'Unauthorized' });
    
    target.isActive = !target.isActive;
    if (!target.isActive) {
      target.status = 'Sleeping';
    } else {
      target.status = 'Unknown';
    }
    await target.save();
    res.json(target);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Get logs for a target
router.get('/targets/:id/logs', async (req, res) => {
  try {
    const target = await Target.findById(req.params.id);
    if (!target) return res.status(404).json({ error: 'Not found' });
    if (target.userId !== req.auth.userId) return res.status(403).json({ error: 'Unauthorized' });

    const logs = await Log.find({ targetId: req.params.id })
                          .sort({ createdAt: -1 })
                          .limit(50);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Stats Endpoint
router.get('/admin/stats', async (req, res) => {
  try {
    // 1. Verify if requester is admin
    const requester = await clerkClient.users.getUser(req.auth.userId);
    const primaryEmailId = requester.primaryEmailAddressId;
    const emailObj = requester.emailAddresses.find(e => e.id === primaryEmailId);
    
    if (!emailObj || emailObj.emailAddress !== 'omshivhare666@gmail.com') {
      return res.status(403).json({ error: 'Unauthorized: Admins only' });
    }

    // 2. Fetch all targets grouped by userId
    const groupedTargets = await Target.aggregate([
      { 
        $group: { 
          _id: "$userId", 
          targets: { 
            $push: { 
              name: "$name", 
              url: "$url", 
              status: "$status", 
              interval: "$interval" 
            } 
          },
          totalTargets: { $sum: 1 }
        } 
      }
    ]);

    // 3. Fetch user details for each userId
    const userIds = groupedTargets.map(g => g._id).filter(id => id); // filter out null/undefined
    
    let clerkUsers = [];
    if (userIds.length > 0) {
      clerkUsers = await clerkClient.users.getUserList({ userId: userIds, limit: 100 });
    }
    
    const usersArray = clerkUsers.data || clerkUsers || [];
    
    // 4. Combine data
    const stats = groupedTargets.map(group => {
      if (!group._id) return { ...group, userEmail: 'Unknown', userName: 'Legacy Data' };
      
      const user = usersArray.find(u => u.id === group._id);
      
      let userEmail = 'Unknown';
      let userName = 'Unknown User';
      
      if (user) {
        const primaryEmail = user.emailAddresses?.find(e => e.id === user.primaryEmailAddressId);
        if (primaryEmail) userEmail = primaryEmail.emailAddress;
        
        userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'User';
      }
      
      return {
        userId: group._id,
        userEmail,
        userName,
        totalTargets: group.totalTargets,
        targets: group.targets
      };
    });

    res.json(stats);
  } catch (err) {
    console.error('Admin API Error:', err);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

module.exports = router;
