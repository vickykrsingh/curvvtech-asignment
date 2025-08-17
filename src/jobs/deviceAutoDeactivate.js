
import Device from '../models/Device.js';
import cron from 'node-cron';

// Runs every hour
cron.schedule('0 * * * *', async () => {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  try {
    const result = await Device.updateMany(
      { last_active_at: { $lt: cutoff }, status: 'active' },
      { $set: { status: 'inactive' } }
    );
    if (result.modifiedCount > 0) {
      console.log(`AutoDeactivate Deactivated ${result.modifiedCount} devices (inactive > 24h)`);
    }
  } catch (err) {
    console.error('AutoDeactivate Error:', err);
  }
});
