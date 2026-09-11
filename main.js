/* ============================================
   ERA 303 Services — main.js
   ============================================ */

/* ---- Lead delivery ----
   Formspree endpoint that forwards every submission (contact form +
   both calculators) straight to era303services@gmail.com.
   TODO (Jesse/Alic): create a free form at https://formspree.io using
   era303services@gmail.com, then replace YOUR_FORM_ID below with the
   real endpoint id shown in the Formspree dashboard. Until that's done,
   submissions will fail with a console error instead of emailing out. */
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';

/* Pricing assumptions — $ per sq ft, and the flat "up to" size assumed
   for each residential room type since customers only enter a count,
   not an exact measurement. Two of these (staircase, walk-in closet)
   were NOT given an exact sq ft by the client — defaults below are a
   reasonable placeholder; adjust freely, this is the only place needed. */
const RATE_PER_SQFT = 0.21;
const ROOM_SQFT = {
  living:   300,  // "up to 300 sq ft" — per client
  bedroom:  200,  // "up to 200 sq ft" — per client
  stair:    60,   // "up to 14 stairs" — no sq ft given by client, placeholder estimate
  closet:   40,   // "walk-in closet, no size limit" — no sq ft given by client, placeholder estimate
  hallway:  150,  // "up to 150 sq ft" — per client
  dining:   300,  // "up to 300 sq ft" (hard floor, not carpet) — per client
  openspace:500   // "up to 500 sq ft" — per client
};

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
  // Residential/Commercial now live under the "Services" dropdown — highlight
  // its trigger (not a plain <a>, so the loop above can't reach it) when
  // either of those pages is open.
  if (currentPage === 'residential.html' || currentPage === 'commercial.html') {
    document.querySelectorAll('.nav-dropdown-trigger, .mobile-nav-dropdown-trigger').forEach(btn => {
      btn.classList.add('active');
    });
  }

  /* ---- Services dropdown (desktop hover + click, mobile tap) ---- */
  document.querySelectorAll('.nav-dropdown-trigger, .mobile-nav-dropdown-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const container = trigger.closest('.nav-dropdown, .mobile-nav-dropdown');
      const willOpen = !container.classList.contains('open');
      document.querySelectorAll('.nav-dropdown.open, .mobile-nav-dropdown.open').forEach(open => {
        if (open !== container) {
          open.classList.remove('open');
          open.querySelector('button').setAttribute('aria-expanded', 'false');
        }
      });
      container.classList.toggle('open', willOpen);
      trigger.setAttribute('aria-expanded', String(willOpen));
    });
  });
  document.addEventListener('click', (e) => {
    document.querySelectorAll('.nav-dropdown.open, .mobile-nav-dropdown.open').forEach(open => {
      if (!open.contains(e.target)) {
        open.classList.remove('open');
        open.querySelector('button').setAttribute('aria-expanded', 'false');
      }
    });
  });

  /* ---- Hero video: slow-motion playback ---- */
  const heroVideo = document.querySelector('.hero-video');
  if (heroVideo) {
    // 0.55× = slow-motion feel without looking choppy
    heroVideo.playbackRate = 0.55;
    heroVideo.addEventListener('canplay', () => {
      heroVideo.playbackRate = 0.55; // re-apply after browser normalises it
    });
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

  /* ---- Generic Formspree submit helper ----
     Used by the main contact form and both calculator lead-capture
     forms. Sends JSON via fetch so we can show an inline "thank you"
     without leaving the page. */
  function submitToFormspree(data, { onSuccess, onError }) {
    fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(res => {
        if (res.ok) {
          onSuccess();
        } else {
          onError();
        }
      })
      .catch(() => onError());
  }

  /* ---- Contact page form ---- */
  const form = document.getElementById('quoteForm');
  const thankYou = document.getElementById('thankYou');
  if (form && thankYou) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const data = Object.fromEntries(new FormData(form).entries());
      data.form_source = 'Contact Page';
      const submitBtn = form.querySelector('.form-submit');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending...'; }
      submitToFormspree(data, {
        onSuccess: () => {
          form.style.opacity = '0';
          form.style.transition = 'opacity .4s ease';
          setTimeout(() => {
            form.style.display = 'none';
            thankYou.classList.add('show');
          }, 400);
        },
        onError: () => {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send My Request'; }
          alert('Something went wrong sending your request. Please call us directly at (303) 916-1095.');
        }
      });
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

  /* ================================================
     RESIDENTIAL CALCULATOR
     ================================================ */
  const resCalc = document.getElementById('residentialCalculator');
  if (resCalc) {
    const calcBtn = resCalc.querySelector('#calcBtn');
    const resultBox = resCalc.querySelector('#calcResult');
    const resultAmount = resCalc.querySelector('#calcResultAmount');
    const scheduleBtn = resCalc.querySelector('#scheduleBtn');
    const bigJobBox = resCalc.querySelector('#calcBigJob');
    const leadForm = resCalc.querySelector('#calcLeadForm');

    // Thresholds beyond which a flat $/sq ft estimate stops being reliable —
    // point to Contact for a personalized quote instead of a possibly-wrong price.
    const MAX_ROOMS_FOR_ESTIMATE = 10;
    const MAX_STAIRCASES_FOR_ESTIMATE = 4;

    let lastEstimate = 0;

    function openLeadForm() {
      leadForm.classList.add('show');
      leadForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    calcBtn.addEventListener('click', () => {
      let total = 0;
      let roomsCount = 0;
      let stairCount = 0;
      const breakdown = [];
      resCalc.querySelectorAll('.calc-item input[type="number"]').forEach(input => {
        const qty = parseInt(input.value, 10) || 0;
        const sqft = parseFloat(input.dataset.sqft) || 0;
        if (qty > 0) {
          const lineTotal = qty * sqft * RATE_PER_SQFT;
          total += lineTotal;
          breakdown.push(`${qty}x ${input.dataset.label} ($${lineTotal.toFixed(2)})`);
        }
        if (input.id === 'calc-stair') {
          stairCount += qty;
        } else {
          roomsCount += qty;
        }
      });
      lastEstimate = total;
      resCalc.dataset.breakdown = breakdown.join(', ') || 'No rooms selected';

      const isBigJob = roomsCount > MAX_ROOMS_FOR_ESTIMATE || stairCount > MAX_STAIRCASES_FOR_ESTIMATE;

      if (isBigJob) {
        resultBox.classList.remove('show');
        bigJobBox.classList.add('show');
        bigJobBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        bigJobBox.classList.remove('show');
        resultAmount.textContent = total > 0 ? `$${total.toFixed(2)}` : '$0';
        resultBox.classList.add('show');
        resultBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    scheduleBtn.addEventListener('click', openLeadForm);

    const leadSubmitBtn = resCalc.querySelector('#calcSubmitBtn');
    const leadThankYou = resCalc.querySelector('#calcThankYou');
    leadSubmitBtn.addEventListener('click', () => {
      const name = resCalc.querySelector('#calcName');
      const phone = resCalc.querySelector('#calcPhone');
      const email = resCalc.querySelector('#calcEmail');
      if (!name.value || !phone.value || !email.checkValidity()) {
        [name, phone, email].forEach(f => f.reportValidity && f.reportValidity());
        return;
      }
      const notes = resCalc.querySelector('#calcNotes');
      const data = {
        form_source: 'Residential Calculator — Ready to Schedule',
        name: name.value,
        phone: phone.value,
        email: email.value,
        estimated_total: `$${lastEstimate.toFixed(2)}`,
        rooms_selected: resCalc.dataset.breakdown || 'No rooms selected',
        notes: (notes && notes.value.trim()) || '(none)'
      };
      leadSubmitBtn.disabled = true;
      leadSubmitBtn.textContent = 'Sending...';
      submitToFormspree(data, {
        onSuccess: () => {
          leadForm.querySelectorAll('.form-row, .form-group, button:not(#calcThankYou *)').forEach(el => el.style.display = 'none');
          leadForm.querySelector('h4').style.display = 'none';
          leadThankYou.classList.add('show');
        },
        onError: () => {
          leadSubmitBtn.disabled = false;
          leadSubmitBtn.textContent = 'Send My Request';
          alert('Something went wrong. Please call us directly at (303) 916-1095.');
        }
      });
    });
  }

  /* ================================================
     COMMERCIAL CALCULATOR
     Each floor gets its own independent sq ft range picker,
     since different floors of the same building are often
     different sizes.
     ================================================ */
  const comCalc = document.getElementById('commercialCalculator');
  if (comCalc) {
    const floorsInput = comCalc.querySelector('#calcFloors');
    const floorsContainer = comCalc.querySelector('#floorsContainer');
    const calcBtn = comCalc.querySelector('#calcBtn');
    const resultBox = comCalc.querySelector('#calcResult');
    const resultAmount = comCalc.querySelector('#calcResultAmount');
    const errorBox = comCalc.querySelector('#calcError');
    const scheduleBtn = comCalc.querySelector('#scheduleBtn');
    const bigJobBox = comCalc.querySelector('#calcBigJob');
    const leadForm = comCalc.querySelector('#calcLeadForm');

    const SQFT_RANGES = [
      { low: 1000, high: 2000 },
      { low: 2000, high: 3000 },
      { low: 3000, high: 4000 },
      { low: 4000, high: 5000 },
      { low: 5000, high: 6000 },
      { low: 6000, high: 7000 },
      { low: 7000, high: 8000 },
      { low: 8000, high: 9000 },
      { low: 9000, high: 10000 }
    ];

    let lastEstimateLabel = '';

    function rangePickerHTML(floorNum) {
      const buttons = SQFT_RANGES.map(r =>
        `<button type="button" class="range-btn" data-low="${r.low}" data-high="${r.high}">${r.low.toLocaleString()} &ndash; ${r.high.toLocaleString()} sq ft</button>`
      ).join('');
      return `
        <div class="floor-block" data-floor="${floorNum}">
          <label class="floor-block-label">Floor ${floorNum} &mdash; Approximate Square Footage</label>
          <div class="range-picker">
            ${buttons}
            <button type="button" class="range-btn" data-custom="true">10,000+ sq ft</button>
          </div>
        </div>`;
    }

    function renderFloors(count) {
      // Remember any ranges already picked so re-rendering (e.g. typing
      // "1" then "12") doesn't wipe out selections for floors that still exist.
      const previousSelections = {};
      floorsContainer.querySelectorAll('.floor-block').forEach(block => {
        const active = block.querySelector('.range-btn.active');
        if (active) previousSelections[block.dataset.floor] = active.dataset;
      });

      floorsContainer.innerHTML = '';
      for (let i = 1; i <= count; i++) {
        floorsContainer.insertAdjacentHTML('beforeend', rangePickerHTML(i));
      }

      Object.keys(previousSelections).forEach(floorNum => {
        const block = floorsContainer.querySelector(`.floor-block[data-floor="${floorNum}"]`);
        if (!block) return;
        const prev = previousSelections[floorNum];
        const match = [...block.querySelectorAll('.range-btn')].find(btn =>
          prev.custom ? btn.dataset.custom : (btn.dataset.low === prev.low && btn.dataset.high === prev.high)
        );
        if (match) match.classList.add('active');
      });

      resultBox.classList.remove('show');
      bigJobBox.classList.remove('show');
      errorBox.classList.remove('show');
    }

    function clampFloors() {
      let count = parseInt(floorsInput.value, 10);
      if (!count || count < 1) count = 1;
      if (count > 50) count = 50;
      floorsInput.value = count;
      return count;
    }

    floorsInput.addEventListener('input', () => renderFloors(clampFloors()));
    floorsInput.addEventListener('blur', () => renderFloors(clampFloors()));
    renderFloors(clampFloors());

    // Event delegation: one listener handles range-btn clicks in any floor block.
    floorsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.range-btn');
      if (!btn) return;
      const block = btn.closest('.floor-block');
      block.querySelectorAll('.range-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      errorBox.classList.remove('show');
    });

    function openLeadForm() {
      leadForm.classList.add('show');
      leadForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    calcBtn.addEventListener('click', () => {
      const floorBlocks = [...floorsContainer.querySelectorAll('.floor-block')];
      const selections = floorBlocks.map(block => block.querySelector('.range-btn.active'));

      if (selections.some(sel => !sel)) {
        const missing = floorBlocks
          .map((block, i) => (selections[i] ? null : i + 1))
          .filter(n => n !== null);
        errorBox.textContent = `Please select a square footage range for floor${missing.length > 1 ? 's' : ''} ${missing.join(', ')}.`;
        errorBox.classList.add('show');
        resultBox.classList.remove('show');
        bigJobBox.classList.remove('show');
        return;
      }
      errorBox.classList.remove('show');

      const floorCount = selections.length;
      const singleSelection = selections[0];
      // A flat per-sq-ft number is only trustworthy for one floor within a
      // known bracket. Multi-floor buildings, or anything 10,000+ sq ft,
      // route to a free on-site visit instead of guessing a price.
      const isBigJob = floorCount > 1 || !!singleSelection.dataset.custom;

      const floorDescriptions = selections.map((sel, i) =>
        sel.dataset.custom
          ? `Floor ${i + 1}: 10,000+ sq ft`
          : `Floor ${i + 1}: ${parseFloat(sel.dataset.low).toLocaleString()}–${parseFloat(sel.dataset.high).toLocaleString()} sq ft`
      );

      if (isBigJob) {
        resultBox.classList.remove('show');
        bigJobBox.classList.add('show');
        lastEstimateLabel = `${floorDescriptions.join('; ')} — large job, on-site quote needed`;
        bigJobBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        // Single floor, known bracket — price off the upper limit of that range.
        const high = parseFloat(singleSelection.dataset.high);
        const total = high * RATE_PER_SQFT;
        resultAmount.textContent = `$${total.toFixed(2)}`;
        lastEstimateLabel = `${floorDescriptions[0]} — est. $${total.toFixed(2)}`;
        bigJobBox.classList.remove('show');
        resultBox.classList.add('show');
        resultBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    scheduleBtn.addEventListener('click', openLeadForm);

    const leadSubmitBtn = comCalc.querySelector('#calcSubmitBtn');
    const leadThankYou = comCalc.querySelector('#calcThankYou');
    leadSubmitBtn.addEventListener('click', () => {
      const name = comCalc.querySelector('#calcName');
      const phone = comCalc.querySelector('#calcPhone');
      const email = comCalc.querySelector('#calcEmail');
      if (!name.value || !phone.value || !email.checkValidity()) {
        [name, phone, email].forEach(f => f.reportValidity && f.reportValidity());
        return;
      }
      const notes = comCalc.querySelector('#calcNotes');
      const data = {
        form_source: 'Commercial Calculator — Ready to Schedule',
        name: name.value,
        phone: phone.value,
        email: email.value,
        building_details: lastEstimateLabel || 'Not calculated',
        notes: (notes && notes.value.trim()) || '(none)'
      };
      leadSubmitBtn.disabled = true;
      leadSubmitBtn.textContent = 'Sending...';
      submitToFormspree(data, {
        onSuccess: () => {
          leadForm.querySelectorAll('.form-row, .form-group, button:not(#calcThankYou *)').forEach(el => el.style.display = 'none');
          leadForm.querySelector('h4').style.display = 'none';
          leadThankYou.classList.add('show');
        },
        onError: () => {
          leadSubmitBtn.disabled = false;
          leadSubmitBtn.textContent = 'Send My Request';
          alert('Something went wrong. Please call us directly at (303) 916-1095.');
        }
      });
    });
  }

});
