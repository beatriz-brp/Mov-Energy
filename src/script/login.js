// ===========================================
// CONFIGURAÇÕES GLOBAIS
// ===========================================

const CONFIG = {
    ANIMATION_DURATION: 600,
    TOAST_DURATION: 4000,
    API_DELAY: 1500,
    MIN_PASSWORD_LENGTH: 6
};

// ===========================================
// ESTADO DA APLICAÇÃO
// ===========================================

const state = {
    currentMode: 'login',
    isAnimating: false
};

// ===========================================
// CACHE DE ELEMENTOS DOM
// ===========================================

const elements = {};

/**
 * Inicializa e cacheia todos os elementos DOM necessários
 */
function cacheElements() {
    const ids = [
        'container', 'loginForm', 'signupForm', 
        'loginFormElement', 'signupFormElement', 'toastContainer'
    ];
    
    ids.forEach(id => {
        elements[id] = document.getElementById(id);
        if (!elements[id]) {
            console.warn(`Elemento não encontrado: ${id}`);
        }
    });
}

// ===========================================
// INICIALIZAÇÃO
// ===========================================

/**
 * Inicializa a aplicação quando o DOM estiver pronto
 */
document.addEventListener('DOMContentLoaded', init);

function init() {
    cacheElements();
    setupEventListeners();
    setupFormValidation();
    handleResponsive();
}

// ===========================================
// EVENT LISTENERS
// ===========================================

/**
 * Configura todos os event listeners da aplicação
 */
function setupEventListeners() {
    // Formulários
    elements.loginFormElement?.addEventListener('submit', handleLogin);
    elements.signupFormElement?.addEventListener('submit', handleSignup);

    // Inputs - efeitos visuais
    document.querySelectorAll('.form-input').forEach(input => {
        input.addEventListener('focus', () => addInputEffect(input));
        input.addEventListener('blur', () => removeInputEffect(input));
        input.addEventListener('input', () => validateInput(input));
    });

    // Responsividade
    window.addEventListener('resize', handleResponsive);
    
    // Teclado
    document.addEventListener('keydown', handleKeyboard);
}

// ===========================================
// ALTERNÂNCIA DE MODOS (LOGIN/CADASTRO)
// ===========================================

/**
 * Alterna entre os modos de login e cadastro
 * @param {string} mode - 'login' ou 'signup'
 */
function switchMode(mode) {
    if (state.isAnimating || mode === state.currentMode) return;

    state.isAnimating = true;
    const container = elements.container;

    // Aplica ou remove classe de animação
    if (mode === 'signup') {
        container.classList.add('signup-mode');
        toggleForms('signup');
    } else {
        container.classList.remove('signup-mode');
        toggleForms('login');
    }

    state.currentMode = mode;
    
    // Reset do estado de animação
    setTimeout(() => {
        state.isAnimating = false;
        focusFirstInput(mode);
    }, CONFIG.ANIMATION_DURATION);

    clearErrors();
}

/**
 * Alterna a visibilidade dos formulários
 * @param {string} mode - Modo ativo
 */
function toggleForms(mode) {
    setTimeout(() => {
        if (mode === 'signup') {
            elements.loginForm?.classList.add('hidden');
            elements.signupForm?.classList.remove('hidden');
        } else {
            elements.signupForm?.classList.add('hidden');
            elements.loginForm?.classList.remove('hidden');
        }
    }, 300);
}

/**
 * Foca no primeiro input do formulário ativo
 * @param {string} mode - Modo ativo
 */
function focusFirstInput(mode) {
    const firstInput = document.querySelector(`.${mode}-form .form-input`);
    firstInput?.focus();
}

// ===========================================
// CONTROLE DE SENHA
// ===========================================

/**
 * Alterna visibilidade da senha
 * @param {string} inputId - ID do campo de senha
 */
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input?.nextElementSibling;
    
    if (!input || !icon) return;

    const isVisible = input.type === 'text';
    input.type = isVisible ? 'password' : 'text';
    icon.textContent = isVisible ? '👁' : '🙈';
    
    // Feedback visual
    animateElement(icon, 'scale(1.2)', 150);
}

// ===========================================
// MANIPULAÇÃO DE FORMULÁRIOS
// ===========================================

/**
 * Processa o login do usuário
 */
async function handleLogin(event) {
    event.preventDefault();
    
    const form = event.target;
    const button = form.querySelector('.submit-btn');
    const email = form.querySelector('#loginEmail').value;
    const password = form.querySelector('#loginPassword').value;

    // Validação
    if (!validateLogin(email, password)) return;

    // Estado de loading
    setLoading(button, true);

    try {
        const result = await apiCall('login', { email, password });
        
        if (result.success) {
            showToast('Login realizado com sucesso!', 'success');
            // Simula redirecionamento
            setTimeout(() => window.location.href = '/dashboard', 1500);
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        setLoading(button, false);
    }
}

/**
 * Processa o cadastro do usuário
 */
async function handleSignup(event) {
    event.preventDefault();
    
    const form = event.target;
    const button = form.querySelector('.submit-btn');
    
    const userData = {
        name: form.querySelector('#signupName').value,
        email: form.querySelector('#signupEmail').value,
        password: form.querySelector('#signupPassword').value,
        confirmPassword: form.querySelector('#confirmPassword').value,
        terms: form.querySelector('#acceptTerms').checked
    };

    // Validação
    if (!validateSignup(userData)) return;

    // Estado de loading
    setLoading(button, true);

    try {
        const result = await apiCall('signup', userData);
        
        if (result.success) {
            showToast('Conta criada com sucesso!', 'success');
            setTimeout(() => switchMode('login'), 2000);
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        setLoading(button, false);
    }
}

/**
 * Processa login com Google (placeholder)
 */
function handleGoogleLogin() {
    showToast('Integração com Google em desenvolvimento...', 'warning');
}

// ===========================================
// VALIDAÇÃO DE FORMULÁRIOS
// ===========================================

/**
 * Valida dados de login
 */
function validateLogin(email, password) {
    clearErrors();
    let isValid = true;

    if (!isValidEmail(email)) {
        showFieldError('loginEmail', 'Email inválido');
        isValid = false;
    }

    if (password.length < CONFIG.MIN_PASSWORD_LENGTH) {
        showFieldError('loginPassword', `Senha deve ter pelo menos ${CONFIG.MIN_PASSWORD_LENGTH} caracteres`);
        isValid = false;
    }

    return isValid;
}

/**
 * Valida dados de cadastro
 */
function validateSignup({ name, email, password, confirmPassword, terms }) {
    clearErrors();
    let isValid = true;

    if (name.trim().length < 2) {
        showFieldError('signupName', 'Nome deve ter pelo menos 2 caracteres');
        isValid = false;
    }

    if (!isValidEmail(email)) {
        showFieldError('signupEmail', 'Email inválido');
        isValid = false;
    }

    if (password.length < 8) {
        showFieldError('signupPassword', 'Senha deve ter pelo menos 8 caracteres');
        isValid = false;
    }

    if (password !== confirmPassword) {
        showFieldError('confirmPassword', 'Senhas não coincidem');
        isValid = false;
    }

    if (!terms) {
        showToast('Você deve aceitar os termos de uso', 'error');
        isValid = false;
    }

    return isValid;
}

/**
 * Validação em tempo real dos inputs
 */
function validateInput(input) {
    const { type, value } = input;
    
    if (type === 'email' && value) {
        input.style.borderColor = isValidEmail(value) ? 'var(--success-color)' : 'var(--error-color)';
    }
    
    if (type === 'password' && value) {
        input.style.borderColor = value.length >= 8 ? 'var(--success-color)' : 'var(--warning-color)';
    }
}

// ===========================================
// FUNÇÕES UTILITÁRIAS
// ===========================================

/**
 * Valida formato de email
 */
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Mostra erro em campo específico
 */
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    field.style.borderColor = 'var(--error-color)';
    showToast(message, 'error');

    // Remove erro após 3 segundos
    setTimeout(() => {
        field.style.borderColor = '';
    }, 3000);
}

/**
 * Limpa todos os erros visuais
 */
function clearErrors() {
    document.querySelectorAll('.form-input').forEach(input => {
        input.style.borderColor = '';
    });
}

/**
 * Controla estado de loading dos botões
 */
function setLoading(button, loading) {
    const text = button.querySelector('.btn-text');
    const loader = button.querySelector('.btn-loader');

    button.disabled = loading;
    text.style.opacity = loading ? '0' : '1';
    loader.classList.toggle('hidden', !loading);
}

/**
 * Efeitos visuais nos inputs
 */
function addInputEffect(input) {
    const wrapper = input.parentElement;
    if (wrapper.classList.contains('input-wrapper')) {
        wrapper.style.transform = 'scale(1.02)';
    }
}

function removeInputEffect(input) {
    const wrapper = input.parentElement;
    if (wrapper.classList.contains('input-wrapper')) {
        wrapper.style.transform = 'scale(1)';
    }
}

/**
 * Anima elemento com transform
 */
function animateElement(element, transform, duration) {
    element.style.transform = `translateY(-50%) ${transform}`;
    setTimeout(() => {
        element.style.transform = 'translateY(-50%)';
    }, duration);
}

// ===========================================
// SISTEMA DE NOTIFICAÇÕES
// ===========================================

/**
 * Exibe notificação toast
 * @param {string} message - Mensagem a ser exibida
 * @param {string} type - Tipo da notificação (success, error, warning)
 */
function showToast(message, type = 'info') {
    if (!elements.toastContainer) return;

    const toast = createToastElement(message, type);
    elements.toastContainer.appendChild(toast);

    // Remove automaticamente
    setTimeout(() => removeToast(toast), CONFIG.TOAST_DURATION);
}

/**
 * Cria elemento de toast
 */
function createToastElement(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        ${message}
        <button onclick="removeToast(this.parentElement)" style="position: absolute; top: 5px; right: 10px; background: none; border: none; color: var(--text-primary); font-size: 18px; cursor: pointer;">×</button>
    `;
    return toast;
}

/**
 * Remove notificação toast
 */
function removeToast(toast) {
    if (!toast?.parentNode) return;
    
    toast.style.animation = 'slideOutToast 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
}

// ===========================================
// SIMULAÇÃO DE API
// ===========================================

/**
 * Simula chamadas para API
 * @param {string} endpoint - Endpoint da API
 * @param {Object} data - Dados a serem enviados
 */
async function apiCall(endpoint, data) {
    return new Promise(resolve => {
        setTimeout(() => {
            if (endpoint === 'login') {
                resolve({ 
                    success: data.email && data.password.length >= CONFIG.MIN_PASSWORD_LENGTH,
                    message: 'Credenciais inválidas'
                });
            } else {
                resolve({ success: true, message: 'Sucesso' });
            }
        }, CONFIG.API_DELAY);
    });
}

// ===========================================
// RESPONSIVIDADE E ACESSIBILIDADE
// ===========================================

/**
 * Gerencia comportamento responsivo
 */
function handleResponsive() {
    const isMobile = window.innerWidth <= 768;
    document.querySelectorAll('.mobile-switch').forEach(element => {
        element.style.display = isMobile ? 'block' : 'none';
    });
}

/**
 * Gerencia navegação por teclado
 */
function handleKeyboard(event) {
    if (event.key === 'Escape') {
        // Fecha toasts e limpa erros
        document.querySelectorAll('.toast').forEach(removeToast);
        clearErrors();
    }
}

/**
 * Configura validação HTML5
 */
function setupFormValidation() {
    document.querySelectorAll('input[type="email"]').forEach(input => {
        input.pattern = '[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$';
    });
    
    document.querySelectorAll('input[type="password"]').forEach(input => {
        input.minLength = CONFIG.MIN_PASSWORD_LENGTH;
    });
}

// ===========================================
// FUNÇÕES GLOBAIS (para uso em HTML)
// ===========================================

// Torna funções disponíveis globalmente para uso em onclick
window.switchMode = switchMode;
window.togglePassword = togglePassword;
window.handleGoogleLogin = handleGoogleLogin;
window.removeToast = removeToast;