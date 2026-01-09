// Smooth scroll para links de navegação
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Animação de entrada dos cards ao scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, index * 100);
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observar todos os cards do menu
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.menu-card');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});

// Header background change on scroll
let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        header.style.background = 'rgba(26, 26, 26, 0.95)';
        header.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.3)';
    } else {
        header.style.background = 'var(--surface)';
        header.style.boxShadow = 'none';
    }

    lastScroll = currentScroll;
});

// Adicionar efeito de hover nos botões de pedido
document.querySelectorAll('.btn-order').forEach(button => {
    button.addEventListener('mouseenter', function() {
        this.style.transition = 'all 0.3s ease';
    });
});

// Lazy loading para imagens
if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        img.src = img.dataset.src;
    });
} else {
    // Fallback para navegadores que não suportam lazy loading nativo
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
}

// Highlight do link ativo na navegação
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').substring(1) === current) {
            link.classList.add('active');
        }
    });
});

// Adicionar estilo para link ativo
const style = document.createElement('style');
style.textContent = `
    .nav-link.active {
        color: var(--primary);
    }
    .nav-link.active::after {
        width: 100%;
    }
`;
document.head.appendChild(style);

// Animação do botão WhatsApp flutuante
const whatsappFloat = document.querySelector('.whatsapp-float');

if (whatsappFloat) {
    whatsappFloat.addEventListener('click', function(e) {
        this.style.transform = 'scale(0.9)';
        setTimeout(() => {
            this.style.transform = 'scale(1.1)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 100);
        }, 100);
    });
}

// Performance: Debounce para scroll events
function debounce(func, wait = 10, immediate = true) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

// Aplicar debounce no scroll
const efficientScroll = debounce(() => {
    // Scroll handling já implementado acima
});

window.addEventListener('scroll', efficientScroll);

// Adicionar efeito de parallax suave no hero
const hero = document.querySelector('.hero');
const heroContent = document.querySelector('.hero-content');

if (hero && heroContent) {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * 0.5;

        if (scrolled < hero.offsetHeight) {
            heroContent.style.transform = `translateY(${rate}px)`;
            heroContent.style.opacity = 1 - (scrolled / hero.offsetHeight);
        }
    });
}

// Contador de animação para preços (opcional - efeito legal)
function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = progress * (end - start) + start;
        element.textContent = 'R$ ' + value.toFixed(2).replace('.', ',');
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Aplicar animação de preço quando o card entrar na viewport (opcional)
const priceObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const priceElement = entry.target;
            const priceText = priceElement.textContent;
            const priceValue = parseFloat(priceText.replace('R$', '').replace(',', '.').trim());

            if (!isNaN(priceValue)) {
                // animateValue(priceElement, 0, priceValue, 1000);
                // Comentado por padrão, descomente se quiser o efeito
            }

            priceObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

// Observar todos os preços
document.querySelectorAll('.card-price').forEach(price => {
    // priceObserver.observe(price);
    // Comentado por padrão
});

// Easter egg: Konami Code
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode.splice(-konamiSequence.length - 1, konamiCode.length - konamiSequence.length);

    if (konamiCode.join('') === konamiSequence.join('')) {
        // Easter egg ativado!
        document.body.style.animation = 'rainbow 2s linear infinite';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 5000);
    }
});

// Adicionar keyframes para o easter egg
const rainbowStyle = document.createElement('style');
rainbowStyle.textContent = `
    @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
    }
`;
document.head.appendChild(rainbowStyle);

// Log de inicialização
console.log('%c🍔 LocalBurger Website Carregado! ', 'background: linear-gradient(135deg, #ff6b35 0%, #f39c12 100%); color: white; font-size: 16px; padding: 10px; border-radius: 5px;');
console.log('%cDesenvolvido com ❤️ para os amantes de hambúrgueres artesanais', 'color: #ff6b35; font-size: 12px;');

// ===== SISTEMA DE CARRINHO DE COMPRAS =====

const Cart = {
    items: [],
    deliveryFee: 0,
    selectedNeighborhood: '',
    whatsappNumber: '5512982837333',
    address: {
        cep: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: ''
    },
    payment: {
        method: '',
        changeFor: ''
    },
    sachets: {
        ketchup: false,
        mostarda: false
    },

    init() {
        this.loadFromStorage();
        this.bindEvents();
        this.bindAddressEvents();
        this.bindPaymentEvents();
        this.bindSachetEvents();
        this.updateUI();
        this.convertButtons();
    },

    loadFromStorage() {
        const stored = localStorage.getItem('localburger_cart');
        if (stored) {
            this.items = JSON.parse(stored);
        }
        const storedDelivery = localStorage.getItem('localburger_delivery');
        if (storedDelivery) {
            const delivery = JSON.parse(storedDelivery);
            this.deliveryFee = delivery.fee || 0;
            this.selectedNeighborhood = delivery.neighborhood || '';
        }
        const storedAddress = localStorage.getItem('localburger_address');
        if (storedAddress) {
            this.address = JSON.parse(storedAddress);
        }
        const storedPayment = localStorage.getItem('localburger_payment');
        if (storedPayment) {
            this.payment = JSON.parse(storedPayment);
        }
        const storedSachets = localStorage.getItem('localburger_sachets');
        if (storedSachets) {
            this.sachets = JSON.parse(storedSachets);
        }
    },

    saveToStorage() {
        localStorage.setItem('localburger_cart', JSON.stringify(this.items));
        localStorage.setItem('localburger_delivery', JSON.stringify({
            fee: this.deliveryFee,
            neighborhood: this.selectedNeighborhood
        }));
        localStorage.setItem('localburger_address', JSON.stringify(this.address));
        localStorage.setItem('localburger_payment', JSON.stringify(this.payment));
        localStorage.setItem('localburger_sachets', JSON.stringify(this.sachets));
    },

    bindEvents() {
        // Abrir modal do carrinho
        document.getElementById('cartFloat').addEventListener('click', () => this.openModal());

        // Fechar modal
        document.getElementById('cartClose').addEventListener('click', () => this.closeModal());
        document.getElementById('cartModal').addEventListener('click', (e) => {
            if (e.target.id === 'cartModal') this.closeModal();
        });

        // Finalizar no WhatsApp
        document.getElementById('btnWhatsapp').addEventListener('click', () => this.sendToWhatsApp());

        // Limpar carrinho
        document.getElementById('btnClearCart').addEventListener('click', () => this.clearCart());

        // Seleção de bairro para entrega
        const deliverySelect = document.getElementById('deliveryNeighborhood');
        if (deliverySelect) {
            deliverySelect.addEventListener('change', (e) => this.updateDeliveryFee(e.target));
            // Restaurar seleção salva
            if (this.selectedNeighborhood) {
                const options = deliverySelect.options;
                for (let i = 0; i < options.length; i++) {
                    if (options[i].text.includes(this.selectedNeighborhood.split(' - ')[0])) {
                        deliverySelect.selectedIndex = i;
                        break;
                    }
                }
            }
        }

        // Fechar com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
        });
    },

    bindAddressEvents() {
        const cepInput = document.getElementById('addressCep');
        const btnSearchCep = document.getElementById('btnSearchCep');

        if (cepInput && btnSearchCep) {
            // Máscara para CEP
            cepInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 5) {
                    value = value.slice(0, 5) + '-' + value.slice(5, 8);
                }
                e.target.value = value;
                this.address.cep = value;
                this.saveToStorage();
            });

            // Buscar CEP ao clicar no botão
            btnSearchCep.addEventListener('click', () => this.searchCep());

            // Buscar CEP ao pressionar Enter
            cepInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.searchCep();
                }
            });

            // Restaurar valor salvo
            if (this.address.cep) {
                cepInput.value = this.address.cep;
            }
        }

        // Bind dos campos de endereço
        const addressFields = ['addressStreet', 'addressNumber', 'addressComplement', 'addressNeighborhood', 'addressCity', 'addressState'];
        const fieldMap = {
            addressStreet: 'street',
            addressNumber: 'number',
            addressComplement: 'complement',
            addressNeighborhood: 'neighborhood',
            addressCity: 'city',
            addressState: 'state'
        };

        addressFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', (e) => {
                    this.address[fieldMap[fieldId]] = e.target.value;
                    this.saveToStorage();
                });
                // Restaurar valor salvo
                if (this.address[fieldMap[fieldId]]) {
                    field.value = this.address[fieldMap[fieldId]];
                }
            }
        });
    },

    async searchCep() {
        const cepInput = document.getElementById('addressCep');
        const cepLoading = document.getElementById('cepLoading');
        const cepError = document.getElementById('cepError');
        const btnSearchCep = document.getElementById('btnSearchCep');

        const cep = cepInput.value.replace(/\D/g, '');

        if (cep.length !== 8) {
            cepError.textContent = 'CEP inválido. Digite 8 números.';
            cepError.classList.add('show');
            return;
        }

        // Mostrar loading
        cepLoading.classList.add('show');
        cepError.classList.remove('show');
        btnSearchCep.disabled = true;

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();

            if (data.erro) {
                cepError.textContent = 'CEP não encontrado.';
                cepError.classList.add('show');
            } else {
                // Preencher campos
                document.getElementById('addressStreet').value = data.logradouro || '';
                document.getElementById('addressNeighborhood').value = data.bairro || '';
                document.getElementById('addressCity').value = data.localidade || '';
                document.getElementById('addressState').value = data.uf || '';

                // Atualizar objeto de endereço
                this.address.street = data.logradouro || '';
                this.address.neighborhood = data.bairro || '';
                this.address.city = data.localidade || '';
                this.address.state = data.uf || '';
                this.saveToStorage();

                // Focar no campo número
                document.getElementById('addressNumber').focus();
            }
        } catch (error) {
            cepError.textContent = 'Erro ao buscar CEP. Tente novamente.';
            cepError.classList.add('show');
        } finally {
            cepLoading.classList.remove('show');
            btnSearchCep.disabled = false;
        }
    },

    bindPaymentEvents() {
        const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
        const changeSection = document.getElementById('changeSection');
        const changeAmount = document.getElementById('changeAmount');

        paymentRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.payment.method = e.target.value;

                // Mostrar/esconder campo de troco
                if (e.target.value === 'dinheiro') {
                    changeSection.classList.add('show');
                } else {
                    changeSection.classList.remove('show');
                    this.payment.changeFor = '';
                    if (changeAmount) changeAmount.value = '';
                }

                this.saveToStorage();
            });

            // Restaurar seleção salva
            if (this.payment.method && radio.value === this.payment.method) {
                radio.checked = true;
                if (this.payment.method === 'dinheiro') {
                    changeSection.classList.add('show');
                }
            }
        });

        if (changeAmount) {
            changeAmount.addEventListener('input', (e) => {
                this.payment.changeFor = e.target.value;
                this.saveToStorage();
            });
            // Restaurar valor salvo
            if (this.payment.changeFor) {
                changeAmount.value = this.payment.changeFor;
            }
        }
    },

    bindSachetEvents() {
        const ketchupCheckbox = document.getElementById('sachetKetchup');
        const mostardaCheckbox = document.getElementById('sachetMostarda');

        if (ketchupCheckbox) {
            ketchupCheckbox.addEventListener('change', (e) => {
                this.sachets.ketchup = e.target.checked;
                this.saveToStorage();
            });
            // Restaurar seleção salva
            ketchupCheckbox.checked = this.sachets.ketchup;
        }

        if (mostardaCheckbox) {
            mostardaCheckbox.addEventListener('change', (e) => {
                this.sachets.mostarda = e.target.checked;
                this.saveToStorage();
            });
            // Restaurar seleção salva
            mostardaCheckbox.checked = this.sachets.mostarda;
        }
    },

    updateDeliveryFee(selectElement) {
        const selectedOption = selectElement.options[selectElement.selectedIndex];
        if (selectedOption.value) {
            this.deliveryFee = parseFloat(selectedOption.value);
            this.selectedNeighborhood = selectedOption.text;
        } else {
            this.deliveryFee = 0;
            this.selectedNeighborhood = '';
        }
        this.saveToStorage();
        this.updateUI();
    },

    convertButtons() {
        // Converter todos os botões de "Pedir" para adicionar ao carrinho
        document.querySelectorAll('.btn-order').forEach(button => {
            const card = button.closest('.menu-card');
            if (!card) return;

            const name = card.querySelector('.card-title')?.textContent || '';
            const priceText = card.querySelector('.card-price')?.textContent || '';
            const price = this.parsePrice(priceText);

            // Remover link e converter para botão
            button.removeAttribute('href');
            button.removeAttribute('target');
            button.style.cursor = 'pointer';

            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.addItem(name, price);
            });
        });
    },

    parsePrice(priceText) {
        // Extrair valor numérico do texto de preço
        const match = priceText.match(/[\d,.]+/);
        if (match) {
            return parseFloat(match[0].replace('.', '').replace(',', '.'));
        }
        return 0;
    },

    addItem(name, price) {
        const existing = this.items.find(item => item.name === name);

        if (existing) {
            existing.qty += 1;
        } else {
            this.items.push({ name, price, qty: 1 });
        }

        this.saveToStorage();
        this.updateUI();
        this.showToast(`${name} adicionado ao carrinho!`);
        this.animateCartCount();
    },

    removeItem(name) {
        this.items = this.items.filter(item => item.name !== name);
        this.saveToStorage();
        this.updateUI();
    },

    updateQty(name, delta) {
        const item = this.items.find(item => item.name === name);
        if (item) {
            item.qty += delta;
            if (item.qty <= 0) {
                this.removeItem(name);
            } else {
                this.saveToStorage();
                this.updateUI();
            }
        }
    },

    clearCart() {
        this.items = [];
        this.deliveryFee = 0;
        this.selectedNeighborhood = '';
        this.address = { cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' };
        this.payment = { method: '', changeFor: '' };
        this.sachets = { ketchup: false, mostarda: false };

        // Resetar select de bairro
        const deliverySelect = document.getElementById('deliveryNeighborhood');
        if (deliverySelect) deliverySelect.selectedIndex = 0;

        // Resetar campos de endereço
        ['addressCep', 'addressStreet', 'addressNumber', 'addressComplement', 'addressNeighborhood', 'addressCity', 'addressState'].forEach(id => {
            const field = document.getElementById(id);
            if (field) field.value = '';
        });

        // Resetar checkboxes de sachês
        const ketchupCheckbox = document.getElementById('sachetKetchup');
        const mostardaCheckbox = document.getElementById('sachetMostarda');
        if (ketchupCheckbox) ketchupCheckbox.checked = false;
        if (mostardaCheckbox) mostardaCheckbox.checked = false;

        // Resetar radio buttons de pagamento
        const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
        paymentRadios.forEach(radio => radio.checked = false);

        // Esconder seção de troco
        const changeSection = document.getElementById('changeSection');
        if (changeSection) changeSection.classList.remove('show');

        // Resetar campo de troco
        const changeAmount = document.getElementById('changeAmount');
        if (changeAmount) changeAmount.value = '';

        this.saveToStorage();
        this.updateUI();
        this.showToast('Carrinho limpo!');
    },

    getSubtotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    },

    getTotal() {
        return this.getSubtotal() + this.deliveryFee;
    },

    getTotalItems() {
        return this.items.reduce((sum, item) => sum + item.qty, 0);
    },

    formatPrice(value) {
        return 'R$ ' + value.toFixed(2).replace('.', ',');
    },

    updateUI() {
        const cartCount = document.getElementById('cartCount');
        const cartItems = document.getElementById('cartItems');
        const cartEmpty = document.getElementById('cartEmpty');
        const cartFooter = document.getElementById('cartFooter');
        const cartSubtotal = document.getElementById('cartSubtotal');
        const cartDeliveryFee = document.getElementById('cartDeliveryFee');
        const cartTotal = document.getElementById('cartTotal');
        const deliveryFeeValue = document.getElementById('deliveryFeeValue');
        const cartSachets = document.getElementById('cartSachets');
        const cartAddress = document.getElementById('cartAddress');
        const cartPayment = document.getElementById('cartPayment');

        // Atualizar contador
        const totalItems = this.getTotalItems();
        cartCount.textContent = totalItems;

        // Atualizar lista de itens
        if (this.items.length === 0) {
            cartItems.innerHTML = '';
            cartEmpty.classList.add('show');
            cartFooter.classList.remove('show');
            if (cartSachets) cartSachets.classList.remove('show');
            if (cartAddress) cartAddress.classList.remove('show');
            if (cartPayment) cartPayment.classList.remove('show');
        } else {
            cartEmpty.classList.remove('show');
            cartFooter.classList.add('show');
            if (cartSachets) cartSachets.classList.add('show');
            if (cartAddress) cartAddress.classList.add('show');
            if (cartPayment) cartPayment.classList.add('show');

            cartItems.innerHTML = this.items.map(item => `
                <div class="cart-item" data-name="${item.name}">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">${this.formatPrice(item.price * item.qty)}</div>
                    </div>
                    <div class="cart-item-controls">
                        <button class="btn-minus" data-name="${item.name}">-</button>
                        <span class="cart-item-qty">${item.qty}</span>
                        <button class="btn-plus" data-name="${item.name}">+</button>
                    </div>
                    <button class="cart-item-remove" data-name="${item.name}" title="Remover">
                        &times;
                    </button>
                </div>
            `).join('');

            // Bind eventos dos botões
            cartItems.querySelectorAll('.btn-minus').forEach(btn => {
                btn.addEventListener('click', () => this.updateQty(btn.dataset.name, -1));
            });

            cartItems.querySelectorAll('.btn-plus').forEach(btn => {
                btn.addEventListener('click', () => this.updateQty(btn.dataset.name, 1));
            });

            cartItems.querySelectorAll('.cart-item-remove').forEach(btn => {
                btn.addEventListener('click', () => this.removeItem(btn.dataset.name));
            });

            // Atualizar valores
            if (cartSubtotal) cartSubtotal.textContent = this.formatPrice(this.getSubtotal());
            if (cartDeliveryFee) cartDeliveryFee.textContent = this.formatPrice(this.deliveryFee);
            if (deliveryFeeValue) deliveryFeeValue.textContent = this.formatPrice(this.deliveryFee);
            if (cartTotal) cartTotal.textContent = this.formatPrice(this.getTotal());
        }
    },

    openModal() {
        document.getElementById('cartModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    closeModal() {
        document.getElementById('cartModal').classList.remove('active');
        document.body.style.overflow = '';
    },

    animateCartCount() {
        const cartCount = document.getElementById('cartCount');
        cartCount.classList.add('bump');
        setTimeout(() => cartCount.classList.remove('bump'), 300);
    },

    showToast(message) {
        // Remover toast existente
        const existingToast = document.querySelector('.toast');
        if (existingToast) existingToast.remove();

        // Criar novo toast
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">✓</span>
                <span>${message}</span>
            </div>
        `;
        document.body.appendChild(toast);

        // Mostrar toast
        setTimeout(() => toast.classList.add('show'), 10);

        // Remover após 2.5s
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    },

    sendToWhatsApp() {
        if (this.items.length === 0) return;

        // Verificar se selecionou bairro
        if (!this.selectedNeighborhood) {
            this.showToast('Selecione o bairro para entrega!');
            return;
        }

        // Verificar endereço obrigatório
        if (!this.address.street || !this.address.number) {
            this.showToast('Preencha o endereço de entrega!');
            return;
        }

        // Verificar método de pagamento
        if (!this.payment.method) {
            this.showToast('Selecione a forma de pagamento!');
            return;
        }

        // Montar mensagem
        let message = 'Olá! Gostaria de fazer o seguinte pedido:\n\n';

        this.items.forEach(item => {
            message += `• ${item.qty}x ${item.name} - ${this.formatPrice(item.price * item.qty)}\n`;
        });

        // Sachês
        const sachetsSelected = [];
        if (this.sachets.ketchup) sachetsSelected.push('Ketchup');
        if (this.sachets.mostarda) sachetsSelected.push('Mostarda');
        if (sachetsSelected.length > 0) {
            message += `\n*Sachês:* ${sachetsSelected.join(', ')}`;
        } else {
            message += `\n*Sachês:* Não`;
        }

        message += `\n\n*Subtotal: ${this.formatPrice(this.getSubtotal())}*`;
        message += `\n*Entrega (${this.selectedNeighborhood.split(' - ')[0]}): ${this.formatPrice(this.deliveryFee)}*`;
        message += `\n*TOTAL: ${this.formatPrice(this.getTotal())}*`;

        // Endereço
        message += `\n\n📍 *Endereço de Entrega:*`;
        message += `\n${this.address.street}, ${this.address.number}`;
        if (this.address.complement) {
            message += ` - ${this.address.complement}`;
        }
        message += `\n${this.address.neighborhood} - ${this.address.city}/${this.address.state}`;
        message += `\nCEP: ${this.address.cep}`;

        // Método de pagamento
        const paymentLabels = {
            'credito': 'Cartão de Crédito',
            'debito': 'Cartão de Débito',
            'pix': 'PIX',
            'dinheiro': 'Dinheiro'
        };
        message += `\n\n💳 *Forma de Pagamento:* ${paymentLabels[this.payment.method]}`;

        if (this.payment.method === 'dinheiro' && this.payment.changeFor) {
            message += `\n*Troco para:* ${this.payment.changeFor}`;
        }

        // Codificar mensagem para URL
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${this.whatsappNumber}?text=${encodedMessage}`;

        // Abrir WhatsApp
        window.open(whatsappUrl, '_blank');

        // Fechar modal
        this.closeModal();
    }
};

// Inicializar carrinho quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    Cart.init();
});