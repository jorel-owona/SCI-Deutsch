/* ==============================================
   SCI DEUTSCH - COMMON JS (common.js)
   Script centralisé pour la navigation, le showreel vidéo, 
   les favoris persistant et les notifications.
   ============================================== */

document.addEventListener('DOMContentLoaded', function () {
    // 1. NAVIGATION BURGER & MOBILE
    const burgerBtn = document.getElementById('burgerBtn');
    const mobileNav = document.getElementById('mobileNav');
    const header = document.querySelector('.header');

    if (burgerBtn && mobileNav) {
        burgerBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            this.classList.toggle('active');
            mobileNav.classList.toggle('active');
            document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : 'auto';
        });

        // Fermer le menu lors du clic sur un lien mobile
        document.querySelectorAll('.nav-mobile a').forEach(link => {
            link.addEventListener('click', () => {
                burgerBtn.classList.remove('active');
                mobileNav.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        });

        // Fermer au clic extérieur
        document.addEventListener('click', function (e) {
            if (mobileNav.classList.contains('active') && !mobileNav.contains(e.target) && !burgerBtn.contains(e.target)) {
                burgerBtn.classList.remove('active');
                mobileNav.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }

    // 2. HIGHLIGHT PAGE ACTIVES DANS LE MENU
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-desktop a, .nav-mobile a').forEach(link => {
        const href = link.getAttribute('href');
        if (href && (href === currentPath || (currentPath === '' && href === 'index.html'))) {
            link.classList.add('active');
        }
    });

    // 3. EFFET DE SCROLL SUR LE HEADER
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 40) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // 4. GESTION DU SHOWREEL VIDÉO (MODAL & LECTURE)
    initShowreelPlayer();

    // 5. INITIALISATION DES FAVORIS PERSISTANTS
    initFavoritesManager();
});

/* ==============================================
   GESTION DU SHOWREEL VIDÉO
   ============================================== */

function initShowreelPlayer() {
    const playBtns = document.querySelectorAll('.showreel-play-btn, [data-video-target]');
    const videoModal = document.getElementById('videoModal');
    const modalPlayer = document.getElementById('modalVideoPlayer');
    const topCloseBtn = document.getElementById('videoModalTopClose') || document.querySelector('.top-modal-close-yellow');
    const vidPlayPauseBtn = document.getElementById('vidPlayPauseBtn');
    const vidMuteBtn = document.getElementById('vidMuteBtn');
    const vidTimeline = document.getElementById('vidTimeline');
    const vidTimelineFill = document.getElementById('vidTimelineFill');
    const vidTimeDisplay = document.getElementById('vidTimeDisplay');
    const vidFullscreenBtn = document.getElementById('vidFullscreenBtn');
    const vidQuitBtn = document.getElementById('vidQuitBtn');

    if (!videoModal || !modalPlayer) return;

    const formatTime = (seconds) => {
        if (isNaN(seconds)) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const updateControlsUI = () => {
        const cur = modalPlayer.currentTime || 0;
        const dur = modalPlayer.duration || 0;
        const pct = dur > 0 ? (cur / dur) * 100 : 0;

        if (vidTimelineFill) vidTimelineFill.style.width = `${pct}%`;
        if (vidTimeDisplay) vidTimeDisplay.textContent = `${formatTime(cur)} / ${formatTime(dur)}`;

        if (vidPlayPauseBtn) {
            const icon = vidPlayPauseBtn.querySelector('i');
            if (icon) {
                icon.className = modalPlayer.paused ? 'fas fa-play' : 'fas fa-pause';
            }
        }
    };

    playBtns.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            const videoSrc = this.getAttribute('data-video-src') || 'image/ShowreelSci.MOV';

            if (modalPlayer.getAttribute('src') !== videoSrc) {
                modalPlayer.src = videoSrc;
            }

            videoModal.classList.add('active');
            document.body.style.overflow = 'hidden';

            modalPlayer.play().then(() => {
                updateControlsUI();
            }).catch(err => console.log('Autoplay empêché:', err));
        });
    });

    const closeVideo = () => {
        videoModal.classList.remove('active');
        modalPlayer.pause();
        modalPlayer.currentTime = 0;
        document.body.style.overflow = 'auto';
        updateControlsUI();
    };

    // Boutons de fermeture
    topCloseBtn?.addEventListener('click', closeVideo);
    vidQuitBtn?.addEventListener('click', closeVideo);
    document.querySelector('.video-modal-close')?.addEventListener('click', closeVideo);

    // Play / Pause
    vidPlayPauseBtn?.addEventListener('click', () => {
        if (modalPlayer.paused) {
            modalPlayer.play();
        } else {
            modalPlayer.pause();
        }
        updateControlsUI();
    });

    // Progression vidéo
    modalPlayer.addEventListener('timeupdate', updateControlsUI);
    modalPlayer.addEventListener('loadedmetadata', updateControlsUI);

    // Clic sur timeline
    vidTimeline?.addEventListener('click', (e) => {
        const rect = vidTimeline.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        if (modalPlayer.duration) {
            modalPlayer.currentTime = pos * modalPlayer.duration;
        }
    });

    // Mute
    vidMuteBtn?.addEventListener('click', () => {
        modalPlayer.muted = !modalPlayer.muted;
        const icon = vidMuteBtn.querySelector('i');
        if (icon) {
            icon.className = modalPlayer.muted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
        }
    });

    // Plein écran
    vidFullscreenBtn?.addEventListener('click', () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            modalPlayer.requestFullscreen?.() || videoModal.requestFullscreen?.();
        }
    });

    // Clic extérieur
    videoModal.addEventListener('click', function (e) {
        if (e.target === videoModal) {
            closeVideo();
        }
    });

    // Clavier Echap
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && videoModal.classList.contains('active')) {
            closeVideo();
        }
    });
}

/* ==============================================
   SYSTÈME DE FAVORIS PERSISTANTS (localStorage)
   ============================================== */

const FAVORITES_STORAGE_KEY = 'sci_deutsch_favorites_v1';

function getSavedFavorites() {
    try {
        const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        return [];
    }
}

function saveFavorites(favorites) {
    try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (e) {
        console.error('Impossible d\'enregistrer les favoris dans localStorage', e);
    }
}

function toggleFavorite(itemId, title = 'Élément') {
    let favorites = getSavedFavorites();
    const index = favorites.indexOf(itemId);
    let isAdded = false;

    if (index > -1) {
        favorites.splice(index, 1);
        showNotification(`"${title}" retiré de vos favoris`, 'info');
    } else {
        favorites.push(itemId);
        isAdded = true;
        showNotification(`"${title}" ajouté à vos favoris ❤️`, 'success');
    }

    saveFavorites(favorites);
    updateFavoritesUI();
    return isAdded;
}

function updateFavoritesUI() {
    const favorites = getSavedFavorites();
    document.querySelectorAll('[data-fav-id]').forEach(btn => {
        const id = btn.getAttribute('data-fav-id');
        const icon = btn.querySelector('i');
        if (favorites.includes(id)) {
            btn.classList.add('active');
            if (icon) {
                icon.className = 'fas fa-heart';
                icon.style.color = '#e74c3c';
            }
        } else {
            btn.classList.remove('active');
            if (icon) {
                icon.className = 'far fa-heart';
                icon.style.color = '';
            }
        }
    });
}

function initFavoritesManager() {
    updateFavoritesUI();

    document.body.addEventListener('click', function (e) {
        const favBtn = e.target.closest('.btn-favorite, [data-fav-id]');
        if (favBtn) {
            e.preventDefault();
            e.stopPropagation();
            const id = favBtn.getAttribute('data-fav-id') || favBtn.getAttribute('data-car-id') || favBtn.closest('[data-car-id]')?.getAttribute('data-car-id');
            const title = favBtn.getAttribute('data-title') || 'Véhicule';
            
            if (id) {
                toggleFavorite(id, title);
            }
        }
    });
}

/* ==============================================
   NOTIFICATION SYSTEM (TOAST)
   ============================================== */

function showNotification(message, type = 'info') {
    let notif = document.getElementById('globalNotification');
    if (!notif) {
        notif = document.createElement('div');
        notif.id = 'globalNotification';
        notif.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: #1a3a5f;
            color: #fff;
            padding: 14px 24px;
            border-radius: 30px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.25);
            font-size: 0.95rem;
            font-weight: 500;
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 12px;
            transform: translateY(100px);
            opacity: 0;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            border-left: 4px solid #c19a5b;
        `;
        document.body.appendChild(notif);
    }

    notif.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}" style="color:#c19a5b;"></i>
        <span>${message}</span>
    `;

    notif.style.transform = 'translateY(0)';
    notif.style.opacity = '1';

    clearTimeout(notif.timeout);
    notif.timeout = setTimeout(() => {
        notif.style.transform = 'translateY(100px)';
        notif.style.opacity = '0';
    }, 3500);
}
