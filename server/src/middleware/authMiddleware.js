import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { inMemoryStore } from '../controllers/bookController.js';

const JWT_SECRET = process.env.JWT_SECRET || 'bookmind_super_secret_jwt_key_2026';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no session token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if MongoDB is connected
    const isDbConnected = User.db && User.db.readyState === 1;

    if (isDbConnected) {
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
        return next();
      }
    }

    // In-memory fallback
    if (!inMemoryStore.users) inMemoryStore.users = [];
    const memoryUser = inMemoryStore.users.find(u => u._id === decoded.id);
    if (memoryUser) {
      const { password, ...safeUser } = memoryUser;
      req.user = safeUser;
      return next();
    }

    return res.status(401).json({ error: 'Session expired or user not found' });
  } catch (error) {
    return res.status(401).json({ error: 'Not authorized, token invalid or expired' });
  }
};
