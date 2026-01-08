const mongoose = require('mongoose');

// Schema para Adicionais (bacon, queijo, ovo, etc.)
const AdicionalSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: [true, 'Nome do adicional é obrigatório'],
        trim: true
    },
    preco: {
        type: Number,
        required: [true, 'Preço é obrigatório'],
        min: [0, 'Preço não pode ser negativo']
    },
    ativo: {
        type: Boolean,
        default: true
    },
    ordem: {
        type: Number,
        default: 0
    }
});

// Schema para Combos
const ComboSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: [true, 'Nome do combo é obrigatório'],
        trim: true
    },
    descricao: {
        type: String,
        trim: true
    },
    preco: {
        type: Number,
        required: [true, 'Preço é obrigatório'],
        min: [0, 'Preço não pode ser negativo']
    },
    ativo: {
        type: Boolean,
        default: true
    }
});

// Schema para Taxas de Entrega
const TaxaEntregaSchema = new mongoose.Schema({
    bairro: {
        type: String,
        required: [true, 'Nome do bairro é obrigatório'],
        trim: true
    },
    preco: {
        type: Number,
        required: [true, 'Preço é obrigatório'],
        min: [0, 'Preço não pode ser negativo']
    },
    ativo: {
        type: Boolean,
        default: true
    }
});

// Schema principal de Configurações
const SettingsSchema = new mongoose.Schema({
    // Configurações gerais
    nomeLoja: {
        type: String,
        default: 'LocalBurger'
    },
    whatsapp: {
        type: String,
        default: '5512982837333'
    },
    endereco: {
        type: String,
        default: 'Avenida Doutor Altino Arantes, 220 - Centro - São Sebastião'
    },

    // Preço da maionese verde
    maionese_verde: {
        preco: {
            type: Number,
            default: 4.00
        },
        ativo: {
            type: Boolean,
            default: true
        }
    },

    // Preço do combo (padrão)
    combo_preco: {
        type: Number,
        default: 15.00
    },

    // Lista de adicionais
    adicionais: [AdicionalSchema],

    // Lista de combos
    combos: [ComboSchema],

    // Taxas de entrega por bairro
    taxas_entrega: [TaxaEntregaSchema],

    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Atualizar updatedAt antes de salvar
SettingsSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
