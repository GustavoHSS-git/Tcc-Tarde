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

        const { tmdb_id, rating, status } = data;
        if (!tmdb_id || rating == null || !status) {
            return { success: false, error: 'Dados de avaliação incompletos.' };
        }

        const ratings = getRatings();
        const newRating = {
            id: nextId(ratings),
            userId,
            tmdb_id,
            rating: Number(rating),
            status,
            createdAt: new Date().toISOString(),
        };
        ratings.push(newRating);
        saveRatings(ratings);

        return { success: true, rating: newRating };
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
