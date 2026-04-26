require('dotenv').config();
const amqp = require('amqplib');

async function sendDemo() {
  const rabbit = process.env.RABBITMQ_URL || 'amqp://localhost';
  const conn = await amqp.connect(rabbit);
  const ch = await conn.createChannel();
  const exchange = 'notifications';
  await ch.assertExchange(exchange, 'topic', { durable: true });

  const msg = {
    toUserId: '1',
    type: 'ORDER_CREATED',
    title: 'Đơn hàng mới',
    body: 'Đơn hàng #123 đã được tạo',
    data: { orderId: 123 }
  };

  ch.publish(exchange, 'order.created', Buffer.from(JSON.stringify(msg)), { persistent: true });
  console.log('Demo message published');
  await ch.close();
  await conn.close();
}

sendDemo().catch((err) => {
  console.error(err);
  process.exit(1);
});
