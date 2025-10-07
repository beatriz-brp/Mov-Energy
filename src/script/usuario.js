// ========================
// PROTEÇÃO DE ACESSO REFORÇADA
// ========================

// Verifica login IMEDIATAMENTE (antes mesmo do DOM carregar)
(function() {
    const isLoggedIn = localStorage.getItem("usuarioLogado") === "true";
    const loggedInFlag = localStorage.getItem("loggedIn") === "true";
    
    // Verifica ambas as flags de login
    if (!isLoggedIn && !loggedInFlag) {
        // Remove qualquer conteúdo da página
        document.documentElement.innerHTML = `
            <html>
                <head>
                    <title>Acesso Negado</title>
                    <style>
                        body { 
                            font-family: 'Poppins', Arial, sans-serif;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            margin: 0;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            text-align: center;
                        }
                        .error-container {
                            max-width: 400px;
                            padding: 2rem;
                            background: rgba(255,255,255,0.1);
                            border-radius: 20px;
                            backdrop-filter: blur(10px);
                        }
                        h1 { margin-bottom: 1rem; }
                        p { margin-bottom: 2rem; opacity: 0.8; }
                        .btn {
                            display: inline-block;
                            padding: 12px 30px;
                            background: linear-gradient(45deg, #ff6b6b, #ee5a24);
                            color: white;
                            text-decoration: none;
                            border-radius: 25px;
                            font-weight: 600;
                            transition: transform 0.3s ease;
                        }
                        .btn:hover { transform: translateY(-2px); }
                    </style>
                </head>
                <body>
                    <div class="error-container">
                        <h1>🔒 Acesso Restrito</h1>
                        <p>Você precisa fazer login para acessar esta página.</p>
                        <a href="login.html" class="btn">Fazer Login</a>
                    </div>
                </body>
            </html>
        `;
        
        // Impede execução de qualquer script adicional
        throw new Error("Acesso negado - usuário não logado");
    }
})();

document.addEventListener("DOMContentLoaded", function () {
    // Verifica novamente após DOM carregar (dupla proteção)
    const isLoggedIn = localStorage.getItem("usuarioLogado") === "true";
    const loggedInFlag = localStorage.getItem("loggedIn") === "true";
    
    if (!isLoggedIn && !loggedInFlag) {
        window.location.href = "login.html";
        return;
    }

    // ========================
    // MONITORAMENTO CONTÍNUO
    // ========================
    
    // Monitora mudanças no localStorage
    window.addEventListener('storage', function(e) {
        if ((e.key === 'usuarioLogado' || e.key === 'loggedIn') && 
            e.newValue !== 'true') {
            alert('Sessão expirada. Redirecionando para o login...');
            window.location.href = 'login.html';
        }
    });

    // Verifica status de login a cada 30 segundos
    setInterval(() => {
        const currentStatus = localStorage.getItem("usuarioLogado") === "true" || 
                             localStorage.getItem("loggedIn") === "true";
        
        if (!currentStatus) {
            alert('Sessão expirada. Você será redirecionado para o login.');
            window.location.href = 'login.html';
        }
    }, 30000);

    // ========================
    // FUNÇÃO DE LOGOUT SEGURA
    // ========================
    window.logout = function () {
        // Limpa todos os dados de sessão
        localStorage.removeItem("loggedIn");
        localStorage.removeItem("usuarioLogado");
        localStorage.removeItem("usuarioNome");
        
        // Limpa sessionStorage também (caso exista)
        sessionStorage.clear();
        
        // Mostra mensagem de confirmação
        alert('Logout realizado com sucesso!');
        
        // Redireciona para login
        window.location.href = "login.html";
    };

    // ========================
    // PROTEÇÃO CONTRA DEV TOOLS
    // ========================
    
    // Detecta se DevTools está aberto (método básico)
    let devtools = {open: false, orientation: null};
    const threshold = 160;

    setInterval(() => {
        if (window.outerHeight - window.innerHeight > threshold || 
            window.outerWidth - window.innerWidth > threshold) {
            if (!devtools.open) {
                devtools.open = true;
                console.warn('⚠️ Ferramentas de desenvolvedor detectadas. O sistema está monitorando sua sessão.');
            }
        } else {
            devtools.open = false;
        }
    }, 500);

    // ========================
    // INICIALIZAÇÃO DOS RECURSOS DA PÁGINA
    // ========================
    
    // Carrega dados do usuário
    const userName = localStorage.getItem("usuarioNome") || "Usuário";
    console.log(`✅ Bem-vindo, ${userName}!`);

    // ========================
    // Contadores animados
    // ========================
    function animateCounter(element, start, end, duration) {
        let startTime = null;
        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const value = progress * (end - start) + start;
            element.textContent =
                value.toFixed(1) +
                (element.id.includes("calorias")
                    ? " kcal"
                    : element.id.includes("energia")
                    ? " kWh"
                    : "%");
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };
        requestAnimationFrame(step);
    }

    setTimeout(() => {
        const energiaEl = document.getElementById("energia-hoje");
        const caloriasEl = document.getElementById("calorias-hoje");
        const descontoEl = document.getElementById("desconto-mensal");

        if (energiaEl) animateCounter(energiaEl, 0, 2.4, 2000);
        if (caloriasEl) animateCounter(caloriasEl, 0, 485, 2000);
        if (descontoEl) animateCounter(descontoEl, 0, 12, 2000);
    }, 1000);

    // ========================
    // Botão QR Code
    // ========================
    const scanBtn = document.getElementById("scan-qr-btn");
    if (scanBtn) {
        scanBtn.addEventListener("click", function (e) {
            e.preventDefault();
            
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Abrindo câmera...';
            this.disabled = true;

            setTimeout(() => {
                // Verifica se ainda está logado antes de executar
                if (localStorage.getItem("usuarioLogado") !== "true" && 
                    localStorage.getItem("loggedIn") !== "true") {
                    window.location.href = "login.html";
                    return;
                }
                
                // Redireciona para página da câmera
                window.location.href = 'camera.html';
            }, 1500);
        });
    }

    // ========================
    // Scroll suave
    // ========================
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute("href"));
            if (target) {
                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }
        });
    });

    // ========================
    // PERSONALIZAÇÃO DA INTERFACE
    // ========================
    
    // Atualiza nome do usuário na interface (se existir elemento específico)
    const userNameElements = document.querySelectorAll('.user-name, #user-name');
    userNameElements.forEach(element => {
        element.textContent = userName;
    });

    // Adiciona classe para indicar usuário logado
    document.body.classList.add('user-logged-in');
    
    console.log('✅ Dashboard do usuário carregado com sucesso!');
});

// ========================
// PROTEÇÕES ADICIONAIS
// ========================

// Impede que a página seja carregada em iframe (clickjacking)
if (window.top !== window.self) {
    window.top.location = window.location;
}

// Previne ações maliciosas no console
console.log('%c⚠️ ATENÇÃO', 'color: red; font-size: 20px; font-weight: bold;');
console.log('%cSe alguém te disse para colar algo aqui, pode ser uma tentativa de roubo de conta!', 'color: red; font-size: 14px;');
console.log('%cApenas desenvolvedores autorizados devem usar esta área.', 'color: red; font-size: 14px;');