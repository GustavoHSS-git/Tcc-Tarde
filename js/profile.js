    const visibleRatings = ratings.slice(0, 6);
// Gerenciamento de perfil do usuário - Versão Final Corrigida

// Navegar para o perfil
function navigateToProfile() {
    if (currentUser) {
        window.location.hash = `#profile/${currentUser.id}`;
    }
}

// Carregar perfil do usuário
async function loadUserProfile(userId) {
    const container = document.getElementById('profileContent');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Carregando perfil...</div>';
    
    try {
        const userData = await API.getUser(userId);
        
        if (!userData || !userData.user) {
            container.innerHTML = '<p class="placeholder-text">Usuário não encontrado</p>';
            return;
        }
        
        const user = userData.user;
        const stats = userData.stats || { total_ratings: 0, completed_series: 0, avg_rating: 0 };
        const isOwnProfile = currentUser && currentUser.id === parseInt(userId);
        
        // --- LÓGICA CLOUDINARY CORRIGIDA ---
        const hasCustomAvatar = Boolean(user.avatar);
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'original';
        const avatarUrl = hasCustomAvatar
            ? (user.avatar.startsWith('data:') || user.avatar.startsWith('http')
                ? user.avatar
                : `../../uploads/icons/${user.avatar}`)
            : (ICON_THEMES?.[currentTheme] || '../../uploads/icons/icon-icons.png');
        
        let avatarSection = '';
        if (isOwnProfile) {
            avatarSection = `
                <div style="position: absolute; bottom: 0; right: 0;">
                    <label for="avatarUpload" class="btn btn-primary" style="cursor: pointer; font-size: 0.9rem; padding: 0.55rem; border-radius: 50%;">
                        <img src="../../uploads/icons/cam.svg" alt="Upload" style="width: 1.5rem; height: 1.5rem; vertical-align: middle;">
                    </label>
                    <input type="file" id="avatarUpload" accept="image/*" style="display: none;" onchange="handleAvatarUpload(event)">
                </div>
            `;
        }
        
        let bioSection = isOwnProfile ? `
            <div style="margin-top: 1rem;">
                <textarea id="bioEdit" placeholder="Escreva algo sobre você..." 
                          style="width: 100%; min-height: 80px; padding: 0.8rem; background: var(--bg-dark); 
                          border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary); 
                          font-family: inherit; resize: vertical;">${user.bio || ''}</textarea>
                <button class="btn btn-primary" style="margin-top: 0.5rem;" onclick="saveBio()">Salvar Bio</button>
            </div>
        ` : `<p class="profile-bio" style="margin-top:1rem; color: var(--text-secondary);">${user.bio || 'Sem bio disponível.'}</p>`;
        
        container.innerHTML = `
            <div class="profile-header" style="display: flex; gap: 2rem; align-items: center; flex-wrap: wrap;">
                <div class="profile-avatar-container" style="position: relative; width: 150px; height: 150px;">
                    <img src="${avatarUrl}" ${hasCustomAvatar ? '' : 'data-theme-avatar="true"'}
                         alt="${user.username}" class="profile-avatar"
                         style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; border: 3px solid var(--primary-color);"
                         onerror="this.src='../../uploads/icons/icon-icons.png'">
                    ${avatarSection}
                </div>
                <div class="profile-info" style="flex: 1; min-width: 300px;">
                    <h2 class="profile-username" style="font-size: 2rem;">${user.username}</h2>
                    ${bioSection}
                    <div class="profile-stats" style="display: flex; gap: 2rem; margin-top: 1.5rem;">
                        <div class="stat-item">
                            <div class="stat-value" style="font-size: 1.5rem; font-weight: bold; color: var(--primary-color);">${stats.total_ratings || 0}</div>
                            <div class="stat-label" style="font-size: 0.8rem; color: var(--text-secondary);">Avaliações</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value" style="font-size: 1.5rem; font-weight: bold; color: var(--primary-color);">${stats.completed_series || 0}</div>
                            <div class="stat-label" style="font-size: 0.8rem; color: var(--text-secondary);">Completadas</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value" style="font-size: 1.5rem; font-weight: bold; color: var(--primary-color);">${Number(stats.avg_rating || 0).toFixed(1)}</div>
                            <div class="stat-label" style="font-size: 0.8rem; color: var(--text-secondary);">Média</div>
                        </div>
                    </div>
                </div>
            </div>
            <div style="margin-top: 3rem;">
                <h3 style="margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">Jogos Avaliados</h3>
                <div class="series-grid" id="userRatings">
                    <div class="loading">Carregando avaliações...</div>
                </div>
            </div>
        `;
        
        loadUserRatingsList(userId);

    } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        container.innerHTML = '<p class="placeholder-text">Erro ao carregar dados do perfil.</p>';
    }
}

// Carregar Lista de Notas (CORRIGIDO PARA O JSON DO SERVER)
async function loadUserRatingsList(userId) {
    const ratingsContainer = document.getElementById('userRatings');
    if (!ratingsContainer) return;

    try {
        const ratings = await API.getUserRatings(userId);

        ratingsContainer.innerHTML = '';

        if (!ratings || ratings.length === 0) {
            ratingsContainer.innerHTML = '<p class="placeholder-text" style="grid-column: 1/-1;">Nenhuma série avaliada ainda</p>';
            return;
        }

        const statusLabels = {
            playing: 'Jogando',
            completed: 'Completou',
            plan_to_play: 'Planeja jogar',
            plan_to_watch: 'Planeja assistir',
            watching: 'Assistindo',
            dropped: 'Dropou'
        };

        const statusColors = {
            playing: '#00d4ff',
            completed: '#00ff88',
            plan_to_play: '#ffd600',
            plan_to_watch: '#ffd600',
            watching: '#00d4ff',
            dropped: '#ff4444'
        };

        const visibleRatings = ratings.slice(0, 6);
        for (const rating of visibleRatings) {
            const title = rating.title || rating.name || `Jogo ${rating.igdb_id ?? rating.game_id ?? rating.id}`;
            let poster = rating.image || rating.img || rating.poster || rating.cover || '../../uploads/paletas/padrao.webp';
            
            // Se a imagem começa com //, garantir que seja https ou usar caminho relativo
            if (poster && poster.startsWith('//')) {
                poster = 'https:' + poster;
            }
            
            // Se for data URL (base64), usar fallback pois são muito grandes
            if (poster && poster.startsWith('data:')) {
                poster = '../../uploads/paletas/padrao.webp';
            }
            
            const routeId = rating.game_id || rating.igdb_id || rating.tmdb_id || normalizeGameReference(title);
            const card = document.createElement('div');
            card.className = 'series-card';
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            const openGamePage = () => {
                window.location.hash = `#series/${encodeURIComponent(routeId)}`;
            };
            card.onclick = openGamePage;
            card.onkeydown = (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openGamePage();
                }
            };

            card.innerHTML = `
                <img src="${poster}" alt="${title}" class="series-card-poster"
                     onerror="this.src='../../uploads/paletas/padrao.webp'">
                <div style="position: absolute; top: 0.5rem; right: 0.5rem; 
                     background: ${statusColors[rating.status] || '#666'}; 
                     color: white; padding: 0.2rem 0.5rem; border-radius: 4px; 
                     font-size: 0.7rem; font-weight: 600; text-transform: uppercase; z-index: 3;">
                     ${statusLabels[rating.status] || rating.status || 'Avaliado'}
                </div>
                <div class="series-card-content">
                    <div class="series-card-title" title="${title}">${title}</div>
                    <div class="series-card-info">
                        <span class="series-rating"><span aria-hidden="true">★</span> ${Number(rating.rating || 0).toFixed(1)}</span>
                    </div>
                    ${rating.comment ? `<div class="series-card-comment">${rating.comment}</div>` : ''}
                </div>
            `;

            ratingsContainer.appendChild(card);
        }
    } catch (error) {
        console.error("Erro ao carregar notas:", error);
        ratingsContainer.innerHTML = '<p>Erro ao carregar avaliações.</p>';
    }
}

// Upload de avatar
async function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Feedback visual imediato
    const btn = event.target.parentElement.querySelector('label');
    const originalText = btn.innerHTML;
    btn.innerHTML = '...';
    
    try {
        const data = await API.uploadAvatar(file);
        if (data.success) {
            notifySuccess('Avatar atualizado com sucesso!', '✓ Avatar Salvo');
            location.reload(); 
        } else {
            notifyError(data.error || 'Falha no upload', '✗ Erro ao Fazer Upload');
            btn.innerHTML = originalText;
        }
    } catch (error) {
        notifyError('Erro ao conectar com o servidor', '✗ Erro de Conexão');
        btn.innerHTML = originalText;
    }
}

// Salvar bio
async function saveBio() {
    const bio = document.getElementById('bioEdit').value;
    const btn = document.querySelector('button[onclick="saveBio()"]');
    btn.disabled = true;
    btn.innerText = 'Salvando...';

    try {
        const data = await API.updateUser({ bio });
        if (data.success) {
            notifySuccess('Bio atualizada com sucesso!', '✓ Perfil Atualizado');
        } else {
            notifyError(data.error || 'Erro ao salvar bio', '✗ Erro ao Salvar');
        }
    } catch (error) {
        notifyError('Erro ao conectar com o servidor', '✗ Erro de Conexão');
    } finally {
        btn.disabled = false;
        btn.innerText = 'Salvar Bio';
    }
}