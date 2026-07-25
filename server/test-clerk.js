const { clerkClient } = require('@clerk/clerk-sdk-node');
require('dotenv').config();

async function test() {
  try {
    const userIds = ['user_3GxdsZdqEcmJf7YbegjXHnEsFVa'];
    const clerkUsers = await clerkClient.users.getUserList({ userId: userIds, limit: 100 });
    console.log(clerkUsers);
  } catch(e) {
    console.error("Clerk Error:", e);
  }
}
test();
