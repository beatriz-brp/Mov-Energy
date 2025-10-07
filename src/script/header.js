class MovEnergyNav {
  constructor() {
    this.navbar = document.querySelector('.navbar');
    this.hamburger = document.getElementById('hamburger');
    this.mobileMenu = document.getElementById('mobile-menu');
    this.navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    this.body = document.body;
    this.isMenuOpen = false;
    this.scrollThreshold = 50;
    this.init();
  }


  init() {
    this.setupEventListeners();
    this.setActiveLink();
    this.handleScroll(); // Check initial scroll position
  }

  setupEventListeners() {
    // Mobile menu toggle
    if (this.hamburger) {
      this.hamburger.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleMobileMenu();
      });
    }

    // Close mobile menu when clicking on links
    this.navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (this.isMenuOpen) {
          this.closeMobileMenu();
        }
      });
    });

    // Close mobile menu when clicking outside
    if (this.mobileMenu) {
      this.mobileMenu.addEventListener('click', (e) => {
        if (e.target === this.mobileMenu) {
          this.closeMobileMenu();
        }
      });
    }

    // Handle scroll effects
    window.addEventListener('scroll', () => {
      this.handleScroll();
    });

    // Handle resize events
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && this.isMenuOpen) {
        this.closeMobileMenu();
      }
    });

    // Handle escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isMenuOpen) {
        this.closeMobileMenu();
      }
    });

    // Smooth scroll for anchor links
    this.setupSmoothScroll();
  }

  toggleMobileMenu() {
    if (this.isMenuOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  openMobileMenu() {
    this.isMenuOpen = true;
    this.hamburger?.classList.add('active');
    this.mobileMenu?.classList.add('active');
    this.body.style.overflow = 'hidden';

    // Add ARIA attributes for accessibility
    if (this.hamburger) {
      this.hamburger.setAttribute('aria-expanded', 'true');
    }
    if (this.mobileMenu) {
      this.mobileMenu.setAttribute('aria-hidden', 'false');
    }

    // Focus trap
    this.trapFocus();
  }

  closeMobileMenu() {
    this.isMenuOpen = false;
    this.hamburger?.classList.remove('active');
    this.mobileMenu?.classList.remove('active');
    this.body.style.overflow = '';

    // Add ARIA attributes for accessibility
    if (this.hamburger) {
      this.hamburger.setAttribute('aria-expanded', 'false');
    }
    if (this.mobileMenu) {
      this.mobileMenu.setAttribute('aria-hidden', 'true');
    }
  }

  handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > this.scrollThreshold) {
      this.navbar?.classList.add('scrolled');
    } else {
      this.navbar?.classList.remove('scrolled');
    }
  }

  setActiveLink() {
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';

    this.navLinks.forEach(link => {
      link.classList.remove('active');

      const linkPath = link.getAttribute('href');
      if (linkPath === currentPage ||
        (currentPage === '' && linkPath === 'index.html') ||
        (currentPage === 'index.html' && linkPath === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  setupSmoothScroll() {
    // Handle smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));

        if (target) {
          const headerOffset = 80; // Height of fixed navbar
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  trapFocus() {
    if (!this.mobileMenu) return;

    const focusableElements = this.mobileMenu.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    );

    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];

    // Focus first element
    if (firstFocusableElement) {
      firstFocusableElement.focus();
    }

    // Handle tab key
    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusableElement) {
            lastFocusableElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusableElement) {
            firstFocusableElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    if (this.isMenuOpen) {
      document.addEventListener('keydown', handleTabKey);

      // Remove event listener when menu closes
      const removeListener = () => {
        document.removeEventListener('keydown', handleTabKey);
        document.removeEventListener('keydown', removeListener);
      };

      // Clean up when menu closes
      setTimeout(() => {
        if (!this.isMenuOpen) {
          removeListener();
        }
      }, 100);
    }
  }

  // Public methods for external use

  /**
   * Manually set active navigation item
   * @param {string} href - The href value of the link to set as active
   */
  setActive(href) {
    this.navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === href) {
        link.classList.add('active');
      }
    });
  }

  /**
   * Add custom navigation item
   * @param {Object} item - Navigation item object
   * @param {string} item.text - Link text
   * @param {string} item.href - Link URL
   * @param {string} item.position - 'desktop' | 'mobile' | 'both'
   */
  addNavItem(item) {
    const { text, href, position = 'both' } = item;

    if (position === 'desktop' || position === 'both') {
      const desktopNav = document.querySelector('.nav-links');
      if (desktopNav) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = href;
        a.textContent = text;
        a.className = 'nav-link';
        li.appendChild(a);
        desktopNav.appendChild(li);
      }
    }

    if (position === 'mobile' || position === 'both') {
      const mobileNav = document.querySelector('.mobile-nav-links');
      if (mobileNav) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = href;
        a.textContent = text;
        a.className = 'mobile-nav-link';
        li.appendChild(a);

        // Insert before login button (last item)
        const loginItem = mobileNav.querySelector('.btn-style')?.parentElement;
        if (loginItem) {
          mobileNav.insertBefore(li, loginItem);
        } else {
          mobileNav.appendChild(li);
        }
      }
    }

    // Refresh event listeners
    this.navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    this.setupEventListeners();
  }

  /**
   * Get current navigation state
   */
  getState() {
    return {
      isMenuOpen: this.isMenuOpen,
      isScrolled: this.navbar?.classList.contains('scrolled') || false,
      activeLink: document.querySelector('.nav-link.active, .mobile-nav-link.active')?.getAttribute('href') || null
    };
  }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Create global instance
  window.movEnergyNav = new MovEnergyNav();
});
document.addEventListener('DOMContentLoaded', () => {
  // Cria a instância do nav
  window.movEnergyNav = new MovEnergyNav();

  // Verifica se o usuário está logado
  const isLoggedIn = localStorage.getItem('usuarioLogado') === 'true';

  if (isLoggedIn) {
    // Adiciona o item extra no nav
    window.movEnergyNav.addNavItem({
      text: 'Olá, Usuário',
      position: 'inicio',
    });

    // Substituir botão de login por logout
    const loginButton = document.querySelector('.btn');
    if (loginButton) {
      loginButton.textContent = 'Logout';
      loginButton.href = '#';
      loginButton.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('usuarioLogado');
        location.reload();
      });
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  // Cria a instância do nav
  window.movEnergyNav = new MovEnergyNav();

  // Verifica se o usuário está logado
  const isLoggedIn = localStorage.getItem('usuarioLogado') === 'true';

  if (isLoggedIn) {
    // Adiciona o item extra no nav
    window.movEnergyNav.addNavItem({
      text: 'Usuario',
      href: 'usuario.html',
      position: 'both'
    });

    // Substituir botão de login por logout
    const loginButton = document.querySelector('.btn');
    if (loginButton) {
      loginButton.textContent = 'Logout';
      loginButton.href = '#';
      loginButton.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('usuarioLogado');
        location.reload();
      });
    }
  }
});
document.addEventListener('DOMContentLoaded', () => {
  window.movEnergyNav = new MovEnergyNav();

  const isLoggedIn = localStorage.getItem('usuarioLogado') === 'true';
  const userName = localStorage.getItem('usuarioNome') || 'Usuário';

  if (isLoggedIn) {
    // 1. Cria o dropdown de usuário
    const userDropdownHTML = `
      <div class="user-dropdown">
        <button class="user-btn">Olá, ${userName} ▾</button>
        <ul class="dropdown-menu">
          <li><a href="usuario.html">Painel</a></li>
          <li><a href="configuracoes.html">Configurações</a></li>
          <li><a href="ajuda.html">Ajuda</a></li>
        </ul>
      </div>
    `;

    // 2. Insere ao lado do botão de logout
    const nav = document.querySelector('.nav');
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = userDropdownHTML;
    const userDropdown = tempDiv.firstElementChild;
    nav.insertBefore(userDropdown, nav.lastElementChild); // antes do botão de login/logout

    // 3. Substituir botão login por logout
    const loginButton = document.querySelector('.btn');
    if (loginButton) {
      loginButton.textContent = 'Logout';
      loginButton.href = '#';
      loginButton.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('usuarioLogado');
        localStorage.removeItem('usuarioNome');
        location.reload();
      });
    }

    // 4. Toggle do menu dropdown
    const userBtn = document.querySelector('.user-btn');
    const dropdownMenu = document.querySelector('.dropdown-menu');

    userBtn.addEventListener('click', () => {
      dropdownMenu.classList.toggle('active');
    });

    // Fecha o menu se clicar fora
    document.addEventListener('click', (e) => {
      if (!userDropdown.contains(e.target)) {
        dropdownMenu.classList.remove('active');
      }
    });
  }
});
