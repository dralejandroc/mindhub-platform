const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'mindhub-secret-key-2024';
const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

// Función para leer usuarios
function readUsers() {
    try {
        if (!fs.existsSync(USERS_FILE)) {
            const dataDir = path.dirname(USERS_FILE);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }
            fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
            return [];
        }
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading users:', error);
        return [];
    }
}

// Función para escribir usuarios
function writeUsers(users) {
    try {
        const dataDir = path.dirname(USERS_FILE);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing users:', error);
        return false;
    }
}

// Función para generar ID único
function generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
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
        const { email, password, nombre, apellido, institucion } = req.body;

        if (!email || !password || !nombre || !apellido) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos obligatorios deben ser completados'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'La contraseña debe tener al menos 6 caracteres'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Email inválido'
            });
        }

        const users = readUsers();

        if (users.find(user => user.email === email)) {
            return res.status(400).json({
                success: false,
                message: 'Este email ya está registrado'
            });
        }

        const newUser = {
            id: generateId(),
            email: email.toLowerCase().trim(),
            password: password,
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            institucion: institucion ? institucion.trim() : '',
            role: 'free',
            createdAt: new Date().toISOString(),
            lastLogin: null,
            isActive: true
        };

        users.push(newUser);

        if (!writeUsers(users)) {
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }

        const token = jwt.sign(
            { 
                userId: newUser.id, 
                email: newUser.email,
                role: newUser.role 
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        const userResponse = { ...newUser };
        delete userResponse.password;

        return res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            user: userResponse,
            token: token
        });

    } catch (error) {
        console.error('Error en registro:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};
