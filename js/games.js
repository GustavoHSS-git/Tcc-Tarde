// Funções para carregamento de jogos
const searchableGames = new Map();
const fallbackGames = [
    { id: 'elden-ring', title: 'Elden Ring', img: '../../uploads/jogos/Elden Ring.jfif', desc: 'RPG de ação.' },
    { id: 'the-last-of-us', title: 'The Last of Us', img: '../../uploads/jogos/tlou.jfif', desc: 'Ação e sobrevivência.' },
    { id: 'outer-wilds', title: 'Outer Wilds', img: '../../uploads/jogos/outer wids.jfif', desc: 'Exploração e mistério.' },
    { id: 'gris', title: 'GRIS', img: '../../uploads/jogos/gris.jfif', desc: 'Aventura e plataforma.' },
    { id: 'street-fighter-v', title: 'Street Fighter V', img: '../../uploads/jogos/Street Fighter V.jfif', desc: 'Jogo de luta.' },
    { id: 'street-fighter-6', title: 'Street Fighter 6', img: '../../uploads/jogos/STREET FIGHTER 6.jfif', desc: 'Jogo de luta.' },
    { id: 'lego-batman-2', title: 'Lego Batman 2', img: '../../uploads/jogos/Lego Batman 2.jfif', desc: 'Aventura.' }
];

function registerGames(games) {
    games.forEach((game) => {
        const key = game.id || game.title;
        if (key) searchableGames.set(key, game);
    });
}

function navigateToSeries(seriesId) {
    const id = (seriesId || '').toString().trim();
    if (!id) return;
    window.location.hash = `#series/${id}`;
}

function createSeriesCard(game) {
    const card = document.createElement('div');
    card.className = 'series-card';
    card.setAttribute('role', 'button');
    card.tabIndex = 0;
    card.dataset.id = game.id || game.title;
    card.innerHTML = `
        <img class="series-card-poster" src="${game.img}" alt="${game.title}">
        <div class="series-card-content">
            <div class="series-card-title">${game.title}</div>
            <div class="series-card-info">${game.desc}</div>
        </div>`;

    const openDetails = () => navigateToSeries(game.id || game.title);
    card.addEventListener('click', openDetails);
    card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openDetails();
        }
    });

    return card;
}

function bindStaticSeriesCards() {
    document.querySelectorAll('.series-card[data-id]').forEach((card) => {
        const openDetails = () => navigateToSeries(card.dataset.id);
        card.addEventListener('click', openDetails);
        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openDetails();
            }
        });
    });
}

function renderSeriesCards(container, games) {
    if (!container) return;

    registerGames(games);
    container.innerHTML = '';
    games.forEach((game) => container.appendChild(createSeriesCard(game)));
}

async function loadNewReleasesSection() {
    const container = document.getElementById('newSeries') || document.getElementById('newGames');
    if (container) {
        renderSeriesCards(container, [
            { id: 'elden-ring', title: 'Elden Ring', img: '../../uploads/jogos/Elden Ring.jfif', desc: 'RPG de ação.' },
            { id: 'the-last-of-us', title: 'The Last of Us', img: '../../uploads/jogos/tlou.jfif', desc: 'Ação e sobrevivência.' },
            { id: 'outer-wilds', title: 'Outer Wilds', img: '../../uploads/jogos/outer wids.jfif', desc: 'Exploração e mistério.' },
            { id: 'gris', title: 'GRIS', img: '../../uploads/jogos/gris.jfif', desc: 'Aventura e plataforma.' },
            { id: 'street-fighter-v', title: 'Street Fighter V', img: '../../uploads/jogos/Street Fighter V.jfif', desc: 'Jogo de luta.' }
        ]);
    }
}

async function loadAnimeSection() {
    const container = document.getElementById('animeSeries') || document.getElementById('animeGames');
    if (container) {
        renderSeriesCards(container, [
            { id: 'gris', title: 'GRIS', img: '../../uploads/jogos/gris.jfif', desc: 'Aventura e plataforma.' },
            { id: 'outer-wilds', title: 'Outer Wilds', img: '../../uploads/jogos/outer wids.jfif', desc: 'Exploração e mistério.' },
            { id: 'lego-batman-2', title: 'Lego Batman 2', img: '../../uploads/jogos/Lego Batman 2.jfif', desc: 'Aventura.' },
            { id: 'street-fighter-v', title: 'Street Fighter V', img: '../../uploads/jogos/Street Fighter V.jfif', desc: 'Jogo de luta.' }
        ]);
    }
}

async function loadPopularSeries() {
    const container = document.getElementById('popularSeries') || document.getElementById('popularGames');
    if (container) {
        renderSeriesCards(container, [
            { id: 'elden-ring', title: 'Elden Ring', img: '../../uploads/jogos/Elden Ring.jfif', desc: 'RPG de ação.' },
            { id: 'the-last-of-us', title: 'The Last of Us', img: '../../uploads/jogos/tlou.jfif', desc: 'Ação e sobrevivência.' },
            { id: 'street-fighter-6', title: 'Street Fighter 6', img: '../../uploads/jogos/STREET FIGHTER 6.jfif', desc: 'Jogo de luta.' },
            { id: 'outer-wilds', title: 'Outer Wilds', img: '../../uploads/jogos/outer wids.jfif', desc: 'Exploração e mistério.' }
        ]);
    }
}

async function loadTopRatedSeries() {
    const container = document.getElementById('topRatedSeries');
    if (container) {
        renderSeriesCards(container, [
            { id: 'the-last-of-us', title: 'The Last of Us', img: '../../uploads/jogos/tlou.jfif', desc: 'Ação e sobrevivência.' },
            { id: 'elden-ring', title: 'Elden Ring', img: '../../uploads/jogos/Elden Ring.jfif', desc: 'RPG de ação.' },
            { id: 'gris', title: 'GRIS', img: '../../uploads/jogos/gris.jfif', desc: 'Aventura e plataforma.' },
            { id: 'outer-wilds', title: 'Outer Wilds', img: '../../uploads/jogos/outer wids.jfif', desc: 'Exploração e mistério.' },
            { id: 'god-of-war', title: 'God of War', img: '../../uploads/jogos/GOD OF WAR.jfif', desc: 'Ação e aventura.' }
        ]);
    }
}

async function loadRecentActivity() {
    const container = document.getElementById('activityFeed');
    if (container) {
        container.innerHTML = '<p>Sem atividades recentes.</p>';
    }
}

function getStaticGames() {
    return [...document.querySelectorAll('.series-card[data-id]')].map((card) => ({
        id: card.dataset.id,
        title: card.querySelector('.series-card-title')?.textContent.trim() || card.dataset.id,
        img: card.querySelector('.series-card-poster')?.src,
        desc: card.querySelector('.series-card-info')?.textContent.trim() || ''
    }));
}

function searchSeries(event) {
    const query = event.target.value.trim().toLowerCase();
    const results = document.getElementById('searchResults');
    if (!results) return;

    if (!query) {
        results.innerHTML = '<p class="placeholder-text">Digite algo para começar a buscar...</p>';
        return;
    }

    const games = new Map(searchableGames);
    getStaticGames().forEach((game) => games.set(game.id, game));
    const matches = [...games.values()].filter((game) => {
        const searchableText = `${game.id} ${game.title} ${game.desc}`.toLowerCase();
        return searchableText.includes(query);
    });

    results.innerHTML = '';
    if (matches.length === 0) {
        results.innerHTML = '<p class="placeholder-text">Nenhum jogo encontrado.</p>';
        return;
    }

    renderSeriesCards(results, matches);
}

function performSearch() {
    const input = document.getElementById('searchInput');
    if (input) {
        searchSeries({ target: input });
    }
}

function heroSearchSeries(event) {
    searchSeries(event);
}

function loadSeriesDetail(seriesId) {
    const container = document.getElementById('seriesDetail');
    if (!container) return;

    const normalizedId = decodeURIComponent(seriesId || '').toLowerCase();
    const games = new Map(fallbackGames.map((game) => [game.id, game]));
    searchableGames.forEach((game, id) => games.set(String(id).toLowerCase(), game));
    getStaticGames().forEach((game) => games.set(String(game.id).toLowerCase(), game));

    const game = games.get(normalizedId) || [...games.values()].find((item) =>
        String(item.title).toLowerCase() === normalizedId
    );

    if (!game) {
        container.innerHTML = '<p class="placeholder-text">Jogo não encontrado.</p>';
        return;
    }

    container.innerHTML = `
        <div class="backdrop-container">
            <img class="backdrop-img" src="${game.img}" alt="">
        </div>
        <div class="series-detail-content">
            <div class="series-detail-header">
                <img class="series-detail-poster" src="${game.img}" alt="${game.title}">
                <div class="series-detail-info">
                    <h1 class="series-detail-title">${game.title}</h1>
                    <div class="series-detail-meta">
                        <span>${game.desc}</span>
                    </div>
                    <div class="series-detail-overview">
                        <h3>Sobre o jogo</h3>
                        <p>${game.desc} Confira informações, avaliações e novidades sobre ${game.title}.</p>
                    </div>
                    <div class="series-detail-actions">
                        <button class="btn btn-primary" onclick="window.location.hash='#home'">Voltar aos jogos</button>
                    </div>
                </div>
            </div>
        </div>`;
}

function showSeriesDetail(seriesId) {
    loadSeriesDetail(seriesId);
}