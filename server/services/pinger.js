const cron = require('node-cron');
const axios = require('axios');
const Target = require('../models/Target');
const Log = require('../models/Log');

const pingTarget = async (target) => {
  const startTime = Date.now();
  try {
    const response = await axios.get(target.url, { timeout: 60000 });
    const latency = Date.now() - startTime;

    target.status = 'Awake';
    target.lastPing = new Date();
    await Target.updateOne({ _id: target._id }, { $set: { status: target.status, lastPing: target.lastPing } });

    await Log.create({
      targetId: target._id,
      status: 'Success',
      statusCode: response.status,
      latency,
    });
    console.log(`Pinged ${target.name} successfully. Latency: ${latency}ms`);
  } catch (error) {
    console.log(`First ping to ${target.name} failed, retrying in 20s (likely cold start)...`);
    await new Promise((r) => setTimeout(r, 20000));

    try {
      const retryStart = Date.now();
      const response = await axios.get(target.url, { timeout: 60000 });
      const latency = Date.now() - retryStart;

      target.status = 'Awake';
      target.lastPing = new Date();
      await Target.updateOne({ _id: target._id }, { $set: { status: target.status, lastPing: target.lastPing } });

      await Log.create({
        targetId: target._id,
        status: 'Success',
        statusCode: response.status,
        latency,
      });
      console.log(`Retry succeeded for ${target.name}. Latency: ${latency}ms`);
      return;
    } catch (retryError) {
      const latency = Date.now() - startTime;
      target.status = 'Down';
      target.lastPing = new Date();
      await Target.updateOne({ _id: target._id }, { $set: { status: target.status, lastPing: target.lastPing } });

      await Log.create({
        targetId: target._id,
        status: 'Failed',
        statusCode: retryError.response ? retryError.response.status : 0,
        latency,
      });
      console.log(`Pinged ${target.name} failed after retry. Latency: ${latency}ms`);
    }
  }
};

const startPinger = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const targets = await Target.find({});
      const now = new Date();

      for (const target of targets) {
        if (target.isActive === false) continue;

        if (!target.lastPing) {
          pingTarget(target);
        } else {
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