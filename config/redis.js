const redis = require('redis');

const client = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  }
});

client.on('connect', () => {
  console.log('✅ Connected to Redis');
});

client.on('error', (err) => {
  console.error('❌ Redis error:', err.message);
});

client.on('reconnecting', () => {
  console.log('🔄 Reconnecting to Redis...');
});

// Connect to Redis
client.connect().catch(console.error);

module.exports = client;