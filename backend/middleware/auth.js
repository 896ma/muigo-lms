const jwt = require('jsonwebtoken');

module.exports = function requireAuth(req, res, next) {
	try {
		const header = req.headers.authorization || '';
		const token = header.startsWith('Bearer ') ? header.slice(7) : null;
		if (!token) return res.status(401).json({ message: 'Unauthorized' });
		const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
		const payload = jwt.verify(token, secret);
		req.user = { id: payload.id, role: payload.role };
		next();
	} catch (err) {
		return res.status(401).json({ message: 'Unauthorized' });
	}
};


