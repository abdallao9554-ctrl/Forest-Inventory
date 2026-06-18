import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // For simple seed, we check password directly or via bcrypt
        // If password starts with text (not hashed), we compare directly
        const isMatch = password === user.password || await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        const { password: _, ...userWithoutPassword } = user;
        res.json({
            user: userWithoutPassword,
            token,
        });
    } catch (error) {
        console.error('Login error', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
