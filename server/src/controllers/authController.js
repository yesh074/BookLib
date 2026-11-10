import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { inMemoryStore } from './bookController.js';

const JWT_SECRET = process.env.JWT_SECRET || 'bookmind_super_secret_jwt_key_2026';

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '30d',
  });
};

const isDbConnected = () => User.db && User.db.readyState === 1;

// Initialize in-memory users array if not existing
if (!inMemoryStore.users) {
  inMemoryStore.users = [];
}

/**
 * Register User
 * POST /api/auth/register
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, avatar } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide name, email, and password.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user exists
    if (isDbConnected()) {
      const userExists = await User.findOne({ email: cleanEmail });
      if (userExists) {
        return res.status(400).json({ error: 'A user with this email already exists.' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await User.create({
        name,
        email: cleanEmail,
        password: hashedPassword,
        avatar: avatar || '🎓',
        streakDays: 1,
        totalReadingMinutes: 15,
      });

      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        streakDays: user.streakDays,
        totalReadingMinutes: user.totalReadingMinutes,
        token: generateToken(user._id),
      });
    } else {
      // In-Memory Fallback
      const existing = inMemoryStore.users.find(u => u.email === cleanEmail);
      if (existing) {
        return res.status(400).json({ error: 'A user with this email already exists.' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const mockId = 'usr_' + Date.now();

      const user = {
        _id: mockId,
        name,
        email: cleanEmail,
        password: hashedPassword,
        avatar: avatar || '🎓',
        streakDays: 1,
        totalReadingMinutes: 15,
        createdAt: new Date().toISOString()
      };

      inMemoryStore.users.push(user);

      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        streakDays: user.streakDays,
        totalReadingMinutes: user.totalReadingMinutes,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    console.error('[Register Error]:', error);
    res.status(500).json({ error: 'Failed to register account: ' + error.message });
  }
};

/**
 * Login User
 * POST /api/auth/login
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (isDbConnected()) {
      const user = await User.findOne({ email: cleanEmail });
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        streakDays: user.streakDays,
        totalReadingMinutes: user.totalReadingMinutes,
        token: generateToken(user._id),
      });
    } else {
      // In-Memory Fallback
      const user = inMemoryStore.users.find(u => u.email === cleanEmail);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        streakDays: user.streakDays,
        totalReadingMinutes: user.totalReadingMinutes,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    console.error('[Login Error]:', error);
    res.status(500).json({ error: 'Failed to authenticate user: ' + error.message });
  }
};

/**
 * One-Click Demo Scholar Login
 * POST /api/auth/demo
 */
export const demoLogin = async (req, res) => {
  try {
    const demoEmail = 'alex.rivera@bookmind.ai';
    const demoName = 'Alex Rivera';
    const demoAvatar = '🧠';

    if (isDbConnected()) {
      let user = await User.findOne({ email: demoEmail });
      if (!user) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('DemoPass123!', salt);
        user = await User.create({
          name: demoName,
          email: demoEmail,
          password: hashedPassword,
          avatar: demoAvatar,
          streakDays: 7,
          totalReadingMinutes: 480,
        });
      }

      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        streakDays: user.streakDays,
        totalReadingMinutes: user.totalReadingMinutes,
        token: generateToken(user._id),
      });
    } else {
      // In-Memory
      let user = inMemoryStore.users.find(u => u.email === demoEmail);
      if (!user) {
        user = {
          _id: 'usr_demo_scholar',
          name: demoName,
          email: demoEmail,
          password: 'mock_hashed_password',
          avatar: demoAvatar,
          streakDays: 7,
          totalReadingMinutes: 480,
          createdAt: new Date().toISOString()
        };
        inMemoryStore.users.push(user);
      }

      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        streakDays: user.streakDays,
        totalReadingMinutes: user.totalReadingMinutes,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    console.error('[Demo Login Error]:', error);
    res.status(500).json({ error: 'Demo login failed: ' + error.message });
  }
};

/**
 * Get Current User Profile
 * GET /api/auth/me
 */
export const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve profile: ' + error.message });
  }
};
