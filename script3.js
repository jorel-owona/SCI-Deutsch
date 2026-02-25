// ==============================================
// GESTION DE LA LOCATION DE VOITURES
// ==============================================

document.addEventListener('DOMContentLoaded', function () {

    // ==============================================
    // VARIABLES
    // ==============================================
    const carsGrid = document.getElementById('carsGrid');
    const filterButtons = document.querySelectorAll('.car-filter-btn');
    const prixSelect = document.getElementById('prixLocation');
    const carburantSelect = document.getElementById('typeCarburant');
    const transmissionSelect = document.getElementById('transmission');

    // Modals
    const galleryModal = document.getElementById('carGalleryModal');
    const modalImage = document.getElementById('modalImage');
    const modalVideo = document.getElementById('modalVideo');

    // État actuel de la galerie
    let currentGalleryImages = [];
    let currentImageIndex = 0;

    // ==============================================
    // FILTRAGE DES VOITURES
    // ==============================================

    function filterCars() {
        const activeCategory = document.querySelector('.car-filter-btn.active')?.dataset.category || 'all';
        const selectedPrix = prixSelect.value;
        const selectedCarburant = carburantSelect.value;
        const selectedTransmission = transmissionSelect.value;

        const carCards = document.querySelectorAll('.car-card');

        carCards.forEach(card => {
            const categories = card.dataset.category.split(' ');
            const prix = parseInt(card.dataset.prix);
            const carburant = card.dataset.carburant;
            const transmission = card.dataset.transmission;

            // Filtre par catégorie
            let showByCategory = activeCategory === 'all' || categories.includes(activeCategory);

            // Filtre par prix
            let showByPrix = true;
            if (selectedPrix) {
                let min = 0, max = Infinity;

                if (selectedPrix.includes('-')) {
                    const parts = selectedPrix.split('-');
                    min = parseInt(parts[0]);
                    max = parseInt(parts[1]);
                } else if (selectedPrix.includes('+')) {
                    min = parseInt(selectedPrix);
                    max = Infinity;
                }

                showByPrix = prix >= min && prix <= max;
            }

            // Filtre par carburant
            let showByCarburant = !selectedCarburant || carburant === selectedCarburant;

            // Filtre par transmission
            let showByTransmission = !selectedTransmission || transmission === selectedTransmission;

            const shouldShow = showByCategory && showByPrix && showByCarburant && showByTransmission;

            // Animation de transition
            if (shouldShow) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'scale(1)';
                }, 50);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });

        // Vérifier s'il y a des résultats
        checkNoResults();
    }

    function checkNoResults() {
        const visibleCars = document.querySelectorAll('.car-card[style*="display: block"]');
        let noResultsMsg = document.querySelector('.no-cars-results');

        if (visibleCars.length === 0) {
            if (!noResultsMsg) {
                noResultsMsg = document.createElement('div');
                noResultsMsg.className = 'no-cars-results';
                noResultsMsg.innerHTML = `
                    <i class="fas fa-car-side"></i>
                    <h3>Aucun véhicule trouvé</h3>
                    <p>Essayez de modifier vos critères de recherche</p>
                `;
                carsGrid.parentNode.insertBefore(noResultsMsg, carsGrid.nextSibling);
            }
        } else {
            if (noResultsMsg) {
                noResultsMsg.remove();
            }
        }
    }

    // Événements de filtrage
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterCars();
        });
    });

    prixSelect?.addEventListener('change', filterCars);
    carburantSelect?.addEventListener('change', filterCars);
    transmissionSelect?.addEventListener('change', filterCars);

    // ==============================================
    // GALERIE D'IMAGES
    // ==============================================

    function initGallery() {
        const galleryTriggers = document.querySelectorAll('.car-zoom-btn, .btn-details-car');
        const thumbnails = document.querySelectorAll('.thumbnail');

        galleryTriggers.forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                const carCard = this.closest('.car-card');
                const images = [];

                // Récupérer toutes les images de la carte
                carCard.querySelectorAll('.thumbnail').forEach(thumb => {
                    const src = thumb.src; // Utiliser thumb.src ou dataset.full
                    // Si src contient .mp4, c'est une vidéo
                    images.push(src.includes('.mp4') ? src : thumb.dataset.full);
                });

                // Si pas de miniatures, utiliser l'image principale
                if (images.length === 0) {
                    const mainImage = carCard.querySelector('.car-main-image').src;
                    images.push(mainImage);
                }

                currentGalleryImages = images;
                currentImageIndex = 0;

                showGalleryImage(0);
                galleryModal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            });
        });

        // Navigation par miniatures
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', function () {
                const carCard = this.closest('.car-card');
                const mainImage = carCard.querySelector('.car-main-image');
                mainImage.src = this.dataset.full;

                // Mettre à jour la classe active
                carCard.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }

    function showGalleryImage(index) {
        if (currentGalleryImages.length > 0) {
            const url = currentGalleryImages[index];
            const isVideo = url.toLowerCase().endsWith('.mp4');

            if (isVideo) {
                modalImage.style.display = 'none';
                modalVideo.style.display = 'block';
                modalVideo.src = url;
                modalVideo.play().catch(e => console.log("Auto-play blocked"));
            } else {
                modalVideo.style.display = 'none';
                modalVideo.pause();
                modalImage.style.display = 'block';
                modalImage.src = url;
            }
        }
    }

    // Navigation dans la galerie
    document.querySelector('.modal-prev')?.addEventListener('click', () => {
        currentImageIndex = (currentImageIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
        showGalleryImage(currentImageIndex);
    });

    document.querySelector('.modal-next')?.addEventListener('click', () => {
        currentImageIndex = (currentImageIndex + 1) % currentGalleryImages.length;
        showGalleryImage(currentImageIndex);
    });

    // Fermeture de la galerie
    document.querySelector('.car-modal-close')?.addEventListener('click', () => {
        galleryModal.style.display = 'none';
        modalVideo.pause();
        document.body.style.overflow = 'auto';
    });

    window.addEventListener('click', (e) => {
        if (e.target === galleryModal) {
            galleryModal.style.display = 'none';
            modalVideo.pause();
            document.body.style.overflow = 'auto';
        }
    });

    // Navigation au clavier
    document.addEventListener('keydown', (e) => {
        if (galleryModal.style.display === 'block') {
            if (e.key === 'ArrowLeft') {
                document.querySelector('.modal-prev')?.click();
            } else if (e.key === 'ArrowRight') {
                document.querySelector('.modal-next')?.click();
            } else if (e.key === 'Escape') {
                galleryModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        }
    });

    // ==============================================
    // REDIRECTION RÉSERVATION
    // ==============================================

    function initReservation() {
        document.querySelectorAll('.btn-reserver').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                window.location.href = 'index.html#contact';
            });
        });
    }

    // ==============================================
    // BOUTONS WHATSAPP
    // ==============================================

    function initWhatsapp() {
        document.querySelectorAll('.btn-whatsapp').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                const carName = this.dataset.car;
                const message = encodeURIComponent(`Bonjour, je suis intéressé par la location du ${carName}. Pourriez-vous me donner plus d'informations ?`);
                window.open(`https://wa.me/237691739200?text=${message}`, '_blank');

                showNotification(`Redirection vers WhatsApp pour ${carName}`);
            });
        });
    }

    // ==============================================
    // NOTIFICATION
    // ==============================================

    function showNotification(message) {
        let notification = document.querySelector('.car-notification');

        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'car-notification';
            document.body.appendChild(notification);
        }

        notification.textContent = message;
        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // ==============================================
    // CHARGER PLUS DE VOITURES
    // ==============================================

    const loadMoreCars = document.getElementById('loadMoreCars');
    let carPage = 1;

    loadMoreCars?.addEventListener('click', function () {
        this.innerHTML = '<span>Chargement...</span> <i class="fas fa-spinner fa-spin"></i>';

        setTimeout(() => {
            const newCars = generateMoreCars(carPage);
            carsGrid.insertAdjacentHTML('beforeend', newCars);

            this.innerHTML = '<span>Afficher plus de véhicules</span> <i class="fas fa-car-side"></i>';
            carPage++;

            // Réinitialiser les événements
            initGallery();
            initReservation();
            initWhatsapp();
            attachCarEvents();

            // Animation d'apparition
            const newCards = document.querySelectorAll('.car-card:not(.animated)');
            newCards.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('animated');
                }, index * 100);
            });
        }, 1500);
    });

    function generateMoreCars(page) {
        const cars = [
            {
                name: 'Hyundai Tucson',
                category: 'suv',
                price: 90000,
                carburant: 'diesel',
                transmission: 'automatique',
                image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
                rating: 4,
                places: 5
            },
            {
                name: 'Kia Rio',
                category: 'economique',
                price: 30000,
                carburant: 'essence',
                transmission: 'manuelle',
                image: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
                rating: 4,
                places: 5
            }
        ];

        const car = cars[page % cars.length];

        return `
            <div class="car-card animate-on-scroll" data-category="${car.category}" data-prix="${car.price}" data-carburant="${car.carburant}" data-transmission="${car.transmission}">
                <div class="car-card-inner">
                    <div class="car-media">
                        <div class="car-image-container">
                            <img src="${car.image}" alt="${car.name}" class="car-main-image" loading="lazy">
                            <div class="car-image-overlay">
                                <button class="car-zoom-btn" data-image="${car.name.toLowerCase().replace(' ', '')}">
                                    <i class="fas fa-search-plus"></i>
                                </button>
                            </div>
                        </div>
                        <div class="car-badge">Nouveau</div>
                        <div class="car-thumbnails">
                            <img src="${car.image}" alt="Vue 1" class="thumbnail active" data-full="${car.image}">
                        </div>
                    </div>
                    <div class="car-info">
                        <div class="car-header">
                            <h3>${car.name}</h3>
                            <div class="car-rating">
                                ${generateStars(car.rating)}
                                <span>(${Math.floor(Math.random() * 50)} avis)</span>
                            </div>
                        </div>
                        <div class="car-specs">
                            <div class="spec"><i class="fas fa-users"></i><span>${car.places} places</span></div>
                            <div class="spec"><i class="fas fa-gas-pump"></i><span>${car.carburant}</span></div>
                            <div class="spec"><i class="fas fa-tachometer-alt"></i><span>${car.transmission}</span></div>
                        </div>
                        <div class="car-price-section">
                            <div class="price-tag">
                                <span class="price">${car.price.toLocaleString()} FCFA</span>
                                <span class="price-period">/jour</span>
                            </div>
                        </div>
                        <div class="car-actions">
                            <button class="btn-reserver" data-car="${car.name}"><i class="fas fa-calendar-check"></i> Réserver</button>
                            <button class="btn-whatsapp" data-car="${car.name}"><i class="fab fa-whatsapp"></i></button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function generateStars(rating) {
        let stars = '';
        for (let i = 0; i < 5; i++) {
            if (i < Math.floor(rating)) {
                stars += '<i class="fas fa-star"></i>';
            } else if (i < rating) {
                stars += '<i class="fas fa-star-half-alt"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }
        return stars;
    }

    function attachCarEvents() {
        // Réattacher tous les événements nécessaires
        const newZoomBtns = document.querySelectorAll('.car-zoom-btn:not([data-listener]), .btn-details-car:not([data-listener])');
        newZoomBtns.forEach(btn => {
            btn.setAttribute('data-listener', 'true');
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                // La galerie est déjà initialisée par initGallery sur tous les boutons (futurs inclus via loadMore inversement)
            });
        });

        const newReserveBtns = document.querySelectorAll('.btn-reserver:not([data-listener])');
        newReserveBtns.forEach(btn => {
            btn.setAttribute('data-listener', 'true');
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                window.location.href = 'index.html#contact';
            });
        });

        const newWhatsappBtns = document.querySelectorAll('.btn-whatsapp:not([data-listener])');
        newWhatsappBtns.forEach(btn => {
            btn.setAttribute('data-listener', 'true');
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                const carName = this.dataset.car;
                const message = encodeURIComponent(`Bonjour, je suis intéressé par la location du ${carName}. Pourriez-vous me donner plus d'informations ?`);
                window.open(`https://wa.me/237691739200?text=${message}`, '_blank');
            });
        });
    }


    // ==============================================
    // INITIALISATION
    // ==============================================

    initGallery();
    initReservation();
    initWhatsapp();

    console.log('Section Location de Voitures finalisée');
});