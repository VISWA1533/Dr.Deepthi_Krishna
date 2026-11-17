import { useEffect, useRef } from 'react'
import { createProgram, lerp, hasFinePointer, prefersReducedMotion } from './gl'

// One full-screen WebGL layer that draws the hover light:
//  - a soft cursor aura that follows the pointer
//  - a liquid light that runs along the edge of whichever glass card is hovered
// Cards opt in with the `data-gl` attribute.
const FRAG = `
precision highp float;
uniform vec2 uRes;      // css px
uniform float uScale;   // device px per css px
uniform vec2 uMouse;    // css px, top-left origin
uniform float uTime;
uniform vec4 uRect;     // hovered card: x, y, w, h (css px)
uniform float uRadius;
uniform float uHover;   // 0..1
uniform float uAura;    // 0..1
uniform float uFill;    // 1 = shimmer inside the card, 0 = edge light only

float sdRoundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}

void main() {
  vec2 p = gl_FragCoord.xy / uScale;
  p.y = uRes.y - p.y;

  vec3 teal = vec3(0.30, 0.92, 0.82);
  vec3 sky  = vec3(0.49, 0.78, 1.00);
  vec3 rose = vec3(1.00, 0.62, 0.70);

  // Cursor aura (dimmed over cards marked data-gl="edge")
  float dm = length(p - uMouse);
  vec3 col = mix(teal, sky, 0.5 + 0.5 * sin(uTime * 0.6)) * exp(-dm / 140.0) * 0.22 * uAura * mix(1.0, 0.0, uHover * (1.0 - uFill));

  // Card edge light
  if (uHover > 0.001) {
    vec2 c = uRect.xy + uRect.zw * 0.5;
    vec2 local = p - c;
    float d = sdRoundBox(local, uRect.zw * 0.5, uRadius);

    // wobble the edge with flowing noise so it feels liquid
    float n = noise(local * 0.018 + vec2(uTime * 0.35, -uTime * 0.25));
    float edge = exp(-abs(d + (n - 0.5) * 6.0) / 2.2);
    float halo = exp(-max(d, 0.0) / 22.0) * step(0.0, d);

    // light is strongest near the cursor, with a slow travelling sweep
    float near = exp(-length(p - uMouse) / 260.0);
    float ang = atan(local.y, local.x);
    float sweep = 0.5 + 0.5 * sin(ang * 2.0 - uTime * 1.6);

    vec3 tint = mix(teal, rose, smoothstep(-0.6, 0.9, sin(ang + uTime * 0.4)));
    tint = mix(tint, sky, near * 0.4);

    // inner caustic shimmer
    float inside = step(d, 0.0);
    float caustic = pow(noise(local * 0.03 + uTime * 0.2) * noise(local * 0.05 - uTime * 0.15), 2.0);
    float spot = exp(-length(p - uMouse) / 180.0);

    col += tint * (edge * (0.35 + 0.9 * near) * (0.55 + 0.45 * sweep) + halo * 0.18 * near) * uHover;
    col += sky * inside * (caustic * 0.35 + spot * 0.10) * uHover * uFill;
  }

  float a = clamp(max(col.r, max(col.g, col.b)), 0.0, 1.0);
  gl_FragColor = vec4(col, a);
}`

export default function GlowField() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas || !hasFinePointer()) return
    const ctx = createProgram(canvas, FRAG)
    if (!ctx) return
    const { gl, u } = ctx
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

    const reduce = prefersReducedMotion()
    const scale = Math.min(window.devicePixelRatio || 1, 1.25)
    const state = {
      mouse: [-999, -999],
      sm: [-999, -999],
      rect: [0, 0, 0, 0],
      radius: 24,
      hover: 0,
      aura: 0,
      target: null,
      inside: false,
      fill: 1,
    }

    const resize = () => {
      canvas.width = Math.round(window.innerWidth * scale)
      canvas.height = Math.round(window.innerHeight * scale)
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()

    const onMove = (e) => {
      state.mouse = [e.clientX, e.clientY]
      if (state.sm[0] < -900) state.sm = [e.clientX, e.clientY]
      state.inside = true
      const card = e.target.closest?.('[data-gl]')
      if (card) state.target = card
      else state.target = null
    }
    const onLeave = () => {
      state.inside = false
      state.target = null
    }

    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)

    let raf
    const start = performance.now()
    const frame = (now) => {
      const t = reduce ? 0 : (now - start) / 1000
      const k = 0.18
      state.sm[0] = lerp(state.sm[0], state.mouse[0], k)
      state.sm[1] = lerp(state.sm[1], state.mouse[1], k)
      state.aura = lerp(state.aura, state.inside ? 1 : 0, 0.08)

      if (state.target) {
        const r = state.target.getBoundingClientRect()
        const target = [r.left, r.top, r.width, r.height]
        // glide between cards instead of snapping
        const g = state.hover < 0.05 ? 1 : 0.25
        state.rect = state.rect.map((v, i) => lerp(v, target[i], g))
        state.radius = parseFloat(getComputedStyle(state.target).borderTopLeftRadius) || 24
        state.fill = lerp(state.fill, state.target.dataset.gl === 'edge' ? 0 : 1, 0.2)
      }
      state.hover = lerp(state.hover, state.target ? 1 : 0, 0.1)

      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform2f(u('uRes'), window.innerWidth, window.innerHeight)
      gl.uniform1f(u('uScale'), scale)
      gl.uniform2f(u('uMouse'), state.sm[0], state.sm[1])
      gl.uniform1f(u('uTime'), t)
      gl.uniform4f(u('uRect'), ...state.rect)
      gl.uniform1f(u('uRadius'), state.radius)
      gl.uniform1f(u('uHover'), state.hover)
      gl.uniform1f(u('uAura'), state.aura)
      gl.uniform1f(u('uFill'), state.fill)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return <canvas ref={ref} className="glow-field" aria-hidden="true" />
}
