const connectDB = require('../../lib/mongodb');
const Product = require('../../models/Product');
const { authMiddleware, sendError, sendSuccess, setCorsHeaders } = require('../../lib/auth');

module.exports = async (req, res) => {
    setCorsHeaders(res);

    // Preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { id } = req.query;

    if (!id) {
        return sendError(res, 400, 'ID do produto é obrigatório');
    }

    try {
        await connectDB();

        // GET - Buscar produto por ID (público)
        if (req.method === 'GET') {
            const product = await Product.findById(id);

            if (!product) {
                return sendError(res, 404, 'Produto não encontrado');
            }

            return sendSuccess(res, { product });
        }

        // PUT - Atualizar produto (protegido)
        if (req.method === 'PUT') {
            const auth = await authMiddleware(req);
            if (!auth.authenticated) {
                return sendError(res, 401, 'Acesso não autorizado');
            }

            const { nome, descricao, preco, categoria, imagem, badge, ativo, ordem } = req.body;

            const product = await Product.findById(id);

            if (!product) {
                return sendError(res, 404, 'Produto não encontrado');
            }

            // Atualizar campos
            if (nome !== undefined) product.nome = nome;
            if (descricao !== undefined) product.descricao = descricao;
            if (preco !== undefined) product.preco = parseFloat(preco);
            if (categoria !== undefined) product.categoria = categoria.toLowerCase();
            if (imagem !== undefined) product.imagem = imagem;
            if (badge !== undefined) product.badge = badge;
            if (ativo !== undefined) product.ativo = ativo;
            if (ordem !== undefined) product.ordem = ordem;

            await product.save();

            return sendSuccess(res, {
                message: 'Produto atualizado com sucesso',
                product
            });
        }

        // DELETE - Remover produto (protegido)
        if (req.method === 'DELETE') {
            const auth = await authMiddleware(req);
            if (!auth.authenticated) {
                return sendError(res, 401, 'Acesso não autorizado');
            }

            const product = await Product.findByIdAndDelete(id);

            if (!product) {
                return sendError(res, 404, 'Produto não encontrado');
            }

            return sendSuccess(res, {
                message: 'Produto removido com sucesso'
            });
        }

        return sendError(res, 405, 'Método não permitido');

    } catch (error) {
        console.error('Erro na API de produto:', error);

        if (error.name === 'CastError') {
            return sendError(res, 400, 'ID de produto inválido');
        }

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return sendError(res, 400, messages.join(', '));
        }

        return sendError(res, 500, 'Erro interno do servidor');
    }
};
