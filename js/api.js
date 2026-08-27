const STORAGE_USERS = 'tcc_tarde_users';
const STORAGE_RATINGS = 'tcc_tarde_ratings';
const STORAGE_SESSION = 'tcc_tarde_session';

function loadStorage(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
        return fallback;
    }
}

function saveStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getUsers() {
    return loadStorage(STORAGE_USERS, []);
}

function saveUsers(users) {
    saveStorage(STORAGE_USERS, users);
}

function getRatings() {
    return loadStorage(STORAGE_RATINGS, []);
}

function saveRatings(ratings) {
    saveStorage(STORAGE_RATINGS, ratings);
}

function getSessionUserId() {
    const raw = localStorage.getItem(STORAGE_SESSION);
    return raw ? Number(raw) : null;
}

function setSessionUserId(userId) {
    if (userId == null) {
        localStorage.removeItem(STORAGE_SESSION);
    } else {
        localStorage.setItem(STORAGE_SESSION, String(userId));
    }
}

function nextId(items) {
    if (!items || items.length === 0) return 1;
    return Math.max(...items.map(item => item.id)) + 1;
}

function normalizeRatingGameId(data = {}) {
    const candidate = data.igdb_id ?? data.igdbId ?? data.game_id ?? data.gameId ?? data.tmdb_id ?? data.tmdbId ?? data.id;
    return candidate == null ? null : String(candidate);
}

function sanitizeUser(user) {
    if (!user) return null;
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar || null,
        bio: user.bio || '',
    };
}

async function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

const API = {
    async checkSession() {
        const userId = getSessionUserId();
        const users = getUsers();
        const user = users.find(item => item.id === userId);
        return {
            authenticated: Boolean(user),
            user: sanitizeUser(user),
        };
    },

    async login(email, password) {
        const users = getUsers();
        const user = users.find(item => item.email === email && item.password === password);
        if (!user) {
            return { success: false, error: 'Email ou senha inválidos.' };
        }

        setSessionUserId(user.id);
        return {
            success: true,
            userId: user.id,
            username: user.username,
            avatar: user.avatar || null,
        };
    },

    async register(username, email, password) {
        const users = getUsers();
        if (!username || !email || !password) {
            return { success: false, error: 'Preencha todos os campos.' };
        }

        const exists = users.some(item => item.email.toLowerCase() === email.toLowerCase());
        if (exists) {
            return { success: false, error: 'Email já cadastrado.' };
        }

        const user = {
            id: nextId(users),
            username,
            email,
            password,
            avatar: null,
            bio: '',
        };

        users.push(user);
        saveUsers(users);
        setSessionUserId(user.id);

        return {
            success: true,
            userId: user.id,
            username: user.username,
        };
    },

    async logout() {
        setSessionUserId(null);
        return { success: true };
    },

    async getUser(userId) {
        const users = getUsers();
        const user = users.find(item => item.id === Number(userId));
        if (!user) {
            return { user: null };
        }

        const ratings = getRatings().filter(rating => rating.userId === Number(userId));
        const total = ratings.length;
        const completedSeries = ratings.filter(rating => rating.status === 'completed').length;
        const avgRating = total > 0 ? ratings.reduce((sum, rating) => sum + Number(rating.rating), 0) / total : 0;

        return {
            user: sanitizeUser(user),
            stats: {
                total_ratings: total,
                completed_series: completedSeries,
                avg_rating: Number(avgRating.toFixed(1)),
            },
        };
    },

    async getUserRatings(userId) {
        return getRatings().filter(rating => rating.userId === Number(userId));
    },

    async getRecentRatings() {
        const users = getUsers();
        return getRatings()
            .slice()
            .sort((first, second) => new Date(second.createdAt || 0) - new Date(first.createdAt || 0))
            .map((rating) => ({
                ...rating,
                username: users.find((user) => user.id === rating.userId)?.username || 'Usuário',
            }));
    },

    async getGameRatings(gameId) {
        if (gameId == null) return [];
        const normalizedId = String(gameId);
        const users = getUsers();
        return getRatings()
            .filter((rating) =>
                String(rating.igdb_id) === normalizedId || String(rating.game_id) === normalizedId
            )
            .map((rating) => ({
                ...rating,
                username: users.find((user) => user.id === rating.userId)?.username || 'Usuário',
            }));
    },

    async uploadAvatar(file) {
        const userId = getSessionUserId();
        if (!userId) {
            return { success: false, error: 'Usuário não autenticado.' };
        }

        const users = getUsers();
        const user = users.find(item => item.id === userId);
        if (!user) {
            return { success: false, error: 'Usuário não encontrado.' };
        }

        try {
            const dataUrl = await readFileAsDataUrl(file);
            user.avatar = dataUrl;
            saveUsers(users);
            return { success: true, avatar: dataUrl };
        } catch (error) {
            return { success: false, error: 'Não foi possível carregar a imagem.' };
        }
    },

    async addRating(data) {
        const userId = getSessionUserId();
        if (!userId) {
            return { success: false, error: 'Usuário não autenticado.' };
        }

        const igdbId = normalizeRatingGameId(data);
        const tmdbId = data.tmdb_id ?? data.tmdbId ?? null;
        const rating = data.rating ?? data.score ?? data.value;
        const status = data.status ?? data.state ?? 'completed';

        if (!igdbId && !tmdbId) {
            return { success: false, error: 'Dados de avaliação incompletos: informe um id do jogo.' };
        }

        if (rating == null || Number(rating) < 0 || Number(rating) > 10) {
            return { success: false, error: 'Nota inválida. Use um valor entre 0 e 10.' };
        }

        if (!status) {
            return { success: false, error: 'Informe o status da avaliação.' };
        }

        const ratings = getRatings();
        
        // Limpar imagem se for muito grande ou data URL (causa erro 431)
        let imageToSave = data.img || data.image || data.poster || data.cover || null;
        
        if (imageToSave) {
            if (imageToSave.startsWith('data:')) {
                console.warn('Ignorando data URL muito grande');
                imageToSave = null;
            } else if (imageToSave.length > 500) {
                console.warn('URL da imagem muito longa, ignorando');
                imageToSave = null;
            } else if (imageToSave.startsWith('http://') || imageToSave.startsWith('https://')) {
                // Converter URL absoluta para caminho relativo desde a raiz
                // Ex: http://127.0.0.1:5500/uploads/jogos/... -> /uploads/jogos/...
                try {
                    const url = new URL(imageToSave);
                    const pathname = url.pathname;
                    imageToSave = pathname;
                } catch (e) {
                    console.error('Erro ao converter URL:', e);
                }
            }
        }
        
        const newRating = {
            id: nextId(ratings),
            userId,
            igdb_id: igdbId,
            tmdb_id: tmdbId,
            game_id: igdbId ?? tmdbId,
            title: data.title || data.name || null,
            image: imageToSave,
            rating: Number(rating),
            status,
            comment: String(data.comment || data.commentary || '').trim(),
            createdAt: new Date().toISOString(),
        };
        
        console.log('Saved rating:', newRating);
        ratings.push(newRating);
        saveRatings(ratings);

        return { success: true, rating: newRating };
    },

    async getRatingForGame(userId, gameId) {
        if (!userId || gameId == null) return null;
        const normalizedId = String(gameId);
        return getRatings().find((rating) =>
            rating.userId === Number(userId) &&
            (String(rating.igdb_id) === normalizedId || String(rating.game_id) === normalizedId)
        ) || null;
    },

    async updateRating(ratingId, data) {
        const userId = getSessionUserId();
        const ratings = getRatings();
        const index = ratings.findIndex((rating) =>
            rating.id === Number(ratingId) && rating.userId === userId
        );

        if (!userId) return { success: false, error: 'Usuário não autenticado.' };
        if (index === -1) return { success: false, error: 'Avaliação não encontrada.' };

        const ratingValue = Number(data.rating);
        const status = data.status || 'completed';
        if (!Number.isFinite(ratingValue) || ratingValue < 0 || ratingValue > 10) {
            return { success: false, error: 'Nota inválida. Use um valor entre 0 e 10.' };
        }

        ratings[index] = {
            ...ratings[index],
            rating: ratingValue,
            status,
            comment: String(data.comment || '').trim(),
            updatedAt: new Date().toISOString(),
        };
        saveRatings(ratings);
        return { success: true, rating: ratings[index] };
    },

    async updateUser(data) {
        const userId = getSessionUserId();
        if (!userId) {
            return { success: false, error: 'Usuário não autenticado.' };
        }

        const users = getUsers();
        const user = users.find(item => item.id === userId);
        if (!user) {
            return { success: false, error: 'Usuário não encontrado.' };
        }

        if (typeof data.bio === 'string') {
            user.bio = data.bio;
        }

        saveUsers(users);
        return { success: true };
    },
};

window.API = API;





