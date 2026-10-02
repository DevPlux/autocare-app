import mongoose from 'mongoose';
import { config } from './env.js';

mongoose.set('runValidators', true);

export async function connectDB(uri = config.mongoUri, options = {}) {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000, ...options });
  const hello = await mongoose.connection.db.admin().command({ hello: 1 });
  if (!hello.setName && hello.msg !== 'isdbgrid') {
    await mongoose.disconnect();
    throw new Error(
      'MongoDB must support transactions: use Atlas or a replica set',
    );
  }
  return mongoose.connection;
}
