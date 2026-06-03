/**
 * 蝴蝶竹影漫游动画
 * 蝴蝶在竹影间自然漫游，靠近鼠标时优雅躲避，飞行朝向随移动方向变化
 */
;(function () {
  'use strict'

  var butterflies = document.querySelectorAll('[data-butterfly]')
  if (!butterflies.length) return

  var mx = -1000
  var my = -1000
  var viewW = window.innerWidth
  var viewH = window.innerHeight

  document.addEventListener('mousemove', function (e) {
    mx = e.clientX
    my = e.clientY
  })

  document.addEventListener('mouseleave', function () {
    mx = -1000
    my = -1000
  })

  document.addEventListener('touchmove', function (e) {
    if (e.touches.length) {
      mx = e.touches[0].clientX
      my = e.touches[0].clientY
    }
  }, { passive: true })

  window.addEventListener('resize', function () {
    viewW = window.innerWidth
    viewH = window.innerHeight
  })

  function lerp(a, b, t) {
    return a + (b - a) * t
  }

  // 每只蝴蝶的状态
  var targets = []

  butterflies.forEach(function (wrap) {
    var rect = wrap.getBoundingClientRect()
    targets.push({
      el: wrap,
      x: 0,
      y: 0,
      // 漫游中心（蝴蝶在页面中的自然位置）
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2,
      // 速度系数
      speed: parseFloat(wrap.getAttribute('data-speed')) || 1,
      // 漫游相位
      time: Math.random() * 100,
      // 躲避偏移
      evadeX: 0,
      evadeY: 0,
      // 上一帧位置，用于计算朝向
      lastX: rect.left + rect.width / 2,
      lastY: rect.top + rect.height / 2,
      // 当前朝向角度
      angle: 0,
      // 蝴蝶内部可旋转的元素（找到 .bfly 类的子元素）
      inner: null
    })
  })

  var tpl = document.getElementById('butterflyTpl')
  var tplContent = tpl ? tpl.innerHTML : ''

  function update() {
    targets.forEach(function (t) {
      t.time += 0.012 * t.speed

      // 1. 基础漫游路径 — 多重正弦波
      var wanderX = Math.sin(t.time * 0.3) * 280 + Math.cos(t.time * 0.2) * 100
      var wanderY = Math.cos(t.time * 0.4) * 180 + Math.sin(t.time * 0.25) * 80

      // 2. 当前实际位置 (漫游中心 + 漫游偏移 + 躲避偏移)
      var cx = t.centerX + wanderX + t.evadeX
      var cy = t.centerY + wanderY + t.evadeY

      // 3. 鼠标躲避逻辑 (物理排斥力)
      var dx = cx - mx
      var dy = cy - my
      var dist = Math.sqrt(dx * dx + dy * dy)
      var avoidRadius = 350

      if (dist < avoidRadius && dist > 0) {
        var force = (avoidRadius - dist) / avoidRadius
        force = force * force * 35 * t.speed
        t.evadeX += (dx / dist) * force
        t.evadeY += (dy / dist) * force
      }

      // 4. 阻尼衰减 — 让躲避后缓慢回归基础路径
      t.evadeX *= 0.94
      t.evadeY *= 0.94

      // 5. 最终目标位置
      var targetX = t.centerX + wanderX + t.evadeX
      var targetY = t.centerY + wanderY + t.evadeY

      // 6. 速度向量 — 用于动态朝向
      var vx = targetX - t.lastX
      var vy = targetY - t.lastY
      var spd = Math.sqrt(vx * vx + vy * vy)

      // 7. 应用位移（相对于蝴蝶初始位置的偏移）
      var offsetX = targetX - t.centerX
      var offsetY = targetY - t.centerY
      t.el.style.transform = 'translate(' + offsetX.toFixed(1) + 'px, ' + offsetY.toFixed(1) + 'px)'

      // 8. 动态旋转 — 蝴蝶朝向飞行方向
      //    找到蝴蝶的旋转元素（bfly 或 bfly-g*）
      if (!t.inner) {
        t.inner = t.el.querySelector('.bfly') || t.el.querySelector('[class*="bfly-g"]')
      }
      if (t.inner && spd > 0.2) {
        var targetAngle = Math.atan2(vy, vx) * 180 / Math.PI + 90
        var diff = targetAngle - t.angle
        while (diff > 180) diff -= 360
        while (diff < -180) diff += 360
        t.angle += diff * 0.35
        t.inner.style.transform = 'rotate(' + t.angle.toFixed(1) + 'deg)'
        t.inner.style.transformOrigin = '50% 50%'
      }

      // 更新上一帧位置
      t.lastX = targetX
      t.lastY = targetY
    })

    requestAnimationFrame(update)
  }

  requestAnimationFrame(update)
})()
