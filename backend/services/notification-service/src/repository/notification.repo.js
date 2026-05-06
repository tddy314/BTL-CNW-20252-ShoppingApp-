const { redisClient } = require("../config/database/redis.config");

const MAX_NOTIFICATIONS_PER_USER = Number(process.env.NOTIFICATION_MAX_ITEMS || 50);

function buildRedisKey(userId) {
  return `notifications:${userId}`;
}

class NotificationRepository {
  async saveNotification(userId, payload) {
    const key = buildRedisKey(userId);
    await redisClient.lpush(key, JSON.stringify(payload));
    await redisClient.ltrim(key, 0, MAX_NOTIFICATIONS_PER_USER - 1);
  }

  async getNotificationsByUser(userId, limit = 20) {
    const normalizedLimit = Math.max(1, Math.min(Number(limit) || 20, MAX_NOTIFICATIONS_PER_USER));
    const key = buildRedisKey(userId);
    const rows = await redisClient.lrange(key, 0, normalizedLimit - 1);
    return rows.map((row) => JSON.parse(row));
  }

  async getNotificationsByUserPaginated({
    userId,
    channel,
    page = 1,
    limit = 10,
  }) {
    const key = buildRedisKey(userId);
    const normalizedPage = Math.max(1, Number(page) || 1);
    const normalizedLimit = Math.max(1, Math.min(Number(limit) || 10, MAX_NOTIFICATIONS_PER_USER));

    const rows = await redisClient.lrange(key, 0, MAX_NOTIFICATIONS_PER_USER - 1);
    let items = rows.map((row) => JSON.parse(row));

    if (channel) {
      items = items.filter((item) => String(item?.data?.channel || "").toLowerCase() === String(channel).toLowerCase());
    }

    const totalItems = items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / normalizedLimit));
    const safePage = Math.min(normalizedPage, totalPages);
    const start = (safePage - 1) * normalizedLimit;
    const end = start + normalizedLimit;
    const pageItems = items.slice(start, end);

    return {
      currentPage: safePage,
      limit: normalizedLimit,
      totalItems,
      totalPages,
      items: pageItems,
    };
  }
}

module.exports = { NotificationRepository };
