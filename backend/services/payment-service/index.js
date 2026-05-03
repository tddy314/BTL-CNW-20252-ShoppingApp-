module.exports = require('./src/index.js');

if (require.main === module) {
  const app = module.exports;
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Payment service listening on port ${PORT}`);
  });
}
