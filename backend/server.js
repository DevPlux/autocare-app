import mongoose from 'mongoose';
import app from './src/app.js';
import { config, validateEnvironment } from './src/config/env.js';
import { connectDB } from './src/config/db.js';

let server;
let stopping = false;
async function shutdown(code = 0) {
  if (stopping) return;
  stopping = true;
  const timer = setTimeout(() => process.exit(1), 10000).unref();
  if (server) await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
  clearTimeout(timer);
  process.exit(code);
}
try {
  validateEnvironment();
  await connectDB();
  await Promise.all(
    Object.values(mongoose.models).map((model) => model.init()),
  );
  server = app.listen(config.port, '0.0.0.0');
  server.once('listening', () => {
    console.log(`runing on port ${config.port} ✅`);
    console.log('mongodb connected 🍃');
  });
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(
        `Port ${config.port} is already in use. Stop the other server before running yarn dev, or choose a different PORT in .env.`,
      );
    } else {
      console.error(
        `HTTP server failed to start (${error.code || 'UNKNOWN'}).`,
      );
    }
    void shutdown(1);
  });
} catch (error) {
  // Do not print driver errors that can include connection credentials.
  console.error(
    'Startup failed:',
    error.name === 'Error' ? error.message : error.name,
  );
  await mongoose.disconnect();
  process.exitCode = 1;
}
process.on('SIGINT', () => void shutdown());
process.on('SIGTERM', () => void shutdown());
