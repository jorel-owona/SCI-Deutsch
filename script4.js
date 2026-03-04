// ==============================================
// GESTION DE L'IMPORT-EXPORT
// ==============================================

document.addEventListener('DOMContentLoaded', function () {

    // ==============================================
    // CONFIGURATION & INITIALISATION
    // ==============================================
    const SUPABASE_URL = 'https://rosaunkspusxefmqpcfg.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvc2F1bmtzcHVzeGVmbXFwY2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMzA0ODcsImV4cCI6MjA4NTkwNjQ4N30.voclCHjsEgvFSlRHyla21se3Qr3ouwfzmol2B0olRh8';

    const EJS_SERVICE = 'service_0mg1yy1';
    const EJS_TEMPLATE = 'template_284gcpk';
    const EJS_PUBLIC_KEY = 'l2o1aPLHxsWxRzR-i';

    // Initialisation Supabase
    const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

    // Initialisation EmailJS
    if (window.emailjs) {
        emailjs.init(EJS_PUBLIC_KEY);
    }

    // ==============================================
    // VARIABLES
    // ==============================================
    const tradeGrid = document.getElementById('tradeGrid');
    const filterButtons = document.querySelectorAll('.trade-filter-btn');
    const searchInput = document.getElementById('tradeSearch');
    const header = document.querySelector('.header');
    const burgerBtn = document.getElementById('burgerBtn');
    const mobileNav = document.getElementById('mobileNav');

    // ==============================================
    // REDIRECTION VERS CONTACT (INDEX.HTML)
    // ==============================================
    function redirectToHomeContact(productName, type) {
        const url = `index.html?product=${encodeURIComponent(productName)}&type=${encodeURIComponent(type)}#contact`;
        window.location.href = url;
    }

    function attachTradeEvents() {
        // Devis & Catalogue
        document.querySelectorAll('.btn-inquiry, .btn-specs').forEach(btn => {
            if (!btn.dataset.listenerAttached) {
                btn.dataset.listenerAttached = 'true';
                btn.addEventListener('click', function (e) {
                    e.preventDefault();
                    const productName = this.dataset.product;
                    const type = this.dataset.type || (this.classList.contains('btn-inquiry') ? 'Devis' : 'Catalogue');
                    redirectToHomeContact(productName, type);
                });
            }
        });

        // WhatsApp
        document.querySelectorAll('.btn-chat').forEach(btn => {
            if (!btn.dataset.listenerAttached) {
                btn.dataset.listenerAttached = 'true';
                btn.addEventListener('click', function (e) {
                    e.preventDefault();
                    const productName = this.dataset.product;
                    const message = encodeURIComponent(`Bonjour, je suis intéressé par ${productName}. Pourriez-vous me donner plus d'informations ?`);
                    window.open(`https://wa.me/237691739200?text=${message}`, '_blank');
                });
            }
        });

        // Détails (Galerie)
        const detailsButtons = document.querySelectorAll('.btn-details-trade');
        detailsButtons.forEach(btn => {
            if (!btn.dataset.listenerAttached) {
                btn.dataset.listenerAttached = 'true';
                btn.addEventListener('click', openTradeGallery);
            }
        });
    }


    // ==============================================
    // GALERIE MÉDIAS
    // ==============================================
    let currentTradeGallery = [];
    let currentTradeIndex = 0;

    function openTradeGallery(e) {
        e.preventDefault();
        const card = this.closest('.trade-card');
        const title = card.querySelector('h3').textContent;
        const thumbs = card.querySelectorAll('.trade-thumb');
        const mediaSet = [];

        thumbs.forEach(thumb => {
            mediaSet.push({
                url: thumb.src,
                type: thumb.src.toLowerCase().endsWith('.mp4') ? 'video' : 'image'
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

        const galleryModal = document.getElementById('tradeGalleryModal');
        const modalTitle = document.getElementById('modalTradeTitle');
        if (modalTitle) modalTitle.textContent = title;

        showTradeMedia(0);
        if (galleryModal) {
            galleryModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    function showTradeMedia(index) {
        const modalImage = document.getElementById('modalTradeImage');
        const modalVideo = document.getElementById('modalTradeVideo');
        if (!modalImage || !modalVideo) return;

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

    // Événements de fermeture Galerie
    const galleryModal = document.getElementById('tradeGalleryModal');
    galleryModal?.querySelector('.gallery-close')?.addEventListener('click', () => {
        galleryModal.style.display = 'none';
        document.getElementById('modalTradeVideo')?.pause();
        document.body.style.overflow = 'auto';
    });

    galleryModal?.querySelector('.modal-prev')?.addEventListener('click', () => {
        currentTradeIndex = (currentTradeIndex - 1 + currentTradeGallery.length) % currentTradeGallery.length;
        showTradeMedia(currentTradeIndex);
    });

    galleryModal?.querySelector('.modal-next')?.addEventListener('click', () => {
        currentTradeIndex = (currentTradeIndex + 1) % currentTradeGallery.length;
        showTradeMedia(currentTradeIndex);
    });

    window.addEventListener('click', (e) => {
        if (e.target === galleryModal) {
            galleryModal.style.display = 'none';
            document.getElementById('modalTradeVideo')?.pause();
            document.body.style.overflow = 'auto';
        }
    });

    // ==============================================
    // FILTRAGE & RECHERCHE
    // ==============================================
    function filterProducts() {
        const activeFilter = document.querySelector('.trade-filter-btn.active')?.dataset.trade || 'all';
        const searchTerm = searchInput?.value.toLowerCase() || '';
        const tradeCards = document.querySelectorAll('.trade-card');

        tradeCards.forEach(card => {
            const categories = card.dataset.category.split(' ');
            const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
            const shouldShow = (activeFilter === 'all' || categories.includes(activeFilter)) &&
                (!searchTerm || title.includes(searchTerm));

            if (shouldShow) {
                card.style.display = 'block';
                setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'scale(1)'; }, 50);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.8)';
                setTimeout(() => { card.style.display = 'none'; }, 300);
            }
        });
    }

    filterButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterProducts();
        });
    });

    searchInput?.addEventListener('input', filterProducts);

    // ==============================================
    // MINIATURES (Interactive)
    // ==============================================
    function initTradeThumbnails() {
        document.querySelectorAll('.trade-thumb').forEach(thumb => {
            if (!thumb.dataset.listenerAttached) {
                thumb.dataset.listenerAttached = 'true';
                thumb.addEventListener('click', function () {
                    const container = this.closest('.trade-media');
                    const mainImage = container.querySelector('.trade-image');
                    const allThumbs = container.querySelectorAll('.trade-thumb');
                    mainImage.src = this.src;
                    allThumbs.forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                });
            }
        });
    }

    // ==============================================
    // NOTIFICATIONS
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
        setTimeout(() => notification.classList.remove('show'), 3000);
    }

    // ==============================================
    // HEADER & BURGER
    // ==============================================
    if (burgerBtn && mobileNav) {
        burgerBtn.addEventListener('click', function () {
            this.classList.toggle('active');
            mobileNav.classList.toggle('active');
            document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : 'auto';
        });

        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                burgerBtn.classList.remove('active');
                mobileNav.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        });
    }

    window.addEventListener('scroll', function () {
        if (header) {
            header.style.background = window.scrollY > 50 ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = window.scrollY > 50 ? '0 5px 20px rgba(0, 0, 0, 0.1)' : '0 2px 10px rgba(0, 0, 0, 0.05)';
        }
    });

    // ==============================================
    // EFFET COMPTEUR (Stats)
    // ==============================================
    function initCounters() {
        const stats = document.querySelectorAll('.stat-value');
        const speed = 200;

        stats.forEach(counter => {
            const updateCount = () => {
                const target = +counter.getAttribute('data-target');
                const count = +counter.innerText;
                const inc = target / speed;

                if (count < target) {
                    counter.innerText = Math.ceil(count + inc);
                    setTimeout(updateCount, 1);
                } else {
                    counter.innerText = target;
                }
            };
            updateCount();
        });
    }

    // Observer pour les animations au scroll (dont les compteurs)
    const observerOptions = {
        threshold: 0.2
    };

    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                initCounters();
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const statsSection = document.querySelector('.trade-stats');
    if (statsSection) {
        counterObserver.observe(statsSection);
    }

    // ==============================================
    // INITIALISATION FINALE
    // ==============================================
    initTradeThumbnails();
    attachTradeEvents();

    console.log('Système Import-Export prêt.');
});