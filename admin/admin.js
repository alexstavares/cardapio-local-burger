// ===== ADMIN DASHBOARD JS =====
const API_URL = '/api';

// Estado da aplicação
const state = {
    user: null,
    token: null,
    products: [],
    settings: null,
    currentSection: 'produtos',
    editingProduct: null,
    confirmCallback: null
};

// ===== AUTENTICAÇÃO =====
async function checkAuth() {
    state.token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('user');

    if (!state.token) {
        window.location.href = '/admin/';
        return false;
    }

    try {
        const response = await fetch(`${API_URL}/auth/verify`, {
            headers: {
                'Authorization': `Bearer ${state.token}`
            }
        });

        const data = await response.json();

        if (!data.success || !data.authenticated) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            window.location.href = '/admin/';
            return false;
        }

        state.user = data.user;
        updateUserUI();
        return true;

    } catch (error) {
        console.error('Erro na autenticação:', error);
        window.location.href = '/admin/';
        return false;
    }
}

function updateUserUI() {
    if (state.user) {
        document.getElementById('userName').textContent = state.user.nome;
        document.getElementById('userRole').textContent = state.user.role === 'superadmin' ? 'Super Admin' : 'Administrador';
        document.getElementById('userAvatar').textContent = state.user.nome.charAt(0).toUpperCase();
    }
}

async function logout() {
    try {
        await fetch(`${API_URL}/auth/logout`);
    } catch (error) {
        console.error('Erro no logout:', error);
    }

    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = '/admin/';
}

// ===== NAVEGAÇÃO =====
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = {
        'produtos': 'sectionProdutos',
        'adicionais': 'sectionAdicionais',
        'combos': 'sectionCombos',
        'taxas': 'sectionTaxas',
        'config': 'sectionConfig'
    };

    const titles = {
        'produtos': 'Produtos',
        'adicionais': 'Adicionais',
        'combos': 'Combos e Extras',
        'taxas': 'Taxas de Entrega',
        'config': 'Configurações'
    };

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;

            // Atualizar nav ativo
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Mostrar seção correta
            Object.values(sections).forEach(sectionId => {
                document.getElementById(sectionId).style.display = 'none';
            });
            document.getElementById(sections[section]).style.display = 'block';

            // Atualizar título
            document.getElementById('pageTitle').textContent = titles[section];

            // Atualizar botão adicionar
            const btnAdd = document.getElementById('btnAdd');
            if (section === 'config') {
                btnAdd.style.display = 'none';
            } else {
                btnAdd.style.display = 'flex';
            }

            state.currentSection = section;

            // Carregar dados da seção
            loadSectionData(section);

            // Fechar menu mobile
            document.getElementById('sidebar').classList.remove('active');
        });
    });

    // Mobile menu
    document.getElementById('mobileMenuBtn').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('active');
    });
}

async function loadSectionData(section) {
    switch (section) {
        case 'produtos':
            await loadProducts();
            break;
        case 'adicionais':
        case 'combos':
        case 'taxas':
        case 'config':
            await loadSettings();
            break;
    }
}

// ===== PRODUTOS =====
async function loadProducts() {
    const loadingEl = document.getElementById('loadingProducts');
    const tableBody = document.getElementById('productsBody');
    const emptyEl = document.getElementById('emptyProducts');

    loadingEl.style.display = 'block';
    tableBody.innerHTML = '';
    emptyEl.style.display = 'none';

    try {
        const categoria = document.getElementById('filterCategoria').value;
        const ativo = document.getElementById('filterStatus').value;

        let url = `${API_URL}/products?admin=true`;
        if (categoria) url += `&categoria=${categoria}`;
        if (ativo) url += `&ativo=${ativo}`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${state.token}`
            }
        });

        const data = await response.json();

        if (data.success) {
            state.products = data.products;
            renderProducts();
        } else {
            showToast('Erro ao carregar produtos', 'error');
        }

    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        showToast('Erro de conexão', 'error');
    } finally {
        loadingEl.style.display = 'none';
    }
}

function renderProducts() {
    const tableBody = document.getElementById('productsBody');
    const emptyEl = document.getElementById('emptyProducts');

    if (state.products.length === 0) {
        emptyEl.style.display = 'block';
        tableBody.innerHTML = '';
        return;
    }

    emptyEl.style.display = 'none';

    const categoryLabels = {
        'lanche': 'Hambúrguer',
        'smash': 'Ultra Smash',
        'porcao': 'Porção',
        'kids': 'Kids',
        'bebida': 'Bebida'
    };

    tableBody.innerHTML = state.products.map(product => `
        <tr>
            <td><img src="${product.imagem}" alt="${product.nome}" class="table-img"></td>
            <td><strong>${product.nome}</strong></td>
            <td><span class="badge badge-category">${categoryLabels[product.categoria] || product.categoria}</span></td>
            <td><strong>R$ ${product.preco.toFixed(2).replace('.', ',')}</strong></td>
            <td>${product.badge || '-'}</td>
            <td>
                <span class="badge ${product.ativo ? 'badge-active' : 'badge-inactive'}">
                    ${product.ativo ? 'Ativo' : 'Inativo'}
                </span>
            </td>
            <td>
                <div class="table-actions">
                    <button class="btn-icon" onclick="editProduct('${product._id}')" title="Editar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="btn-icon danger" onclick="confirmDeleteProduct('${product._id}')" title="Excluir">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openProductModal(product = null) {
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    const title = document.getElementById('modalTitle');

    form.reset();
    document.getElementById('productId').value = '';
    document.getElementById('productAtivo').checked = true;
    document.getElementById('productError').textContent = '';

    if (product) {
        title.textContent = 'Editar Produto';
        document.getElementById('productId').value = product._id;
        document.getElementById('productNome').value = product.nome;
        document.getElementById('productDescricao').value = product.descricao;
        document.getElementById('productPreco').value = product.preco;
        document.getElementById('productCategoria').value = product.categoria;
        document.getElementById('productBadge').value = product.badge || '';
        document.getElementById('productImagem').value = product.imagem || '';
        document.getElementById('productOrdem').value = product.ordem || 0;
        document.getElementById('productAtivo').checked = product.ativo;
        state.editingProduct = product;
    } else {
        title.textContent = 'Novo Produto';
        state.editingProduct = null;
    }

    modal.classList.add('active');
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
    state.editingProduct = null;
}

async function saveProduct(e) {
    e.preventDefault();

    const btn = document.getElementById('btnSaveProduct');
    const btnText = btn.querySelector('.btn-text');
    const btnLoading = btn.querySelector('.btn-loading');
    const errorDiv = document.getElementById('productError');

    const productId = document.getElementById('productId').value;
    const productData = {
        nome: document.getElementById('productNome').value,
        descricao: document.getElementById('productDescricao').value,
        preco: parseFloat(document.getElementById('productPreco').value),
        categoria: document.getElementById('productCategoria').value,
        badge: document.getElementById('productBadge').value,
        imagem: document.getElementById('productImagem').value,
        ordem: parseInt(document.getElementById('productOrdem').value) || 0,
        ativo: document.getElementById('productAtivo').checked
    };

    btnText.style.display = 'none';
    btnLoading.style.display = 'block';
    btn.disabled = true;
    errorDiv.textContent = '';

    try {
        const url = productId ? `${API_URL}/products/${productId}` : `${API_URL}/products`;
        const method = productId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify(productData)
        });

        const data = await response.json();

        if (data.success) {
            showToast(productId ? 'Produto atualizado!' : 'Produto criado!', 'success');
            closeProductModal();
            loadProducts();
        } else {
            errorDiv.textContent = data.error || 'Erro ao salvar produto';
        }

    } catch (error) {
        errorDiv.textContent = 'Erro de conexão';
    } finally {
        btnText.style.display = 'block';
        btnLoading.style.display = 'none';
        btn.disabled = false;
    }
}

function editProduct(id) {
    const product = state.products.find(p => p._id === id);
    if (product) {
        openProductModal(product);
    }
}

function confirmDeleteProduct(id) {
    state.confirmCallback = async () => {
        try {
            const response = await fetch(`${API_URL}/products/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${state.token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                showToast('Produto excluído!', 'success');
                loadProducts();
            } else {
                showToast(data.error || 'Erro ao excluir', 'error');
            }
        } catch (error) {
            showToast('Erro de conexão', 'error');
        }
    };

    document.getElementById('confirmMessage').textContent = 'Tem certeza que deseja excluir este produto?';
    document.getElementById('confirmModal').classList.add('active');
}

// ===== SETTINGS (Adicionais, Combos, Taxas, Config) =====
async function loadSettings() {
    try {
        const response = await fetch(`${API_URL}/settings`, {
            headers: {
                'Authorization': `Bearer ${state.token}`
            }
        });

        const data = await response.json();

        if (data.success) {
            state.settings = data.settings;
            renderSettings();
        }

    } catch (error) {
        console.error('Erro ao carregar configurações:', error);
    }
}

function renderSettings() {
    if (!state.settings) return;

    // Adicionais
    renderAdicionais();

    // Combos
    renderCombos();

    // Taxas
    renderTaxas();

    // Configurações gerais
    document.getElementById('configNomeLoja').value = state.settings.nomeLoja || '';
    document.getElementById('configWhatsapp').value = state.settings.whatsapp || '';
    document.getElementById('configEndereco').value = state.settings.endereco || '';
}

function renderAdicionais() {
    const grid = document.getElementById('adicionaisGrid');

    if (!state.settings.adicionais || state.settings.adicionais.length === 0) {
        grid.innerHTML = '<p class="empty-state">Nenhum adicional cadastrado</p>';
        return;
    }

    grid.innerHTML = state.settings.adicionais.map((adicional, index) => `
        <div class="item-card">
            <div class="item-card-header">
                <span class="item-card-title">${adicional.nome}</span>
                <span class="item-card-price">R$ ${adicional.preco.toFixed(2).replace('.', ',')}</span>
            </div>
            <div class="item-card-footer">
                <span class="badge ${adicional.ativo ? 'badge-active' : 'badge-inactive'}">
                    ${adicional.ativo ? 'Ativo' : 'Inativo'}
                </span>
                <div class="table-actions">
                    <button class="btn-icon" onclick="editAdicional(${index})" title="Editar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderCombos() {
    const grid = document.getElementById('combosGrid');

    // Preço do combo
    document.getElementById('comboPreco').value = state.settings.combo_preco || 15;

    // Maionese verde
    document.getElementById('maioneseAtivo').checked = state.settings.maionese_verde?.ativo ?? true;
    document.getElementById('maionesePreco').value = state.settings.maionese_verde?.preco || 4;

    if (!state.settings.combos || state.settings.combos.length === 0) {
        grid.innerHTML = '<p class="empty-state">Nenhum combo cadastrado</p>';
        return;
    }

    grid.innerHTML = state.settings.combos.map((combo, index) => `
        <div class="item-card">
            <div class="item-card-header">
                <span class="item-card-title">${combo.nome}</span>
                <span class="item-card-price">R$ ${combo.preco.toFixed(2).replace('.', ',')}</span>
            </div>
            ${combo.descricao ? `<p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.5rem;">${combo.descricao}</p>` : ''}
            <div class="item-card-footer">
                <span class="badge ${combo.ativo ? 'badge-active' : 'badge-inactive'}">
                    ${combo.ativo ? 'Ativo' : 'Inativo'}
                </span>
                <div class="table-actions">
                    <button class="btn-icon" onclick="editCombo(${index})" title="Editar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderTaxas() {
    const grid = document.getElementById('taxasGrid');

    if (!state.settings.taxas_entrega || state.settings.taxas_entrega.length === 0) {
        grid.innerHTML = '<p class="empty-state">Nenhuma taxa cadastrada</p>';
        return;
    }

    grid.innerHTML = state.settings.taxas_entrega.map((taxa, index) => `
        <div class="item-card">
            <div class="item-card-header">
                <span class="item-card-title">${taxa.bairro}</span>
                <span class="item-card-price">R$ ${taxa.preco.toFixed(2).replace('.', ',')}</span>
            </div>
            <div class="item-card-footer">
                <span class="badge ${taxa.ativo ? 'badge-active' : 'badge-inactive'}">
                    ${taxa.ativo ? 'Ativo' : 'Inativo'}
                </span>
                <div class="table-actions">
                    <button class="btn-icon" onclick="editTaxa(${index})" title="Editar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// ===== MODAIS DE EDIÇÃO =====
function editAdicional(index) {
    const adicional = state.settings.adicionais[index];
    document.getElementById('adicionalIndex').value = index;
    document.getElementById('adicionalNome').value = adicional.nome;
    document.getElementById('adicionalPreco').value = adicional.preco;
    document.getElementById('adicionalAtivo').checked = adicional.ativo;
    document.getElementById('adicionalModal').classList.add('active');
}

function editCombo(index) {
    const combo = state.settings.combos[index];
    document.getElementById('comboIndex').value = index;
    document.getElementById('comboNome').value = combo.nome;
    document.getElementById('comboDescricao').value = combo.descricao || '';
    document.getElementById('comboPrecoItem').value = combo.preco;
    document.getElementById('comboAtivo').checked = combo.ativo;
    document.getElementById('comboModal').classList.add('active');
}

function editTaxa(index) {
    const taxa = state.settings.taxas_entrega[index];
    document.getElementById('taxaIndex').value = index;
    document.getElementById('taxaBairro').value = taxa.bairro;
    document.getElementById('taxaPreco').value = taxa.preco;
    document.getElementById('taxaAtivo').checked = taxa.ativo;
    document.getElementById('taxaModal').classList.add('active');
}

async function saveSettings(updates) {
    try {
        const response = await fetch(`${API_URL}/settings`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.token}`
            },
            body: JSON.stringify(updates)
        });

        const data = await response.json();

        if (data.success) {
            state.settings = data.settings;
            showToast('Configurações salvas!', 'success');
            return true;
        } else {
            showToast(data.error || 'Erro ao salvar', 'error');
            return false;
        }
    } catch (error) {
        showToast('Erro de conexão', 'error');
        return false;
    }
}

// ===== TOAST =====
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const icon = document.getElementById('toastIcon');
    const msg = document.getElementById('toastMessage');

    toast.className = `toast ${type}`;
    icon.textContent = type === 'success' ? '✓' : '✕';
    msg.textContent = message;

    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===== INICIALIZAÇÃO =====
async function init() {
    const isAuth = await checkAuth();
    if (!isAuth) return;

    setupNavigation();
    setupEventListeners();

    // Carregar dados iniciais
    await loadProducts();
    await loadSettings();
}

function setupEventListeners() {
    // Logout
    document.getElementById('btnLogout').addEventListener('click', logout);

    // Botão adicionar
    document.getElementById('btnAdd').addEventListener('click', () => {
        switch (state.currentSection) {
            case 'produtos':
                openProductModal();
                break;
            case 'adicionais':
                document.getElementById('adicionalIndex').value = '-1';
                document.getElementById('adicionalForm').reset();
                document.getElementById('adicionalAtivo').checked = true;
                document.getElementById('adicionalModalTitle').textContent = 'Novo Adicional';
                document.getElementById('adicionalModal').classList.add('active');
                break;
            case 'combos':
                document.getElementById('comboIndex').value = '-1';
                document.getElementById('comboForm').reset();
                document.getElementById('comboAtivo').checked = true;
                document.getElementById('comboModalTitle').textContent = 'Novo Combo';
                document.getElementById('comboModal').classList.add('active');
                break;
            case 'taxas':
                document.getElementById('taxaIndex').value = '-1';
                document.getElementById('taxaForm').reset();
                document.getElementById('taxaAtivo').checked = true;
                document.getElementById('taxaModalTitle').textContent = 'Nova Taxa de Entrega';
                document.getElementById('taxaModal').classList.add('active');
                break;
        }
    });

    // Filtros de produtos
    document.getElementById('filterCategoria').addEventListener('change', loadProducts);
    document.getElementById('filterStatus').addEventListener('change', loadProducts);

    // Modal de produto
    document.getElementById('modalClose').addEventListener('click', closeProductModal);
    document.getElementById('btnCancelProduct').addEventListener('click', closeProductModal);
    document.getElementById('productForm').addEventListener('submit', saveProduct);

    // Modal de adicional
    document.getElementById('adicionalModalClose').addEventListener('click', () => {
        document.getElementById('adicionalModal').classList.remove('active');
    });
    document.getElementById('btnCancelAdicional').addEventListener('click', () => {
        document.getElementById('adicionalModal').classList.remove('active');
    });
    document.getElementById('adicionalForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const index = parseInt(document.getElementById('adicionalIndex').value);
        const adicionalData = {
            nome: document.getElementById('adicionalNome').value,
            preco: parseFloat(document.getElementById('adicionalPreco').value),
            ativo: document.getElementById('adicionalAtivo').checked
        };

        const adicionais = [...state.settings.adicionais];
        if (index === -1) {
            adicionais.push(adicionalData);
        } else {
            adicionais[index] = { ...adicionais[index], ...adicionalData };
        }

        if (await saveSettings({ adicionais })) {
            document.getElementById('adicionalModal').classList.remove('active');
            renderAdicionais();
        }
    });

    // Modal de combo
    document.getElementById('comboModalClose').addEventListener('click', () => {
        document.getElementById('comboModal').classList.remove('active');
    });
    document.getElementById('btnCancelCombo').addEventListener('click', () => {
        document.getElementById('comboModal').classList.remove('active');
    });
    document.getElementById('comboForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const index = parseInt(document.getElementById('comboIndex').value);
        const comboData = {
            nome: document.getElementById('comboNome').value,
            descricao: document.getElementById('comboDescricao').value,
            preco: parseFloat(document.getElementById('comboPrecoItem').value),
            ativo: document.getElementById('comboAtivo').checked
        };

        const combos = [...state.settings.combos];
        if (index === -1) {
            combos.push(comboData);
        } else {
            combos[index] = { ...combos[index], ...comboData };
        }

        if (await saveSettings({ combos })) {
            document.getElementById('comboModal').classList.remove('active');
            renderCombos();
        }
    });

    // Modal de taxa
    document.getElementById('taxaModalClose').addEventListener('click', () => {
        document.getElementById('taxaModal').classList.remove('active');
    });
    document.getElementById('btnCancelTaxa').addEventListener('click', () => {
        document.getElementById('taxaModal').classList.remove('active');
    });
    document.getElementById('taxaForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const index = parseInt(document.getElementById('taxaIndex').value);
        const taxaData = {
            bairro: document.getElementById('taxaBairro').value,
            preco: parseFloat(document.getElementById('taxaPreco').value),
            ativo: document.getElementById('taxaAtivo').checked
        };

        const taxas_entrega = [...state.settings.taxas_entrega];
        if (index === -1) {
            taxas_entrega.push(taxaData);
        } else {
            taxas_entrega[index] = { ...taxas_entrega[index], ...taxaData };
        }

        if (await saveSettings({ taxas_entrega })) {
            document.getElementById('taxaModal').classList.remove('active');
            renderTaxas();
        }
    });

    // Preço do combo
    document.getElementById('btnSaveComboPreco').addEventListener('click', async () => {
        const combo_preco = parseFloat(document.getElementById('comboPreco').value);
        await saveSettings({ combo_preco });
    });

    // Maionese verde
    document.getElementById('btnSaveMaionese').addEventListener('click', async () => {
        const maionese_verde = {
            preco: parseFloat(document.getElementById('maionesePreco').value),
            ativo: document.getElementById('maioneseAtivo').checked
        };
        await saveSettings({ maionese_verde });
    });

    // Configurações gerais
    document.getElementById('btnSaveConfig').addEventListener('click', async () => {
        await saveSettings({
            nomeLoja: document.getElementById('configNomeLoja').value,
            whatsapp: document.getElementById('configWhatsapp').value,
            endereco: document.getElementById('configEndereco').value
        });
    });

    // Modal de confirmação
    document.getElementById('confirmModalClose').addEventListener('click', () => {
        document.getElementById('confirmModal').classList.remove('active');
    });
    document.getElementById('btnConfirmCancel').addEventListener('click', () => {
        document.getElementById('confirmModal').classList.remove('active');
    });
    document.getElementById('btnConfirmOk').addEventListener('click', () => {
        if (state.confirmCallback) {
            state.confirmCallback();
        }
        document.getElementById('confirmModal').classList.remove('active');
    });

    // Fechar modais com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => {
                modal.classList.remove('active');
            });
        }
    });

    // Fechar modais clicando fora
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

// Iniciar
document.addEventListener('DOMContentLoaded', init);
