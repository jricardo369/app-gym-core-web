# Design System Master File — LUA Studio Web

> **LOGIC:** When building a specific page, first check `design-system/lua-studio/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** LUA Studio (app-gym-core-web)
**Generated:** 2026-10-07 (ui-ux-pro-max `--design-system` + identidad actual de la app móvil)
**Category:** Fitness/Gym App — gestión de citas/clases de gimnasio (web responsive)
**Pattern:** Feature-Rich Showcase → adaptado a **App Shell** (ver Layout Pattern)
**Style:** Vibrant & Block-based (energético, bloques, alto contraste, hover 150–300ms)

---

## Global Rules

### Color Palette (skill + identidad LUA Studio)

La identidad de marca manda: fondo casi negro + lima `#d5ff5f` (heredado de la app móvil).
El skill aporta la estructura de tokens y los estados semánticos.

| Role | Hex | CSS Variable |
|------|-----|--------------|
| Primary / CTA | `#d5ff5f` | `--color-primary` |
| On Primary | `#101010` | `--color-on-primary` |
| Secondary | `#e8ffa8` | `--color-secondary` |
| On Secondary | `#101010` | `--color-on-secondary` |
| Accent (energía) | `#a3e635` | `--color-accent` |
| On Accent | `#101010` | `--color-on-accent` |
| Background | `#101010` | `--color-background` |
| Surface / Card | `#1d1d1d` | `--color-card` |
| Card Elevated | `#262626` | `--color-card-2` |
| Foreground | `#f7fbff` | `--color-foreground` |
| Muted surface | `#2a2a2a` | `--color-muted` |
| Muted foreground | `#a1a1aa` | `--color-muted-foreground` |
| Border | `rgba(255,255,255,.08)` | `--color-border` |
| Border strong | `rgba(213,255,95,.16)` | `--color-border-strong` |
| Success | `#a3e635` | `--color-success` |
| Warning | `#facc15` | `--color-warning` |
| Destructive | `#f87171` | `--color-destructive` |
| Ring / focus | `#d5ff5f` | `--color-ring` |

**Color Notes:** dark-first (sin light mode por ahora). El lima SOLO para CTA/éxito/enfoque;
nunca como fondo de texto largo. Texto sobre lima siempre `#101010` (contraste ≥ 4.5:1).

### Typography

- **Heading Font:** `Barlow Condensed` (display/athletic, del skill)
- **Body Font:** `Poppins` (identidad actual de la app móvil)
- **Mood:** sports, fitness, athletic, energetic, condensed, action
- **Google Fonts:**
```css
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap');
```

Scale (headings en Barlow Condensed, uppercase opcional + letter-spacing .02em):
display 40–56px / h1 32px / h2 26px / h3 20px / body 15px / small 13px.
`font-size: clamp()` para títulos hero en responsive.

### Spacing Variables (4/8 rhythm)

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` | Tight gaps |
| `--space-sm` | `8px` | Icon gaps, inline spacing |
| `--space-md` | `16px` | Standard padding |
| `--space-lg` | `24px` | Section padding |
| `--space-xl` | `32px` | Large gaps |
| `--space-2xl` | `48px` | Section margins |
| `--space-3xl` | `64px` | Hero padding |

### Radius & Shadows

| Token | Value |
|-------|-------|
| `--radius-sm` | `8px` |
| `--radius-md` | `12px` |
| `--radius-lg` | `20px` (cards) |
| `--radius-pill` | `999px` (botones/inputs) |
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,.4)` |
| `--shadow-md` | `0 10px 28px rgba(0,0,0,.45)` |
| `--shadow-lg` | `0 24px 48px rgba(0,0,0,.55)` |

### Breakpoints (responsive obligatorio)

| Name | Width | Comportamiento |
|------|-------|----------------|
| `sm` | 375px | 1 columna, **bottom nav** (5 targets ≥44px), sin sidebar |
| `md` | 768px | 2 columnas, cards apiladas |
| `lg` | 1024px | **sidebar fijo** + main con max-width, grids 3 cols |
| `xl` | 1440px | contenido max-width 1200px centrado, grids 4 cols |

---

## Layout Pattern (App Shell — obligatorio para páginas con sesión)

- **≥1024px:** sidebar fijo izquierdo (240px) con logo + nav por rol + logout; topbar con título de página y acciones; main scrolleable.
- **<1024px:** sin sidebar; topbar compacta (56px) + **bottom nav** fija (Inicio / Calendario / Perfil o Usuarios + Salir), con `env(safe-area-inset-bottom)` y `padding-bottom` en el contenido para no tapar scroll.
- Las páginas auth (login/registro/recuperar/términos) van en layout full-screen (split hero en ≥1024px, apilado en móvil).
- Nada de scroll horizontal; grids con `auto-fit/minmax`.

---

## Component Specs

### Buttons

```css
.btn { /* base */ padding: 12px 24px; border-radius: var(--radius-pill);
  font-weight: 600; cursor: pointer; transition: all 200ms ease; min-height: 48px; }
.btn-primary { background: #d5ff5f; color: #101010; }
.btn-primary:hover { box-shadow: 0 8px 24px rgba(213,255,95,.25); transform: translateY(-1px); }
.btn-primary:active { transform: translateY(0); }
.btn-secondary { background: #262626; color: #f7fbff; border: 1px solid var(--color-border); }
.btn-secondary:hover { background: #2f2f2f; }
.btn-ghost { background: transparent; color: #d5ff5f; }
.btn-danger { background: rgba(248,113,113,.14); color: #f87171; border: 1px solid rgba(248,113,113,.3); }
.btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }
/* focus visible SIEMPRE */
:focus-visible { outline: 2px solid #d5ff5f; outline-offset: 2px; }
```

### Cards

```css
.card { background: #1d1d1d; border: 1px solid var(--color-border);
  border-radius: var(--radius-lg); padding: var(--space-lg); box-shadow: var(--shadow-md);
  transition: border-color 200ms ease, transform 200ms ease, box-shadow 200ms ease; }
.card:hover { border-color: rgba(213,255,95,.25); transform: translateY(-2px); box-shadow: var(--shadow-lg); }
```

### Inputs

```css
.input { width: 100%; min-height: 48px; padding: 12px 18px; background: #1d1d1d;
  border: 1px solid rgba(255,255,255,.10); border-radius: var(--radius-pill);
  color: #f7fbff; font-size: 15px; transition: border-color 200ms ease, box-shadow 200ms ease; }
.input:focus { border-color: #d5ff5f; outline: none; box-shadow: 0 0 0 3px rgba(213,255,95,.16); }
.input::placeholder { color: #71717a; }
.input.error { border-color: #f87171; }
label { display: block; font-size: 13px; color: #a1a1aa; margin-bottom: 6px; }
.error-text { color: #f87171; font-size: 12px; margin-top: 4px; }
```

### Modals / Alerts / Toasts

```css
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.6);
  backdrop-filter: blur(4px); display: grid; place-items: center; z-index: 60; padding: 16px; }
.modal { background: #1d1d1d; border: 1px solid var(--color-border); border-radius: var(--radius-lg);
  padding: var(--space-xl); box-shadow: var(--shadow-lg); max-width: 480px; width: 100%; }
/* Toast: bottom en móvil, top-right en ≥1024px; nunca tapa el bottom nav */
```

### Estados

- **Loading:** skeleton shimmer (`#262626` → `#313131`) o spinner lima; siempre `aria-busy`.
- **Empty:** ícono + título + 1 línea + CTA.
- **Error:** mensaje inline + botón reintentar.
- **Éxito:** toast efímero (2–3s), texto en `#a3e635`.

---

## Style Guidelines

**Style:** Vibrant & Block-based — bold, energetic, block layout, high color contrast, modern.

**Key Effects:** gaps ≥24px entre secciones, hover con color shift (150–300ms),
tipografía display grande (32px+), scroll-snap en carruseles/semanas.

### Page Pattern (adaptado a App)

1. Topbar con título + acción principal (CTA repetido: topbar, lista, empty state)
2. Resumen/KPIs en cards (solo donde aporte)
3. Contenido principal (lista/grid)
4. CTA inferior en móvil (bottom nav no tapa contenido)

---

## Anti-Patterns (Do NOT Use)

- ❌ Emojis as icons — usar SVG (set interno estilo Lucide en `IconComponent`)
- ❌ Missing `cursor:pointer` en elementos clickeables
- ❌ Layout-shifting hovers (transform que mueve contenido vecino)
- ❌ Low contrast text (mínimo 4.5:1 sobre `#1d1d1d`/`#101010`)
- ❌ Instant state changes (sin transición 150–300ms)
- ❌ Invisible focus states (siempre `:focus-visible` lima)
- ❌ Scroll horizontal en móvil; contenido tapado por bottom nav
- ❌ Limas (lime) como fondo de párrafos largos
- ❌ Mezclar familias de íconos o pesos de trazo

---

## Pre-Delivery Checklist

- [ ] No emojis used as icons (SVG only)
- [ ] All icons from the internal Lucide-style set, stroke 1.5–2px, tamaños por token
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150–300ms)
- [ ] Text contrast 4.5:1 minimum on dark surfaces
- [ ] Focus states visible for keyboard navigation (`:focus-visible` lima)
- [ ] `prefers-reduced-motion` respected (deshabilitar transform/animaciones)
- [ ] Responsive verified: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed bottom nav / topbar
- [ ] No horizontal scroll on mobile
- [ ] Touch targets ≥44px (bottom nav, botones de acción)
- [ ] Forms: labels + errores inline + autenticación permite pegar contraseñas
