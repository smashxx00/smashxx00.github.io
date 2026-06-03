(function () {
  'use strict';

  /* ---------- DOM helpers ---------- */
  var h = function (tag, attrs, kids) {
    var el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        if (key === 'className') el.className = attrs[key];
        else if (key === 'style' && typeof attrs[key] === 'object') {
          Object.keys(attrs[key]).forEach(function (k) { el.style[k] = attrs[key][k]; });
        } else if (key === 'innerHTML') el.innerHTML = attrs[key];
        else if (key.indexOf('on') === 0) el.addEventListener(key.slice(2), attrs[key]);
        else el.setAttribute(key, attrs[key]);
      });
    }
    if (kids) {
      (Array.isArray(kids) ? kids : [kids]).forEach(function (kid) {
        if (typeof kid === 'string') el.appendChild(document.createTextNode(kid));
        else if (kid) el.appendChild(kid);
      });
    }
    return el;
  };

  /* ---------- Renderers ---------- */

  function renderHero(config, heroCfg) {
    var frag = document.createDocumentFragment();

    var avatar = h('div', { className: 'avatar reveal' }, [heroCfg.avatar]);
    frag.appendChild(avatar);

    var clock = h('p', {
      id: 'liveClock',
      className: 'reveal',
      style: { fontFamily: "'JetBrains Mono','SF Mono',Consolas,monospace", fontSize: '0.88rem', color: 'var(--muted)', marginBottom: '0.6rem' }
    }, [getGreeting() + ' · ' + getTimeString()]);
    frag.appendChild(clock);

    var name = h('h1', {
      className: 'reveal',
      style: { fontFamily: "'Noto Serif SC','Source Han Serif SC','Songti SC',Georgia,serif", fontSize: '2.4rem', fontWeight: '700', letterSpacing: '0.04em', marginBottom: '0.5rem' }
    }, [config.site.name]);
    frag.appendChild(name);

    if (heroCfg.badge) {
      frag.appendChild(h('span', { className: 'badge reveal' }, [heroCfg.badge]));
    }

    if (heroCfg.signature) {
      frag.appendChild(h('p', {
        className: 'reveal',
        style: { fontFamily: "'Noto Serif SC','Source Han Serif SC','Songti SC',Georgia,serif", fontSize: '1rem', color: 'var(--muted)', margin: '0.6rem 0' }
      }, [heroCfg.signature]));
    }

    if (config.site.description) {
      frag.appendChild(h('p', {
        className: 'reveal',
        style: { fontSize: '0.95rem', color: 'var(--muted)', maxWidth: '420px', margin: '0.6rem auto 1.8rem', lineHeight: '1.8' }
      }, [config.site.description]));
    }

    if (heroCfg.links && heroCfg.links.length) {
      var linksDiv = h('div', { className: 'hero-links reveal' });
      heroCfg.links.forEach(function (link) {
        var attrs = {
          className: 'card',
          href: link.url,
          style: { display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.3rem', fontWeight: '600' }
        };
        if (link.url.indexOf('http') === 0) {
          attrs.target = '_blank';
          attrs.rel = 'noopener';
        }
        linksDiv.appendChild(h('a', attrs, [h('i', { className: link.icon, style: { marginRight: '0.35rem' } }), link.text]));
      });
      frag.appendChild(linksDiv);
    }

    return h('section', { className: 'section hero', style: { textAlign: 'center' } }, [frag]);
  }

  function renderCards(section) {
    var items = section.items.map(function (item) {
      var cardAttrs = { className: 'card' };
      var kids = [];
      if (item.icon) kids.push(h('span', { className: 'card-icon' }, [h('i', { className: item.icon })]));
      kids.push(h('h3', {}, [item.title]));
      if (item.text) kids.push(h('p', {}, [item.text]));
      if (item.url) {
        cardAttrs.href = item.url;
        if (item.url.indexOf('http') === 0) { cardAttrs.target = '_blank'; cardAttrs.rel = 'noopener'; }
        return h('a', cardAttrs, kids);
      }
      return h('div', cardAttrs, kids);
    });

    var grid = h('div', {
      className: 'card-grid reveal',
      style: { gridTemplateColumns: 'repeat(' + (section.columns || 2) + ', 1fr)' }
    }, items);

    return wrapSection(section.title, grid);
  }

  function renderBooks(section) {
    var items = section.items.map(function (book) {
      return h('div', { className: 'card book-card' }, [
        h('p', { className: 'book-title' }, [book.title]),
        book.author ? h('p', { className: 'book-meta' }, [book.author]) : null,
        book.note ? h('p', { className: 'book-note' }, [book.note]) : null
      ]);
    });

    var grid = h('div', {
      className: 'card-grid book-grid reveal',
      style: { gridTemplateColumns: 'repeat(' + (section.columns || 3) + ', 1fr)' }
    }, items);

    var frag = document.createDocumentFragment();
    frag.appendChild(grid);

    if (section.tags && section.tags.length) {
      var row = h('div', { className: 'tag-row reveal' });
      section.tags.forEach(function (tag) { row.appendChild(h('span', { className: 'tag' }, [tag])); });
      if (section.tagHint) row.appendChild(h('span', { style: { fontSize: '0.8rem', color: 'var(--muted)' } }, [section.tagHint]));
      frag.appendChild(row);
    }

    return wrapSection(section.title, frag);
  }

  function renderTimeline(section) {
    var items = section.items.map(function (entry) {
      return h('li', { className: 'timeline-entry' }, [
        entry.year ? h('time', { className: 'timeline-year', dateTime: String(entry.year) }, [entry.year]) : null,
        h('h3', { className: 'timeline-title' }, [entry.title]),
        entry.text ? h('p', { className: 'timeline-desc' }, [entry.text]) : null
      ]);
    });

    var list = h('ul', { className: 'timeline-list' }, items);
    if (section.hint) list.appendChild(h('p', { style: { fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.8rem' } }, [section.hint]));

    return wrapSection(section.title, h('div', { className: 'reveal' }, [list]));
  }

  function renderEntries(section) {
    var items = section.items.map(function (entry) {
      var attrs = { className: 'card', href: entry.url };
      if (entry.url && entry.url.indexOf('http') === 0) { attrs.target = '_blank'; attrs.rel = 'noopener'; }
      return h('a', attrs, [
        h('span', { className: 'card-icon' }, [h('i', { className: entry.icon })]),
        h('h3', {}, [entry.title]),
        entry.text ? h('p', {}, [entry.text]) : null
      ]);
    });

    var grid = h('div', {
      className: 'card-grid reveal',
      style: { gridTemplateColumns: 'repeat(' + (section.columns || 2) + ', 1fr)' }
    }, items);

    return wrapSection(section.title, grid);
  }

  function renderQuote(section) {
    var kids = [];
    kids.push(h('p', { className: 'quote-text' }, [section.text]));
    if (section.author) kids.push(h('p', { className: 'quote-author' }, [section.author]));
    var block = h('div', { className: 'quote-block reveal' }, kids);
    return section.title ? wrapSection(section.title, block) : block;
  }

  function renderDivider() {
    return h('section', { className: 'section' }, [h('hr', { className: 'section-divider' })]);
  }

  function renderText(section) {
    var block = h('div', { className: 'text-block reveal' }, [section.content]);
    return section.title ? wrapSection(section.title, block) : block;
  }

  /* ---------- Utilities ---------- */

  var sectionIndex = 0;

  function wrapSection(title, body, alt) {
    var cls = 'section';
    if (alt) cls += ' section-alt';
    var sec = h('section', { className: cls });
    if (title) sec.appendChild(h('h2', { className: 'section-title reveal' }, [title]));
    sec.appendChild(body);
    return sec;
  }

  function getTimeString() {
    var d = new Date();
    return [d.getHours(), d.getMinutes(), d.getSeconds()]
      .map(function (n) { return String(n).padStart(2, '0'); })
      .join(':');
  }

  function getGreeting() {
    var h = new Date().getHours();
    if (h >= 5 && h < 12) return '早安';
    if (h >= 12 && h < 18) return '午安';
    if (h >= 18 && h < 23) return '晚上好';
    return '夜深了';
  }

  /* ---------- Init ---------- */

  function renderAll(config) {
    var root = document.getElementById('app');
    root.innerHTML = '';

    // hero
    if (config.hero) root.appendChild(renderHero(config, config.hero));

    // sections (alternate background for visual rhythm)
    var secCount = 0;
    (config.sections || []).forEach(function (sec) {
      var el = null;
      switch (sec.type) {
        case 'cards':    el = renderCards(sec); break;
        case 'books':    el = renderBooks(sec); break;
        case 'timeline': el = renderTimeline(sec); break;
        case 'entries':  el = renderEntries(sec); break;
        case 'quote':    el = renderQuote(sec); break;
        case 'divider':  el = renderDivider(); break;
        case 'text':     el = renderText(sec); break;
        default: break;
      }
      // Alternate section backgrounds for visual breathing room
      if (el && sec.type !== 'hero' && sec.type !== 'divider') {
        secCount++;
        if (secCount % 2 === 0) el.classList.add('section-alt');
      }
      if (el) root.appendChild(el);
    });

    // footer
    var footer = document.getElementById('pageFooter');
    if (footer) footer.textContent = config.site.footer || '';

    // show page
    document.documentElement.style.visibility = 'visible';

    // init observers
    initScrollReveal();
  }

  /* ---------- Interactive features ---------- */

  function initTheme() {
    var btn = document.getElementById('themeBtn');
    var apply = function (t) {
      document.documentElement.setAttribute('data-theme', t);
      if (btn) btn.textContent = t === 'dark' ? '\u2600' : '\uD83C\uDF19';
    };
    var saved = localStorage.getItem('theme');
    var prefers = window.matchMedia('(prefers-color-scheme: dark)').matches;
    apply(saved || (prefers ? 'dark' : 'light'));
    if (btn) {
      btn.addEventListener('click', function () {
        var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        apply(next);
        localStorage.setItem('theme', next);
      });
    }
  }

  function initClock() {
    var el = document.getElementById('liveClock');
    if (!el) return;
    setInterval(function () {
      el.textContent = getGreeting() + ' · ' + getTimeString();
    }, 1000);
  }

  function initScrollReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    els.forEach(function (el) { obs.observe(el); });
  }

  /* ---------- Bootstrap ---------- */

  fetch('config.json')
    .then(function (r) { return r.json(); })
    .then(function (config) {
      renderAll(config);
      initTheme();
      initClock();
    })
    .catch(function () {
      document.documentElement.style.visibility = 'visible';
    });
})();
