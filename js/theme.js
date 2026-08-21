const THEME_KEY = 'tcc_tarde_theme';
const AVAILABLE_THEMES = ['original', 'light', 'gamecube', 'nes', 'snes', 'atari', 'xbox', 'gameboy', 'casaxeira'];

// Lê o tema salvo, ou cai para a preferência do sistema operacional
function getPreferredTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (AVAILABLE_THEMES.includes(saved)) {
        return saved;
    }
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

// Aplica o tema no <html>, salva a escolha e atualiza o dropdown
function applyTheme(theme) {
    if (!AVAILABLE_THEMES.includes(theme)) {
        theme = 'original';
    }
    
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);

    // Atualiza o estado do dropdown
    const options = document.querySelectorAll('.theme-option');
    options.forEach(option => {
        if (option.getAttribute('data-theme') === theme) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });

    // Fecha o dropdown após seleção
    closeThemeMenu();
}

// Define um tema específico
function setTheme(theme) {
    if (AVAILABLE_THEMES.includes(theme)) {
        applyTheme(theme);
    }
}

// Alterna a visibilidade do menu de temas
function toggleThemeMenu() {
    const dropdown = document.getElementById('themeDropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
}

// Fecha o menu de temas
function closeThemeMenu() {
    const dropdown = document.getElementById('themeDropdown');
    if (dropdown) {
        dropdown.classList.remove('active');
    }
}

// Fecha o menu ao clicar fora dele
document.addEventListener('click', (e) => {
    const themeMenu = document.querySelector('.theme-menu');
    if (themeMenu && !themeMenu.contains(e.target)) {
        closeThemeMenu();
    }
});

// Garante que o tema correto seja aplicado assim que a página carregar
document.addEventListener('DOMContentLoaded', () => {
    const current = document.documentElement.getAttribute('data-theme') || getPreferredTheme();
    applyTheme(current);
});
