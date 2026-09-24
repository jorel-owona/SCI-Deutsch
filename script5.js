
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

        galleryItems.forEach((item) => {
            const category = item.dataset.category;
            const shouldShow = activeFilter === 'all' || category === activeFilter;

            if (shouldShow) {
                item.style.display = 'block';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0) scale(1)';
                item.classList.add('animated');
            } else {
                item.style.opacity = '0';
                item.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    if (item.style.opacity === '0') {
                        item.style.display = 'none';
                    }
                }, 200);
            }
        });

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
        const visibleItems = Array.from(document.querySelectorAll('.gallery-item')).filter(item => {
            return getComputedStyle(item).display !== 'none';
        });
        currentImages = visibleItems.map(item => {
            const img = item.querySelector('img');
            const title = item.querySelector('h4')?.textContent || '';
            const description = item.querySelector('p')?.textContent || '';
            const meta = item.querySelectorAll('.gallery-meta span');

            return {
                src: img ? img.src : '',
                title: title,
                description: description,
                meta: Array.from(meta).map(m => m.textContent)
            };
        });
    }

    function openLightbox(index) {
        if (currentImages.length === 0) return;

        currentIndex = index >= 0 && index < currentImages.length ? index : 0;
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
        if (!image) return;

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

    // Ouvrir la lightbox au clic sur le bouton zoom ou directement sur l'image
    document.querySelectorAll('.gallery-zoom, .gallery-image, .gallery-item-inner').forEach((element) => {
        element.addEventListener('click', (e) => {
            if (e.target.closest('.gallery-info-btn')) return;
            e.preventDefault();
            updateCurrentImages();
            const item = element.closest('.gallery-item');
            if (!item) return;
            const visibleItems = Array.from(document.querySelectorAll('.gallery-item')).filter(el => {
                return getComputedStyle(el).display !== 'none';
            });
            const actualIndex = visibleItems.indexOf(item);
            openLightbox(actualIndex >= 0 ? actualIndex : 0);
        });
    });

    // Clic sur l'image 360° pour l'ouvrir en lightbox pleine résolution
    const panorama = document.getElementById('panoramaImage');
    panorama?.addEventListener('dblclick', function() {
        currentImages = [{
            src: this.src,
            title: "Vue 360° Réception",
            description: "Vue haute résolution des locaux SCI Deutsch",
            meta: ["Haute Résolution", "360°"]
        }];
        openLightbox(0);
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
    // CHARGER PLUS D'IMAGES (MESSAGE FIN)
    // ==============================================

    const loadMoreGallery = document.getElementById('loadMoreGallery');

    loadMoreGallery?.addEventListener('click', function () {
        if (this.disabled) return;
        this.innerHTML = '<span>Vérification...</span> <i class="fas fa-spinner fa-spin"></i>';

        setTimeout(() => {
            this.innerHTML = '<span>Toutes les photos ont été chargées</span> <i class="fas fa-check-circle"></i>';
            this.disabled = true;
            this.classList.add('disabled');
        }, 800);
    });

    // ==============================================
    // INITIALISATION
    // ==============================================

    initVirtualTour();
    filterGallery();
    updateCurrentImages();

    // Style pour l'animation fluide
    const style = document.createElement('style');
    style.textContent = `
        .gallery-item {
            opacity: 1;
            transform: translateY(0);
            transition: opacity 0.4s ease, transform 0.4s ease;
        }
        
        .gallery-item[style*="display: none"] {
            display: none !important;
        }
    `;
    document.head.appendChild(style);

    console.log('Section Galerie initialisée avec succès !');
});