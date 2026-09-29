require('dotenv').config();
require('./config/firebase');
// Custom Logger to colorize terminal output
const _log = console.log;
const _warn = console.warn;
const _err = console.error;
console.log = (...args) => _log('\x1b[37m', ...args, '\x1b[0m');  // White
console.warn = (...args) => _warn('\x1b[33m', ...args, '\x1b[0m'); // Yellow
console.error = (...args) => _err('\x1b[31m', ...args, '\x1b[0m'); // Red

const { sequelize } = require('./models');
const app = require('./app');

const PORT = process.env.PORT || 5000;

// Periodically pull courier status from Shiprocket (no webhook configured)
function startShipmentSync() {
  if (!process.env.SHIPROCKET_EMAIL) return;
  const { syncActiveShipments } = require('./services/shipment.service');
  const minutes = parseInt(process.env.SHIPMENT_SYNC_INTERVAL_MINUTES, 10) || 60;
  let running = false;
  const run = async () => {
    if (running) return;
    running = true;
    try {
      await syncActiveShipments();
    } catch (error) {
      console.error('[Shiprocket] Status sync error:', error.message);
    } finally {
      running = false;
    }
  };
  setTimeout(run, 30 * 1000);
  setInterval(run, minutes * 60 * 1000);
}

(async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync all models
    await sequelize.sync();
    console.log('✅ Database models synchronized.');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });

    startShipmentSync();
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
})();
