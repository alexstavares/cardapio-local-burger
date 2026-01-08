const connectDB = require('../../lib/mongodb');
const User = require('../../models/User');
const { authMiddleware, sendError, sendSuccess, setCorsHeaders } = require('../../lib/auth');

module.exports = async (req, res) => {
    setCorsHeaders(res);

    // Preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return sendError(res, 405, 'Método não permitido');
    }

    try {
        // Verificar autenticação
        const auth = await authMiddleware(req);

        if (!auth.authenticated) {
            return sendError(res, 401, auth.error);
        }

        await connectDB();

        // Buscar dados atualizados do usuário
        const user = await User.findById(auth.user.userId);

        if (!user) {
            return sendError(res, 404, 'Usuário não encontrado');
        }

        if (!user.ativo) {
            return sendError(res, 401, 'Usuário desativado');
        }

        return sendSuccess(res, {
            authenticated: true,
            user: user.toPublic()
        });

    } catch (error) {
        console.error('Erro na verificação:', error);
        return sendError(res, 500, 'Erro interno do servidor');
    }
};
