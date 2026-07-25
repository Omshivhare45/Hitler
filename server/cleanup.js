const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Target = require('./models/Target');
  await Target.deleteMany({ userId: { $exists: false } });
  console.log('Deleted legacy targets');
  process.exit(0);
});
