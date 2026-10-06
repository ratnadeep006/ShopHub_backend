const redis = require('../config/redis');

// CACHE MIDDLEWARE
// duration = seconds to cache
exports.cacheMiddleware = (duration) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;

    try {
      // Check Redis cache first
      const cached = await redis.get(key);

      if (cached) {
        console.log(`⚡ Cache HIT: ${key}`);
        return res.json(JSON.parse(cached));
      }

      console.log(`🔍 Cache MISS: ${key}`);

      // Save response to cache
      const originalJson = res.json.bind(res);
      res.json = async (data) => {
        try {
          await redis.setEx(key, duration, JSON.stringify(data));
          console.log(`💾 Cached: ${key} for ${duration}s`);
        } catch (err) {
          console.error('Cache save error:', err);
        }
        return originalJson(data);
      };

      next();

    } catch (error) {
      console.error('Cache middleware error:', error);
      next(); // Continue without cache if Redis fails
    }
  };
};

// CLEAR CACHE
exports.clearCache = async (pattern) => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(keys);
      console.log(`🗑️ Cleared ${keys.length} cache keys: ${pattern}`);
    }
  } catch (error) {
    console.error('Clear cache error:', error);
  }
};