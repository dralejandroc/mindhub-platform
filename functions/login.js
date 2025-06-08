const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'mindhub-secret-key-2024';
const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

function readUsers() {
    try {
        if (!fs.existsSync(USERS_FILE)) {
            return [];
        }
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading users:', error);
        return [];
    }
}

function updateLastLogin(userId) {
    try {
        const users = readUsers();
        const userIndex = users.findIndex(user => user.id === userId);
        
        if (userIndex !== -1) {
            users[userIndex].lastLogin = new Date().toISOString();
            
            const dataDir = path.dirname(USERS_FILE);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }
            
            fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
        }
    } catch (error) {
        console.error('Error updating last login:', error);
    }
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false, 
            message: 'Método no permitido' 
        });
    }

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email y contraseña son requeridos'
            });
        }

        const users = readUsers();

        const user = users.find(u => 
            u.email.toLowerCase() === email.toLowerCase().trim() && 
            u.isActive === true
        );

        if (!user || user.password !== password) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        updateLastLogin(user.id);

        const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email,
                role: user.role 
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        const userResponse = { ...user };
        delete userResponse.password;

        return res.status(200).json({
            success: true,
            message: 'Login exitoso',
            user: userResponse,
            token: token
        });

    } catch (error) {
        console.error('Error en login:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};
