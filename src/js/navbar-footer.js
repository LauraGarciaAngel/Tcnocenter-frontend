// ============================================================================
// navbar-footer.js — Carga e inicializa los componentes compartidos
// ============================================================================

const componentsBaseUrl = new URL('../components/', document.currentScript.src);
const adminDashboardUrl = new URL('../html/Administrador/admin_dashboard.html', document.currentScript.src).href;

// Credencial semilla de Administradora (pre-cargada en localStorage)
const SEED_ADMIN_USER = {
  name: 'Admin Tcnocenter',
  email: 'admin@tcnocenter.com',
  password: 'admin1234',
  role: 'admin',
  terms: true,
  createdAt: '2026-01-01T00:00:00.000Z'
};

function ensureSeedUsers() {
  try {
    const stored = JSON.parse(localStorage.getItem('tcnoUsers') || '[]');
    const users = Array.isArray(stored) ? stored : [];
    const existingIndex = users.findIndex(
      (u) => String(u.email || '').toLowerCase() === SEED_ADMIN_USER.email
    );
    if (existingIndex === -1) {
      users.unshift(SEED_ADMIN_USER);
    } else {
      users[existingIndex] = { ...users[existingIndex], ...SEED_ADMIN_USER };
    }
    localStorage.setItem('tcnoUsers', JSON.stringify(users));
    return users;
  } catch {
    return [SEED_ADMIN_USER];
  }
}

async function loadComponents() {
  const allowedComponents = new Set(['navbar', 'footer', 'admin-layout', 'cart-drawer']);
  const placeholders = Array.from(document.querySelectorAll('[data-component]'))
    .filter((placeholder) => placeholder.dataset.loading !== 'true');

  if (!document.querySelector('[data-component="cart-drawer"]')) {
    const cartPlaceholder = document.createElement('div');
    cartPlaceholder.dataset.component = 'cart-drawer';
    document.body.append(cartPlaceholder);
    placeholders.push(cartPlaceholder);
  }

  await Promise.all(placeholders.map(async (placeholder) => {
    const componentName = placeholder.getAttribute('data-component');
    if (!allowedComponents.has(componentName)) {
      throw new Error(`Componente de interfaz desconocido: ${componentName}`);
    }

    placeholder.dataset.loading = 'true';
    const componentUrl = new URL(`${componentName}.html`, componentsBaseUrl);
    const response = await fetch(componentUrl);
    if (!response.ok) {
      throw new Error(`No se pudo cargar ${componentUrl}: ${response.status} ${response.statusText}`);
    }

    placeholder.outerHTML = await response.text();
  }));
}

function initializeComponents() {
  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
  }
  document.dispatchEvent(new CustomEvent('tcno:components-ready'));

  if (typeof window.initAdminDashboard === 'function') {
    window.initAdminDashboard();
  }

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.tcno-navbar .nav-link[href]').forEach((link) => {
    const href = link.getAttribute('href');
    const isPlaceholderLink = !href || href === '#' || href.startsWith('#');
    const linkPage = isPlaceholderLink
      ? null
      : new URL(link.href, document.baseURI).pathname.split('/').pop();
    const isCurrentPage = linkPage === currentPage;
    link.classList.toggle('active', isCurrentPage);

    if (isCurrentPage) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });

  const togglers = document.querySelectorAll('.navbar [data-bs-toggle="collapse"]');
  togglers.forEach((toggler) => {
    toggler.addEventListener('click', (event) => {
      event.preventDefault();
      const targetSelector = toggler.getAttribute('data-bs-target');
      if (targetSelector) {
        const targetElement = document.querySelector(targetSelector);
        if (targetElement) {
          targetElement.classList.toggle('show');
          const isExpanded = targetElement.classList.contains('show');
          toggler.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
        }
      }
    });
  });

  initializeAccountRegistration();
}

function initializeAccountRegistration() {
  const accountToggle = document.querySelector('[data-account-toggle]');
  const accountMenu = document.querySelector('[data-account-menu]');
  const registerModal = document.querySelector('[data-register-modal]');
  const registerForm = document.querySelector('[data-register-form]');
  const loginModal = document.querySelector('[data-login-modal]');
  const loginForm = document.querySelector('[data-login-form]');

  if (!accountToggle || !accountMenu || !registerModal || !registerForm) {
    return;
  }

  ensureSeedUsers();

  const syncModalBodyLock = () => {
    const isAnyModalOpen = !registerModal.hidden || Boolean(loginModal && !loginModal.hidden);
    document.body.classList.toggle('tcno-modal-open', isAnyModalOpen);
  };

  const setAccountMenuVisibility = (isVisible) => {
    accountMenu.hidden = !isVisible;
    accountToggle.setAttribute('aria-expanded', String(isVisible));
  };

  const setModalVisibility = (isVisible) => {
    registerModal.hidden = !isVisible;
    syncModalBodyLock();
    if (isVisible) {
      registerModal.querySelector('input')?.focus();
    }
  };

  const setLoginModalVisibility = (isVisible) => {
    if (!loginModal) {
      return;
    }
    loginModal.hidden = !isVisible;
    syncModalBodyLock();
    if (isVisible) {
      loginModal.querySelector('input')?.focus();
    }
  };

  accountToggle.addEventListener('click', () => {
    setAccountMenuVisibility(accountMenu.hidden);
  });

  document.querySelectorAll('[data-register-open]').forEach((button) => {
    button.addEventListener('click', () => {
      setAccountMenuVisibility(false);
      setLoginModalVisibility(false);
      setModalVisibility(true);
    });
  });

  document.querySelectorAll('[data-account-login]').forEach((button) => {
    button.addEventListener('click', () => {
      setAccountMenuVisibility(false);
      setModalVisibility(false);
      setLoginModalVisibility(true);
    });
  });

  document.querySelector('[data-register-close]')?.addEventListener('click', () => {
    setModalVisibility(false);
  });

  document.querySelector('[data-login-close]')?.addEventListener('click', () => {
    setLoginModalVisibility(false);
  });

  registerModal.addEventListener('click', (event) => {
    if (event.target === registerModal) {
      setModalVisibility(false);
    }
  });

  loginModal?.addEventListener('click', (event) => {
    if (event.target === loginModal) {
      setLoginModalVisibility(false);
    }
  });

  document.querySelectorAll('[data-password-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const input = document.getElementById(button.dataset.passwordToggle);
      if (!input) {
        return;
      }
      const shouldShow = input.type === 'password';
      input.type = shouldShow ? 'text' : 'password';
      button.setAttribute('aria-label', shouldShow ? 'Ocultar contraseña' : 'Mostrar contraseña');
      button.innerHTML = `<i data-lucide="${shouldShow ? 'eye-off' : 'eye'}" aria-hidden="true"></i>`;
      if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
      }
    });
  });

  registerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(registerForm);
    const user = {
      name: String(formData.get('name') || '').trim(),
      email: String(formData.get('email') || '').trim().toLowerCase(),
      password: String(formData.get('password') || ''),
      passwordConfirmation: String(formData.get('passwordConfirmation') || ''),
      terms: formData.get('terms') === 'on'
    };
    const errors = validateRegistration(user);
    renderRegistrationErrors(registerForm, errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const users = ensureSeedUsers();
    if (users.some((storedUser) => storedUser.email === user.email)) {
      renderRegistrationErrors(registerForm, { email: 'Este correo ya está registrado.' });
      return;
    }

    users.push({ ...user, role: 'user', createdAt: new Date().toISOString() });
    localStorage.setItem('tcnoUsers', JSON.stringify(users));
    registerForm.reset();
    registerForm.querySelector('[data-register-status]').textContent = 'Cuenta creada correctamente.';
  });

  loginForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(loginForm);
    const credentials = {
      email: String(formData.get('email') || '').trim().toLowerCase(),
      password: String(formData.get('password') || '')
    };
    const errors = validateLogin(credentials);
    renderRegistrationErrors(loginForm, errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const users = ensureSeedUsers();
    const matchedUser = users.find((storedUser) => storedUser.email === credentials.email);

    if (!matchedUser) {
      renderRegistrationErrors(loginForm, { email: 'No encontramos una cuenta con este correo.' });
      return;
    }

    if (matchedUser.password !== credentials.password) {
      renderRegistrationErrors(loginForm, { password: 'La contraseña ingresada es incorrecta.' });
      return;
    }

    localStorage.setItem(
      'tcnoCurrentUser',
      JSON.stringify({
        name: matchedUser.name,
        email: matchedUser.email,
        role: matchedUser.role || 'user',
        loggedInAt: new Date().toISOString()
      })
    );
    loginForm.reset();
    const statusElement = loginForm.querySelector('[data-login-status]');
    if (statusElement) {
      statusElement.textContent =
        matchedUser.role === 'admin' || matchedUser.email === SEED_ADMIN_USER.email
          ? `¡Bienvenido(a), ${matchedUser.name}! Redirigiendo al panel...`
          : `¡Bienvenido(a), ${matchedUser.name}! Sesión iniciada correctamente.`;
    }

    if (matchedUser.role === 'admin' || matchedUser.email === SEED_ADMIN_USER.email) {
      window.setTimeout(() => {
        window.location.href = adminDashboardUrl;
      }, 450);
    }
  });

  document.addEventListener('click', (event) => {
    if (!accountMenu.hidden && !accountMenu.parentElement.contains(event.target)) {
      setAccountMenuVisibility(false);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setAccountMenuVisibility(false);
      setModalVisibility(false);
      setLoginModalVisibility(false);
    }
  });
}

function validateLogin(credentials) {
  const errors = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
    errors.email = 'Ingresa un correo electrónico válido.';
  }
  if (credentials.password.length < 8) {
    errors.password = 'La contraseña debe tener mínimo 8 caracteres.';
  }
  return errors;
}

function validateRegistration(user) {
  const errors = {};
  if (user.name.length < 3 || !user.name.includes(' ')) {
    errors.name = 'Ingresa tu nombre y apellido.';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
    errors.email = 'Ingresa un correo electrónico válido.';
  }
  if (user.password.length < 8) {
    errors.password = 'La contraseña debe tener mínimo 8 caracteres.';
  }
  if (user.password !== user.passwordConfirmation) {
    errors.passwordConfirmation = 'Las contraseñas no coinciden.';
  }
  if (!user.terms) {
    errors.terms = 'Debes aceptar los Términos y Condiciones.';
  }
  return errors;
}

function renderRegistrationErrors(form, errors) {
  form.querySelectorAll('.tcno-register-error').forEach((errorElement) => {
    const field = errorElement.dataset.errorFor;
    errorElement.textContent = errors[field] || '';
  });
  const statusElement = form.querySelector('[data-register-status], [data-login-status]');
  if (statusElement) {
    statusElement.textContent = '';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadComponents()
    .then(initializeComponents)
    .catch((error) => {
      console.error('Error al cargar los componentes de interfaz:', error);
    });
});
