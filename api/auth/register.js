const connectDB = require('../../lib/mongodb');
const User = require('../../models/User');
const { generateToken, sendError, sendSuccess, setCorsHeaders, authMiddleware } = require('../../lib/auth');

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

        const { nome, email, senha, adminSecret } = req.body;

        // Validações
        if (!nome || !email || !senha) {
            return sendError(res, 400, 'Nome, email e senha são obrigatórios');
        }

        if (senha.length < 6) {
            return sendError(res, 400, 'Senha deve ter no mínimo 6 caracteres');
        }

        // Verificar se já existe algum admin cadastrado
        const adminCount = await User.countDocuments();

        // Se já existe admin, precisa de autenticação ou chave secreta
        if (adminCount > 0) {
            // Verificar se tem a chave secreta do admin ou está autenticado como superadmin
            const auth = await authMiddleware(req);

            if (auth.authenticated) {
                // Verificar se é superadmin
                const currentUser = await User.findById(auth.user.userId);
                if (!currentUser || currentUser.role !== 'superadmin') {
                    return sendError(res, 403, 'Apenas superadmins podem cadastrar novos administradores');
                }
            } else {
                // Verificar chave secreta (para primeiro cadastro ou recuperação)
                const secretKey = process.env.ADMIN_SECRET || 'localburger-admin-2024';
                if (adminSecret !== secretKey) {
                    return sendError(res, 403, 'Não autorizado a criar novos administradores');
                }
            }
        }

        // Verificar se email já existe
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return sendError(res, 400, 'Este email já está cadastrado');
        }

        // Criar usuário
        const user = new User({
            nome,
            email: email.toLowerCase(),
            senha,
            role: adminCount === 0 ? 'superadmin' : 'admin' // Primeiro usuário é superadmin
        });

        await user.save();

        // Gerar token
        const token = generateToken(user._id, user.email);

        return sendSuccess(res, {
            message: 'Usuário cadastrado com sucesso',
            token,
            user: user.toPublic()
        }, 201);

    } catch (error) {
        console.error('Erro no registro:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return sendError(res, 400, messages.join(', '));
        }

        return sendError(res, 500, 'Erro interno do servidor');
    }
};
