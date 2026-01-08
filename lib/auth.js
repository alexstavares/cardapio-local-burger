const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'localburger-secret-key-2024';

// Gerar token JWT
function generateToken(userId, email) {
    return jwt.sign(
        { userId, email },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}

// Verificar token JWT
function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

// Middleware de autenticação para APIs
async function authMiddleware(req) {
    // Pegar token do header Authorization ou do cookie
    let token = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
    }

    // Tentar pegar do cookie também
    if (!token && req.headers.cookie) {
        const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=');
            acc[key] = value;
            return acc;
        }, {});
        token = cookies['auth_token'];
    }

    if (!token) {
        return { authenticated: false, error: 'Token não fornecido' };
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return { authenticated: false, error: 'Token inválido ou expirado' };
    }

    return { authenticated: true, user: decoded };
}

// Helper para respostas de erro
function sendError(res, status, message) {
    res.status(status).json({ success: false, error: message });
}

// Helper para respostas de sucesso
function sendSuccess(res, data, status = 200) {
    res.status(status).json({ success: true, ...data });
}

// Configurar CORS headers
function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

module.exports = {
    generateToken,
    verifyToken,
    authMiddleware,
    sendError,
    sendSuccess,
    setCorsHeaders,
    JWT_SECRET
};
