const { sendSuccess, setCorsHeaders } = require('../../lib/auth');

module.exports = async (req, res) => {
    setCorsHeaders(res);

    // Preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Limpar cookie
    res.setHeader('Set-Cookie', 'auth_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/');

    return sendSuccess(res, {
        message: 'Logout realizado com sucesso'
    });
};
