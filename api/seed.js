const connectDB = require('../lib/mongodb');
const Product = require('../models/Product');
const Settings = require('../models/Settings');
const { sendError, sendSuccess, setCorsHeaders, authMiddleware } = require('../lib/auth');

// Produtos iniciais baseados no cardápio atual
const initialProducts = [
    // Hambúrguer Artesanal
    { nome: 'Local Burger', descricao: 'Hambúrguer artesanal de fraldinha 160g e queijo prato e maionese defumada da casa', preco: 30.00, categoria: 'lanche', badge: 'Clássico', imagem: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', ordem: 1 },
    { nome: 'Local Salada', descricao: 'Hambúrguer artesanal de fraldinha 160g, queijo prato, alface lisa e tomate e maionese defumada da casa', preco: 36.00, categoria: 'lanche', imagem: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400', ordem: 2 },
    { nome: 'Local Egg', descricao: 'Hambúrguer artesanal de fraldinha 160g, queijo prato, ovo, alface lisa e tomate e maionese defumada da casa', preco: 38.00, categoria: 'lanche', badge: 'Popular', imagem: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400', ordem: 3 },
    { nome: 'Local Cheddar e Bacon', descricao: 'Hambúrguer artesanal 160g de fraldinha, cheddar cremoso, bacon rústico e cebola caramelizada e maionese defumada da casa', preco: 42.00, categoria: 'lanche', badge: 'Premium', imagem: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400', ordem: 4 },
    { nome: 'Local Provolone', descricao: 'Hambúrguer artesanal de fraldinha 160g, queijo provolone, cebola roxa, picles e maionese defumada da casa', preco: 42.00, categoria: 'lanche', imagem: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400', ordem: 5 },
    { nome: 'Local Gorgonzola', descricao: 'Hambúrguer artesanal 160g, creme de gorgonzola, bacon rústico, cebola roxa, alface lisa e tomate e maionese defumada da casa', preco: 46.00, categoria: 'lanche', badge: 'Premium', imagem: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400', ordem: 6 },
    { nome: 'Local Bacon Salada', descricao: 'Hambúrguer artesanal de fraldinha 160g, queijo prato, bacon rústico, alface lisa e tomate e maionese defumada da casa', preco: 42.00, categoria: 'lanche', imagem: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400', ordem: 7 },
    { nome: 'Local Veggie (Vegano)', descricao: 'Hambúrguer do futuro 4.0, cebola roxa, picles, alface, rúcula e tomate e maionese defumada da casa', preco: 40.00, categoria: 'lanche', badge: 'Vegano', imagem: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400', ordem: 8 },
    { nome: 'Local Big (Novo)', descricao: '02 hambúrguer artesanal de fraldinha 160g, dobro queijo prato, dobro bacon rústico, ovo, catupiry, picles, alface lisa, cebola roxa e tomate', preco: 54.00, categoria: 'lanche', badge: 'Novo', imagem: 'https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=400', ordem: 9 },
    { nome: 'Local Chicken Catupiry (Novo)', descricao: 'Peito de frango empanado na farinha panko, queijo prato, catupiry, molho sweet chilli, alface lisa e tomate', preco: 40.00, categoria: 'lanche', badge: 'Novo', imagem: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400', ordem: 10 },

    // Ultra Smash
    { nome: 'Ultra Smash (Burger)', descricao: 'Pão brioche tostado na manteiga, 2 ultra smash 40g cada cobertos com american cheese e maionese defumada da casa', preco: 24.99, categoria: 'smash', imagem: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', ordem: 1 },
    { nome: 'Ultra Smash (Original)', descricao: 'Pão brioche tostado na manteiga, 2 ultra smash 40g cada cobertos com american cheese, cebola picadinha, picles, ketchup e mostarda e maionese defumada da casa', preco: 26.99, categoria: 'smash', badge: 'Popular', imagem: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400', ordem: 2 },
    { nome: 'Ultra Smash (Salada)', descricao: 'Pão brioche tostado na manteiga, 2 ultra smash 40g cada cobertos com american cheese, cebola picadinha, alface e tomate e maionese defumada da casa', preco: 28.99, categoria: 'smash', imagem: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400', ordem: 3 },
    { nome: 'Ultra Smash (Bacon)', descricao: 'Pão brioche tostado na manteiga, 2 ultra smash 40g cada cobertos com american cheese e bacon rústico e maionese defumada da casa', preco: 32.99, categoria: 'smash', badge: 'Premium', imagem: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400', ordem: 4 },

    // Porções
    { nome: 'Batata Frita Pequena', descricao: 'Porção individual de batatas fritas crocantes', preco: 20.00, categoria: 'porcao', imagem: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400', ordem: 1 },
    { nome: 'Batata Frita Grande', descricao: 'Porção generosa de batatas fritas crocantes', preco: 36.00, categoria: 'porcao', imagem: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400', ordem: 2 },
    { nome: 'Batata Frita P com Cheddar e Bacon', descricao: 'Batatas crocantes com cheddar cremoso e bacon', preco: 32.00, categoria: 'porcao', badge: 'Popular', imagem: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400', ordem: 3 },
    { nome: 'Batata Frita G com Cheddar e Bacon', descricao: 'Porção grande com cheddar cremoso e muito bacon', preco: 48.00, categoria: 'porcao', badge: 'Premium', imagem: 'https://images.unsplash.com/photo-1585238341710-4c2f89fce991?w=400', ordem: 4 },

    // Kids
    { nome: 'Local Kids', descricao: 'Hambúrguer artesanal de fraldinha 80g e queijo prato, acompanha batata frita, suco ou refri + 1 pokebola com personagem do pokemon dentro colecionável', preco: 42.00, categoria: 'kids', badge: 'Kids', imagem: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400', ordem: 1 },

    // Bebidas
    { nome: 'Coca Cola Lata 350ml', descricao: 'Refrigerante Coca Cola lata gelada', preco: 8.00, categoria: 'bebida', imagem: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400', ordem: 1 },
    { nome: 'Guaraná Lata 350ml', descricao: 'Refrigerante Guaraná lata gelada', preco: 8.00, categoria: 'bebida', imagem: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400', ordem: 2 },
    { nome: 'Coca Cola Zero Lata 350ml', descricao: 'Refrigerante Coca Cola Zero lata gelada', preco: 8.00, categoria: 'bebida', imagem: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400', ordem: 3 },
    { nome: 'Suco Uva Lata 290ml', descricao: 'Suco Del Valle de uva lata', preco: 8.00, categoria: 'bebida', imagem: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400', ordem: 4 },
    { nome: 'Água 510ml', descricao: 'Água mineral 510ml', preco: 5.00, categoria: 'bebida', imagem: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400', ordem: 5 }
];

// Configurações padrão
const defaultSettings = {
    nomeLoja: 'LocalBurger',
    whatsapp: '5512982837333',
    endereco: 'Avenida Doutor Altino Arantes, 220 - Centro - São Sebastião',
    maionese_verde: { preco: 4.00, ativo: true },
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

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return sendError(res, 405, 'Método não permitido');
    }

    try {
        // Verificar autenticação (opcional - pode remover para primeiro seed)
        const auth = await authMiddleware(req);
        const { force } = req.body;

        await connectDB();

        let results = {
            products: { created: 0, existed: 0 },
            settings: { created: false, existed: false }
        };

        // Verificar se já existem produtos
        const productCount = await Product.countDocuments();

        if (productCount === 0 || force) {
            if (force) {
                await Product.deleteMany({});
            }
            await Product.insertMany(initialProducts);
            results.products.created = initialProducts.length;
        } else {
            results.products.existed = productCount;
        }

        // Verificar se já existem configurações
        let settings = await Settings.findOne();

        if (!settings || force) {
            if (force && settings) {
                await Settings.deleteMany({});
            }
            settings = new Settings(defaultSettings);
            await settings.save();
            results.settings.created = true;
        } else {
            results.settings.existed = true;
        }

        return sendSuccess(res, {
            message: 'Seed executado com sucesso',
            results
        });

    } catch (error) {
        console.error('Erro no seed:', error);
        return sendError(res, 500, 'Erro ao executar seed: ' + error.message);
    }
};
