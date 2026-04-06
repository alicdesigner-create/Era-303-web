/* ============================================
   ERA 303 Services — main.js
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Sticky navbar shadow ---- */
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    const onScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 10);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- Hamburger menu ---- */
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', open);
    });
    // Close on link click
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---- Active nav link ---- */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      if (!link.classList.contains('nav-cta')) {
        link.classList.add('active');
      }
    }
  });

  /* ---- Hero background: fade-in + parallax ---- */
  const heroBg      = document.querySelector('.hero-bg');
  const heroSection = document.querySelector('.hero');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (heroBg) {
    // Entrance fade-in (always)
    setTimeout(() => heroBg.classList.add('loaded'), 80);

    // Parallax scroll (skip on mobile & reduced-motion)
    if (heroSection && !reducedMotion) {
      const parallaxHero = () => {
        if (window.innerWidth < 768) { heroBg.style.transform = ''; return; }
        const scrolled = window.scrollY;
        if (scrolled > heroSection.offsetHeight) return;
        heroBg.style.transform = `translateY(${(scrolled * 0.28).toFixed(2)}px)`;
      };
      window.addEventListener('scroll', parallaxHero, { passive: true });
      parallaxHero();
    }
  }

  /* ---- Scroll fade-in animation ---- */
  const fadeEls = document.querySelectorAll('.fade-up');
  if (fadeEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    fadeEls.forEach(el => observer.observe(el));
  }

  /* ---- Contact form ---- */
  const form = document.getElementById('quoteForm');
  const thankYou = document.getElementById('thankYou');
  if (form && thankYou) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      form.style.opacity = '0';
      form.style.transition = 'opacity .4s ease';
      setTimeout(() => {
        form.style.display = 'none';
        thankYou.classList.add('show');
      }, 400);
    });
  }

  /* ---- Smooth scroll for anchor links ---- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

});
