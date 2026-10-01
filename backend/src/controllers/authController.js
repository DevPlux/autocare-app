import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { config } from '../config/env.js';
import { ApiError, success } from '../utils/apiResponse.js';

const authData = (user) => ({
  token: jwt.sign({}, config.jwtSecret, {
    subject: String(user._id),
    expiresIn: config.jwtExpiresIn,
    algorithm: 'HS256',
    issuer: 'autocare',
    audience: 'autocare-api',
  }),
  user: {
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
  },
});
// Comparing against a fixed hash also spends bcrypt time for unknown accounts.
const dummyHash = bcrypt.hashSync('unused-autocare-password', 12);
export async function register(req, res) {
  const { name, email, password } = req.body;
  const user = await User.create({
    name,
    email,
    password: await bcrypt.hash(password, 12),
  });
  return success(res, 'Registration successful', authData(user), 201);
}
export async function login(req, res) {
  const user = await User.findOne({ email: req.body.email }).select(
    '+password',
  );
  const valid = await bcrypt.compare(
    req.body.password,
    user?.password || dummyHash,
  );
  if (!user || !valid) throw new ApiError(401, 'Invalid email or password');
  return success(res, 'Login successful', authData(user));
}
