const jwt = require('jsonwebtoken');

module.exports = function requireAuth(req, res, next) {
	try {
		const header = req.headers.authorization || '';
		const token = header.startsWith('Bearer ') ? header.slice(7) : null;
		
		console.log('Auth check:', { 
			hasHeader: !!header, 
			hasToken: !!token, 
			path: req.path,
			method: req.method 
		});
		
		if (!token) {
			console.log('No token provided');
			return res.status(401).json({ message: 'Unauthorized' });
		}
		
		const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
		const payload = jwt.verify(token, secret);
		
		console.log('Token verified for user:', payload.id);
		req.user = { id: payload.id, role: payload.role };
		next();
	} catch (err) {
		console.log('Token verification failed:', err.message);
		return res.status(401).json({ message: 'Unauthorized' });
	}
};


