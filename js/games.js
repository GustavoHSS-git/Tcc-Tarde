// Funções para carregamento de jogos

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

    container.innerHTML = '';
    games.forEach((game) => container.appendChild(createSeriesCard(game)));
}

async function loadNewReleasesSection() {
    const container = document.getElementById('newSeries') || document.getElementById('newGames');
    if (container) {
        renderSeriesCards(container, [
            { id: 'horizon', title: 'Horizon', img: 'https://www.yudiz.com/codepen/expandable-animated-card-slider/dota-2.jpg', desc: 'Ação e aventura.'},
            { id: 'indie-quest', title: 'Indie Quest', img: 'https://www.yudiz.com/codepen/expandable-animated-card-slider/pubg.jpg', desc: 'Indie emocionante.'},
            { id: 'skyland', title: 'Skyland', img: 'https://www.yudiz.com/codepen/expandable-animated-card-slider/winter-3.jpg', desc: 'RPG atmosférico.'},
            { id: 'starfall', title: 'Starfall', img: 'https://www.yudiz.com/codepen/expandable-animated-card-slider/rdr-2.jpg', desc: 'Exploração épica.'},
            { id: 'pixel-pulse', title: 'Pixel Pulse', img: 'https://www.yudiz.com/codepen/expandable-animated-card-slider/fortnite.jpg', desc: 'Experiência retrô.' }
        ]);
    }
}

async function loadAnimeSection() {
    const container = document.getElementById('animeSeries') || document.getElementById('animeGames');
    if (container) {
        renderSeriesCards(container, [
            { id: 'retro-run', title: 'Retro Run', img: 'https://www.yudiz.com/codepen/expandable-animated-card-slider/rdr-2.jpg', desc: 'Clássico retrô.'},
            { id: 'pixel-hero', title: 'Pixel Hero', img: 'https://www.yudiz.com/codepen/expandable-animated-card-slider/fortnite.jpg', desc: 'Pixel art.'},
            { id: 'neon-streets', title: 'Neon Streets', img: 'https://www.yudiz.com/codepen/expandable-animated-card-slider/pubg.jpg', desc: 'Corrida com estilo.'},
            { id: 'midnight-arcade', title: 'Midnight Arcade', img: 'https://www.yudiz.com/codepen/expandable-animated-card-slider/dota-2.jpg', desc: 'Arcade moderno.'}
        ]);
    }
}

async function loadPopularSeries() {
    const container = document.getElementById('popularSeries') || document.getElementById('popularGames');
    if (container) {
        renderSeriesCards(container, [
            { id: 'battlefield', title: 'Battlefield', img: 'https://www.yudiz.com/codepen/expandable-animated-card-slider/pubg.jpg', desc: 'Shooter popular.'},
            { id: 'arena', title: 'Arena', img: 'https://www.yudiz.com/codepen/expandable-animated-card-slider/dota-2.jpg', desc: 'Competição intensa.'},
            { id: 'forge', title: 'Forge', img: 'https://www.yudiz.com/codepen/expandable-animated-card-slider/winter-3.jpg', desc: 'Estratégia e ação.'},
            { id: 'ghost-run', title: 'Ghost Run', img: 'https://www.yudiz.com/codepen/expandable-animated-card-slider/fortnite.jpg', desc: 'Corrida furtiva.'}
        ]);
    }
}

async function loadTopRatedSeries() {
    const container = document.getElementById('topRatedSeries');
    if (container) {
        renderSeriesCards(container, [
            { id: 'legendary', title: 'Legendary', img: 'https://www.yudiz.com/codepen/expandable-animated-card-slider/winter-3.jpg', desc: 'Top avaliado.'},
            { id: 'odyssey', title: 'Odyssey', img: 'https://www.yudiz.com/codepen/expandable-animated-card-slider/rdr-2.jpg', desc: 'Aclamado pela crítica.'},
            { id: 'ultima', title: 'Ultima', img: 'https://www.yudiz.com/codepen/expandable-animated-card-slider/pubg.jpg', desc: 'Gameplay refinado.'},
            { id: 'vanguard', title: 'Vanguard', img: 'https://www.yudiz.com/codepen/expandable-animated-card-slider/dota-2.jpg', desc: 'Estratégia de elite.'}
        ]);
    }
}

async function loadRecentActivity() {
    const container = document.getElementById('activityFeed');
    if (container) {
        container.innerHTML = '<p>Sem atividades recentes.</p>';
    }
}

function searchSeries(event) {
    const query = event.target.value;
    const results = document.getElementById('searchResults');
    if (results) {
        results.innerHTML = query ? `<p>Buscando por "${query}"...</p>` : '<p class="placeholder-text">Digite algo para começar a buscar...</p>';
    }
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
    if (container) {
        container.innerHTML = `<p>Detalhes do jogo ${seriesId} não disponíveis.</p>`;
    }
}

function showSeriesDetail(seriesId) {
    loadSeriesDetail(seriesId);
}