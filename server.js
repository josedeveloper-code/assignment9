// Build Restful App for a Company Users and Company Projects

const jwt = require('jsonwebtoken');
const express = require('express');
const bcrypt = require('bcryptjs');
const { db, User, Project, Task } = require('./database/setup');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// --- AUTHENTICATION MIDDLEWARE ---

const requireAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; 
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

const requireManager = (req, res, next) => {
    // Allows managers and admins
    if (req.user && (req.user.role === 'manager' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ error: 'Forbidden: Manager access required' });
    }
};

const requireAdmin = (req, res, next) => {
    // STRICTLY admin only
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    
};

// --- ROUTES ---

// POST /api/register 
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) return res.status(400).json({ error: 'User exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'employee' 
        });

        // Generate token for the new user immediately
        const token = jwt.sign(
            { id: newUser.id, name: newUser.name, role: newUser.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        res.status(201).json({ message: 'User registered', token, user: { id: newUser.id, name: newUser.name, role: newUser.role } });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

// POST /api/login (Step 7 fixed)
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, name: user.name, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

      // Fixing the Login Authenticated for Successful 
        res.json({ 
            message: 'Login successful', 
            token: token, 
            user: { id: user.id, name: user.name, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// GET /api/users (Admin only)
app.get('/api/users', requireAuth, requireAdmin, async (req, res) => {
    const users = await User.findAll({ attributes: ['id', 'name', 'email', 'role'] });
    res.json(users);
});

// POST /api/projects (Manager+)
app.post('/api/projects', requireAuth, requireManager, async (req, res) => {
    try {
        const { name, description } = req.body;
        const newProject = await Project.create({
            name,
            description,
            managerId: req.user.id
        });
        res.status(201).json(newProject);
    } catch (error) {
        res.status(500).json({ error: 'Project creation failed' });
    }
});

// Start server
async function startServer() {
    try {
        await db.authenticate();
        console.log('Database connected.');
        app.listen(PORT, () => console.log(`Server on port ${PORT}`));
    } catch (error) {
        console.error('DB Connection failed:', error);
    }
}

startServer();