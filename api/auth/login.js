const connectDB = require('../../lib/mongodb');
const User = require('../../models/User');
const { generateToken, sendError, sendSuccess, setCorsHeaders } = require('../../lib/auth');

module.exports = async (req, res) => {
    setCorsHeaders(res);

    // Preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return sendError(res, 405, 'Método não permitido');
    }

    try {
        await connectDB();

        const { email, senha } = req.body;

        if (!email || !senha) {
            return sendError(res, 400, 'Email e senha são obrigatórios');
        }

        // Buscar usuário com senha (select: false é o padrão, então precisamos incluir explicitamente)
        const user = await User.findOne({ email: email.toLowerCase() }).select('+senha');

        if (!user) {
            return sendError(res, 401, 'Credenciais inválidas');
        }

        if (!user.ativo) {
            return sendError(res, 401, 'Usuário desativado. Entre em contato com o administrador.');
        }

        // Verificar senha
        const isMatch = await user.comparePassword(senha);
        if (!isMatch) {
            return sendError(res, 401, 'Credenciais inválidas');
        }

        // Gerar token
        const token = generateToken(user._id, user.email);

        // Configurar cookie httpOnly para segurança
        res.setHeader('Set-Cookie', `auth_token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}; Path=/`);

        return sendSuccess(res, {
            message: 'Login realizado com sucesso',
            token,
            user: user.toPublic()
        });

    } catch (error) {
        console.error('Erro no login:', error);
        return sendError(res, 500, 'Erro interno do servidor');
    }
};
