const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: [true, 'Nome é obrigatório'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email é obrigatório'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Email inválido']
    },
    senha: {
        type: String,
        required: [true, 'Senha é obrigatória'],
        minlength: [6, 'Senha deve ter no mínimo 6 caracteres'],
        select: false // Não retorna a senha por padrão nas queries
    },
    role: {
        type: String,
        enum: ['admin', 'superadmin'],
        default: 'admin'
    },
    ativo: {
        type: Boolean,
        default: true
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

// Hash da senha antes de salvar
UserSchema.pre('save', async function(next) {
    if (!this.isModified('senha')) return next();

    const salt = await bcrypt.genSalt(12);
    this.senha = await bcrypt.hash(this.senha, salt);
    this.updatedAt = Date.now();
    next();
});

// Método para comparar senhas
UserSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.senha);
};

// Método para retornar dados públicos (sem senha)
UserSchema.methods.toPublic = function() {
    return {
        id: this._id,
        nome: this.nome,
        email: this.email,
        role: this.role,
        ativo: this.ativo,
        createdAt: this.createdAt
    };
};

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
