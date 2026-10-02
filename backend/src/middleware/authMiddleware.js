import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { config } from '../config/env.js';
import { ApiError } from '../utils/apiResponse.js';

export async function authenticate(req, _res, next) {
  const match = /^Bearer\s+(\S+)$/i.exec(req.headers.authorization || '');
  if (!match) throw new ApiError(401, 'A Bearer token is required');
  let claims;
  try {
    claims = jwt.verify(match[1], config.jwtSecret, {
      algorithms: ['HS256'],
      issuer: 'autocare',
      audience: 'autocare-api',
    });
    if (typeof claims.sub !== 'string' || !/^[a-f\d]{24}$/i.test(claims.sub))
      throw new Error('Invalid subject');
  } catch {
    throw new ApiError(401, 'Invalid or expired token');
  }
  const user = await User.findById(claims.sub);
  if (!user) throw new ApiError(401, 'User no longer exists');
  req.user = user;
  next();
}

export function authorizeOwner(record, user) {
  if (!record) throw new ApiError(404, 'Record not found');
  if (!user.isAdmin && String(record.userId) !== String(user._id))
    throw new ApiError(403, 'You cannot access this record');
  return record;
}
