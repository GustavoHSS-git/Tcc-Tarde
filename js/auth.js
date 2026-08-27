// Autenticação e gerenciamento de sessão
let currentUser = null;

// Verificar sessão ao carregar a página
async function checkSession() {
    try {
        const data = await API.checkSession();
        if (data.authenticated) {
            currentUser = data.user;
            updateUIForLoggedInUser();
        }
    } catch (error) {
        console.error('Erro ao verificar sessão:', error);
    }
}

// Atualizar interface para usuário logado
function updateUIForLoggedInUser() {
    document.getElementById('authButtons').style.display = 'none';
    document.getElementById('userMenu').style.display = 'block';
    document.getElementById('profileLink').style.display = 'block';
    document.getElementById('headerUsername').textContent = currentUser.username;
    
    if (currentUser.avatar) {
        const avatarElement = document.getElementById('headerAvatar');
        avatarElement.dataset.userAvatar = 'true';
        
        // Verifica se é link do Cloudinary (http) ou arquivo local
        const avatarSrc = currentUser.avatar.startsWith('data:') || currentUser.avatar.startsWith('http')
            ? currentUser.avatar 
            : `../../uploads/icons/${currentUser.avatar}`;
            
        avatarElement.src = avatarSrc;

        // Se a imagem não carregar por algum motivo, põe a padrão
        avatarElement.onerror = function() { 
              this.src = '../../uploads/icons/icon-icons.png';
            this.onerror = null;
        };
    }
    
    // Atualizar banner se função existir
    if (typeof updateHeroBanner === 'function') {
        updateHeroBanner();
    }
}

// Atualizar interface para usuário deslogado
function updateUIForLoggedOutUser() {
    currentUser = null;
    document.getElementById('authButtons').style.display = 'flex';
    document.getElementById('userMenu').style.display = 'none';
    document.getElementById('profileLink').style.display = 'none';
    document.getElementById('headerAvatar').removeAttribute('data-user-avatar');
    
    // Atualizar banner se função existir
    if (typeof updateHeroBanner === 'function') {
        updateHeroBanner();
    }
}

// Toggle dropdown do usuário
function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('active');
}

// Fechar dropdown ao clicar fora
document.addEventListener('click', (e) => {
    const userMenu = document.getElementById('userMenu');
    const dropdown = document.getElementById('userDropdown');
    
    if (!userMenu.contains(e.target)) {
        dropdown.classList.remove('active');
    }
});

// Mostrar modal de login
function showLogin() {
    document.getElementById('loginModal').classList.add('active');
    document.getElementById('loginError').classList.remove('active');
}

// Mostrar modal de registro
function showRegister() {
    document.getElementById('registerModal').classList.add('active');
    document.getElementById('registerError').classList.remove('active');
}

// Mostrar modal de recuperação de senha
function switchToForgotPassword(event) {
    event?.preventDefault();
    closeModal('loginModal');
    const modal = document.getElementById('forgotPasswordModal');
    modal.classList.add('active');
    document.getElementById('forgotPasswordError').classList.remove('active');
    document.getElementById('forgotPasswordSuccess').classList.remove('active');
    document.getElementById('forgotPasswordForm').reset();
    document.getElementById('forgotPasswordEmail').focus();
}

function switchToLoginFromForgot(event) {
    event?.preventDefault();
    closeModal('forgotPasswordModal');
    showLogin();
}

function handleForgotPassword(event) {
    event.preventDefault();
    const errorDiv = document.getElementById('forgotPasswordError');
    const successDiv = document.getElementById('forgotPasswordSuccess');
    const email = event.target.email.value.trim();

    errorDiv.classList.remove('active');
    successDiv.classList.remove('active');

    if (!email) {
        errorDiv.textContent = 'Informe um e-mail válido.';
        errorDiv.classList.add('active');
        return;
    }

    successDiv.textContent = 'Solicitação recebida. A redefinição por e-mail será disponibilizada quando o servidor de recuperação estiver conectado.';
    successDiv.classList.add('active');
}

// Fechar modal
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Alternar entre modais
function switchToRegister() {
    closeModal('loginModal');
    showRegister();
}

function switchToLogin() {
    closeModal('registerModal');
    showLogin();
}

// Handle login
async function handleLogin(event) {
    event.preventDefault();
    
    const form = event.target;
    const email = form.email.value;
    const password = form.password.value;
    const errorDiv = document.getElementById('loginError');

    try {
        const data = await API.login(email, password);
        
        // Dentro do handleLogin(event)
            if (data.success) {
            currentUser = {
            id: data.userId,
            username: data.username,
            avatar: data.avatar // Garanta que esta linha exista!
        };
    
            closeModal('loginModal');
            updateUIForLoggedInUser();
    

            // Recarregar página inicial
            if (window.location.hash === '#home' || !window.location.hash) {
                loadHomePage();
            }
        } else {
            errorDiv.textContent = data.error || 'Erro ao fazer login';
            errorDiv.classList.add('active');
        }
    } catch (error) {
        errorDiv.textContent = 'Erro ao conectar com o servidor';
        errorDiv.classList.add('active');
    }
}

// Handle register
async function handleRegister(event) {
    event.preventDefault();
    
    const form = event.target;
    const username = form.username.value;
    const email = form.email.value;
    const password = form.password.value;
    const errorDiv = document.getElementById('registerError');

    try {
        const data = await API.register(username, email, password);
        
        if (data.success) {
            currentUser = {
                id: data.userId,
                username: data.username
            };
            
            closeModal('registerModal');
            updateUIForLoggedInUser();
            
            // Recarregar página inicial
            if (window.location.hash === '#home' || !window.location.hash) {
                loadHomePage();
            }
        } else {
            errorDiv.textContent = data.error || 'Erro ao criar conta';
            errorDiv.classList.add('active');
        }
    } catch (error) {
        errorDiv.textContent = 'Erro ao conectar com o servidor';
        errorDiv.classList.add('active');
    }
}

// Logout
async function logout() {
    try {
        await API.logout();
        updateUIForLoggedOutUser();
        
        // Redirecionar para home
        window.location.hash = '#home';
        loadHomePage();
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
    }
}

// Fechar modais ao clicar fora
window.onclick = (event) => {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
};
