// Innerstone Counseling — interactions
(function () {
  const header = document.getElementById('siteHeader');
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Sticky header shadow
  const onScroll = () => {
    if (window.scrollY > 10) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mobileMenu.querySelectorAll('a, button').forEach((el) =>
      el.addEventListener('click', () => mobileMenu.classList.remove('open'))
    );
  }

  // Active nav link on scroll
  const sections = ['home', 'about', 'services', 'groups', 'faqs', 'contact'];
  const navLinks = document.querySelectorAll('.main-nav .nav-link');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          navLinks.forEach((l) =>
            l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id)
          );
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );
  sections.forEach((id) => {
    const s = document.getElementById(id);
    if (s) observer.observe(s);
  });

  // Reveal on scroll
  const revealEls = document.querySelectorAll('.reveal');
  const rObserver = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => rObserver.observe(el));

  // Testimonial slider
  const quotes = document.querySelectorAll('#quoteSlider .quote');
  const dotsWrap = document.getElementById('quoteDots');
  let qi = 0, qTimer;
  quotes.forEach((_, i) => {
    const d = document.createElement('button');
    d.setAttribute('aria-label', 'Show testimonial ' + (i + 1));
    if (i === 0) d.classList.add('active');
    d.addEventListener('click', () => showQuote(i, true));
    dotsWrap.appendChild(d);
  });
  const dots = dotsWrap.querySelectorAll('button');
  function showQuote(i, manual) {
    qi = (i + quotes.length) % quotes.length;
    quotes.forEach((q, k) => q.classList.toggle('active', k === qi));
    dots.forEach((d, k) => d.classList.toggle('active', k === qi));
    if (manual) restartAuto();
  }
  function restartAuto() {
    clearInterval(qTimer);
    qTimer = setInterval(() => showQuote(qi + 1), 6000);
  }
  restartAuto();

  // FAQ accordion
  document.querySelectorAll('#faqAccordion .acc-item').forEach((item) => {
    const head = item.querySelector('.acc-head');
    head.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('#faqAccordion .acc-item').forEach((o) => o.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  // Booking modal
  const modal = document.getElementById('bookingModal');
  const closeBtn = document.getElementById('modalClose');
  let selectedPlan = 'Free 15-min Consult — $0';
  document.querySelectorAll('[data-open-booking]').forEach((b) =>
    b.addEventListener('click', () => {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    })
  );
  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => e.target === modal && closeModal());
  document.addEventListener('keydown', (e) => e.key === 'Escape' && closeModal());

  document.querySelectorAll('.modal-options .opt').forEach((opt) => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.modal-options .opt').forEach((o) => o.classList.remove('selected'));
      opt.classList.add('selected');
      selectedPlan = opt.dataset.plan;
    });
  });
  // preselect first
  const firstOpt = document.querySelector('.modal-options .opt');
  if (firstOpt) firstOpt.classList.add('selected');

  const bookingForm = document.getElementById('bookingForm');
  const bookingNote = document.getElementById('bookingNote');
  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('bName').value.trim();
    const email = document.getElementById('bEmail').value.trim();
    const date = document.getElementById('bDate').value;
    if (!name || !email || !date) {
      bookingNote.textContent = 'Please complete name, email and preferred date.';
      return;
    }
    bookingNote.textContent = `Thank you, ${name.split(' ')[0]} — your request for “${selectedPlan}” on ${date} was received. Joyce will confirm shortly at ${email}.`;
    bookingForm.reset();
  });

  // Contact form (front-end only for iteration 1)
  const contactForm = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(contactForm);
    const first = (data.get('firstName') || '').toString().trim();
    const email = (data.get('email') || '').toString().trim();
    const msg = (data.get('message') || '').toString().trim();
    if (!first || !email || !msg) {
      formNote.textContent = 'Please fill in your name, email and a short message.';
      formNote.style.color = '#a33';
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      formNote.textContent = 'Please enter a valid email address.';
      formNote.style.color = '#a33';
      return;
    }
    formNote.style.color = '#566052';
    formNote.textContent = `Thank you, ${first} — your message was received. I’ll reply within 1 business day.`;
    contactForm.reset();
  });

  // Smooth anchor offset for sticky header
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - 86;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });
})();
