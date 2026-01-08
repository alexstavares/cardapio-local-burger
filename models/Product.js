const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: [true, 'Nome do produto é obrigatório'],
        trim: true
    },
    descricao: {
        type: String,
        required: [true, 'Descrição é obrigatória'],
        trim: true
    },
    preco: {
        type: Number,
        required: [true, 'Preço é obrigatório'],
        min: [0, 'Preço não pode ser negativo']
    },
    categoria: {
        type: String,
        required: [true, 'Categoria é obrigatória'],
        enum: ['lanche', 'smash', 'porcao', 'kids', 'bebida'],
        lowercase: true
    },
    imagem: {
        type: String,
        default: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'
    },
    badge: {
        type: String,
        enum: ['', 'Clássico', 'Popular', 'Premium', 'Novo', 'Vegano', 'Kids'],
        default: ''
    },
    ativo: {
        type: Boolean,
        default: true
    },
    ordem: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Atualizar updatedAt antes de salvar
ProductSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Índices para melhor performance
ProductSchema.index({ categoria: 1, ativo: 1, ordem: 1 });
ProductSchema.index({ nome: 'text', descricao: 'text' });

module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema);
