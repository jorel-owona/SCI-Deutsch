
// ==============================================
// GESTION DE LA GALERIE DES LOCAUX
// ==============================================

document.addEventListener('DOMContentLoaded', function () {

    // ==============================================
    // VARIABLES
    // ==============================================
    const galleryGrid = document.getElementById('galleryGrid');
    const filterButtons = document.querySelectorAll('.gallery-filter-btn');
    const viewOptions = document.querySelectorAll('.view-option');

    // Lightbox
    const lightbox = document.getElementById('galleryLightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxTitle = document.getElementById('lightboxTitle');
    const lightboxDescription = document.getElementById('lightboxDescription');
    const lightboxMeta = document.getElementById('lightboxMeta');
    const lightboxThumbnails = document.getElementById('lightboxThumbnails');
    const lightboxClose = document.querySelector('.lightbox-close');

    // Informations modale
    const infoModal = document.getElementById('infoModal');
    const infoModalBody = document.getElementById('infoModalBody');

    // État actuel
    let currentImages = [];
    let currentIndex = 0;
    let zoomLevel = 1;
    let rotationAngle = 0;
    let isDragging = false;
    let startX, startY, translateX = 0, translateY = 0;

    // ==============================================
    // NAVIGATION ET HEADER
    // ==============================================
    const burgerBtn = document.getElementById('burgerBtn');
    const mobileNav = document.getElementById('mobileNav');
    const header = document.querySelector('.header');

    // Menu Burger
    burgerBtn?.addEventListener('click', function () {
        this.classList.toggle('active');
        mobileNav?.classList.toggle('active');
        document.body.classList.toggle('overflow-hidden');
    });

    // Fermer le menu au clic sur un lien
    document.querySelectorAll('.nav-mobile a').forEach(link => {
        link.addEventListener('click', () => {
            burgerBtn?.classList.remove('active');
            mobileNav?.classList.remove('active');
            document.body.classList.remove('overflow-hidden');
        });
    });

    // Effet scroll header
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            header?.classList.add('scrolled');
        } else {
            header?.classList.remove('scrolled');
        }

        if (currentScroll > lastScroll && currentScroll > 500) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        lastScroll = currentScroll;
    });

    // ==============================================
    // VISITE VIRTUELLE 360°
    // ==============================================

    function initVirtualTour() {
        const panorama = document.getElementById('panoramaImage');
        const tourViewer = document.querySelector('.tour-viewer');
        const rotateLeft = document.getElementById('rotateLeft');
        const rotateRight = document.getElementById('rotateRight');
        const zoomIn = document.getElementById('zoomIn');
        const zoomOut = document.getElementById('zoomOut');
        const tourThumbs = document.querySelectorAll('.tour-thumb');

        let currentRotation = 0;
        let currentZoom = 1;

        // Rotation
        rotateLeft?.addEventListener('click', () => {
            currentRotation -= 30;
            panorama.style.transform = `rotate(${currentRotation}deg) scale(${currentZoom})`;
        });

        rotateRight?.addEventListener('click', () => {
            currentRotation += 30;
            panorama.style.transform = `rotate(${currentRotation}deg) scale(${currentZoom})`;
        });

        // Zoom
        zoomIn?.addEventListener('click', () => {
            currentZoom = Math.min(currentZoom + 0.1, 2);
            panorama.style.transform = `rotate(${currentRotation}deg) scale(${currentZoom})`;
        });

        zoomOut?.addEventListener('click', () => {
            currentZoom = Math.max(currentZoom - 0.1, 0.5);
            panorama.style.transform = `rotate(${currentRotation}deg) scale(${currentZoom})`;
        });

        // Drag to rotate
        let isDragging = false;
        let startX;

        tourViewer?.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const deltaX = e.clientX - startX;
            currentRotation += deltaX * 0.5;
            panorama.style.transform = `rotate(${currentRotation}deg) scale(${currentZoom})`;
            startX = e.clientX;
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Changement de vue
        tourThumbs.forEach(thumb => {
            thumb.addEventListener('click', function () {
                const view = this.dataset.view;
                const imgSrc = this.querySelector('img').src;

                panorama.src = imgSrc;

                tourThumbs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');

                // Réinitialiser rotation et zoom
                currentRotation = 0;
                currentZoom = 1;
                panorama.style.transform = 'rotate(0deg) scale(1)';
            });
        });

        // Hotspots
        const hotspots = document.querySelectorAll('.hotspot');
        hotspots.forEach(hotspot => {
            hotspot.addEventListener('click', function () {
                const info = this.dataset.info;
                showGalleryNotification(`Point d'intérêt: ${info}`);
            });
        });
    }

    // ==============================================
    // FILTRAGE DE LA GALERIE
    // ==============================================

    function filterGallery() {
        const activeFilter = document.querySelector('.gallery-filter-btn.active')?.dataset.filter || 'all';
        const galleryItems = document.querySelectorAll('.gallery-item');

        galleryItems.forEach((item, index) => {
            const category = item.dataset.category;
            const shouldShow = activeFilter === 'all' || category === activeFilter;

            // Animation de transition
            if (shouldShow) {
                item.style.display = 'block';
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1)';
                }, 50);
            } else {
                item.style.opacity = '0';
                item.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });

        // Mettre à jour les images courantes pour la lightbox
        updateCurrentImages();
    }

    filterButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterGallery();
        });
    });

    // ==============================================
    // CHANGEMENT DE VUE (GRID/MASONRY/LIST)
    // ==============================================

    viewOptions.forEach(option => {
        option.addEventListener('click', function () {
            const view = this.dataset.view;

            viewOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');

            // Changer la classe de la grille
            galleryGrid.className = 'gallery-grid';
            if (view !== 'grid') {
                galleryGrid.classList.add(view);
            }

            // Réorganiser les éléments pour masonry
            if (view === 'masonry') {
                setTimeout(() => {
                    // Forcer le réarrangement
                    window.dispatchEvent(new Event('resize'));
                }, 100);
            }
        });
    });

    // ==============================================
    // LIGHTBOX
    // ==============================================

    function updateCurrentImages() {
        const visibleItems = document.querySelectorAll('.gallery-item[style*="display: block"]');
        currentImages = Array.from(visibleItems).map(item => {
            const img = item.querySelector('img');
            const title = item.querySelector('h4')?.textContent || '';
            const description = item.querySelector('p')?.textContent || '';
            const meta = item.querySelectorAll('.gallery-meta span');

            return {
                src: img.src,
                title: title,
                description: description,
                meta: Array.from(meta).map(m => m.textContent)
            };
        });
    }

    function openLightbox(index) {
        if (currentImages.length === 0) return;

        currentIndex = index;
        updateLightboxImage();
        updateLightboxThumbnails();

        lightbox.style.display = 'block';
        document.body.style.overflow = 'hidden';

        // Réinitialiser zoom et rotation
        zoomLevel = 1;
        rotationAngle = 0;
        lightboxImage.style.transform = `scale(${zoomLevel}) rotate(${rotationAngle}deg)`;
    }

    function updateLightboxImage() {
        const image = currentImages[currentIndex];

        lightboxImage.src = image.src;
        lightboxTitle.textContent = image.title;
        lightboxDescription.textContent = image.description;

        lightboxMeta.innerHTML = image.meta.map(m => `<span>${m}</span>`).join('');
    }

    function updateLightboxThumbnails() {
        lightboxThumbnails.innerHTML = currentImages.map((img, idx) => `
            <img src="${img.src}" 
                 alt="Miniature" 
                 class="${idx === currentIndex ? 'active' : ''}"
                 onclick="openLightbox(${idx})">
        `).join('');
    }

    // Ouvrir lightbox
    document.querySelectorAll('.gallery-zoom').forEach((btn, index) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const item = btn.closest('.gallery-item');
            const allItems = Array.from(document.querySelectorAll('.gallery-item[style*="display: block"]'));
            const actualIndex = allItems.indexOf(item);

            updateCurrentImages();
            openLightbox(actualIndex);
        });
    });

    // Navigation lightbox
    document.querySelector('.lightbox-prev')?.addEventListener('click', () => {
        if (currentImages.length === 0) return;
        currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
        updateLightboxImage();
        updateLightboxThumbnails();
    });

    document.querySelector('.lightbox-next')?.addEventListener('click', () => {
        if (currentImages.length === 0) return;
        currentIndex = (currentIndex + 1) % currentImages.length;
        updateLightboxImage();
        updateLightboxThumbnails();
    });

    // Fermeture lightbox
    lightboxClose?.addEventListener('click', () => {
        lightbox.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    window.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Navigation clavier
    document.addEventListener('keydown', (e) => {
        if (lightbox.style.display === 'block') {
            if (e.key === 'ArrowLeft') {
                document.querySelector('.lightbox-prev')?.click();
            } else if (e.key === 'ArrowRight') {
                document.querySelector('.lightbox-next')?.click();
            } else if (e.key === 'Escape') {
                lightbox.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        }
    });

    // ==============================================
    // OUTILS LIGHTBOX
    // ==============================================

    document.getElementById('zoomInBtn')?.addEventListener('click', () => {
        zoomLevel = Math.min(zoomLevel + 0.2, 3);
        lightboxImage.style.transform = `scale(${zoomLevel}) rotate(${rotationAngle}deg)`;
    });

    document.getElementById('zoomOutBtn')?.addEventListener('click', () => {
        zoomLevel = Math.max(zoomLevel - 0.2, 0.5);
        lightboxImage.style.transform = `scale(${zoomLevel}) rotate(${rotationAngle}deg)`;
    });

    document.getElementById('rotateLeftBtn')?.addEventListener('click', () => {
        rotationAngle -= 90;
        lightboxImage.style.transform = `scale(${zoomLevel}) rotate(${rotationAngle}deg)`;
    });

    document.getElementById('rotateRightBtn')?.addEventListener('click', () => {
        rotationAngle += 90;
        lightboxImage.style.transform = `scale(${zoomLevel}) rotate(${rotationAngle}deg)`;
    });

    document.getElementById('fullscreenBtn')?.addEventListener('click', () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            lightbox.requestFullscreen();
        }
    });

    document.getElementById('downloadBtn')?.addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = lightboxImage.src;
        link.download = `SCI-Deutsch-${currentIndex + 1}.jpg`;
        link.click();

        showGalleryNotification('Image téléchargée avec succès');
    });

    document.getElementById('shareBtn')?.addEventListener('click', async () => {
        try {
            await navigator.share({
                title: currentImages[currentIndex]?.title || 'Image SCI Deutsch',
                text: currentImages[currentIndex]?.description || 'Découvrez nos locaux',
                url: lightboxImage.src
            });
        } catch (err) {
            // Fallback : copier le lien
            navigator.clipboard?.writeText(lightboxImage.src);
            showGalleryNotification('Lien copié dans le presse-papier');
        }
    });

    // ==============================================
    // MODAL INFORMATIONS
    // ==============================================

    document.querySelectorAll('.gallery-info-btn').forEach((btn, index) => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            const item = btn.closest('.gallery-item');
            const title = item.querySelector('h4')?.textContent || '';
            const description = item.querySelector('p')?.textContent || '';
            const meta = item.querySelectorAll('.gallery-meta span');

            infoModalBody.innerHTML = `
                <h3>${title}</h3>
                <p>${description}</p>
                ${Array.from(meta).map(m => `
                    <div class="info-detail">
                        <i class="fas fa-info-circle"></i>
                        <div>
                            <h4>${m.textContent}</h4>
                        </div>
                    </div>
                `).join('')}
            `;

            infoModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    });

    document.querySelector('.info-modal-close')?.addEventListener('click', () => {
        infoModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    window.addEventListener('click', (e) => {
        if (e.target === infoModal) {
            infoModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // ==============================================
    // NOTIFICATION
    // ==============================================

    function showGalleryNotification(message) {
        const notification = document.getElementById('galleryNotification');
        const span = notification.querySelector('span');

        span.textContent = message;
        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // ==============================================
    // CHARGER PLUS D'IMAGES
    // ==============================================

    const loadMoreGallery = document.getElementById('loadMoreGallery');
    let galleryPage = 1;

    loadMoreGallery?.addEventListener('click', function () {
        this.innerHTML = '<span>Chargement...</span> <i class="fas fa-spinner fa-spin"></i>';

        setTimeout(() => {
            const newImages = generateMoreGalleryImages(galleryPage);
            galleryGrid.insertAdjacentHTML('beforeend', newImages);

            this.innerHTML = '<span>Charger plus de photos</span> <i class="fas fa-camera"></i>';
            galleryPage++;

            // Réinitialiser les événements
            attachGalleryEvents();

            // Animation d'apparition
            const newItems = document.querySelectorAll('.gallery-item:not(.animated)');
            newItems.forEach((item, index) => {
                setTimeout(() => {
                    item.classList.add('animated');
                }, index * 100);
            });
        }, 1500);
    });

    function generateMoreGalleryImages(page) {
        const images = [
            {
                title: 'Nouvel espace coworking',
                category: 'bureaux',
                description: 'Espace de coworking moderne',
                meta: ['30 postes', 'WiFi haut débit']
            },
            {
                title: 'Jardin intérieur',
                category: 'detente',
                description: 'Espace vert pour la détente',
                meta: ['200m²', 'Plantes exotiques']
            }
        ];

        const img = images[page % images.length];

        return `
            <div class="gallery-item animate-on-scroll" data-category="${img.category}">
                <div class="gallery-item-inner">
                    <img src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80" 
                         alt="${img.title}" 
                         loading="lazy"
                         class="gallery-image">
                    
                    <div class="gallery-overlay">
                        <div class="gallery-info">
                            <h4>${img.title}</h4>
                            <p>${img.description}</p>
                            <div class="gallery-meta">
                                <span><i class="fas fa-camera"></i> ${img.category}</span>
                                <span><i class="fas fa-calendar"></i> 2024</span>
                            </div>
                            <div class="gallery-actions">
                                <button class="gallery-zoom"><i class="fas fa-search-plus"></i></button>
                                <button class="gallery-info-btn"><i class="fas fa-info-circle"></i></button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="gallery-badge">Nouveau</div>
                </div>
            </div>
        `;
    }

    function attachGalleryEvents() {
        // Réattacher les événements de zoom
        document.querySelectorAll('.gallery-zoom:not([data-listener])').forEach((btn, index) => {
            btn.setAttribute('data-listener', 'true');
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                const item = btn.closest('.gallery-item');
                const allItems = Array.from(document.querySelectorAll('.gallery-item[style*="display: block"]'));
                const actualIndex = allItems.indexOf(item);

                updateCurrentImages();
                openLightbox(actualIndex);
            });
        });

        // Réattacher les événements d'information
        document.querySelectorAll('.gallery-info-btn:not([data-listener])').forEach((btn, index) => {
            btn.setAttribute('data-listener', 'true');
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                const item = btn.closest('.gallery-item');
                const title = item.querySelector('h4')?.textContent || '';
                const description = item.querySelector('p')?.textContent || '';
                const meta = item.querySelectorAll('.gallery-meta span');

                infoModalBody.innerHTML = `
                    <h3>${title}</h3>
                    <p>${description}</p>
                    ${Array.from(meta).map(m => `
                        <div class="info-detail">
                            <i class="fas fa-info-circle"></i>
                            <div>
                                <h4>${m.textContent}</h4>
                            </div>
                        </div>
                    `).join('')}
                `;

                infoModal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            });
        });
    }

    // ==============================================
    // INITIALISATION
    // ==============================================

    // Initialiser la visite virtuelle
    initVirtualTour();

    // Mettre à jour les images courantes
    updateCurrentImages();

    // Ajouter le style pour les éléments animés
    const style = document.createElement('style');
    style.textContent = `
        .gallery-item {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .gallery-item.animated {
            opacity: 1;
            transform: translateY(0);
        }
        
        .gallery-item[style*="display: none"] {
            display: none !important;
        }
    `;
    document.head.appendChild(style);

    console.log('Section Galerie initialisée avec succès !');
});