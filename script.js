

// Attendre que le DOM soit complètement chargé
document.addEventListener('DOMContentLoaded', function () {

    // ==============================================
    // MENU BURGER POUR MOBILE
    // ==============================================
    const burgerBtn = document.getElementById('burgerBtn');
    const mobileNav = document.getElementById('mobileNav');

    // Fonction pour ouvrir/fermer le menu mobile
    function toggleMobileMenu() {
        burgerBtn.classList.toggle('active');
        mobileNav.classList.toggle('active');

        // Empêcher le défilement du body lorsque le menu est ouvert
        if (mobileNav.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }

    // Ajouter l'événement au bouton burger
    burgerBtn.addEventListener('click', toggleMobileMenu);

    // Fermer le menu en cliquant sur un lien
    const mobileNavLinks = mobileNav.querySelectorAll('a');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            burgerBtn.classList.remove('active');
            mobileNav.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });

    // Fermer le menu en cliquant en dehors
    document.addEventListener('click', function (event) {
        if (!burgerBtn.contains(event.target) && !mobileNav.contains(event.target) && mobileNav.classList.contains('active')) {
            burgerBtn.classList.remove('active');
            mobileNav.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });

    // ==============================================
    // CAROUSEL HERO
    // ==============================================
    const carouselSlides = document.querySelectorAll('.carousel-slides .slide');
    const carouselIndicators = document.querySelectorAll('.carousel-indicators .indicator');
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    let currentSlide = 0;
    let slideInterval;
    const slideDuration = 5000; // 5 secondes

    // Fonction pour afficher un slide spécifique
    function showSlide(index) {
        // Masquer tous les slides
        carouselSlides.forEach(slide => {
            slide.classList.remove('active');
        });

        // Désactiver tous les indicateurs
        carouselIndicators.forEach(indicator => {
            indicator.classList.remove('active');
        });

        // Afficher le slide sélectionné
        carouselSlides[index].classList.add('active');
        carouselIndicators[index].classList.add('active');
        currentSlide = index;
    }

    // Fonction pour passer au slide suivant
    function nextSlide() {
        let nextIndex = (currentSlide + 1) % carouselSlides.length;
        showSlide(nextIndex);
    }

    // Fonction pour passer au slide précédent
    function prevSlide() {
        let prevIndex = (currentSlide - 1 + carouselSlides.length) % carouselSlides.length;
        showSlide(prevIndex);
    }

    // Événements pour les boutons de navigation
    nextBtn.addEventListener('click', () => {
        nextSlide();
        resetAutoSlide();
    });

    prevBtn.addEventListener('click', () => {
        prevSlide();
        resetAutoSlide();
    });

    // Événements pour les indicateurs
    carouselIndicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            showSlide(index);
            resetAutoSlide();
        });
    });

    // Fonction pour redémarrer l'auto-défilement
    function resetAutoSlide() {
        clearInterval(slideInterval);
        startAutoSlide();
    }

    // Fonction pour démarrer l'auto-défilement
    function startAutoSlide() {
        slideInterval = setInterval(nextSlide, slideDuration);
    }

    // Démarrer l'auto-défilement
    startAutoSlide();

    // Arrêter l'auto-défilement quand l'utilisateur survole le carousel
    const carousel = document.querySelector('.carousel');
    carousel.addEventListener('mouseenter', () => {
        clearInterval(slideInterval);
    });

    carousel.addEventListener('mouseleave', () => {
        startAutoSlide();
    });

    // ==============================================
    // NAVIGATION SMOOTH SCROLL
    // ==============================================
    // Gérer le défilement fluide pour tous les liens d'ancrage
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // Ne pas appliquer aux liens avec des classes spécifiques si nécessaire
            if (this.getAttribute('href') === '#') return;

            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Calculer la position en prenant en compte le header fixe
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Mettre à jour l'état actif dans la navigation
                updateActiveNavLink(targetId);
            }
        });
    });

    // Fonction pour mettre à jour le lien actif dans la navigation
    function updateActiveNavLink(targetId) {
        // Mettre à jour la navigation desktop
        const navDesktopLinks = document.querySelectorAll('.nav-desktop a');
        navDesktopLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === targetId) {
                link.classList.add('active');
            }
        });

        // Mettre à jour la navigation mobile
        const navMobileLinks = document.querySelectorAll('.nav-mobile a');
        navMobileLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === targetId) {
                link.classList.add('active');
            }
        });
    }

    // Mettre à jour l'état actif lors du défilement
    window.addEventListener('scroll', function () {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.scrollY + 100; // Offset pour le header

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                updateActiveNavLink('#' + sectionId);
            }
        });
    });

    // ==============================================
    // FORMULAIRE DE CONTACT
    // ==============================================
    const contactForm = document.getElementById('contactForm');
    const formConfirmation = document.getElementById('formConfirmation');

    // CONFIGURATION SUPABASE & EMAILJS
    // ⚠️ REMPLACEZ CES VALEURS PAR VOS PROPRES CLÉS ⚠️
    const SUPABASE_URL = 'https://rosaunkspusxefmqpcfg.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvc2F1bmtzcHVzeGVmbXFwY2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMzA0ODcsImV4cCI6MjA4NTkwNjQ4N30.voclCHjsEgvFSlRHyla21se3Qr3ouwfzmol2B0olRh8';

    const EMAILJS_PUBLIC_KEY = 'l2o1aPLHxsWxRzR-i';
    const EMAILJS_SERVICE_ID = 'service_0mg1yy1';
    const EMAILJS_TEMPLATE_ID = 'template_284gcpk';

    // Initialisation
    const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

    // Vérification de la configuration EmailJS
    if (EMAILJS_PUBLIC_KEY === 'l2o1aPLHxsWxRzR-i' ||
        EMAILJS_SERVICE_ID === 'service_0mg1yy1' ||
        EMAILJS_TEMPLATE_ID === 'template_284gcpk') {
        console.error("CONFIGURATION MANQUANTE : Veuillez configurer vos clés EmailJS dans script.js");
        // Optionnel : Alert pour le développeur (commenté pour la prod)
        // alert("Attention : Les clés EmailJS ne sont pas configurées. Le formulaire ne fonctionnera pas.");
    }

    if (window.emailjs) emailjs.init(EMAILJS_PUBLIC_KEY);

    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = 'Envoi en cours...';
            submitBtn.disabled = true;

            // Récupérer les valeurs
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value,
                created_at: new Date().toISOString()
            };

            let errors = [];

            try {
                // 1. Envoi vers Supabase
                if (supabase) {
                    const { error: dbError } = await supabase
                        .from('messages') // Assurez-vous que la table 'messages' existe
                        .insert([formData]);

                    if (dbError) throw new Error("Erreur Supabase: " + dbError.message);
                } else {
                    console.warn("Supabase non initialisé (bibliothèque manquante ou clés vides)");
                }

                // 2. Envoi par EmailJS
                if (window.emailjs) {
                    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
                        name: formData.name, // Modifié pour correspondre à {{name}}
                        email: formData.email, // Modifié pour correspondre à {{email}}
                        phone: formData.phone,
                        subject: formData.subject,
                        message: formData.message
                    });
                } else {
                    console.warn("EmailJS non initialisé");
                }

                // Succès
                contactForm.style.display = 'none';
                formConfirmation.style.display = 'block';
                contactForm.reset();

                // Scroll vers le message
                const contactSection = document.getElementById('contact');
                const headerHeight = document.querySelector('.header').offsetHeight;
                const contactPosition = contactSection.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({ top: contactPosition, behavior: 'smooth' });

                // Réinitialiser après délai
                setTimeout(() => {
                    contactForm.style.display = 'flex';
                    formConfirmation.style.display = 'none';
                }, 10000);

            } catch (error) {
                console.error("Erreur d'envoi:", error);
                alert("Une erreur est survenue lors de l'envoi du message. Veuillez réessayer.");
            } finally {
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }

    // ==============================================
    // ANIMATION AU DÉFILEMENT
    // ==============================================
    // Fonction pour détecter quand un élément est visible à l'écran
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
            rect.bottom >= 0
        );
    }

    // Fonction pour ajouter une animation aux éléments
    function animateOnScroll() {
        const elementsToAnimate = document.querySelectorAll('.property-card, .about-content, .contact-form-container, .contact-info');

        elementsToAnimate.forEach(element => {
            if (isElementInViewport(element) && !element.classList.contains('animated')) {
                element.classList.add('animated');
                element.style.opacity = '0';
                element.style.transform = 'translateY(20px)';

                // Animation d'apparition
                setTimeout(() => {
                    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }, 100);
            }
        });
    }

    // Écouter l'événement de défilement
    window.addEventListener('scroll', animateOnScroll);

    // Déclencher une première fois pour les éléments déjà visibles
    setTimeout(animateOnScroll, 500);

    // ==============================================
    // HEADER SCROLL EFFECT
    // ==============================================
    let lastScrollTop = 0;
    const header = document.querySelector('.header');

    window.addEventListener('scroll', function () {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Ajouter une ombre quand on défile
        if (scrollTop > 50) {
            header.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.08)';
        } else {
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
        }

        // Cacher/montrer le header au défilement (optionnel)
        if (scrollTop > lastScrollTop && scrollTop > 200) {
            // Défilement vers le bas
            header.style.transform = 'translateY(-100%)';
        } else {
            // Défilement vers le haut
            header.style.transform = 'translateY(0)';
        }

        lastScrollTop = scrollTop;
    });

    // ==============================================
    // GESTION DES IMAGES POUR LE RESPONSIVE
    // ==============================================
    // Fonction pour optimiser le chargement des images
    function optimizeImages() {
        const images = document.querySelectorAll('img');

        images.forEach(img => {
            // Ajouter un attribut loading="lazy" pour les images hors écran
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }

            // S'assurer que les images responsives ont les bons attributs
            if (img.parentElement.classList.contains('card-image') ||
                img.parentElement.classList.contains('about-image')) {
                img.setAttribute('alt', img.getAttribute('alt') || 'SCI Deutsch - Gestion immobilière');
            }
        });
    }

    optimizeImages();

    // ==============================================
    // INITIALISATION GÉNÉRALE
    // ==============================================
    console.log('Site SCI Deutsch chargé avec succès');
});
