const cron = require('node-cron');
const axios = require('axios');
const Target = require('../models/Target');
const Log = require('../models/Log');

const pingTarget = async (target) => {
  const startTime = Date.now();
  try {
    const response = await axios.get(target.url, { timeout: 15000 });
    const latency = Date.now() - startTime;
    
    target.status = 'Awake';
    target.lastPing = new Date();
    await target.save();
    
    await Log.create({
      targetId: target._id,
      status: 'Success',
      statusCode: response.status,
      latency,
    });
    console.log(`Pinged ${target.name} successfully. Latency: ${latency}ms`);
  } catch (error) {
    const latency = Date.now() - startTime;
    target.status = 'Down';
    target.lastPing = new Date();
    await target.save();

    await Log.create({
      targetId: target._id,
      status: 'Failed',
      statusCode: error.response ? error.response.status : 0,
      latency,
    });
    console.log(`Pinged ${target.name} failed. Latency: ${latency}ms`);
  }
};

const startPinger = () => {
  // Check every minute if any target needs to be pinged
  cron.schedule('* * * * *', async () => {
    try {
      const targets = await Target.find({});
      const now = new Date();
      
      for (const target of targets) {
        if (!target.lastPing) {
          // First time ping
          pingTarget(target);
        } else {
          // Calculate difference in minutes
          const diffMs = now - target.lastPing;
          const diffMins = Math.floor(diffMs / 60000);
          
          if (diffMins >= target.interval) {
            pingTarget(target);
          }
        }
      }
    } catch (err) {
      console.error('Error in pinger service:', err);
    }
  });
  console.log('Pinger service started');
};

module.exports = { startPinger };
