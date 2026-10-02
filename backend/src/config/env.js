import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

// Deployment environment wins, then backend/.env, then the existing root .env.
dotenv.config({
  path: fileURLToPath(new URL('../../.env', import.meta.url)),
  quiet: true,
});
dotenv.config({
  path: fileURLToPath(new URL('../../../.env', import.meta.url)),
  quiet: true,
});

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI || process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  origins: (process.env.CLIENT_ORIGIN || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  trustProxy: Number(process.env.TRUST_PROXY || 0),
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudKey: process.env.CLOUDINARY_API_KEY,
  cloudSecret: process.env.CLOUDINARY_API_SECRET,
  cloudFolder: process.env.CLOUDINARY_FOLDER || 'autocare',
};

export function validateEnvironment() {
  const missing = [
    'mongoUri',
    'jwtSecret',
    'cloudName',
    'cloudKey',
    'cloudSecret',
  ].filter((k) => !config[k]);
  if (missing.length)
    throw new Error(`Missing configuration: ${missing.join(', ')}`);
  if (config.nodeEnv === 'production' && config.jwtSecret.length < 32)
    throw new Error(
      'JWT_SECRET must contain at least 32 characters in production',
    );
  if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535)
    throw new Error('Invalid PORT');
  if (!Number.isInteger(config.trustProxy) || config.trustProxy < 0)
    throw new Error('Invalid TRUST_PROXY');
}
