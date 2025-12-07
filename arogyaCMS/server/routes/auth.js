/**
 * Authentication API Routes
 */

const express = require('express');

function authRouter(db) {
    const router = express.Router();

    // Login
    router.post('/login', (req, res) => {
        const { username, password, role } = req.body;

        if (!username || !password || !role) {
            return res.status(400).json({ error: 'Username, password, and role are required' });
        }

        const query = 'SELECT * FROM users WHERE username = ? AND password = ? AND role = ?';
        db.get(query, [username, password, role], (err, user) => {
            if (err) {
                console.error('Error authenticating user:', err);
                return res.status(500).json({ error: 'Authentication failed' });
            }

            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Return user without password
            const { password: _, ...userWithoutPassword } = user;
            res.json({ user: userWithoutPassword });
        });
    });

    // Get all users (admin only)
    router.get('/users', (req, res) => {
        const query = 'SELECT id, username, name, role, createdAt FROM users ORDER BY createdAt DESC';
        db.all(query, [], (err, rows) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to fetch users' });
            }
            res.json(rows);
        });
    });

    return router;
}

module.exports = authRouter;


