// Funções para carregamento de jogos

async function loadNewReleasesSection() {
    const container = document.getElementById('newGames');
    if (container) {
        container.innerHTML = '<p>Sem novidades disponíveis no momento.</p>';
    }
}

async function loadAnimeSection() {
    const container = document.getElementById('animeGames');
    if (container) {
        container.innerHTML = '<p>Sem jogos retro disponíveis no momento.</p>';
    }
}

async function loadPopularSeries() {
    const container = document.getElementById('popularGames');
    if (container) {
        container.innerHTML = '<p>Sem jogos em alta disponíveis no momento.</p>';
    }
}

async function loadTopRatedSeries() {
    const container = document.getElementById('topRatedSeries');
    if (container) {
        container.innerHTML = '<p>Sem jogos top avaliados disponíveis no momento.</p>';
    }
}

async function loadRecentActivity() {
    const container = document.getElementById('activityFeed');
    if (container) {
        container.innerHTML = '<p>Sem atividades recentes.</p>';
    }
}

function searchSeries(event) {
    // Placeholder para busca
    const query = event.target.value;
    const results = document.getElementById('searchResults');
    if (results) {
        results.innerHTML = query ? `<p>Buscando por "${query}"...</p>` : '<p class="placeholder-text">Digite algo para começar a buscar...</p>';
    }
}

function performSearch() {
    // Placeholder
    const input = document.getElementById('searchInput');
    if (input) {
        searchSeries({ target: input });
    }
}

function heroSearchSeries(event) {
    // Mesmo que searchSeries, mas para o hero
    searchSeries(event);
}

function loadSeriesDetail(seriesId) {
    // Placeholder
    const container = document.getElementById('seriesDetail');
    if (container) {
        container.innerHTML = `<p>Detalhes do jogo ${seriesId} não disponíveis.</p>`;
    }
}

function showSeriesDetail(seriesId) {
    loadSeriesDetail(seriesId);
}