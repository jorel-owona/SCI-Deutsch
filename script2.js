// ==============================================
// GESTION DES TERRAINS - CAMEROUN
// ==============================================

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function () {

    // ==============================================
    // VARIABLES GLOBALES
    // ==============================================
    const terrainsGrid = document.getElementById('terrainsGrid');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const arrondissementSelect = document.getElementById('arrondissement');
    const prixRangeSelect = document.getElementById('prixRange');
    const modal = document.getElementById('terrainModal');
    const modalBody = modal.querySelector('.modal-body');
    const closeModal = document.querySelector('.close-modal');
    const toast = document.getElementById('notificationToast');
    const header = document.querySelector('.header');
    const burgerBtn = document.getElementById('burgerBtn');
    const mobileNav = document.getElementById('mobileNav');

    // ==============================================
    // GESTION DU HEADER ET MENU BURGER
    // ==============================================

    // Toggle Menu Mobile
    if (burgerBtn && mobileNav) {
        burgerBtn.addEventListener('click', function () {
            this.classList.toggle('active');
            mobileNav.classList.toggle('active');

            // Empêcher le défilement quand le menu est ouvert
            if (mobileNav.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = 'auto';
            }
        });

        // Fermer le menu au clic sur un lien
        const mobileLinks = mobileNav.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                burgerBtn.classList.remove('active');
                mobileNav.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        });
    }

    // Effet Header au défilement
    window.addEventListener('scroll', function () {
        if (window.scrollY > 50) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.1)';
            header.style.padding = '10px 0'; // Optionnel : réduire la hauteur
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
            header.style.padding = '0';
        }
    });

    // Smooth Scroll pour liens internes
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const headerHeight = header.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Mettre à jour le lien actif au défilement
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-desktop a, .nav-mobile a');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - header.offsetHeight - 10)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current) && current !== '') {
                link.classList.add('active');
            }
        });
    });

    // Données simulées pour les terrains (pour la pagination et le filtre)
    const terrainsData = [
        { region: 'centre', arrondissement: 'yaounde', prix: 45000000 },
        { region: 'littoral', arrondissement: 'douala', prix: 75000000 },
        { region: 'ouest', arrondissement: 'bafoussam', prix: 35000000 },
        { region: 'sud', arrondissement: 'ebolowa', prix: 25000000 },
        { region: 'centre', arrondissement: 'mbalmayo', prix: 30000000 },
        { region: 'littoral', arrondissement: 'douala', prix: 95000000 }
    ];

    // ==============================================
    // SYSTÈME DE FILTRAGE
    // ==============================================

    function filterTerrains() {
        const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
        const selectedArrondissement = arrondissementSelect.value;
        const selectedPrixRange = prixRangeSelect.value;

        const terrainCards = document.querySelectorAll('.terrain-card');

        terrainCards.forEach((card, index) => {
            const region = card.dataset.region;
            const arrondissement = card.dataset.arrondissement;
            const prix = parseInt(card.dataset.prix);

            let showByRegion = activeFilter === 'all' || region === activeFilter;
            let showByArrondissement = !selectedArrondissement || arrondissement === selectedArrondissement;
            let showByPrix = true;

            if (selectedPrixRange) {
                const [min, max] = selectedPrixRange.split('-').map(val => {
                    if (val === '25') return 25000000;
                    if (val === '50') return 50000000;
                    if (val === '100') return 100000000;
                    if (val === '25+') return 25000000;
                    if (val === '100+') return Infinity;
                    return parseInt(val) * 1000000;
                });

                if (max) {
                    showByPrix = prix >= min && prix <= max;
                } else {
                    showByPrix = prix >= min;
                }
            }

            const shouldShow = showByRegion && showByArrondissement && showByPrix;

            // Animation de disparition/apparition
            if (shouldShow) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 50);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });

        // Afficher un message si aucun résultat
        const visibleCards = document.querySelectorAll('.terrain-card[style*="display: block"]');
        if (visibleCards.length === 0) {
            showNoResultsMessage();
        } else {
            hideNoResultsMessage();
        }
    }

    function showNoResultsMessage() {
        let message = document.querySelector('.no-results');
        if (!message) {
            message = document.createElement('div');
            message.className = 'no-results';
            message.innerHTML = `
                <i class="fas fa-search"></i>
                <h3>Aucun terrain trouvé</h3>
                <p>Essayez de modifier vos critères de recherche</p>
            `;
            terrainsGrid.parentNode.insertBefore(message, terrainsGrid.nextSibling);
        }
    }

    function hideNoResultsMessage() {
        const message = document.querySelector('.no-results');
        if (message) {
            message.remove();
        }
    }

    // Événements de filtrage
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterTerrains();
        });
    });

    arrondissementSelect?.addEventListener('change', filterTerrains);
    prixRangeSelect?.addEventListener('change', filterTerrains);

    // ==============================================
    // LECTEUR VIDÉO PERSONNALISÉ
    // ==============================================

    function initializeVideoPlayers() {
        const videoContainers = document.querySelectorAll('.video-container');

        videoContainers.forEach(container => {
            const video = container.querySelector('video');
            if (!video) return;

            const playPauseBtn = container.querySelector('.video-play-pause');
            const progressBar = container.querySelector('.progress-bar');
            const progressFilled = container.querySelector('.progress-filled');
            const currentTimeSpan = container.querySelector('.current-time');
            const durationSpan = container.querySelector('.duration');
            const fullscreenBtn = container.querySelector('.video-fullscreen');
            const speedOptions = container.querySelectorAll('.speed-option');
            const brightnessControl = container.querySelector('.brightness-control');
            const contrastControl = container.querySelector('.contrast-control');
            const volumeControl = container.querySelector('.volume-control');
            const overlay = container.querySelector('.video-overlay');

            // Initialisation des contrôles
            if (playPauseBtn) {
                playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            }

            if (volumeControl) {
                video.volume = volumeControl.value / 100;
            }

            // Lecture/Pause
            playPauseBtn?.addEventListener('click', () => {
                togglePlay(video, playPauseBtn);
            });

            overlay?.addEventListener('click', () => {
                togglePlay(video, playPauseBtn);
            });

            function togglePlay(video, btn) {
                if (video.paused) {
                    video.play();
                    btn.innerHTML = '<i class="fas fa-pause"></i>';
                    overlay.style.opacity = '0';
                } else {
                    video.pause();
                    btn.innerHTML = '<i class="fas fa-play"></i>';
                    overlay.style.opacity = '1';
                }
            }

            // Mise à jour de la barre de progression
            video.addEventListener('timeupdate', () => {
                const progress = (video.currentTime / video.duration) * 100;
                progressFilled.style.width = progress + '%';

                // Mise à jour du temps
                currentTimeSpan.textContent = formatTime(video.currentTime);
            });

            video.addEventListener('loadedmetadata', () => {
                durationSpan.textContent = formatTime(video.duration);
            });

            // Barre de progression cliquable
            progressBar?.addEventListener('click', (e) => {
                const rect = progressBar.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                video.currentTime = pos * video.duration;
            });

            // Plein écran
            fullscreenBtn?.addEventListener('click', () => {
                if (video.requestFullscreen) {
                    video.requestFullscreen();
                } else if (video.webkitRequestFullscreen) {
                    video.webkitRequestFullscreen();
                }
            });

            // Vitesse de lecture
            speedOptions?.forEach(option => {
                option.addEventListener('click', () => {
                    speedOptions.forEach(opt => opt.classList.remove('active'));
                    option.classList.add('active');
                    video.playbackRate = parseFloat(option.dataset.speed);
                });
            });

            // Luminosité
            brightnessControl?.addEventListener('input', (e) => {
                const value = e.target.value;
                video.style.filter = `brightness(${value}%) contrast(${contrastControl?.value || 100}%)`;
            });

            // Contraste
            contrastControl?.addEventListener('input', (e) => {
                const value = e.target.value;
                video.style.filter = `brightness(${brightnessControl?.value || 100}%) contrast(${value}%)`;
            });

            // Volume
            volumeControl?.addEventListener('input', (e) => {
                video.volume = e.target.value / 100;
            });

            // Arrêter la vidéo quand elle n'est plus visible
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting && !video.paused) {
                        video.pause();
                        if (playPauseBtn) {
                            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                        }
                    }
                });
            }, { threshold: 0.5 });

            observer.observe(video);
        });
    }

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // ==============================================
    // MODAL DE DÉTAILS - GALERIE INTERACTIVE
    // ==============================================

    let currentMediaIndex = 0;
    let currentGalleryData = [];

    function showTerrainDetails(terrainName) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        // Données étendues pour la galerie (normalement via une base de données)
        // Ici on simule des médias pour chaque terrain
        currentGalleryData = [
            { type: 'image', url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1932&q=80' },
            { type: 'video', url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
            { type: 'image', url: 'https://images.unsplash.com/photo-1500076656116-558758c991c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80' },
            { type: 'image', url: 'https://images.unsplash.com/photo-1542601098-8fc114e148e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80' }
        ];

        currentMediaIndex = 0;
        renderGallery(terrainName);
    }

    function renderGallery(terrainName) {
        modalBody.innerHTML = `
            <div class="modal-gallery">
                <div class="gallery-container">
                    <div class="gallery-media-wrapper" id="mediaWrapper">
                        ${currentGalleryData.map(item => `
                            <div class="gallery-item">
                                ${item.type === 'image'
                ? `<img src="${item.url}" alt="${terrainName}">`
                : `<video src="${item.url}" controls></video>`}
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="gallery-nav">
                        <button class="gallery-btn" id="prevMedia"><i class="fas fa-chevron-left"></i></button>
                        <button class="gallery-btn" id="nextMedia"><i class="fas fa-chevron-right"></i></button>
                    </div>
                    
                    <div class="gallery-counter">
                        <span id="currentIdx">1</span> / ${currentGalleryData.length}
                    </div>
                </div>

                <div class="gallery-thumbs">
                    ${currentGalleryData.map((item, idx) => `
                        <div class="thumb-item ${idx === 0 ? 'active' : ''}" data-index="${idx}">
                            <img src="${item.type === 'image' ? item.url : 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1932&q=80'}" alt="Miniature">
                        </div>
                    `).join('')}
                </div>

                <div style="padding: 20px;">
                    <h2 style="color: #1a3a5f;">${terrainName}</h2>
                    <p style="color: #666; margin-top: 10px;">Consultez les photos et vidéos de ce terrain exceptionnel.</p>
                </div>
            </div>
        `;

        // Événements Galerie
        const wrapper = document.getElementById('mediaWrapper');
        const prevBtn = document.getElementById('prevMedia');
        const nextBtn = document.getElementById('nextMedia');
        const thumbs = document.querySelectorAll('.thumb-item');
        const currentIdxText = document.getElementById('currentIdx');

        const updateGallery = (index) => {
            currentMediaIndex = index;
            wrapper.style.transform = `translateX(-${index * 100}%)`;
            currentIdxText.textContent = index + 1;

            thumbs.forEach(t => t.classList.remove('active'));
            thumbs[index].classList.add('active');

            // Stopper les vidéos si on change de slide
            const allVideos = wrapper.querySelectorAll('video');
            allVideos.forEach(v => v.pause());
        };

        prevBtn.addEventListener('click', () => {
            let idx = (currentMediaIndex - 1 + currentGalleryData.length) % currentGalleryData.length;
            updateGallery(idx);
        });

        nextBtn.addEventListener('click', () => {
            let idx = (currentMediaIndex + 1) % currentGalleryData.length;
            updateGallery(idx);
        });

        thumbs.forEach(thumb => {
            thumb.addEventListener('click', () => {
                updateGallery(parseInt(thumb.dataset.index));
            });
        });
    }

    // Événements pour les boutons de détails
    document.querySelectorAll('.btn-details').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            const terrainName = this.dataset.terrain;
            showTerrainDetails(terrainName);
        });
    });

    // Fermeture du modal
    closeModal?.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // ==============================================
    // BOUTON CONTACT & WHATSAPP
    // ==============================================

    function attachButtonEvents() {
        document.querySelectorAll('.btn-details').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                showTerrainDetails(this.dataset.terrain);
            });
        });

        document.querySelectorAll('.btn-whatsapp').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                const terrainName = this.dataset.terrain;
                const message = encodeURIComponent(`Bonjour, je suis intéressé par le terrain ${terrainName} présenté sur votre site.`);
                window.open(`https://wa.me/237691739200?text=${message}`, '_blank');
                showToast(`Redirection WhatsApp pour ${terrainName}`);
            });
        });

        document.querySelectorAll('.btn-contact').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                window.location.href = 'index.html#contact';
            });
        });
    }

    function showToast(message) {
        const toast = document.getElementById('notificationToast');
        const toastMessage = toast.querySelector('span');

        toastMessage.textContent = message;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // ==============================================
    // PAGINATION / CHARGER PLUS
    // ==============================================

    const loadMoreBtn = document.getElementById('loadMoreTerrains');
    let currentPage = 1;
    const cardsPerPage = 3;

    loadMoreBtn?.addEventListener('click', function () {
        // Simuler le chargement de nouveaux terrains
        this.innerHTML = '<span>Chargement...</span> <i class="fas fa-spinner fa-spin"></i>';

        setTimeout(() => {
            // Ajouter de nouvelles cartes (simulées)
            const newCards = generateNewCards(currentPage);
            terrainsGrid.insertAdjacentHTML('beforeend', newCards);

            this.innerHTML = '<span>Voir plus de terrains</span> <i class="fas fa-arrow-down"></i>';
            currentPage++;

            // Réinitialiser les lecteurs vidéo
            initializeVideoPlayers();

            // Ajouter les événements aux nouveaux boutons
            attachButtonEvents();

            // Animation d'apparition
            const newCardsElements = document.querySelectorAll('.terrain-card:not(.animated)');
            newCardsElements.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('animated');
                }, index * 100);
            });
        }, 1500);
    });

    function generateNewCards(page) {
        // Simuler de nouveaux terrains
        const regions = ['centre', 'littoral', 'ouest'];
        const prices = [40000000, 60000000, 80000000];

        return `
            <div class="terrain-card animate-on-scroll" data-region="${regions[page % 3]}" data-arrondissement="yaounde" data-prix="${prices[page % 3]}">
                <div class="card-media">
                    <div class="video-container">
                        <video class="terrain-video" poster="https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1932&q=80">
                            <source src="https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4">
                        </video>
                        <div class="video-overlay">
                            <i class="fas fa-play-circle"></i>
                        </div>
                    </div>
                    <div class="region-badge ${regions[page % 3]}">${regions[page % 3].charAt(0).toUpperCase() + regions[page % 3].slice(1)}</div>
                    <div class="status-badge disponible">Disponible</div>
                </div>
                <div class="card-content">
                    <h3>Nouveau terrain - Lot ${page + 7}</h3>
                    <div class="terrain-location">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>Yaoundé, Quartier Résidentiel</span>
                    </div>
                    <div class="terrain-price">
                        <span class="price">${prices[page % 3].toLocaleString()} FCFA</span>
                    </div>
                    <div class="terrain-actions">
                        <button class="btn-contact" data-terrain="Nouveau ${page + 7}">
                            <i class="fas fa-whatsapp"></i> Contacter
                        </button>
                        <button class="btn-details" data-terrain="Nouveau ${page + 7}">
                            <i class="fas fa-info-circle"></i> Détails
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    function attachButtonEvents() {
        // Réattacher les événements aux nouveaux boutons
        document.querySelectorAll('.btn-details:not([data-listener])').forEach(btn => {
            btn.setAttribute('data-listener', 'true');
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                showTerrainDetails(this.dataset.terrain);
            });
        });

        document.querySelectorAll('.btn-whatsapp:not([data-listener])').forEach(btn => {
            btn.setAttribute('data-listener', 'true');
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                const terrainName = this.dataset.terrain;
                const message = encodeURIComponent(`Bonjour, je suis intéressé par le terrain ${terrainName} présenté sur votre site.`);
                window.open(`https://wa.me/237691739200?text=${message}`, '_blank');
                showToast(`Redirection WhatsApp pour ${terrainName}`);
            });
        });

        document.querySelectorAll('.btn-contact:not([data-listener])').forEach(btn => {
            btn.setAttribute('data-listener', 'true');
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                window.location.href = 'index.html#contact';
            });
        });
    }

    // ==============================================
    // ANIMATIONS AU SCROLL
    // ==============================================

    const animateElements = document.querySelectorAll('.animate-on-scroll');

    function checkScroll() {
        animateElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementBottom = element.getBoundingClientRect().bottom;
            const windowHeight = window.innerHeight;

            if (elementTop < windowHeight - 100 && elementBottom > 0) {
                element.classList.add('animated');
            }
        });
    }

    window.addEventListener('scroll', checkScroll);
    checkScroll(); // Vérifier au chargement

    // ==============================================
    // INITIALISATION
    // ==============================================

    // Initialiser les lecteurs vidéo
    initializeVideoPlayers();

    // Attacher les événements aux boutons
    attachButtonEvents();

    // Initialiser les filtres
    filterTerrains();

    console.log('Section Terrains initialisée avec succès !');
});