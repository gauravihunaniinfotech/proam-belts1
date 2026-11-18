/* =========================================================
   CROWNWORKS – interactions
   header · reveal · counters · hero picker · accordion · shop
   spotlight · cart drawer · process stepper · testimonials · forms
   ========================================================= */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hoverable = matchMedia('(hover:hover)').matches;
  const money = (n) => '$' + (Math.round(n * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: n % 1 ? 2 : 0 });
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
  };

  /* ---------- Toast ---------- */
  const toastEl = $('#toast');
  let toastTimer;
  const toast = (msg) => {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
  };

  /* ---------- Header, progress, back-to-top ---------- */
  const nav = $('#nav'), bar = $('.progress i'), toTop = $('#toTop');
  const onScroll = () => {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    nav.classList.toggle('stuck', y > 30);
    bar.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
    toTop.classList.toggle('show', y > 900);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

  /* ---------- Mobile menu ---------- */
  const menuBtn = $('#menuBtn'), mobileMenu = $('#mobileMenu');
  const setMenu = (open) => {
    mobileMenu.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    $('use', menuBtn).setAttribute('href', open ? '#i-close' : '#i-menu');
  };
  menuBtn.addEventListener('click', () => setMenu(!mobileMenu.classList.contains('open')));
  $$('a', mobileMenu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  addEventListener('resize', () => { if (innerWidth > 900) setMenu(false); });

  /* ---------- Active nav link (scroll spy) ---------- */
  const navLinks = $$('.nav-links a');
  const spy = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) navLinks.forEach((a) => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  navLinks.forEach((a) => { const t = $(a.getAttribute('href')); if (t) spy.observe(t); });

  /* ---------- Scroll reveal (with auto stagger) ---------- */
  $$('[data-stagger]').forEach((g) => $$('.rv', g).forEach((el, i) => el.style.setProperty('--d', (i * 0.08) + 's')));
  const rvIO = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); rvIO.unobserve(e.target); }
  }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  $$('.rv').forEach((el) => (reduce ? el.classList.add('in') : rvIO.observe(el)));

  /* ---------- Counters ---------- */
  const runCount = (el) => {
    const end = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), suf = el.dataset.suffix || '';
    const fmt = (v) => v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf;
    if (reduce) { el.textContent = fmt(end); return; }
    const t0 = performance.now(), dur = 1800;
    const tick = (t) => {
      const p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(end * e);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const cIO = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { runCount(e.target); cIO.unobserve(e.target); }
  }), { threshold: 0.6 });
  $$('[data-count]').forEach((el) => cIO.observe(el));

  /* ---------- Hero belt picker ---------- */
  const stage = $('#heroStage');
  if (stage) {
    const imgs = $$('.stage-img img', stage), sws = $$('.sw', stage);
    const nameEl = $('#heroName'), priceEl = $('#heroPrice');
    let idx = 0, timer;
    const show = (n) => {
      idx = n;
      imgs.forEach((im, k) => im.classList.toggle('on', k === n));
      sws.forEach((b, k) => { b.classList.toggle('on', k === n); b.setAttribute('aria-pressed', String(k === n)); });
      nameEl.textContent = sws[n].dataset.name;
      priceEl.textContent = sws[n].dataset.price;
    };
    const stop = () => clearInterval(timer);
    const play = () => { if (!reduce) { stop(); timer = setInterval(() => show((idx + 1) % sws.length), 5200); } };
    sws.forEach((b, k) => b.addEventListener('click', () => { show(k); play(); }));
    stage.addEventListener('mouseenter', stop);
    stage.addEventListener('mouseleave', play);
    play();
    if (hoverable && !reduce) {
      stage.addEventListener('mousemove', (e) => {
        const r = stage.getBoundingClientRect();
        stage.style.setProperty('--ry', (((e.clientX - r.left) / r.width - 0.5) * 8) + 'deg');
        stage.style.setProperty('--rx', (-((e.clientY - r.top) / r.height - 0.5) * 6) + 'deg');
      });
      stage.addEventListener('mouseleave', () => { stage.style.setProperty('--rx', '0deg'); stage.style.setProperty('--ry', '0deg'); });
    }
  }

  /* ---------- Craft accordion + image swap ---------- */
  const acItems = $$('.ac-item'), craftImgs = $$('.craft-media img');
  acItems.forEach((item, k) => $('.ac-head', item).addEventListener('click', () => {
    acItems.forEach((o, j) => { o.classList.toggle('open', j === k); $('.ac-head', o).setAttribute('aria-expanded', String(j === k)); });
    craftImgs.forEach((im, j) => im.classList.toggle('on', j === k));
  }));

  /* ---------- Cart ---------- */
  const FREE_SHIP = 300;
  let cart = store.get('cw_cart', []);
  const drawer = $('#drawer'), overlay = $('#overlay');
  const listEl = $('#drawerItems');
  const openCart = () => { drawer.classList.add('open'); overlay.classList.add('open'); drawer.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; };
  const closeCart = () => { drawer.classList.remove('open'); overlay.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; };
  const renderCart = () => {
    const count = cart.reduce((s, i) => s + i.qty, 0);
    const sub = cart.reduce((s, i) => s + i.qty * i.price, 0);
    $$('[data-count-badge]').forEach((b) => { b.textContent = count; });
    drawer.classList.toggle('empty', cart.length === 0);
    $('#cartSub').textContent = money(sub);
    const left = FREE_SHIP - sub;
    $('#shipMsg').textContent = left > 0 ? 'You are ' + money(left) + ' away from free shipping' : 'You unlocked free shipping!';
    $('#shipFill').style.width = Math.min(100, (sub / FREE_SHIP) * 100) + '%';
    listEl.innerHTML = cart.map((i) => `
      <li class="d-item" data-id="${i.id}">
        <img src="${i.img}" alt="">
        <div><b>${i.name}</b><small>${i.variant || 'Custom text on request'}</small>
          <div class="d-qty"><button data-act="dec" aria-label="Decrease quantity">−</button><span>${i.qty}</span><button data-act="inc" aria-label="Increase quantity">+</button></div></div>
        <div class="d-right"><b>${money(i.price * i.qty)}</b><button class="d-rm" data-act="rm" aria-label="Remove ${i.name}"><svg class="ic"><use href="#i-trash"/></svg></button></div>
      </li>`).join('');
    store.set('cw_cart', cart);
  };
  const addToCart = (item, qty = 1) => {
    const found = cart.find((c) => c.id === item.id);
    if (found) found.qty += qty; else cart.push({ ...item, qty });
    renderCart();
    $$('.cart-btn .cart-count').forEach((b) => { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); });
    toast(item.name + ' added to cart');
  };
  listEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-act]'); if (!btn) return;
    const id = btn.closest('.d-item').dataset.id, it = cart.find((c) => c.id === id);
    if (!it) return;
    if (btn.dataset.act === 'inc') it.qty++;
    if (btn.dataset.act === 'dec') it.qty = Math.max(1, it.qty - 1);
    if (btn.dataset.act === 'rm') cart = cart.filter((c) => c.id !== id);
    renderCart();
  });
  $('#cartOpen').addEventListener('click', openCart);
  $('#cartClose').addEventListener('click', closeCart);
  overlay.addEventListener('click', closeCart);
  $('#emptyShop').addEventListener('click', closeCart);
  $('#checkout').addEventListener('click', () => toast('Demo store: connect your payment provider to enable checkout'));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeCart(); setMenu(false); } });
  renderCart();

  /* ---------- Shop: filters, carousel, add, wishlist ---------- */
  const track = $('#shopTrack');
  $$('.chips .chip').forEach((c) => c.addEventListener('click', () => {
    $$('.chips .chip').forEach((x) => x.classList.toggle('on', x === c));
    const f = c.dataset.f;
    $$('.p-card', track).forEach((card) => { card.hidden = !(f === 'all' || card.dataset.tags.split(' ').includes(f)); });
    track.scrollTo({ left: 0 });
  }));
  const step = () => Math.min(360, track.clientWidth * 0.8);
  $('#shopPrev').addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  $('#shopNext').addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  $$('.p-card').forEach((card) => {
    const add = $('.add-btn', card);
    add.addEventListener('click', () => {
      addToCart({ id: card.dataset.id, name: card.dataset.name, price: +card.dataset.price, img: card.dataset.img });
      add.classList.add('done'); const old = add.innerHTML; add.innerHTML = '<svg class="ic"><use href="#i-check"/></svg> Added';
      setTimeout(() => { add.classList.remove('done'); add.innerHTML = old; }, 1400);
    });
    $('.heart', card).addEventListener('click', (e) => e.currentTarget.classList.toggle('on'));
  });

  /* ---------- Spotlight ---------- */
  const spot = $('#spotlight');
  if (spot) {
    const img = $('#spotImg'), title = $('#spotTitle'), price = $('#spotPrice'), color = $('#spotColor');
    const sw = $$('.swatch', spot), qv = $('#qVal');
    let current = sw[0], qty = 1;
    sw.forEach((s) => s.addEventListener('click', () => {
      current = s;
      sw.forEach((x) => x.classList.toggle('on', x === s));
      img.classList.add('swap');
      setTimeout(() => { img.src = s.dataset.img; img.alt = s.dataset.name; img.classList.remove('swap'); }, 220);
      title.textContent = s.dataset.name; price.textContent = money(+s.dataset.price); color.textContent = s.dataset.color;
    }));
    $('#qPlus').addEventListener('click', () => { qty = Math.min(99, qty + 1); qv.textContent = qty; });
    $('#qMinus').addEventListener('click', () => { qty = Math.max(1, qty - 1); qv.textContent = qty; });
    $('#spotAdd').addEventListener('click', () => {
      addToCart({ id: current.dataset.id, name: current.dataset.name, price: +current.dataset.price, img: current.dataset.img, variant: current.dataset.color + ' strap' }, qty);
      openCart();
    });
    const hots = $$('.hot', spot);
    hots.forEach((h) => h.addEventListener('click', (e) => {
      e.stopPropagation();
      const was = h.classList.contains('open');
      hots.forEach((x) => x.classList.remove('open'));
      h.classList.toggle('open', !was);
    }));
    document.addEventListener('click', () => hots.forEach((x) => x.classList.remove('open')));
  }

  /* ---------- Process stepper ---------- */
  // const STEPS = [
  //   { t: 'Consult & quote', p: 'Tell us about your team, league or event. We reply within 4 business hours with a quote and a few style directions to react to.', e: 'Day 0', c: ['Free consultation', 'Instant price range', 'Bulk pricing for 10+'] },
  //   { t: 'Design & proof', p: 'Our designers lay out your text, logos and colors, then send a free proof. Revise as many times as you like before anything is made.', e: 'Day 1 to 2', c: ['Free design proof', 'Unlimited revisions', 'Logo cleanup included'] },
  //   { t: 'Choose materials', p: 'Pick your strap leather and plate finish (24K gold, silver or black chrome) and decide how many side plates you want.', e: 'Day 2', c: ['4 strap colors', '3 plating finishes', 'Up to 6 side plates'] },
  //   { t: 'Handcrafted', p: 'Plates are cast, polished and plated, then mounted on a hand-stitched strap by our artisans at the bench.', e: 'Day 3 to 6', c: ['Hand-polished plates', 'Hand-stitched leather', 'Colorfast plating'] },
  //   { t: 'Quality inspection', p: 'Every belt is checked for finish, stitching and text accuracy. If something is off, we remake it before it ships.', e: 'Day 6', c: ['Spelling checked twice', 'Finish inspection', 'Photo before shipping'] },
  //   { t: 'Delivered', p: 'Your belt travels tracked and insured in a padded display box, ready to be presented at the podium.', e: 'Day 7+', c: ['Tracked & insured', 'Padded display box', '30-day guarantee'] }
  // ];
  // const stepsEl = $('#steps');
  // if (stepsEl) {
  //   const btns = $$('.st', stepsEl), card = $('.step-card');
  //   const n = $('#stN'), t = $('#stT'), p = $('#stP'), e = $('#stE'), c = $('#stC');
  //   let cur = 0, auto, userTouched = false;
  //   const go = (i, animate = true) => {
  //     cur = i;
  //     btns.forEach((b, k) => { b.classList.toggle('on', k === i); b.classList.toggle('done', k < i); });
  //     stepsEl.style.setProperty('--p', (i / (btns.length - 1)) * 100 + '%');
  //     const s = STEPS[i];
  //     n.textContent = String(i + 1).padStart(2, '0'); t.textContent = s.t; p.textContent = s.p; e.textContent = s.e;
  //     c.innerHTML = s.c.map((x) => '<li>' + x + '</li>').join('');
  //     if (animate && !reduce) { card.classList.remove('swap'); void card.offsetWidth; card.classList.add('swap'); }
  //   };
  //   btns.forEach((b, i) => b.addEventListener('click', () => { userTouched = true; clearInterval(auto); go(i); }));
  //   go(0, false);
  //   new IntersectionObserver((es) => es.forEach((en) => {
  //     clearInterval(auto);
  //     if (en.isIntersecting && !userTouched && !reduce) auto = setInterval(() => go((cur + 1) % btns.length), 4200);
  //   }), { threshold: 0.5 }).observe(stepsEl);
  // }


const STEPS = [
  {
    t: 'Consult & quote',
    p: 'Tell us about your team, league or event. We reply within 4 business hours with a quote and a few style directions to react to.',
    e: 'Day 0',
    c: ['Free consultation', 'Instant price range', 'Bulk pricing for 10+']
  },
  {
    t: 'Design & proof',
    p: 'Our designers lay out your text, logos and colors, then send a free proof. Revise as many times as you like before anything is made.',
    e: 'Day 1 to 2',
    c: ['Free design proof', 'Unlimited revisions', 'Logo cleanup included']
  },
  {
    t: 'Choose materials',
    p: 'Pick your strap leather and plate finish (24K gold, silver or black chrome) and decide how many side plates you want.',
    e: 'Day 2',
    c: ['4 strap colors', '3 plating finishes', 'Up to 6 side plates']
  },
  {
    t: 'Handcrafted',
    p: 'Plates are cast, polished and plated, then mounted on a hand-stitched strap by our artisans at the bench.',
    e: 'Day 3 to 6',
    c: ['Hand-polished plates', 'Hand-stitched leather', 'Colorfast plating']
  },
  {
    t: 'Quality inspection',
    p: 'Every belt is checked for finish, stitching and text accuracy. If something is off, we remake it before it ships.',
    e: 'Day 6',
    c: ['Spelling checked twice', 'Finish inspection', 'Photo before shipping']
  },
  {
    t: 'Delivered',
    p: 'Your belt travels tracked and insured in a padded display box, ready to be presented at the podium.',
    e: 'Day 7+',
    c: ['Tracked & insured', 'Padded display box', '30-day guarantee']
  }
];


const stepsEl = $('#steps');

if (stepsEl) {
  const btns = $$('.st', stepsEl);
  const card = $('.step-card');

  const n = $('#stN');
  const t = $('#stT');
  const p = $('#stP');
  const e = $('#stE');
  const c = $('#stC');

  const DURATION = 4200;
  const total = btns.length - 1;

  let cur = 0;
  let auto = null;
  let userTouched = false;
  let isVisible = false;

  const setProgress = (value, duration = DURATION) => {
    stepsEl.style.setProperty('--progress-duration', duration + 'ms');
    stepsEl.style.setProperty('--p', value + '%');
  };

  const go = (i, animate = true) => {
    cur = (i + btns.length) % btns.length;

    // btns.forEach((b, k) => {
    //   b.classList.toggle('on', k === cur);
    //   b.classList.toggle('done', k < cur);
    // });

    btns.forEach((b, k) => {
      b.classList.toggle('on', k === cur);
      b.classList.toggle('done', k < cur);
    });

      const s = STEPS[cur];

      n.textContent = String(cur + 1).padStart(2, '0');
      t.textContent = s.t;
      p.textContent = s.p;
      e.textContent = s.e;

      c.innerHTML = s.c.map(x => `<li>${x}</li>`).join('');

      if (animate && !reduce && card) {
        card.classList.remove('swap');
        void card.offsetWidth;
        card.classList.add('swap');
      }
    };

    const stopAuto = () => {
      clearTimeout(auto);
      auto = null;
    };

    // Continuous looping from Step 1 to Step 6
    const animateNext = () => {
    stopAuto();

    if (!isVisible || userTouched || reduce) return;

    // If Step 6 is active, wait before restarting at Step 1
    if (cur === btns.length - 1) {
      auto = setTimeout(() => {
        setProgress(0, 0);
        go(0);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setProgress((1 / total) * 100, DURATION);
          });
        });
        auto = setTimeout(() => {
          animateNext();
        }, DURATION);
      }, DURATION);
      return;
    }

    // Move to the next step
    const next = cur + 1;
    setProgress((next / total) * 100, DURATION);
    auto = setTimeout(() => {
      go(next);
      animateNext();
    }, DURATION);
  };

  // Manual selection
  btns.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      userTouched = true;
      stopAuto();

      go(i);
      setProgress((i / total) * 100, 600);
    });
  });

  // Initial state
  go(0, false);
  setProgress(0, 0);

  // Viewport observer
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      isVisible = entry.isIntersecting;

      if (isVisible && !userTouched && !reduce) {
        if (!auto) {
          animateNext();
        }
      } else {
        stopAuto();
      }
    });
  }, {
    threshold: 0.5
  });

  observer.observe(stepsEl);
}


  /* ---------- Testimonials ---------- */
  const qs = $$('#quotes .q'), dotsEl = $('#qDots');
  if (qs.length) {
    let qi = 0, qt;
    dotsEl.innerHTML = qs.map(() => '<i></i>').join('');
    const dots = $$('i', dotsEl);
    const showQ = (i) => { qi = (i + qs.length) % qs.length; qs.forEach((q, k) => q.classList.toggle('on', k === qi)); dots.forEach((d, k) => d.classList.toggle('on', k === qi)); };
    const playQ = () => { clearInterval(qt); if (!reduce) qt = setInterval(() => showQ(qi + 1), 7000); };
    $('#qPrev').addEventListener('click', () => { showQ(qi - 1); playQ(); });
    $('#qNext').addEventListener('click', () => { showQ(qi + 1); playQ(); });
    dots.forEach((d, k) => d.addEventListener('click', () => { showQ(k); playQ(); }));
    $('#quotes').addEventListener('mouseenter', () => clearInterval(qt));
    $('#quotes').addEventListener('mouseleave', playQ);
    showQ(0); playQ();
  }

  /* ---------- Email forms ---------- */
  const valid = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  $$('form[data-form]').forEach((f) => f.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const input = $('input', f), msg = f.nextElementSibling && f.nextElementSibling.classList.contains('form-msg') ? f.nextElementSibling : f.parentElement.querySelector('.form-msg');
    const ok = valid(input.value.trim());
    if (msg) { msg.classList.toggle('err', !ok); msg.textContent = ok ? 'Thanks! Check your inbox soon.' : 'Please enter a valid email address.'; }
    if (ok) { f.reset(); toast('You are on the list'); }
  }));
})();
