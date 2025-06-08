import jwt from 'jsonwebtoken';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { email, password } = req.body;
  
  if (email === 'admin@mindhub.com' && password === 'admin123') {
    // JWT con expiración de 30 días
    const token = jwt.sign(
      { 
        email: email,
        role: 'admin',
        iat: Math.floor(Date.now() / 1000)
      },
      'mindhub-secret-key-2024',
      { expiresIn: '30d' }
    );
    
    return res.status(200).json({
      success: true,
      message: 'Login exitoso',
      user: { email, role: 'admin' },
      token: token
    });
  }
  
  return res.status(401).json({
    success: false,
    message: 'Credenciales inválidas'
  });
}
