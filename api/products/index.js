const connectDB = require('../../lib/mongodb');
const Product = require('../../models/Product');
const { authMiddleware, sendError, sendSuccess, setCorsHeaders } = require('../../lib/auth');

module.exports = async (req, res) => {
    setCorsHeaders(res);

    // Preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        await connectDB();

        // GET - Listar produtos (público)
        if (req.method === 'GET') {
            const { categoria, ativo, admin } = req.query;

            let query = {};

            // Se não é admin, mostra apenas ativos
            if (admin !== 'true') {
                query.ativo = true;
            } else {
                // Verificar autenticação para acesso admin
                const auth = await authMiddleware(req);
                if (!auth.authenticated) {
                    return sendError(res, 401, 'Acesso não autorizado');
                }
                // Admin pode ver todos (ativos e inativos)
                if (ativo !== undefined) {
                    query.ativo = ativo === 'true';
                }
            }

            if (categoria) {
                query.categoria = categoria.toLowerCase();
            }

            const products = await Product.find(query)
                .sort({ categoria: 1, ordem: 1, createdAt: -1 });

            return sendSuccess(res, { products });
        }

        // POST - Criar produto (protegido)
        if (req.method === 'POST') {
            const auth = await authMiddleware(req);
            if (!auth.authenticated) {
                return sendError(res, 401, 'Acesso não autorizado');
            }

            const { nome, descricao, preco, categoria, imagem, badge, ativo, ordem } = req.body;

            if (!nome || !descricao || preco === undefined || !categoria) {
                return sendError(res, 400, 'Nome, descrição, preço e categoria são obrigatórios');
            }

            const product = new Product({
                nome,
                descricao,
                preco: parseFloat(preco),
                categoria: categoria.toLowerCase(),
                imagem: imagem || undefined,
                badge: badge || '',
                ativo: ativo !== false,
                ordem: ordem || 0
            });

            await product.save();

            return sendSuccess(res, {
                message: 'Produto criado com sucesso',
                product
            }, 201);
        }

        return sendError(res, 405, 'Método não permitido');

    } catch (error) {
        console.error('Erro na API de produtos:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return sendError(res, 400, messages.join(', '));
        }

        return sendError(res, 500, 'Erro interno do servidor');
    }
};
