const jwt = require('jsonwebtoken');

module.exports = function requireAuth(req, res, next) {
	try {
		const header = req.headers.authorization || '';
		console.log('🔐 Auth middleware - Authorization header:', header ? 'Present' : 'Missing');
		console.log('🔐 Auth middleware - Full headers:', JSON.stringify(req.headers, null, 2));
		
		const token = header.startsWith('Bearer ') ? header.slice(7) : null;
		console.log('🔐 Auth middleware - Token extracted:', token ? 'Present' : 'Missing');
		
		if (!token) {
			console.log('🔐 Auth middleware - No token found, returning 401');
			return res.status(401).json({ message: 'Unauthorized' });
		}
		
		const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
		console.log('🔐 Auth middleware - JWT Secret:', secret ? 'Present' : 'Missing');
		
		const payload = jwt.verify(token, secret);
		console.log('🔐 Auth middleware - Token verified successfully, payload:', payload);
		
		req.user = { id: payload.id, role: payload.role };
		next();
	} catch (err) {
		console.log('🔐 Auth middleware - Token verification failed:', err.message);
		return res.status(401).json({ message: 'Unauthorized' });
	}
};


