const amqp = require('amqplib');

async function startConsumer(rabbitUrl, onMessage) {
  const conn = await amqp.connect(rabbitUrl);
  const ch = await conn.createChannel();
  const exchange = 'notifications';
  await ch.assertExchange(exchange, 'topic', { durable: true });

  const q = await ch.assertQueue('', { exclusive: true });
  await ch.bindQueue(q.queue, exchange, '#');

  console.log('RabbitMQ consumer ready, waiting messages...');

  ch.consume(
    q.queue,
    async (msg) => {
      if (!msg) return;
      try {
        const content = msg.content.toString();
        const data = JSON.parse(content);
        await onMessage(data);
        ch.ack(msg);
      } catch (err) {
        console.error('Failed to process message', err);
        ch.nack(msg, false, false);
      }
    },
    { noAck: false }
  );

  return { conn, ch };
}

module.exports = { startConsumer };
