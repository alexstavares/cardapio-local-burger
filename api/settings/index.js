const connectDB = require('../../lib/mongodb');
const Settings = require('../../models/Settings');
const { authMiddleware, sendError, sendSuccess, setCorsHeaders } = require('../../lib/auth');

// Dados padrão das configurações
const defaultSettings = {
    nomeLoja: 'LocalBurger',
    whatsapp: '5512982837333',
    endereco: 'Avenida Doutor Altino Arantes, 220 - Centro - São Sebastião',
    maionese_verde: {
        preco: 4.00,
        ativo: true
    },
    combo_preco: 15.00,
    adicionais: [
        { nome: 'Adicional rúcula', preco: 4.00, ativo: true, ordem: 1 },
        { nome: 'Adicional de bacon', preco: 8.00, ativo: true, ordem: 2 },
        { nome: 'Adicional de cheddar', preco: 8.00, ativo: true, ordem: 3 },
        { nome: 'Adicional de catupiry', preco: 8.00, ativo: true, ordem: 4 },
        { nome: 'Adicional de cebola caramelizada', preco: 6.00, ativo: true, ordem: 5 },
        { nome: 'Adicional de salada', preco: 6.00, ativo: true, ordem: 6 },
        { nome: 'Adicional de ovo', preco: 4.00, ativo: true, ordem: 7 },
        { nome: 'Adicional hambúrguer 160g', preco: 15.00, ativo: true, ordem: 8 },
        { nome: 'Adicional queijo provolone', preco: 6.00, ativo: true, ordem: 9 },
        { nome: 'Adicional queijo prato', preco: 6.00, ativo: true, ordem: 10 },
        { nome: 'Adicional picles', preco: 4.00, ativo: true, ordem: 11 },
        { nome: 'Adicional cebola roxa', preco: 4.00, ativo: true, ordem: 12 }
    ],
    combos: [
        { nome: 'Combo coca-cola lata + fritas', descricao: 'Coca-Cola 350ml + Batata Frita P', preco: 15.00, ativo: true },
        { nome: 'Combo guaraná antarctica lata + fritas', descricao: 'Guaraná Antarctica 350ml + Batata Frita P', preco: 15.00, ativo: true },
        { nome: 'Combo coca-cola zero lata + fritas', descricao: 'Coca-Cola Zero 350ml + Batata Frita P', preco: 15.00, ativo: true },
        { nome: 'Combo suco del valle uva lata + fritas', descricao: 'Suco Del Valle Uva 290ml + Batata Frita P', preco: 15.00, ativo: true }
    ],
    taxas_entrega: [
        { bairro: 'Centro', preco: 5.00, ativo: true },
        { bairro: 'Praia Grande', preco: 5.00, ativo: true },
        { bairro: 'Vila Amélia', preco: 5.00, ativo: true },
        { bairro: 'Itatinga', preco: 6.00, ativo: true },
        { bairro: 'Olaria', preco: 6.00, ativo: true },
        { bairro: 'Porto Grande', preco: 6.00, ativo: true },
        { bairro: 'Praia Deserta', preco: 6.00, ativo: true },
        { bairro: 'Topolândia', preco: 6.00, ativo: true },
        { bairro: 'Pontal da Cruz', preco: 7.00, ativo: true },
        { bairro: 'Praia Preta', preco: 7.00, ativo: true },
        { bairro: 'Varadouro', preco: 7.00, ativo: true },
        { bairro: 'Arrastão', preco: 8.00, ativo: true },
        { bairro: 'Portal da Olaria', preco: 9.00, ativo: true },
        { bairro: 'Reserva do Moulin', preco: 9.00, ativo: true },
        { bairro: 'Morro do Abrigo', preco: 10.00, ativo: true },
        { bairro: 'São Francisco', preco: 10.00, ativo: true },
        { bairro: 'Figueira', preco: 12.00, ativo: true }
    ]
};

module.exports = async (req, res) => {
    setCorsHeaders(res);

    // Preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        await connectDB();

        // GET - Buscar configurações (público para o site)
        if (req.method === 'GET') {
            let settings = await Settings.findOne();

            // Se não existir, criar com dados padrão
            if (!settings) {
                settings = new Settings(defaultSettings);
                await settings.save();
            }

            return sendSuccess(res, { settings });
        }

        // PUT - Atualizar configurações (protegido)
        if (req.method === 'PUT') {
            const auth = await authMiddleware(req);
            if (!auth.authenticated) {
                return sendError(res, 401, 'Acesso não autorizado');
            }

            let settings = await Settings.findOne();

            if (!settings) {
                settings = new Settings(defaultSettings);
            }

            // Atualizar campos enviados
            const updates = req.body;

            if (updates.nomeLoja !== undefined) settings.nomeLoja = updates.nomeLoja;
            if (updates.whatsapp !== undefined) settings.whatsapp = updates.whatsapp;
            if (updates.endereco !== undefined) settings.endereco = updates.endereco;
            if (updates.maionese_verde !== undefined) settings.maionese_verde = updates.maionese_verde;
            if (updates.combo_preco !== undefined) settings.combo_preco = parseFloat(updates.combo_preco);
            if (updates.adicionais !== undefined) settings.adicionais = updates.adicionais;
            if (updates.combos !== undefined) settings.combos = updates.combos;
            if (updates.taxas_entrega !== undefined) settings.taxas_entrega = updates.taxas_entrega;

            await settings.save();

            return sendSuccess(res, {
                message: 'Configurações atualizadas com sucesso',
                settings
            });
        }

        return sendError(res, 405, 'Método não permitido');

    } catch (error) {
        console.error('Erro na API de configurações:', error);
        return sendError(res, 500, 'Erro interno do servidor');
    }
};
