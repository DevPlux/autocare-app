import mongoose from 'mongoose';
import { ApiError } from './apiResponse.js';

// A write to the shared parent serializes operations on the same service/part.
// MongoDB retries write conflicts with a fresh transaction snapshot.
export const transaction = (callback) =>
  mongoose.connection.transaction(callback, {
    readPreference: 'primary',
    readConcern: { level: 'snapshot' },
    writeConcern: { w: 'majority' },
  });
export async function lockParent(Model, id, session) {
  const parent = await Model.findOneAndUpdate(
    { _id: id },
    { $inc: { revision: 1 } },
    { new: true, session },
  ).select('+imagePublicId');
  if (!parent) throw new ApiError(404, `${Model.modelName} not found`);
  return parent;
}
