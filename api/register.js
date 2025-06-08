export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { email, password, nombre, apellido, institucion } = req.body;
  
  if (!email || !password || !nombre || !apellido) {
    return res.status(400).json({
      success: false,
      message: 'Todos los campos obligatorios deben ser completados'
    });
  }
  
  // Simular registro exitoso
  const newUser = {
    id: Date.now().toString(),
    email: email.toLowerCase().trim(),
    nombre: nombre.trim(),
    apellido: apellido.trim(),
    institucion: institucion || '',
    role: 'free',
    createdAt: new Date().toISOString()
  };
  
  return res.status(201).json({
    success: true,
    message: 'Usuario registrado exitosamente',
    user: newUser,
    token: 'new_user_token_' + Date.now()
  });
}
