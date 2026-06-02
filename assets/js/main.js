(function () {
  'use strict';

  var btn = document.getElementById('themeBtn');
  var applyTheme = function (theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (btn) btn.textContent = theme === 'dark' ? '☀' : '🌙';
  };

  var saved = localStorage.getItem('theme');
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  var resolved = saved || (prefersDark ? 'dark' : 'light');
  applyTheme(resolved);

  if (btn) {
    btn.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem('theme', next);
    });
  }

  var clockEl = document.getElementById('liveClock');
  if (clockEl) {
    var greet = function (h) {
      if (h >= 5 && h < 12) return '早安';
      if (h >= 12 && h < 18) return '午安';
      if (h >= 18 && h < 23) return '晚上好';
      return '夜深了';
    };
    var tick = function () {
      var now = new Date();
      var hh = String(now.getHours()).padStart(2, '0');
      var mm = String(now.getMinutes()).padStart(2, '0');
      var ss = String(now.getSeconds()).padStart(2, '0');
      clockEl.textContent = greet(now.getHours()) + ' · ' + hh + ':' + mm + ':' + ss;
    };
    tick();
    setInterval(tick, 1000);
  }

  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  }
})();
