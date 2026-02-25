// ==============================================
// GESTION DE L'IMPORT-EXPORT
// ==============================================

document.addEventListener('DOMContentLoaded', function () {

    // ==============================================
    // VARIABLES
    // ==============================================
    const tradeGrid = document.getElementById('tradeGrid');
    const filterButtons = document.querySelectorAll('.trade-filter-btn');
    const searchInput = document.getElementById('tradeSearch');

    // Modals
    const inquiryModal = document.getElementById('inquiryModal');
    const specsModal = document.getElementById('specsModal');
    const inquiryClose = inquiryModal?.querySelector('.trade-modal-close');
    const specsClose = specsModal?.querySelector('.trade-modal-close');

    // ⚠️ REMPLACEZ CES VALEURS PAR VOS PROPRES CLÉS ⚠️
    const SUPABASE_URL = 'https://rosaunkspusxefmqpcfg.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvc2F1bmtzcHVzeGVmbXFwY2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMzA0ODcsImV4cCI6MjA4NTkwNjQ4N30.voclCHjsEgvFSlRHyla21se3Qr3ouwfzmol2B0olRh8';


    const EMAILJS_PUBLIC_KEY = 'VOTRE_CLE_PUBLIQUE_EMAILJS';
    const EMAILJS_SERVICE_ID = 'VOTRE_SERVICE_ID_EMAILJS';
    const EMAILJS_TEMPLATE_ID = 'VOTRE_TEMPLATE_ID_EMAILJS';

    // Initialisation Supabase
    const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

    // Initialisation EmailJS
    if (window.emailjs && EMAILJS_PUBLIC_KEY !== 'VOTRE_CLE_PUBLIQUE_EMAILJS') {
        emailjs.init(EMAILJS_PUBLIC_KEY);
    }

    // Statistiques (compteur animé)
    const statValues = document.querySelectorAll('.stat-value');

    // ==============================================
    // COMPTEURS ANIMÉS
    // ==============================================

    function animateStats() {
        statValues.forEach(stat => {
            const target = parseInt(stat.dataset.target);
            const duration = 2000; // 2 secondes
            const step = target / (duration / 16); // 60fps
            let current = 0;

            const updateCounter = () => {
                current += step;
                if (current < target) {
                    stat.textContent = Math.floor(current).toLocaleString();
                    requestAnimationFrame(updateCounter);
                } else {
                    stat.textContent = target.toLocaleString();
                }
            };

            updateCounter();
        });
    }

    // Observer pour lancer l'animation quand les stats sont visibles
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStats();
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.trade-stats').forEach(stats => {
        statsObserver.observe(stats);
    });

    // ==============================================
    // FILTRAGE DES PRODUITS
    // ==============================================

    function filterProducts() {
        const activeFilter = document.querySelector('.trade-filter-btn.active')?.dataset.trade || 'all';
        const searchTerm = searchInput?.value.toLowerCase() || '';

        const tradeCards = document.querySelectorAll('.trade-card');

        tradeCards.forEach(card => {
            const categories = card.dataset.category.split(' ');
            const product = card.dataset.product;
            const title = card.querySelector('h3')?.textContent.toLowerCase() || '';

            // Filtre par catégorie
            let showByCategory = activeFilter === 'all' || categories.includes(activeFilter);

            // Filtre par recherche
            let showBySearch = !searchTerm ||
                title.includes(searchTerm) ||
                product.includes(searchTerm);

            const shouldShow = showByCategory && showBySearch;

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

        checkNoTradeResults();
    }

    function checkNoTradeResults() {
        const visibleCards = document.querySelectorAll('.trade-card[style*="display: block"]');
        let noResultsMsg = document.querySelector('.no-trade-results');

        if (visibleCards.length === 0) {
            if (!noResultsMsg) {
                noResultsMsg = document.createElement('div');
                noResultsMsg.className = 'no-trade-results';
                noResultsMsg.innerHTML = `
                    <i class="fas fa-search"></i>
                    <h3>Aucun produit trouvé</h3>
                    <p>Essayez de modifier vos critères de recherche</p>
                `;
                tradeGrid.parentNode.insertBefore(noResultsMsg, tradeGrid.nextSibling);
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
            filterProducts();
        });
    });

    searchInput?.addEventListener('input', filterProducts);

    // ==============================================
    // MINIATURES
    // ==============================================

    function initTradeThumbnails() {
        const thumbnails = document.querySelectorAll('.trade-thumb');

        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', function () {
                const container = this.closest('.trade-media');
                const mainImage = container.querySelector('.trade-image');
                const allThumbs = container.querySelectorAll('.trade-thumb');

                // Mettre à jour l'image principale
                mainImage.src = this.src;

                // Mettre à jour la classe active
                allThumbs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }

    // ==============================================
    // MODAL DE DEVIS
    // ==============================================

    const inquiryButtons = document.querySelectorAll('.btn-inquiry');
    const inquiryProduct = document.getElementById('inquiryProduct');
    const selectedProductDisplay = document.getElementById('selectedProductDisplay');

    inquiryButtons.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            const productName = this.dataset.product;

            inquiryProduct.value = productName;
            selectedProductDisplay.textContent = `Produit sélectionné : ${productName}`;

            inquiryModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    });

    inquiryClose?.addEventListener('click', () => {
        inquiryModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    window.addEventListener('click', (e) => {
        if (e.target === inquiryModal) {
            inquiryModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Soumission du formulaire de devis
    document.getElementById('inquiryForm')?.addEventListener('submit', async function (e) {
        e.preventDefault();

        const submitBtn = this.querySelector('.btn-submit-inquiry');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>Envoi en cours...</span> <i class="fas fa-spinner fa-spin"></i>';
        submitBtn.disabled = true;

        const formData = {
            product: document.getElementById('inquiryProduct').value,
            name: document.getElementById('inquiryName').value,
            company: document.getElementById('inquiryCompany').value,
            email: document.getElementById('inquiryEmail').value,
            phone: document.getElementById('inquiryPhone').value,
            quantity: document.getElementById('inquiryQuantity').value,
            incoterm: document.getElementById('inquiryIncoterm').value,
            message: document.getElementById('inquiryMessage').value,
            desired_date: document.getElementById('inquiryDate').value,
            created_at: new Date().toISOString()
        };

        try {
            // 1. Envoi vers Supabase (Table 'devis')
            if (supabase && SUPABASE_URL !== 'VOTRE_URL_SUPABASE') {
                const { error: dbError } = await supabase
                    .from('devis')
                    .insert([formData]);

                if (dbError) throw new Error("Erreur base de données : " + dbError.message);
            }

            // 2. Envoi par EmailJS
            if (window.emailjs && EMAILJS_PUBLIC_KEY !== 'VOTRE_CLE_PUBLIQUE_EMAILJS') {
                await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
                    product: formData.product,
                    name: formData.name,
                    company: formData.company,
                    email: formData.email,
                    phone: formData.phone,
                    quantity: formData.quantity,
                    incoterm: formData.incoterm,
                    message: formData.message,
                    date_souhaitee: formData.desired_date
                });
            }

            // Succès
            showTradeNotification('Votre demande de devis a été envoyée !');

            setTimeout(() => {
                inquiryModal.style.display = 'none';
                document.body.style.overflow = 'auto';
                this.reset();
            }, 2000);

        } catch (error) {
            console.error("Erreur formulaire devis:", error);
            showTradeNotification('Une erreur est survenue. Veuillez réessayer.');
        } finally {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    });

    // ==============================================
    // MODAL SPÉCIFICATIONS
    // ==============================================

    const specsButtons = document.querySelectorAll('.btn-specs');
    const specsContent = document.getElementById('specsContent');

    specsButtons.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            const productName = this.dataset.product;

            specsModal.style.display = 'block';
            document.body.style.overflow = 'hidden';

            // Simuler le chargement des spécifications
            specsContent.innerHTML = `
                <div class="specs-loader">
                    <div class="specs-spinner"></div>
                </div>
            `;

            setTimeout(() => {
                specsContent.innerHTML = generateSpecsContent(productName);
            }, 1000);
        });
    });

    specsClose?.addEventListener('click', () => {
        specsModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    window.addEventListener('click', (e) => {
        if (e.target === specsModal) {
            specsModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    function generateSpecsContent(product) {
        const productLower = product.toLowerCase();
        let specs = {
            origin: 'Allemagne / Japon / Chine',
            certification: 'CE, ISO 9001, TUV',
            packaging: 'Emballage d\'origine / Palette',
            min_stock: '1 unité / lot',
            delivery: '20-30 jours'
        };

        // Personnalisation selon le produit
        if (productLower.includes('electromenager')) {
            specs.min_stock = '5 unités';
            specs.certification = 'CE, RoHS, Classe A+++';
        } else if (productLower.includes('pièce') || productLower.includes('auto')) {
            specs.packaging = 'Carton renforcé / Caisse bois';
            specs.certification = 'OEM, ISO/TS 16949';
        } else if (productLower.includes('cacao') || productLower.includes('café') || productLower.includes('agricole')) {
            specs.origin = 'Cameroun';
            specs.certification = 'Fairtrade, Bio, Rainforest';
            specs.packaging = 'Sacs de 25kg/50kg';
            specs.min_stock = '1 conteneur 20\'';
        }

        return `
            <div class="specs-pdf">
                <h3 style="color: #1a3a5f; margin-bottom: 20px;">Fiche technique - ${product}</h3>
                
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="background: #f0f0f0;">
                        <th style="padding: 10px; text-align: left;">Caractéristique</th>
                        <th style="padding: 10px; text-align: left;">Valeur</th>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;">Origine</td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${specs.origin}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;">Certification</td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${specs.certification}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;">Emballage</td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${specs.packaging}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;">Stock minimum</td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${specs.min_stock}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;">Délai de livraison</td>
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${specs.delivery}</td>
                    </tr>
                </table>
                
                <div style="margin-top: 30px;">
                    <h4 style="color: #c19a5b;">Conditions commerciales</h4>
                    <ul style="margin-top: 10px;">
                        <li>Paiement : Lettre de crédit / Virement bancaire</li>
                        <li>Incoterms : EXW / FOB / CIF / DDP</li>
                        <li>Inspection : Contrôle qualité inclus</li>
                    </ul>
                </div>
            </div>
        `;
    }

    // ==============================================
    // BOUTONS WHATSAPP
    // ==============================================

    document.querySelectorAll('.btn-chat').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            const productName = this.dataset.product;
            const message = encodeURIComponent(`Bonjour, je suis intéressé par ${productName}. Pourriez-vous me donner plus d'informations ?`);
            window.open(`https://wa.me/23760000000?text=${message}`, '_blank');

            showTradeNotification(`Redirection WhatsApp pour ${productName}`);
        });
    });

    // ==============================================
    // BOUTONS TÉLÉCHARGER PDF / IMPRIMER
    // ==============================================

    document.querySelector('.btn-download-pdf')?.addEventListener('click', function () {
        showTradeNotification('Téléchargement du PDF...');
    });

    document.querySelector('.btn-print-specs')?.addEventListener('click', function () {
        window.print();
    });

    // ==============================================
    // NOTIFICATION
    // ==============================================

    function showTradeNotification(message) {
        let notification = document.querySelector('.trade-notification');

        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'trade-notification';
            document.body.appendChild(notification);
        }

        notification.textContent = message;
        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // ==============================================
    // CHARGER PLUS DE PRODUITS
    // ==============================================

    const loadMoreTrade = document.getElementById('loadMoreTrade');
    let tradePage = 1;

    loadMoreTrade?.addEventListener('click', function () {
        this.innerHTML = '<span>Chargement...</span> <i class="fas fa-spinner fa-spin"></i>';

        setTimeout(() => {
            const newProducts = generateMoreProducts(tradePage);
            tradeGrid.insertAdjacentHTML('beforeend', newProducts);

            this.innerHTML = '<span>Charger plus de produits</span> <i class="fas fa-globe-africa"></i>';
            tradePage++;

            // Réinitialiser les événements
            initTradeThumbnails();
            attachTradeEvents();

            // Animation d'apparition
            const newCards = document.querySelectorAll('.trade-card:not(.animated)');
            newCards.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('animated');
                }, index * 100);
            });
        }, 1500);
    });

    function generateMoreProducts(page) {
        const products = [
            {
                name: 'Huile de palme',
                category: 'export',
                origin: 'Cameroun',
                price: '850 FCFA',
                image: 'https://images.unsplash.com/photo-1595246002626-512f-9b8a2b8b8b8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
            },
            {
                name: 'Bois d\'okoumé',
                category: 'export',
                origin: 'Cameroun',
                price: '450 000 FCFA',
                image: 'https://images.unsplash.com/photo-1595246002626-512f-9b8a2b8b8b8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
            }
        ];

        const product = products[page % products.length];

        return `
            <div class="trade-card animate-on-scroll" data-category="${product.category}" data-product="${product.name.toLowerCase()}">
                <div class="trade-card-inner">
                    <div class="trade-media">
                        <div class="trade-image-container">
                            <img src="${product.image}" alt="${product.name}" class="trade-image">
                            <div class="trade-badge ${product.category}">${product.category === 'export' ? 'Export' : 'Import'}</div>
                            <div class="trade-badge origin">${product.origin}</div>
                        </div>
                    </div>
                    <div class="trade-info">
                        <h3>${product.name}</h3>
                        <div class="trade-price-section">
                            <div class="price-tag">
                                <span class="price">${product.price}</span>
                            </div>
                        </div>
                        <div class="trade-actions">
                                <button class="btn-specs" data-product="${product.name}">
                                    <i class="fas fa-file-pdf"></i> Fiche technique
                                </button>
                                <button class="btn-chat" data-product="${product.name}"><i class="fab fa-whatsapp"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
        `;
    }

    function attachTradeEvents() {
        // Réattacher tous les événements
        document.querySelectorAll('.btn-inquiry:not([data-listener])').forEach(btn => {
            btn.setAttribute('data-listener', 'true');
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                const productName = this.dataset.product;
                inquiryProduct.value = productName;
                selectedProductDisplay.textContent = `Produit sélectionné : ${productName}`;
                inquiryModal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            });
        });

        document.querySelectorAll('.btn-specs:not([data-listener])').forEach(btn => {
            btn.setAttribute('data-listener', 'true');
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                const productName = this.dataset.product;

                specsModal.style.display = 'block';
                document.body.style.overflow = 'hidden';

                specsContent.innerHTML = `
                    <div class="specs-loader">
                        <div class="specs-spinner"></div>
                    </div>
                `;

                setTimeout(() => {
                    specsContent.innerHTML = generateSpecsContent(productName);
                }, 1000);
            });
        });

        document.querySelectorAll('.btn-chat:not([data-listener])').forEach(btn => {
            btn.setAttribute('data-listener', 'true');
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                const productName = this.dataset.product;
                const message = encodeURIComponent(`Bonjour, je suis intéressé par ${productName}. Pourriez-vous me donner plus d'informations ?`);
                window.open(`https://wa.me/23760000000?text=${message}`, '_blank');
                showTradeNotification(`Redirection WhatsApp pour ${productName}`);
            });
        });
    }

    // ==============================================
    // EFFET DE SCROLL
    // ==============================================

    const worldMap = document.querySelector('.map-svg');

    window.addEventListener('scroll', () => {
        if (worldMap) {
            const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
            const rotate = scrollPercent * 360;
            worldMap.style.transform = `rotate(${rotate}deg)`;
        }
    });

    // ==============================================
    // STYLES DYNAMIQUES
    // ==============================================

    const style = document.createElement('style');
    style.textContent = `
        .no-trade-results {
            text-align: center;
            padding: 60px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 20px;
            margin: 30px 0;
        }
        
        .no-trade-results i {
            font-size: 4rem;
            color: #c19a5b;
            margin-bottom: 20px;
        }
        
        .no-trade-results h3 {
            color: white;
            margin-bottom: 10px;
        }
        
        .no-trade-results p {
            color: rgba(255, 255, 255, 0.7);
        }
    `;
    document.head.appendChild(style);

    // ==============================================
    // DÉTAILS DU PRODUIT (Lien avec la vue détaillée)
    // ==============================================
    // ==============================================
    // GALERIE MÉDIAS (Import-Export)
    // ==============================================
    let currentTradeGallery = [];
    let currentTradeIndex = 0;

    function initTradeGallery() {
        const detailsButtons = document.querySelectorAll('.btn-details-trade');
        const galleryModal = document.getElementById('tradeGalleryModal');
        const modalImage = document.getElementById('modalTradeImage');
        const modalVideo = document.getElementById('modalTradeVideo');
        const modalTitle = document.getElementById('modalTradeTitle');
        const galleryClose = galleryModal?.querySelector('.gallery-close');

        detailsButtons.forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                const card = this.closest('.trade-card');
                const title = card.querySelector('h3').textContent;
                const thumbs = card.querySelectorAll('.trade-thumb');
                const mediaSet = [];

                thumbs.forEach(thumb => {
                    const src = thumb.src;
                    mediaSet.push({
                        url: src,
                        type: src.toLowerCase().endsWith('.mp4') ? 'video' : 'image'
                    });
                });

                if (mediaSet.length === 0) {
                    const mainImg = card.querySelector('.trade-image').src;
                    mediaSet.push({
                        url: mainImg,
                        type: mainImg.toLowerCase().endsWith('.mp4') ? 'video' : 'image'
                    });
                }

                currentTradeGallery = mediaSet;
                currentTradeIndex = 0;
                if (modalTitle) modalTitle.textContent = title;

                showTradeMedia(0);
                if (galleryModal) {
                    galleryModal.style.display = 'block';
                    document.body.style.overflow = 'hidden';
                }
            });
        });

        function showTradeMedia(index) {
            if (currentTradeGallery.length > 0) {
                const item = currentTradeGallery[index];
                if (item.type === 'video') {
                    modalImage.style.display = 'none';
                    modalVideo.style.display = 'block';
                    modalVideo.src = item.url;
                    modalVideo.play().catch(e => console.log("Auto-play blocked"));
                } else {
                    modalVideo.pause();
                    modalVideo.style.display = 'none';
                    modalImage.style.display = 'block';
                    modalImage.src = item.url;
                }
            }
        }

        // Navigation
        galleryModal?.querySelector('.modal-prev')?.addEventListener('click', () => {
            currentTradeIndex = (currentTradeIndex - 1 + currentTradeGallery.length) % currentTradeGallery.length;
            showTradeMedia(currentTradeIndex);
        });

        galleryModal?.querySelector('.modal-next')?.addEventListener('click', () => {
            currentTradeIndex = (currentTradeIndex + 1) % currentTradeGallery.length;
            showTradeMedia(currentTradeIndex);
        });

        galleryClose?.addEventListener('click', () => {
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
    }

    // ==============================================
    // INITIALISATION
    // ==============================================

    initTradeThumbnails();
    initTradeGallery();
    attachTradeEvents();

    console.log('Section Import-Export initialisée avec succès !');
});