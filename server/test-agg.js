const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Target = require('./models/Target');
  try {
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
    console.log(JSON.stringify(groupedTargets, null, 2));
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
});
