export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({ 
    message: 'API funcionando!', 
    timestamp: new Date().toISOString(),
    method: req.method 
  });
}
