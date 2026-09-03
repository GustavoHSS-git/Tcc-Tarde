// Funções para carregamento de jogos
const searchableGames = new Map();
/*const fallbackGames = [
    { id: 'elden-ring', title: 'Elden Ring', img: '../../uploads/jogos/Elden Ring.jfif', desc: 'RPG de ação.' },
    { id: 'the-last-of-us', title: 'The Last of Us', img: '../../uploads/jogos/tlou.jfif', desc: 'Ação e sobrevivência.' },
    { id: 'outer-wilds', title: 'Outer Wilds', img: '../../uploads/jogos/outer wids.jfif', desc: 'Exploração e mistério.' },
    { id: 'gris', title: 'GRIS', img: '../../uploads/jogos/gris.jfif', desc: 'Aventura e plataforma.' },
    { id: 'street-fighter-v', title: 'Street Fighter V', img: '../../uploads/jogos/Street Fighter V.jfif', desc: 'Jogo de luta.' },
    { id: 'street-fighter-6', title: 'Street Fighter 6', img: '../../uploads/jogos/STREET FIGHTER 6.jfif', desc: 'Jogo de luta.' },
    { id: 'lego-batman-2', title: 'Lego Batman 2', img: '../../uploads/jogos/Lego Batman 2.jfif', desc: 'Aventura.' },
    { id: 'celeste', title: 'Celeste', img: '../../uploads/jogos/Celeste.jfif', desc: 'Plataforma e aventura.' },
    { id: 'horizon', title: 'Horizon', img: '../../uploads/jogos/horizon.jfif', desc: 'Ação e aventura.' },
    { id: 'hades', title: 'Hades', img: '../../uploads/jogos/Hades.jfif', desc: 'Roguelike de ação.' },
    { id: 'the-last-of-us-part-2', title: 'The Last of Us Part II', img: '../../uploads/jogos/tlou2.jfif', desc: 'Ação e sobrevivência.' },
    { id: 'animal-crossing-new-horizons', title: 'Animal Crossing: New Horizons', img: '../../uploads/jogos/Animal Crossing New Horizons.jfif', desc: 'Simulação e aventura.' },
    { id: 'metroidvania-games', title: 'The 25 Best Metroidvania Nintendo Switch Games', img: '../../uploads/jogos/The 25 Best Metroidvania Nintendo Switch Games.jfif', desc: 'Aventura e exploração.' },
    { id: 'life-is-strange', title: 'Life is Strange', img: '../../uploads/jogos/life is strange.jfif', desc: 'Aventura narrativa.' }
];console.log(fallbackGames);*/

const fallbackGames = [];
let gamesById = new Map();

async function load() {
    try {
        const response = await fetch("../../gamesInfo.php");

        //const dados = await response.json();
        const dados = await response.json();

        fallbackGames.push(...dados);
        gamesById = new Map(fallbackGames.map((game) => [game.id, game]));

        console.log(fallbackGames);

    } catch (erro) {
        console.error("Erro:", erro);
    }
}

const gamesLoaded = load();


function normalizeGameReference(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function normalizeIgdbValue(value, fallback = '') {
    if (value === null || value === undefined || value === '') {
        return fallback;
    }

    if (Array.isArray(value)) {
        return value.map((item) => normalizeIgdbValue(item, '')).filter(Boolean).join(', ') || fallback;
    }

    if (typeof value === 'object') {
        if (value.name) return value.name;
        if (value.title) return value.title;
        if (value.slug) return value.slug;
        if (value.url) return value.url;
        return fallback;
    }

    return String(value);
}

function normalizeIgdbGame(game) {
    if (!game) {
        return null;
    }

    const coverUrl = normalizeIgdbValue(
        game.cover?.url || game.cover_url || game.image || game.img || game.poster,
        game.img || ''
    );

    const gameId = game.igdb_id ?? game.igdbId ?? game.game_id ?? game.gameId ?? game.id ?? game.slug ?? game.title;

    const backdropUrl = normalizeIgdbValue(
        game.backdrop || game.background || game.artworks?.[0]?.url || game.screenshots?.[0]?.url || coverUrl,
        coverUrl
    );

    return {
        id: gameId,
        igdb_id: gameId,
        game_id: gameId,
        title: normalizeIgdbValue(game.title || game.name, 'Jogo sem nome'),
        img: coverUrl ? coverUrl.replace('t_thumb', 't_cover_big') : game.img || '',
        backdrop: backdropUrl ? backdropUrl.replace('t_thumb', 't_original') : backdropUrl,
        desc: normalizeIgdbValue(game.desc || game.summary || game.storyline, 'Sem descrição disponível.'),
        summary: normalizeIgdbValue(game.summary || game.desc || game.storyline, 'Sem descrição disponível.'),
        genres: normalizeIgdbValue(game.genres || game.genre || game.tags, '').split(',').map((item) => item.trim()).filter(Boolean),
        platforms: normalizeIgdbValue(game.platforms || game.platform || game.console, '').split(',').map((item) => item.trim()).filter(Boolean),
        releaseDate: normalizeIgdbValue(game.releaseDate || game.first_release_date || game.release_date, 'Lançamento não informado'),
        rating: game.rating ? `${Number(game.rating).toFixed(1)}/10` : (game.aggregated_rating ? `${Number(game.aggregated_rating).toFixed(1)}/100` : 'Sem avaliação'),
    };
}

function getCanonicalGameId(reference) {
    const candidate = String(reference || '').trim();
    if (!candidate) return '';

    const exactMatch = fallbackGames.find((game) =>
        normalizeGameReference(game.id) === normalizeGameReference(candidate)
        || normalizeGameReference(game.title) === normalizeGameReference(candidate)
    );

    return exactMatch ? exactMatch.id : candidate;
}

function getGamesById(ids) {
    return ids.map((id) => gamesById.get(id)).filter(Boolean);
}

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
        const canonicalId = getCanonicalGameId(card.dataset.id || card.querySelector('.series-card-title')?.textContent);
        if (canonicalId) {
            card.dataset.id = canonicalId;
        }

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
    await gamesLoaded; // espera o fetch terminar antes de renderizar
    const container = document.getElementById('newSeries') || document.getElementById('newGames');
    if (container) {
        renderSeriesCards(container, fallbackGames);
    }
}

async function loadAnimeSection() {
    await gamesLoaded; // espera o fetch terminar antes de renderizar
    const container = document.getElementById('animeSeries') || document.getElementById('animeGames');
    if (container) {
        renderSeriesCards(container, getGamesById([
            '2', '6', '4', '1'
        ]));
    }
}

async function loadPopularSeries() {
    await gamesLoaded; // espera o fetch terminar antes de renderizar
    const container = document.getElementById('popularSeries') || document.getElementById('popularGames');
    if (container) {
        renderSeriesCards(container, getGamesById([
            '1', '4', '2', '5', '3'
        ]));
    }
}

async function loadTopRatedSeries() {
    await gamesLoaded; // espera o fetch terminar antes de renderizar
    const container = document.getElementById('topRatedSeries');
    if (container) {
        renderSeriesCards(container, getGamesById([
            '1', '4', '2', '5', '3'
        ]));
    }
}

async function loadRecentActivity() {
    const container = document.getElementById('activityFeed');
    if (!container) return;

    const ratings = await API.getRecentRatings();
    if (!ratings.length) {
        container.innerHTML = '<p>Sem atividades recentes.</p>';
        return;
    }

    container.innerHTML = ratings.slice(0, 10).map((rating) => `
        <article class="activity-item">
            <div class="activity-content">
                <strong>${rating.username}</strong> avaliou <strong>${rating.title || 'um jogo'}</strong>
                <span class="activity-rating">★ ${Number(rating.rating || 0).toFixed(1)}</span>
                ${rating.comment ? `<p class="activity-comment">${rating.comment}</p>` : ''}
            </div>
        </article>
    `).join('');
}

function getStaticGames() {
    return [...document.querySelectorAll('.series-card[data-id]')].map((card) => {
        const canonicalId = getCanonicalGameId(card.dataset.id || card.querySelector('.series-card-title')?.textContent);
        if (canonicalId) {
            card.dataset.id = canonicalId;
        }

        return {
            id: canonicalId || card.dataset.id,
            title: card.querySelector('.series-card-title')?.textContent.trim() || card.dataset.id,
            img: card.querySelector('.series-card-poster')?.src,
            desc: card.querySelector('.series-card-info')?.textContent.trim() || ''
        };
    });
}

async function getSearchGames() {
    await gamesLoaded; // espera o fetch terminar antes de renderizar
    const games = new Map(fallbackGames.map((game) => [game.id, game]));
    searchableGames.forEach((game, id) => games.set(String(id), game));
    getStaticGames().forEach((game) => games.set(game.id, game));
    return [...games.values()].slice(0, 18);
}

function searchSeries(event) {
    const query = event.target.value.trim().toLowerCase();
    const results = document.getElementById('searchResults');
    if (!results) return;

    const games = getSearchGames();
    if (!query) {
        renderSeriesCards(results, games);
        return;
    }

    const matches = games.filter((game) => {
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

async function loadSeriesDetail(seriesId) {
    await gamesLoaded; // espera o fetch terminar antes de renderizar
    const container = document.getElementById('seriesDetail');
    if (!container) return;

    const normalizedId = normalizeGameReference(decodeURIComponent(seriesId || ''));
    const games = new Map();

    fallbackGames.forEach((game) => {
        games.set(normalizeGameReference(game.id), game);
        games.set(normalizeGameReference(game.title), game);
    });

    searchableGames.forEach((game, id) => {
        games.set(normalizeGameReference(String(id)), game);
        games.set(normalizeGameReference(game.title), game);
    });

    getStaticGames().forEach((game) => {
        games.set(normalizeGameReference(String(game.id)), game);
        games.set(normalizeGameReference(game.title), game);
    });

    const game = games.get(normalizedId) || [...games.values()].find((item) =>
        normalizeGameReference(String(item.title)) === normalizedId
    );

    if (!game) {
        container.innerHTML = '<p class="placeholder-text">Jogo não encontrado.</p>';
        return;
    }

    const detailGame = normalizeIgdbGame({
        ...game,
        title: game.title,
        name: game.title,
        img: game.img,
        cover: { url: game.img },
        summary: game.desc,
        desc: game.desc,
        genres: ['Ação', 'Aventura'],
        platforms: ['Xbox', 'PlayStation', 'Nintendo Switch', 'PC'],
        releaseDate: 'Lançamento não informado',
        rating: null,
    });

    const genres = detailGame.genres?.length ? detailGame.genres.join(' • ') : 'Jogos';
    const platforms = detailGame.platforms?.length ? detailGame.platforms.join(' • ') : 'Plataforma';
    const backdropImage = detailGame.backdrop || detailGame.img;

    container.innerHTML = `
        <div class="backdrop-container">
            <img class="backdrop-img" src="${backdropImage}" alt="${detailGame.title}">
        </div>
        <div class="series-detail-content">
            <div class="series-detail-header">
                <img class="series-detail-poster" src="${detailGame.img}" alt="${detailGame.title}">
                <div class="series-detail-info">
                    <div class="series-detail-badges">
                        <span>${platforms}</span>
                        <span>${genres}</span>
                    </div>
                    <h1 class="series-detail-title">${detailGame.title}</h1>
                    <div class="series-detail-meta">
                        <span>${detailGame.releaseDate}</span>
                        <span>${detailGame.rating}</span>
                    </div>
                    <div class="series-detail-overview">
                        <h3>Sobre o jogo</h3>
                        <p>${detailGame.summary}</p>
                    </div>
                    <div class="series-detail-actions">
                        <button class="btn btn-primary" onclick="window.location.hash='#home'">Voltar aos jogos</button>
                        <button class="btn btn-outline" onclick="openRatingModal(detailGame)">Avaliar</button>
                    </div>

                </div>
            </div>
        </div>`;

    const reviews = await API.getGameRatings(detailGame.igdb_id || detailGame.game_id || detailGame.id);
    const reviewsSection = document.createElement('section');
    reviewsSection.className = 'game-reviews';
    reviewsSection.innerHTML = `
        <h2>Comentários dos jogadores</h2>
        <div class="reviews-list">
            ${reviews.length ? reviews.map((review) => `
                <article class="review-item">
                    <div class="review-header">
                        <strong>${review.username}</strong>
                        <span class="review-rating">★ ${Number(review.rating || 0).toFixed(1)}</span>
                    </div>
                    ${review.comment ? `<p class="review-text">${review.comment}</p>` : '<p class="review-text">Sem comentário.</p>'}
                </article>
            `).join('') : '<p class="placeholder-text">Ainda não há comentários para este jogo.</p>'}
        </div>`;
    container.querySelector('.series-detail-content')?.appendChild(reviewsSection);

    const ratingButton = container.querySelector('[onclick*="openRatingModal"]');
    if (ratingButton) {
        ratingButton.onclick = () => openRatingModal(detailGame);
    }
}

function bindRatingStars() {
    const stars = document.querySelectorAll('.rating-star');
    const input = document.getElementById('ratingValueInput');

    if (!stars.length || !input) return;

    stars.forEach((star) => {
        star.addEventListener('click', () => {
            const value = Number(star.dataset.value);
            input.value = String(value);

            stars.forEach((item) => {
                const active = Number(item.dataset.value) <= value;
                item.classList.toggle('selected', active);
            });
        });
    });
}

function openRatingModal(game) {
    if (!game) return;

    if (!currentUser) {
        notifyInfo('Faça login para avaliar este jogo.', 'Login necessário');
        showLogin();
        return;
    }

    const modal = document.getElementById('ratingModal');
    const gameName = document.getElementById('ratingModalGameName');
    const input = document.getElementById('ratingValueInput');
    const statusSelect = document.getElementById('statusGameSelect');

    if (!modal || !gameName || !input || !statusSelect) return;

    gameName.textContent = game.title;
    input.value = '';
    statusSelect.value = 'playing';

    document.querySelectorAll('.rating-star').forEach((star) => {
        star.classList.remove('selected');
    });

    modal.classList.add('active');
}

function closeRatingModal() {
    const modal = document.getElementById('ratingModal');
    if (modal) modal.classList.remove('active');
}

function handleGameRatingSubmit(event) {
    event.preventDefault();

    const gameNameElement = document.getElementById('ratingModalGameName');
    const title = gameNameElement?.textContent || 'este jogo';
    const form = event.currentTarget;
    const rating = Number(form.querySelector('[name="rating"]').value);
    const status = form.querySelector('[name="status"]').value;
    const comment = form.querySelector('[name="comment"]')?.value.trim() || '';

    if (!rating || Number.isNaN(rating)) {
        notifyError('Selecione uma nota para continuar.', 'Avaliação incompleta');
        return;
    }

    const payload = {
        igdb_id: currentGameForRating?.igdb_id ?? currentGameForRating?.game_id ?? currentGameForRating?.id,
        game_id: currentGameForRating?.igdb_id ?? currentGameForRating?.game_id ?? currentGameForRating?.id,
        tmdb_id: currentGameForRating?.tmdb_id ?? null,
        img: currentGameForRating?.img || null,
        rating,
        status,
        comment,
        title
    };

    const saveRequest = currentRatingForEdit
        ? API.updateRating(currentRatingForEdit.id, payload)
        : API.addRating(payload);

    saveRequest.then((result) => {
        if (result.success) {
            const message = currentRatingForEdit ? 'Avaliação atualizada!' : `Avaliação salva para ${title}!`;
            notifySuccess(message, '★ Avaliado');
            form.reset();
            closeRatingModal();
            currentRatingForEdit = null;
            return;
        }

        notifyError(result.error || 'Não foi possível salvar a avaliação.', 'Erro');
    }).catch((error) => {
        console.error('Erro ao salvar avaliação:', error);
        notifyError('Erro ao salvar avaliação. Tente novamente.', 'Erro');
    });
}

let currentGameForRating = null;

let currentRatingForEdit = null;

async function openRatingModal(game) {
    if (!game) return;

    currentGameForRating = game;

    if (!currentUser) {
        notifyInfo('Faça login para avaliar este jogo.', 'Login necessário');
        showLogin();
        return;
    }

    const modal = document.getElementById('ratingModal');
    const gameName = document.getElementById('ratingModalGameName');
    const input = document.getElementById('ratingValueInput');
    const statusSelect = document.getElementById('statusGameSelect');
    const commentInput = document.getElementById('ratingComment');

    if (!modal || !gameName || !input || !statusSelect) return;

    gameName.textContent = game.title;
    input.value = '';
    statusSelect.value = 'playing';
    if (commentInput) commentInput.value = '';

    document.querySelectorAll('.rating-star').forEach((star) => {
        star.classList.remove('selected');
    });

    const gameId = game.igdb_id ?? game.game_id ?? game.id;
    const existingRating = await API.getRatingForGame(currentUser.id, gameId);
    if (existingRating) {
        currentRatingForEdit = existingRating;
        input.value = existingRating.rating;
        statusSelect.value = existingRating.status || 'playing';
        if (commentInput) commentInput.value = existingRating.comment || '';
        document.querySelectorAll('.rating-star').forEach((star) => {
            star.classList.toggle('selected', Number(star.dataset.value) <= Number(existingRating.rating));
        });
    }

    modal.classList.add('active');
    bindRatingStars();
}

function showSeriesDetail(seriesId) {
    loadSeriesDetail(seriesId);
}





