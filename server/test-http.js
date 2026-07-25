const https = require('https');

https.get('https://hitler-v4xv.onrender.com/api/admin/stats', (res) => {
  console.log(`Status Code: ${res.statusCode}`);
}).on('error', (e) => {
  console.error(`Got error: ${e.message}`);
});
