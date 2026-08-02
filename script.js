document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------------
     1. Terminal-style role typing effect
     --------------------------------------------------------- */
  const roles = ['Full Stack PHP Developer', 'Laravel Developer', 'Team Lead'];
  const roleEl = document.getElementById('terminalRoleText');

  if (roleEl && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let roleIndex = 0, charIndex = 0, deleting = false;

    const type = () => {
      const current = roles[roleIndex];
      if (!deleting) {
        charIndex++;
        roleEl.textContent = current.slice(0, charIndex);
        if (charIndex === current.length) {
          deleting = true;
          setTimeout(type, 1600);
          return;
        }
      } else {
        charIndex--;
        roleEl.textContent = current.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
        }
      }
      setTimeout(type, deleting ? 35 : 65);
    };
    type();
  } else if (roleEl) {
    roleEl.textContent = roles[0];
  }

  /* ---------------------------------------------------------
     2. Scroll-reveal for sections & skill cards, each paired
        with its own typed terminal-command eyebrow.
     --------------------------------------------------------- */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const typeCommand = (eyebrowEl) => {
    const cmdEl = eyebrowEl.querySelector('.typed-cmd');
    const command = eyebrowEl.dataset.command || '';
    if (!cmdEl || !command || eyebrowEl.dataset.typed === 'true') return;
    eyebrowEl.dataset.typed = 'true';

    if (reduceMotion) { cmdEl.textContent = command; return; }

    let i = 0;
    const step = () => {
      i++;
      cmdEl.textContent = command.slice(0, i);
      if (i < command.length) setTimeout(step, 28 + Math.random() * 35);
    };
    step();
  };

  const sections = document.querySelectorAll('.content-section');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        const eyebrow = entry.target.querySelector('.eyebrow[data-command]');
        if (eyebrow) setTimeout(() => typeCommand(eyebrow), 180);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  sections.forEach(section => revealObserver.observe(section));

  /* the first section (About) is visible on page load, so its
     observer callback may fire before layout settles — type it
     explicitly once the page is ready. */
  const firstEyebrow = document.querySelector('.content-section .eyebrow[data-command]');
  if (firstEyebrow && firstEyebrow.getBoundingClientRect().top < window.innerHeight) {
    setTimeout(() => typeCommand(firstEyebrow), 500);
  }

  /* stagger skill item entrance animation */
  document.querySelectorAll('.skill-item').forEach((item, i) => {
    item.style.animationDelay = `${Math.min(i * 45, 500)}ms`;
  });

  /* ---------------------------------------------------------
     3. Active nav link on scroll (with directory-tree style)
     --------------------------------------------------------- */
  const navLinks = document.querySelectorAll('.nav-menu a');
  const navMap = new Map();
  navLinks.forEach(link => {
    const id = link.getAttribute('href').replace('#', '');
    const target = document.getElementById(id);
    if (target) navMap.set(target, link);
  });

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const link = navMap.get(entry.target);
      if (!link) return;
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { threshold: 0.3, rootMargin: '-10% 0px -60% 0px' });

  navMap.forEach((_, target) => navObserver.observe(target));

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href').replace('#', '');
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ---------------------------------------------------------
     4. Skills category filter
     --------------------------------------------------------- */
  const categoryBtns = document.querySelectorAll('.category-btn');
  const skillItems = document.querySelectorAll('.skill-item');

  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const category = btn.dataset.category;

      skillItems.forEach((item, i) => {
        const match = category === 'all' || item.dataset.category === category;
        if (match) {
          item.classList.remove('hide');
          item.style.animation = 'none';
          void item.offsetWidth; /* restart animation */
          item.style.animationDelay = `${Math.min(i * 30, 300)}ms`;
          item.style.animation = '';
        } else {
          item.classList.add('hide');
        }
      });
    });
  });

  /* ---------------------------------------------------------
     5. Project image gallery popup
     --------------------------------------------------------- */
  const popup = document.getElementById('imagePopup');
  const popupImage = document.getElementById('popupImage');
  const closeBtn = document.getElementById('closeBtn');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const counter = document.getElementById('imageCounter');

  let currentGallery = [];
  let currentIndex = 0;

  const openPopup = (galleryEl, index) => {
    currentGallery = Array.from(galleryEl.querySelectorAll('img')).map(img => img.src);
    currentIndex = index;
    updatePopup();
    popup.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const updatePopup = () => {
    popupImage.src = currentGallery[currentIndex];
    counter.textContent = `${currentIndex + 1} / ${currentGallery.length}`;
  };

  const closePopup = () => {
    popup.classList.remove('open');
    document.body.style.overflow = '';
  };

  document.querySelectorAll('.gallery-grid').forEach(grid => {
    grid.querySelectorAll('.gallery-item').forEach((item, index) => {
      item.addEventListener('click', () => openPopup(grid, index));
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closePopup);
  if (prevBtn) prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
    updatePopup();
  });
  if (nextBtn) nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % currentGallery.length;
    updatePopup();
  });

  popup.addEventListener('click', (e) => {
    if (e.target === popup) closePopup();
  });

  document.addEventListener('keydown', (e) => {
    if (!popup.classList.contains('open')) return;
    if (e.key === 'Escape') closePopup();
    if (e.key === 'ArrowLeft') prevBtn.click();
    if (e.key === 'ArrowRight') nextBtn.click();
  });

  /* ---------------------------------------------------------
     6. Auto-played hover animations
        a) Skill grid — a continuous "scanning" glow that
           quietly cycles through the cards on its own, like a
           system status sweep.
        b) Everything else hoverable (tags, gallery thumbs,
           experience/education cards, project cards, stats,
           social icons) — plays its own hover state once, in a
           staggered wave, the first time it scrolls into view,
           so the interaction is visible even without a mouse.
     --------------------------------------------------------- */
  if (!reduceMotion) {

    /* a) continuous skill-grid scan */
    const scanItems = Array.from(document.querySelectorAll('.skill-item'));
    if (scanItems.length) {
      let scanIndex = 0;
      let lastGlowed = null;
      setInterval(() => {
        const visible = scanItems.filter(el => !el.classList.contains('hide'));
        if (!visible.length) return;
        if (lastGlowed) lastGlowed.classList.remove('auto-glow');
        scanIndex = scanIndex % visible.length;
        const el = visible[scanIndex];
        el.classList.add('auto-glow');
        lastGlowed = el;
        scanIndex++;
      }, 1400);
    }

    /* b) one-shot staggered sweep for a group of elements */
    const sweepGroup = (elements, stagger = 90, hold = 550) => {
      elements.forEach((el, i) => {
        setTimeout(() => {
          el.classList.add('auto-glow');
          setTimeout(() => el.classList.remove('auto-glow'), hold);
        }, i * stagger);
      });
    };

    const sweepObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const container = entry.target;
        if (container.dataset.swept === 'true') return;
        container.dataset.swept = 'true';

        let group = [];
        if (container.matches('.experience-card, .experience-item')) {
          group = [container];
        } else if (container.matches('.project-card')) {
          group = [container, ...container.querySelectorAll('.gallery-item')];
        } else if (container.matches('.tech-tags')) {
          group = Array.from(container.querySelectorAll('.tech-tag'));
        } else if (container.matches('.stat-strip')) {
          group = Array.from(container.querySelectorAll('.stat-item'));
        } else if (container.matches('.social-links')) {
          group = Array.from(container.querySelectorAll('a'));
        }

        if (group.length) sweepGroup(group);
        sweepObserver.unobserve(container);
      });
    }, { threshold: 0.4 });

    document.querySelectorAll(
      '.experience-card, .experience-item, .project-card, .tech-tags, .stat-strip, .social-links'
    ).forEach(el => sweepObserver.observe(el));
  }

});
