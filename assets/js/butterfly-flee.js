(function () {
  'use strict';

  var butterflies = document.querySelectorAll('[data-butterfly]');
  if (!butterflies.length) return;

  var mx = -9999;
  var my = -9999;
  var threshold = 320;
  var fleeStrength = 80;

  document.addEventListener('mousemove', function (e) {
    mx = e.clientX;
    my = e.clientY;
  });

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  var targets = [];

  butterflies.forEach(function (wrap) {
    targets.push({
      el: wrap,
      x: 0,
      y: 0,
      speed: parseFloat(wrap.getAttribute('data-speed')) || 1,
    });
  });

  function update() {
    targets.forEach(function (t) {
      var rect = t.el.getBoundingClientRect();
      var bx = rect.left + rect.width / 2;
      var by = rect.top + rect.height / 2;
      var dx = mx - bx;
      var dy = my - by;
      var dist = Math.sqrt(dx * dx + dy * dy);

      var tx, ty;
      if (dist < threshold && dist > 0) {
        var force = (threshold - dist) / threshold;
        force = force * force;
        var angle = Math.atan2(dy, dx) + Math.PI;
        tx = Math.cos(angle) * fleeStrength * force * t.speed;
        ty = Math.sin(angle) * fleeStrength * force * t.speed;
      } else {
        tx = 0;
        ty = 0;
      }

      t.x = lerp(t.x, tx, 0.08);
      t.y = lerp(t.y, ty, 0.08);

      t.el.style.transform = 'translate(' + t.x.toFixed(1) + 'px, ' + t.y.toFixed(1) + 'px)';
    });

    requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
})();
