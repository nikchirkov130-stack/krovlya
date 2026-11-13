
(function () {
  'use strict';

  /* ---------- Утилиты ---------- */
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const money = (value) => Math.round(value).toLocaleString('ru-RU') + ' ₽';
  const ru = (value) => Number(value).toLocaleString('ru-RU', { maximumFractionDigits: 1 });
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const escapeHtml = (value) => String(value == null ? '' : value)
    .replace(/[&<>"']/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));

  /* ---------- Данные каталога продукции ---------- */
  const STATUS = {
    in: ['В наличии', 'badge--in'],
    order: ['Под заказ', 'badge--order'],
    out: ['Ожидаем поставку', 'badge--out']
  };

  const PRODUCTS = {
    profnastil: {
      name: 'Профнастил',
      cat: 'Кровля и забор',
      desc: 'Несущий и стеновой профнастил С8, С21 и НС35 для кровли, стен и заборов. Оцинкованная сталь с полимерным покрытием, резка листов в размер.',
      features: ['Толщина металла 0,45–0,7 мм', 'Цвета по каталогу', 'Листы длиной до 12 м'],
      price: 520,
      unit: 'м²',
      status: 'in'
    },
    metallocherepitsa: {
      name: 'Металлочерепица',
      cat: 'Кровля',
      desc: 'Металлочерепица «Монтеррей» и другие профили с полимерным покрытием. Подберём цвет по образцам и комплект доборных элементов.',
      features: ['Профили «Монтеррей» и «СуперМонтеррей»', 'Полиэстер и матовый полиэстер', 'Конёк, ендова и снегозадержатели'],
      price: 590,
      unit: 'м²',
      status: 'in'
    },
    'sayding-metallicheskiy': {
      name: 'Сайдинг металлический',
      cat: 'Фасад',
      desc: 'Металлический сайдинг «Корабельная доска» и «Ёлочка» для фасада и фронтонов. Панели длиной до 6 метров с покрытием по каталогу.',
      features: ['Длина панелей до 6 м', 'Покрытие по каталогу', 'Софиты, углы и планки в комплекте'],
      price: 640,
      unit: 'м²',
      status: 'in'
    },
    'fasadnye-paneli': {
      name: 'Фасадные панели',
      cat: 'Фасад',
      desc: 'Фасадные кассеты и панели для вентилируемых фасадов. Оцинкованная сталь с полимером, изготовление под размер объекта.',
      features: ['Сталь 0,7 мм', 'Скрытый крепёж', 'Изготовление под размер'],
      price: 890,
      unit: 'м²',
      status: 'order'
    },
    'sayding-vinilovyy': {
      name: 'Сайдинг виниловый',
      cat: 'Фасад',
      desc: 'Виниловый сайдинг для дач и загородных домов: не выгорает, не требует покраски и легко моется. Панели длиной 3,66 м.',
      features: ['Панель 3,66 м', 'Цвета: белый, бежевый, серый', 'Монтаж круглый год'],
      price: 420,
      unit: 'шт.',
      status: 'in'
    },
    'vodostochnye-sistemy': {
      name: 'Водосточные системы',
      cat: 'Кровля',
      desc: 'Желоба, трубы, воронки и крепления в цвет кровли. Металлические и ПВХ системы, расчёт по длине скатов и площади крыши.',
      features: ['Металл и ПВХ', 'Цвет в тон кровле', 'Расчёт по длине скатов'],
      price: 390,
      unit: 'м.п.',
      status: 'in'
    },
    evroshtaketnik: {
      name: 'Евроштакетник',
      cat: 'Забор',
      desc: 'Металлический евроштакетник с двусторонней покраской. Столбы, лаги и крепёж соберём в комплект на весь периметр участка.',
      features: ['Высота 1,5–2,0 м', 'Двусторонняя покраска', 'Комплект на периметр'],
      price: 95,
      unit: 'шт.',
      status: 'in'
    },
    komplektuyushchie: {
      name: 'Комплектующие материалы',
      cat: 'Кровля и фасад',
      desc: 'Коньки, ендовы, планки, софиты, снегозадержатели и доборные элементы в цвет основного материала.',
      features: ['Доборные элементы в цвет', 'Резка в размер', 'Подбор под ваш профиль'],
      price: 290,
      unit: 'шт.',
      status: 'in'
    },
    'sistemy-krepleniya': {
      name: 'Системы крепления фасадов',
      cat: 'Фасад',
      desc: 'Кляммеры, саморезы, дюбели и крепёж для сайдинга, фасадных кассет и вентилируемых фасадов. Расчёт по площади.',
      features: ['Оцинкованный крепёж', 'Для металла и дерева', 'Расчёт по площади'],
      price: 12,
      unit: 'шт.',
      status: 'in'
    }
  };

  /* ---------- Палитра RAL (из референса А) ---------- */
  const RAL = {
    roof: [
      ['7024', 'графитовый серый', '#474B4E'],
      ['3005', 'винно-красный', '#5E2129'],
      ['8017', 'шоколадно-коричневый', '#45322E'],
      ['6005', 'зелёный мох', '#2F4538'],
      ['5005', 'сигнальный синий', '#154889'],
      ['8004', 'медно-коричневый', '#8D4932']
    ],
    facade: [
      ['1015', 'светлая слоновая кость', '#E6D2B5'],
      ['9003', 'сигнальный белый', '#ECECE7'],
      ['7035', 'светло-серый', '#CBD0CC'],
      ['7004', 'сигнальный серый', '#9B9B9B'],
      ['7024', 'графитовый серый', '#474B4E'],
      ['8004', 'медно-коричневый', '#8D4932']
    ],
    fence: [
      ['8017', 'шоколадно-коричневый', '#45322E'],
      ['7024', 'графитовый серый', '#474B4E'],
      ['6005', 'зелёный мох', '#2F4538'],
      ['3005', 'винно-красный', '#5E2129'],
      ['7035', 'светло-серый', '#CBD0CC'],
      ['9003', 'сигнальный белый', '#ECECE7']
    ]
  };

  /* ---------- Появление блоков при скролле ---------- */
  const revealElements = $$('.reveal');

  revealElements.forEach((element) => {
    const siblings = Array.from(element.parentElement.children)
      .filter((child) => child.classList.contains('reveal'));
    const index = siblings.indexOf(element);
    element.style.setProperty('--delay', Math.min(index, 5) * 0.07 + 's');
  });

  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealElements.forEach((element) => element.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -36px 0px' });

    revealElements.forEach((element) => observer.observe(element));
  }

  /* ---------- Шапка, мобильное меню и подсветка меню ---------- */
  const header = $('#header');
  const burger = $('.burger');
  const nav = $('#nav');
  const navLinks = $$('.nav a[href^="#"]');
  const sections = $$('main section[id]');

  function closeNav() {
    if (!nav) return;
    nav.classList.remove('is-open');
    if (burger) {
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Открыть меню');
    }
    document.body.classList.remove('nav-open');
  }

  if (burger && nav) {
    burger.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(isOpen));
      burger.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
      document.body.classList.toggle('nav-open', isOpen);
    });

    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeNav();
    });
  }

  // Закрываем мобильное меню по Esc
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeNav();
  });

  let scrollFrame = null;

  function onScroll() {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = null;

      if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);

      // Подсветка активного раздела
      const probe = window.scrollY + 140;
      let currentId = '';

      sections.forEach((section) => {
        if (section.offsetTop <= probe) currentId = section.id;
      });

      navLinks.forEach((link) => {
        const isActive = link.getAttribute('href') === '#' + currentId;
        link.classList.toggle('is-active', isActive);
        if (isActive) {
          link.setAttribute('aria-current', 'true');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Ползунки: заливка трека ---------- */
  function paintRange(range) {
    const min = parseFloat(range.min) || 0;
    const max = parseFloat(range.max) || 100;
    const value = parseFloat(range.value) || 0;
    const percent = max > min ? ((value - min) / (max - min)) * 100 : 0;
    range.style.setProperty('--fill', percent + '%');
  }

  $$('input[type="range"]').forEach((range) => {
    paintRange(range);
    range.addEventListener('input', () => paintRange(range));
  });

  /* ---------- Формулы расчёта ---------- */
  function roofCalc(area, coefficient) {
    const k = parseFloat(coefficient) || 1.1;
    const areaWithReserve = Math.ceil(area * k);
    return {
      areaWithReserve,
      reserve: Math.round((k - 1) * 100),
      screws: Math.ceil(areaWithReserve * 7),
      price: areaWithReserve * 590
    };
  }

  function facadeCalc(perimeter, height, openings) {
    const area = Math.max(0, perimeter * height - openings);
    const areaWithReserve = Math.ceil(area * 1.1);
    return {
      area: Math.round(area),
      areaWithReserve,
      corners: 4 * Math.ceil(height / 3),
      price: areaWithReserve * 640
    };
  }

  function fenceCalc(length, height) {
    const sheets = Math.ceil(length / 1.15);
    const posts = length > 0 ? Math.ceil(length / 2.5) + 1 : 0;
    const rows = height > 1.8 ? 3 : 2;
    const lags = Math.ceil((rows * length) / 6);
    const screws = sheets * rows * 4;
    const price = sheets * 690 + posts * 760 + lags * 590 + screws * 3;
    return { sheets, posts, rows, lags, screws, price };
  }

  /* ---------- Расширенный калькулятор ---------- */
  const calcTotal = $('#calcTotal');
  let calcSummary = '';

  function readCalc() {
    const roofArea = parseFloat($('#roofArea').value) || 0;
    const roofShape = $('#roofShape');
    const facadePerimeter = parseFloat($('#facadePerimeter').value) || 0;
    const facadeHeight = parseFloat($('#facadeHeight').value) || 0;
    const facadeOpenings = parseFloat($('#facadeOpenings').value) || 0;
    const fenceLength = parseFloat($('#fenceLength').value) || 0;
    const fenceHeight = parseFloat($('#fenceHeight').value) || 1.8;

    const roof = roofCalc(roofArea, roofShape.value);
    const facade = facadeCalc(facadePerimeter, facadeHeight, facadeOpenings);
    const fence = fenceCalc(fenceLength, fenceHeight);

    return {
      roof,
      facade,
      fence,
      roofArea,
      roofShapeLabel: roofShape.options[roofShape.selectedIndex].textContent,
      facadePerimeter,
      facadeHeight,
      facadeOpenings,
      fenceLength,
      fenceHeight,
      total: roof.price + facade.price + fence.price
    };
  }

  function renderCalc() {
    if (!calcTotal) return;

    const data = readCalc();

    calcTotal.textContent = 'от ' + money(data.total);
    $('#sumRoof').textContent = 'от ' + money(data.roof.price);
    $('#sumFacade').textContent = 'от ' + money(data.facade.price);
    $('#sumFence').textContent = 'от ' + money(data.fence.price);

    calcSummary = 'Кровля: ' + ru(data.roofArea) + ' м² (' + data.roofShapeLabel.toLowerCase() + '), ' +
      'фасад: периметр ' + ru(data.facadePerimeter) + ' м, высота ' + ru(data.facadeHeight) + ' м, проёмы ' + ru(data.facadeOpenings) + ' м², ' +
      'забор: ' + ru(data.fenceLength) + ' м × ' + ru(data.fenceHeight) + ' м. ' +
      'Ориентировочная стоимость: ' + money(data.total) + '.';
  }

  // Синхронизация range ↔ number
  $$('input[type="range"][data-sync]').forEach((range) => {
    const number = document.getElementById(range.dataset.sync);
    if (!number) return;

    const min = parseFloat(range.min) || 0;
    const max = parseFloat(range.max) || 100;

    range.addEventListener('input', () => {
      number.value = range.value;
      paintRange(range);
      renderCalc();
    });

    number.addEventListener('input', () => {
      const value = clamp(parseFloat(number.value) || 0, min, max);
      range.value = value;
      paintRange(range);
      renderCalc();
    });

    number.addEventListener('blur', () => {
      const value = clamp(parseFloat(number.value) || 0, min, max);
      number.value = value;
      range.value = value;
      paintRange(range);
      renderCalc();
    });
  });

  ['#roofShape', '#fenceHeight'].forEach((selector) => {
    const element = $(selector);
    if (element) element.addEventListener('change', renderCalc);
  });

  if (calcTotal) renderCalc();

    /* ---------- Подбор цвета ---------- */
  const colorState = { roof: 0, facade: 0, fence: 0 };
  const SVG_NS = 'http://www.w3.org/2000/svg';

  const makeSvgElement = (name, attrs) => {
    const element = document.createElementNS(SVG_NS, name);
    Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
    return element;
  };

  // Генерация черепицы
  const tiles = $('#svg-tiles');
  if (tiles) {
    for (let y = 104; y < 214; y += 13) {
      tiles.appendChild(makeSvgElement('path', {
        d: 'M' + (96 + (214 - y) * 0.655) + ' ' + y + ' L' + (624 - (214 - y) * 0.655) + ' ' + y,
        fill: 'none'
      }));
    }
  }

  // Генерация сайдинга
  const siding = $('#svg-siding');
  if (siding) {
    for (let y = 208; y < 342; y += 12) {
      siding.appendChild(makeSvgElement('path', { d: 'M150 ' + y + ' L570 ' + y }));
    }
  }

  // Генерация забора
  const fence = $('#svg-fence');
  const fenceLight = [];
  const fenceDark = [];

  if (fence) {
    fence.appendChild(makeSvgElement('rect', { x: 0, y: 396, width: 720, height: 8, fill: '#000', 'fill-opacity': '.14' }));
    const rail1 = makeSvgElement('rect', { x: 0, y: 340, width: 720, height: 7, class: 'tr' });
    const rail2 = makeSvgElement('rect', { x: 0, y: 378, width: 720, height: 7, class: 'tr' });
    fence.appendChild(rail1);
    fence.appendChild(rail2);
    fenceDark.push(rail1, rail2);

    for (let x = 4; x < 720; x += 19) {
      const picket = makeSvgElement('rect', { x, y: 322, width: 14, height: 76, rx: 2, class: 'tr' });
      fence.appendChild(picket);
      fenceLight.push(picket);
      fence.appendChild(makeSvgElement('rect', { x: x + 2, y: 324, width: 3, height: 72, fill: '#fff', 'fill-opacity': '.16' }));
    }

    for (let x = 59; x < 720; x += 133) {
      const post = makeSvgElement('rect', { x, y: 316, width: 18, height: 90, rx: 2, class: 'tr' });
      fence.appendChild(post);
      fenceDark.push(post);
    }
  }

  const shadeColor = (hex, factor) => {
    const value = parseInt(hex.slice(1), 16);
    const r = value >> 16;
    const g = (value >> 8) & 255;
    const b = value & 255;
    const convert = (channel) => clamp(Math.round(channel * factor), 0, 255);
    return 'rgb(' + convert(r) + ',' + convert(g) + ',' + convert(b) + ')';
  };

  const paintHouse = () => {
    const roofColor = RAL.roof[colorState.roof][2];
    const facadeColor = RAL.facade[colorState.facade][2];
    const fenceColor = RAL.fence[colorState.fence][2];
    
    const roof = $('#svg-roof');
    const canopy = $('#svg-canopy');
    const facade = $('#svg-facade');

    if (roof) roof.setAttribute('fill', roofColor);
    if (canopy) canopy.setAttribute('fill', roofColor);
    if (facade) facade.setAttribute('fill', facadeColor);

    fenceLight.forEach((element) => element.setAttribute('fill', fenceColor));
    fenceDark.forEach((element) => element.setAttribute('fill', shadeColor(fenceColor, 0.72)));

    ['roof', 'facade', 'fence'].forEach((zone) => {
      const color = RAL[zone][colorState[zone]];
      const nameEl = $(`.swatch-group[data-zone="${zone}"] .swatch-group__name`);
      if (nameEl) {
        const firstLetter = color[1].charAt(0).toUpperCase() + color[1].slice(1);
        nameEl.textContent = `RAL ${color[0]}, ${firstLetter}`;
      }
    });
  };

  const buildColorSwatches = () => {
    Object.keys(RAL).forEach((zone) => {
      const container = $(`.swatch-group[data-zone="${zone}"] .swatches`);
      if (!container) return;

      container.innerHTML = RAL[zone].map((color, index) => {
        const isActive = index === colorState[zone];
        const firstLetter = color[1].charAt(0).toUpperCase() + color[1].slice(1);
        return `<button class="swatch ${isActive ? 'is-active' : ''}" 
                        type="button" 
                        style="--c: ${color[2]}" 
                        aria-label="Выбрать цвет: RAL ${color[0]} ${firstLetter}"
                        data-index="${index}">
                </button>`;
      }).join('');

      container.addEventListener('click', (event) => {
        const btn = event.target.closest('.swatch');
        if (!btn) return;

        const index = parseInt(btn.dataset.index, 10);
        colorState[zone] = index;

        $$('.swatch', container).forEach((item, i) => {
          item.classList.toggle('is-active', i === index);
        });

        paintHouse();
      });
    });
  };

  if ($('.color-configurator')) {
    buildColorSwatches();
    paintHouse();
  }

  /* ---------- Модальные окна ---------- */
  const modal = $('#modal');
  const modalBody = $('#modalBody');
  const modalDialog = modal ? $('.modal__dialog', modal) : null;
  let lastFocused = null;

  function focusableElements() {
    if (!modalDialog) return [];
    return $$('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])', modalDialog)
      .filter((element) => element.offsetParent !== null);
  }

  function openModal(html, trigger) {
    if (!modal || !modalBody) return;
    if (!modal.classList.contains('is-open')) {
      lastFocused = trigger || document.activeElement;
    }

    modalBody.innerHTML = html;

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    const form = $('[data-modal-form]', modalBody);
    if (form) setupForm(form);

    setTimeout(() => {
      const first = $('input, select, textarea, button', modalBody);
      if (first) first.focus();
    }, 60);
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');

    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
  }

  function requestTemplate(options) {
    const opts = options || {};
    const need = opts.need || '';
    const comment = opts.comment || '';
    const title = opts.title || 'Рассчитать материалы';
    const subtitle = opts.subtitle || 'Оставьте телефон и коротко опишите, что нужно. Перезвоним и уточним размеры.';

    const baseOptions = ['Кровля', 'Фасад', 'Забор', 'Водосточные системы', 'Комплектующие', 'Крепёж', 'Замер'];
    const needOptions = need && baseOptions.indexOf(need) === -1 ? [need].concat(baseOptions) : baseOptions;
    const optionsHtml = needOptions.map((value) =>
      '<option value="' + escapeHtml(value) + '"' + (value === need ? ' selected' : '') + '>' + escapeHtml(value) + '</option>'
    ).join('');

    return '' +
      '<h2 id="modalTitle">' + escapeHtml(title) + '</h2>' +
      '<p>' + escapeHtml(subtitle) + '</p>' +
      '<form class="form" data-modal-form novalidate>' +
        '<div class="form__row">' +
          '<label class="sr-only" for="mName">Имя</label>' +
          '<input class="input" id="mName" name="name" type="text" placeholder="Имя" autocomplete="name" required>' +
        '</div>' +
        '<div class="form__row">' +
          '<label class="sr-only" for="mPhone">Телефон</label>' +
          '<input class="input" id="mPhone" name="phone" type="tel" placeholder="+7 (___) ___-__-__" autocomplete="tel" inputmode="tel" required>' +
        '</div>' +
        '<div class="form__row">' +
          '<label class="sr-only" for="mNeed">Что нужно</label>' +
          '<select class="input" id="mNeed" name="need">' +
            '<option value="">Что нужно</option>' + optionsHtml +
          '</select>' +
        '</div>' +
        '<div class="form__row">' +
          '<label class="sr-only" for="mComment">Комментарий</label>' +
          '<textarea class="input" id="mComment" name="comment" rows="3" placeholder="Комментарий">' + escapeHtml(comment) + '</textarea>' +
        '</div>' +
        '<label class="checkbox">' +
          '<input type="checkbox" name="agree" required>' +
          '<span>Согласен на обработку персональных данных</span>' +
        '</label>' +
        '<p class="form__error" role="alert" aria-live="polite"></p>' +
        '<button class="btn btn--primary btn--block btn--lg" type="submit">Отправить заявку</button>' +
      '</form>';
  }

  function openRequest(options) {
    const opts = options || {};

    let need = opts.need || '';
    let comment = opts.comment || '';

    if (opts.source === 'calc') comment = calcSummary;
    if (opts.source === 'measure') {
      need = 'Замер';
      comment = calcSummary;
    }

    closeNav();
    openModal(requestTemplate({ need: need, comment: comment }), opts.trigger);
  }

  function productTemplate(key) {
    const product = PRODUCTS[key];
    if (!product) return '';

    const status = STATUS[product.status] || STATUS.in;
    const features = product.features.map((feature) =>
      '<li>' + escapeHtml(feature) + '</li>'
    ).join('');

    return '' +
      '<h2 id="modalTitle">' + escapeHtml(product.name) + '</h2>' +
      '<p>' + escapeHtml(product.desc) + '</p>' +
      '<ul class="check product-detail__features">' + features + '</ul>' +
      '<dl class="product-detail__specs">' +
        '<div><dt>Категория</dt><dd>' + escapeHtml(product.cat) + '</dd></div>' +
        '<div><dt>Цена</dt><dd><div class="price"><span>от</span><strong>' + product.price.toLocaleString('ru-RU') + ' ₽</strong><span>/ ' + escapeHtml(product.unit) + '</span></div></dd></div>' +
        '<div><dt>Наличие</dt><dd><span class="badge ' + status[1] + '">' + status[0] + '</span></dd></div>' +
      '</dl>' +
      '<button class="btn btn--primary btn--block btn--lg" type="button" data-modal-request="' + key + '">Получить расчёт</button>' +
      '<p class="form__legal product-detail__legal">Цена «от»: итог зависит от цвета, толщины металла и покрытия.</p>';
  }

  function openProduct(key, trigger) {
    openModal(productTemplate(key), trigger);
  }

  if (modal) {
    modal.addEventListener('click', (event) => {
      if (event.target.closest('[data-modal-close]')) closeModal();
    });

    document.addEventListener('keydown', (event) => {
      if (!modal.classList.contains('is-open')) return;

      if (event.key === 'Escape') {
        closeModal();
        return;
      }

      if (event.key === 'Tab') {
        const items = focusableElements();
        if (!items.length) return;

        const first = items[0];
        const last = items[items.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
  }

  // Делегирование кликов по кнопкам заявки и товаров
  document.addEventListener('click', (event) => {
    const requestButton = event.target.closest('[data-open-request]');
    if (requestButton) {
      event.preventDefault();
      openRequest({ source: requestButton.dataset.source, trigger: requestButton });
      return;
    }

    const productButton = event.target.closest('[data-open-product]');
    if (productButton) {
      event.preventDefault();
      openProduct(productButton.dataset.openProduct, productButton);
    }
  });

  // Переход из карточки товара к форме заявки
  if (modalBody) {
    modalBody.addEventListener('click', (event) => {
      const button = event.target.closest('[data-modal-request]');
      if (!button) return;

      const key = button.dataset.modalRequest;
      const product = PRODUCTS[key];
      openRequest({ need: product ? product.name : '' });
    });
  }

  /* ---------- Маска телефона ---------- */
  function attachPhoneMask(input) {
    input.addEventListener('input', () => {
      let digits = input.value.replace(/\D/g, '');

      if (digits.startsWith('8')) digits = '7' + digits.slice(1);
      if (!digits.startsWith('7')) digits = '7' + digits;
      digits = digits.slice(0, 11);

      const rest = digits.slice(1);
      let formatted = '+7';

      if (rest.length) formatted += ' (' + rest.slice(0, 3);
      if (rest.length >= 3) formatted += ') ' + rest.slice(3, 6);
      if (rest.length >= 6) formatted += '-' + rest.slice(6, 8);
      if (rest.length >= 8) formatted += '-' + rest.slice(8, 10);

      input.value = formatted;
    });

    input.addEventListener('focus', () => {
      if (!input.value) input.value = '+7 (';
    });

    input.addEventListener('blur', () => {
      if (input.value.replace(/\D/g, '').length <= 1) input.value = '';
    });
  }

  /* ---------- Валидация и отправка форм ---------- */
  function showSuccess(form) {
    form.classList.add('form--success');
    form.innerHTML = '' +
      '<span class="success-check" aria-hidden="true">✓</span>' +
      '<h3>Заявка принята</h3>' +
      '<p>Перезвоним в рабочее время и уточним размеры. Это демо-версия — данные не отправляются.</p>';

    // Если форма была в модалке — переводим фокус на кнопку закрытия
    if (form.closest('#modal')) {
      const closeButton = $('.modal__close', modal);
      if (closeButton) closeButton.focus();
    }
  }

  function setupForm(form) {
    const phone = $('input[type="tel"]', form);
    if (phone) attachPhoneMask(phone);

    form.addEventListener('input', () => {
      const error = $('.form__error', form);
      if (error) error.textContent = '';
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const error = $('.form__error', form);
      const name = $('input[name="name"]', form);
      const phoneField = $('input[type="tel"]', form);
      const agree = $('input[name="agree"]', form);

      const setError = (message, field) => {
        if (error) error.textContent = message;
        if (field) field.focus();
      };

      if (!name || name.value.trim().length < 2) {
        setError('Укажите имя.', name);
        return;
      }

      const digits = phoneField ? phoneField.value.replace(/\D/g, '') : '';
      if (digits.length < 11) {
        setError('Введите телефон полностью, например +7 900 000-00-00.', phoneField);
        return;
      }

      if (!agree || !agree.checked) {
        setError('Нужно согласие на обработку персональных данных.');
        return;
      }

      if (error) error.textContent = '';
      showSuccess(form);
    });
  }

  const leadForm = $('#leadForm');
  if (leadForm) setupForm(leadForm);

})();
