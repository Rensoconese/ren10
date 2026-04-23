---
# ────────────────────────────────────────────────────────────
# RenDS — design.md
# A vanilla, accessible, atomic design system.
# v0.8.0 · Default theme · WCAG 2.1 AA baseline, AAA opt-in
# ────────────────────────────────────────────────────────────
#
# This file is the single source of truth an LLM or agent needs
# to build UI that looks and behaves like RenDS. The front-matter
# below lists canonical tokens and their values. The prose after
# explains *why* those values exist and how to use them together.
#
# If a token is omitted here, it still lives in `tokens/**/*.css`
# — this document privileges the tokens that compose day-to-day
# UI decisions over exhaustive coverage.
# ────────────────────────────────────────────────────────────

system:
  name: RenDS
  version: 0.8.0
  package: rends
  license: MIT
  repo: https://github.com/Rensoconese/ren10
  paradigm: vanilla-light-dom-atomic
  accessibility: WCAG 2.1 AA (baseline), AAA (opt-in)
  philosophy: >
    Web standards first. Custom elements + CSS custom properties
    only. No framework, no Shadow DOM, no runtime. Tokens are
    layered: primitive → semantic → component. Components reach
    for semantic tokens; primitives are the raw palette.
  entry-css: index.css
  import-style: ES module CSS import

themes:
  default: default
  variants:
    - amber-editorial  # warm, serif-friendly, editorial surfaces
    - cyber            # neon, dark-first, high-chroma
    - minimal-mono     # neutral, grayscale, typographic
  mechanism: data-theme attribute on :root + light-dark() CSS function
  generator: rends/create  # Generate AA-safe theme from a single hex

# ═════════════════════════════════════════════════════════════
# COLOR
# ═════════════════════════════════════════════════════════════
# Primitives: Apple-HIG-derived scales (50→900 per hue).
# Semantics: mapped with light-dark() so one token serves both modes.
# Dark mode is honored via color-scheme + [data-theme="dark"] override.
# ═════════════════════════════════════════════════════════════

colors:

  primitives:
    blue:
      50:  "#EBF5FF"
      100: "#D1E9FF"
      200: "#A3D3FF"
      300: "#75BDFF"
      400: "#47A7FF"
      500: "#007AFF"   # Apple system blue
      600: "#0063D1"
      700: "#004DA3"
      800: "#003775"
      900: "#002147"
    gray:
      50:  "#F9F9FB"
      100: "#F2F2F7"
      200: "#E5E5EA"
      300: "#D1D1D6"
      400: "#C7C7CC"
      500: "#AEAEB2"
      600: "#8E8E93"
      700: "#636366"
      800: "#48484A"
      900: "#3A3A3C"
      950: "#2C2C2E"
      1000: "#1C1C1E"
    green:
      50:  "#E8FAF0"
      100: "#C2F0D5"
      200: "#7DDBA3"
      300: "#4ECB71"
      400: "#34C759"   # Apple system green
      500: "#28A745"
      600: "#1E8E3E"
      700: "#167A32"
      800: "#0F5B25"
      900: "#083D19"
    red:
      50:  "#FFF0EF"
      100: "#FFD6D4"
      200: "#FFA8A3"
      300: "#FF7A72"
      400: "#FF3B30"   # Apple system red
      500: "#D70015"
      600: "#B80012"
      700: "#990010"
      800: "#7A000D"
      900: "#5C000A"
    orange:
      50:  "#FFF5EB"
      100: "#FFE5C7"
      200: "#FFCB8F"
      300: "#FFB157"
      400: "#FF9500"   # Apple system orange
      500: "#D97E00"
      600: "#B36700"
      700: "#8C5100"
      800: "#663B00"
      900: "#402500"
    yellow:
      50:  "#FFFBE5"
      100: "#FFF4B8"
      200: "#FFEA7A"
      300: "#FFE03C"
      400: "#FFCC00"   # Apple system yellow
      500: "#D4AA00"
      600: "#AA8800"
      700: "#806600"
      800: "#554400"
      900: "#2B2200"
    teal:
      50:  "#E5FAFE"
      100: "#BFF2FC"
      200: "#80E5F9"
      300: "#40D8F6"
      400: "#5AC8FA"   # Apple system teal
      500: "#32ACD6"
      600: "#1E90B3"
      700: "#14748F"
      800: "#0C586C"
      900: "#063C48"
    purple:
      50:  "#F5EEFF"
      100: "#E5D4FF"
      200: "#CBAAFF"
      300: "#B180FF"
      400: "#AF52DE"   # Apple system purple
      500: "#8E3EBE"
      600: "#6F2E9E"
      700: "#52207E"
      800: "#38155E"
      900: "#200C3E"
    pink:
      50:  "#FFF0F5"
      100: "#FFD6E5"
      200: "#FFADCB"
      300: "#FF85B1"
      400: "#FF2D55"   # Apple system pink
      500: "#D4234A"
      600: "#AA1C3E"
      700: "#801532"
      800: "#550E26"
      900: "#2B071A"
    absolutes:
      white: "#FFFFFF"
      black: "#000000"

  # Semantic tokens are what components reach for. Each is
  # expressed as light-dark(light-value, dark-value); both
  # sides are tuned to pass WCAG AA against expected contexts.
  semantic:
    accent:
      base:    light-dark(blue-600, blue-400)      # solid bg
      hover:   light-dark(blue-700, blue-300)
      active:  light-dark(blue-800, blue-200)
      subtle:  light-dark(blue-50,  blue-900)
      strong:  light-dark(blue-700, blue-300)      # AA text on light surface
      on:      light-dark(white, black)            # fg on solid bg
    status:
      success:        light-dark(green-700,  green-400)
      success-subtle: light-dark(green-50,   green-900)
      success-strong: light-dark(green-700,  green-300)   # AA on surface
      on-success:     light-dark(white, black)
      warning:        light-dark(orange-700, orange-400)
      warning-subtle: light-dark(orange-50,  orange-900)
      warning-strong: light-dark(orange-700, orange-300)
      on-warning:     light-dark(white, black)
      danger:         light-dark(red-500,    red-400)
      danger-subtle:  light-dark(red-50,     red-900)
      danger-strong:  light-dark(red-500,    red-300)
      on-danger:      light-dark(white, black)
      info:           light-dark(teal-700,   teal-400)
      info-subtle:    light-dark(teal-50,    teal-900)
      info-strong:    light-dark(teal-700,   teal-300)
      on-info:        light-dark(white, black)
    ai:
      base:    light-dark(purple-500, purple-300)
      hover:   light-dark(purple-600, purple-200)
      subtle:  light-dark(purple-50,  purple-900)
      on:      light-dark(white, black)
    text:
      primary:    light-dark(black, white)
      secondary:  light-dark(gray-700, gray-300)
      muted:      light-dark(gray-700, gray-500)   # AA: 7.24:1 / 4.78:1
      faint:      light-dark(gray-400, gray-800)   # INCIDENTAL ONLY (below AA)
      inverted:   light-dark(white, black)
      link:       accent-strong
      link-hover: accent-active
    surface:
      base:    light-dark(white, black)
      raised:  light-dark(white, gray-1000)
      sunken:  light-dark(gray-100, black)
      overlay: light-dark(white, gray-1000)
    border:
      base:        light-dark(gray-200, gray-900)   # decorative (may fail 3:1)
      strong:      light-dark(gray-300, gray-800)
      muted:       light-dark(gray-100, gray-950)
      interactive: light-dark(gray-500, gray-500)   # WCAG 1.4.11 ≥3:1
      accent:      accent.base
    fill:
      base:    light-dark(gray-100, gray-950)
      hover:   light-dark(gray-200, gray-900)
      active:  light-dark(gray-300, gray-800)
      subtle:  light-dark(gray-50,  gray-950)
    overlay-scrim: light-dark(rgba(0,0,0,0.4), rgba(0,0,0,0.6))
    separator:     light-dark(gray-200, gray-900)
    focus-ring:    accent.base
    selection:
      bg:   light-dark(blue-100, blue-900)
      text: light-dark(black, white)
    input:
      bg:              light-dark(gray-100, gray-1000)
      bg-hover:        light-dark(white, gray-950)
      border:          border.interactive
      border-focus:    accent.base
      placeholder:     light-dark(gray-700, gray-500)
      disabled-bg:     light-dark(gray-200, gray-950)
      disabled-text:   light-dark(gray-400, gray-800)
      error-border:    status.danger
      focus-ring:      light-dark(rgba(0,122,255,0.15), rgba(10,132,255,0.25))
    disabled:
      bg:   light-dark(gray-200, gray-950)
      text: light-dark(gray-400, gray-800)

# ═════════════════════════════════════════════════════════════
# TYPOGRAPHY
# ═════════════════════════════════════════════════════════════

typography:

  families:
    sans: >
      -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Helvetica Neue", Arial, sans-serif,
      "Apple Color Emoji", "Segoe UI Emoji"
    mono: >
      "SF Mono", ui-monospace, "Cascadia Code", "Source Code Pro",
      Menlo, Monaco, Consolas, "Courier New", monospace

  sizes:
    # --text-* · absolute scale (rem). Floor is 11px (Apple HIG minimum).
    xs:   0.6875rem   # 11px — minimum
    sm:   0.8125rem   # 13px — footnote, caption
    base: 1rem        # 16px — body default
    md:   1.0625rem   # 17px — headline
    lg:   1.125rem    # 18px — title-sm
    xl:   1.25rem     # 20px — title-md
    2xl:  1.375rem    # 22px — title-lg
    3xl:  1.625rem    # 26px — display-sm
    4xl:  1.75rem     # 28px — display-md
    5xl:  2.125rem    # 34px — display-lg
    6xl:  2.5rem      # 40px — hero
    7xl:  3rem        # 48px — hero-lg
    8xl:  3.75rem     # 60px — display-hero

  weights:
    thin:       100
    light:      300
    regular:    400
    medium:     500
    semibold:   600
    bold:       700
    extrabold:  800
    black:      900

  leading:
    none:    1
    tight:   1.2    # headlines / display
    snug:    1.375  # titles
    normal:  1.5    # body default
    relaxed: 1.625
    loose:   1.75
    double:  2

  tracking:
    tighter: -0.05em
    tight:   -0.025em
    normal:   0
    wide:     0.025em
    wider:    0.05em
    widest:   0.1em

  roles:
    # Pre-composed styles — pick a role, not a raw size.
    display-lg:   { size: 5xl, weight: bold,     leading: tight, tracking: tight }
    display-md:   { size: 4xl, weight: bold,     leading: tight, tracking: tight }
    display-sm:   { size: 3xl, weight: semibold, leading: tight, tracking: tight }
    title-lg:     { size: 2xl, weight: semibold, leading: snug }
    title-md:     { size: xl,  weight: semibold, leading: snug }
    title-sm:     { size: lg,  weight: semibold, leading: snug }
    headline:     { size: md,  weight: semibold, leading: snug }
    lead:         { size: xl,  weight: regular,  leading: relaxed }
    body-lg:      { size: md,  weight: regular,  leading: normal }
    body:         { size: base, weight: regular, leading: normal }
    body-sm:      { size: sm,  weight: regular,  leading: normal }
    label-lg:     { size: base, weight: medium }
    label:        { size: sm,   weight: medium }
    label-sm:     { size: xs,   weight: medium }
    caption:      { size: sm,   weight: regular, leading: normal }
    caption-sm:   { size: xs,   weight: regular }
    code:         { size: 0.875em, weight: regular, family: mono }

  modular-scale:
    # Optional: projects that prefer a strict ratio over the absolute
    # scale can set `<html data-type-ratio="X">`.
    default: major-third          # 1.250 · classic web
    available:
      - { name: minor-second,   ratio: 1.067 }
      - { name: major-second,   ratio: 1.125 }
      - { name: minor-third,    ratio: 1.200 }
      - { name: major-third,    ratio: 1.250 }   # default
      - { name: perfect-fourth, ratio: 1.333 }
      - { name: aug-fourth,     ratio: 1.414 }
      - { name: perfect-fifth,  ratio: 1.500 }
      - { name: minor-sixth,    ratio: 1.600 }
      - { name: golden-ratio,   ratio: 1.618 }
      - { name: major-sixth,    ratio: 1.667 }
      - { name: octave,         ratio: 2.000 }

# ═════════════════════════════════════════════════════════════
# LAYOUT — Spacing, sizing, grid
# ═════════════════════════════════════════════════════════════

layout:

  grid: 8pt         # Apple HIG. All spacing derives from multiples of 8.

  spacing:
    # --space-* · rem-based; 8px is the fundamental unit.
    unit: 0.5rem       # 8px
    scale:
      0:     0
      px:    1px
      0-25:  0.0625rem    # 1px
      0-5:   0.125rem     # 2px · hairline
      1:     0.25rem      # 4px · half unit
      1-5:   0.375rem     # 6px
      2:     0.5rem       # 8px · 1u
      3:     0.75rem      # 12px
      4:     1rem         # 16px · standard
      5:     1.25rem      # 20px
      6:     1.5rem       # 24px
      7:     1.75rem
      8:     2rem         # 32px
      9:     2.25rem
      10:    2.5rem
      12:    3rem         # 48px
      14:    3.5rem
      16:    4rem
      20:    5rem
      24:    6rem
      32:    8rem
      40:    10rem
      48:    12rem
      56:    14rem
      64:    16rem        # 256px

  spacing-semantic:
    # Intent-based tokens for day-to-day layout.
    card-padding:        space-6
    card-padding-sm:     space-4
    card-padding-lg:     space-8
    panel-padding:       space-6
    dialog-padding:      space-6
    toast-padding:       space-4
    form-gap:            space-5   # between fields
    form-gap-tight:      space-3
    form-gap-loose:      space-8   # between sections
    field-label-gap:     space-2
    field-helper-gap:    space-1
    fieldset-gap:        space-6
    list-gap:            space-2
    list-gap-tight:      space-1
    menu-item-gap:       space-1
    inline-tight:        space-2   # button + icon
    inline:              space-3
    inline-loose:        space-4
    section:             space-12  # between sections
    section-lg:          space-16
    section-sm:          space-8
    page-top:            space-12
    page-bottom:         space-16
    stack-tight:         space-2
    stack:               space-4
    stack-loose:         space-6

  density:
    # Shift the semantic values via [data-density] on <html>.
    comfortable: default                   # card-padding = space-6
    compact:     { card-padding: space-4, form-gap: space-3 }
    spacious:    { card-padding: space-8, form-gap: space-6 }

  sizing:
    touch-min: 2.75rem      # 44px — Apple HIG minimum touch target
    component-heights:
      xs:  1.5rem            # 24px
      sm:  2rem              # 32px
      md:  2.25rem           # 36px
      lg:  2.75rem           # 44px · default / touch
      xl:  3.25rem           # 52px
      2xl: 3.75rem
    icon-sizes:
      xs:  0.75rem           # 12px
      sm:  1rem              # 16px
      md:  1.25rem           # 20px · default
      lg:  1.5rem            # 24px
      xl:  2rem
      2xl: 3rem
    avatar-sizes:
      xs:  1.5rem
      sm:  2rem
      md:  2.5rem
      lg:  3rem
      xl:  4rem
      2xl: 5rem
    content-widths:
      xs:    20rem           # 320px
      sm:    24rem
      md:    28rem
      lg:    32rem
      xl:    36rem
      2xl:   42rem
      3xl:   48rem
      4xl:   56rem
      5xl:   64rem           # 1024px
      6xl:   72rem
      7xl:   80rem           # 1280px
      full:  100%
      prose: 65ch            # optimal reading line length
    stroke-widths:
      0: 0
      1: 1px
      2: 2px
      3: 3px
      4: 4px

# ═════════════════════════════════════════════════════════════
# SHAPES — Border radius
# ═════════════════════════════════════════════════════════════

shapes:
  radius:
    none: 0
    xs:   0.125rem    # 2px · subtle
    sm:   0.25rem     # 4px · small controls
    md:   0.5rem      # 8px · standard (Apple default)
    lg:   0.75rem     # 12px · cards, modals
    xl:   1rem        # 16px · large panels
    2xl:  1.25rem     # 20px · sheets
    3xl:  1.5rem      # 24px · large sheets
    full: 9999px      # pill / circle

# ═════════════════════════════════════════════════════════════
# ELEVATION — Shadows and z-index
# ═════════════════════════════════════════════════════════════

elevation:

  # Shadow colors are defined via light-dark() so the entire
  # ladder swaps cleanly between modes. Light uses subtle black
  # alpha; dark amps up to 0.3–0.5 alpha for visibility on dark
  # surfaces.
  shadow:
    xs:
      light: "0 1px 2px rgba(0,0,0,0.05)"
      dark:  "0 1px 2px rgba(0,0,0,0.30)"
    sm:
      light: "0 1px 3px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06)"
      dark:  "0 1px 3px rgba(0,0,0,0.40), 0 1px 2px rgba(0,0,0,0.30)"
    md:
      light: "0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)"
      dark:  "0 4px 6px rgba(0,0,0,0.40), 0 2px 4px rgba(0,0,0,0.30)"
    lg:
      light: "0 10px 15px rgba(0,0,0,0.10), 0 4px 6px rgba(0,0,0,0.05)"
      dark:  "0 10px 15px rgba(0,0,0,0.40), 0 4px 6px rgba(0,0,0,0.30)"
    xl:
      light: "0 20px 25px rgba(0,0,0,0.10), 0 8px 10px rgba(0,0,0,0.05)"
      dark:  "0 20px 25px rgba(0,0,0,0.40), 0 8px 10px rgba(0,0,0,0.30)"
    2xl:
      light: "0 25px 50px rgba(0,0,0,0.15), 0 12px 24px rgba(0,0,0,0.08)"
      dark:  "0 25px 50px rgba(0,0,0,0.50), 0 12px 24px rgba(0,0,0,0.40)"
    none:  none
    inset:
      light: "inset 0 2px 4px rgba(0,0,0,0.06)"
      dark:  "inset 0 2px 4px rgba(0,0,0,0.30)"

  z-index:
    behind:    -1
    base:       0
    raised:     1     # slightly above siblings
    dropdown:  10     # dropdown menus
    sticky:    20     # sticky headers, navbars
    overlay:   30     # overlays, backdrops
    modal:     40     # modals, dialogs
    popover:   50     # popovers, floating elements
    toast:     60     # toast notifications
    tooltip:   70     # tooltips (always on top)
    max:     9999     # escape hatch (use sparingly)

  focus-ring:
    width:  2px
    offset: 2px
    color:  accent.base
    # Rendered as: box-shadow: 0 0 0 offset surface, 0 0 0 (offset+width) accent

# ═════════════════════════════════════════════════════════════
# MOTION — Durations, easings, presets
# ═════════════════════════════════════════════════════════════
# All durations collapse to 0ms under prefers-reduced-motion.
# ═════════════════════════════════════════════════════════════

motion:

  durations:
    # --duration-* primitives (ms)
    primitives:
      0:       0
      fastest: 50
      fast:    100
      normal:  150
      moderate: 250
      slow:    300
      slower:  450
      slowest: 600
    # Intent-named semantic durations
    semantic:
      micro:     50       # pixel-level feedback
      tactile:   100      # hover / focus / press
      state:     150      # toggle / checkbox
      enter:     250      # widget appearing
      exit:      100      # widget leaving (always < enter)
      emphasize: 450      # hero transitions
      route:     300      # page change
      overlay:   250      # dialog / sheet / popover scrim

  easings:
    linear:        linear
    default:       cubic-bezier(0.25, 0.10, 0.25, 1.00)
    decelerate:    cubic-bezier(0.00, 0.00, 0.20, 1.00)   # arriving
    accelerate:    cubic-bezier(0.40, 0.00, 1.00, 1.00)   # leaving
    standard:      cubic-bezier(0.20, 0.00, 0.00, 1.00)   # in-flight
    emphasized:    cubic-bezier(0.20, 0.00, 0.00, 1.00)
    spring-soft:   cubic-bezier(0.34, 1.20, 0.64, 1.00)
    spring-snappy: cubic-bezier(0.20, 1.50, 0.40, 1.00)
    bounce:        cubic-bezier(0.34, 1.56, 0.64, 1.00)
    # Intent-named:
    enter:         decelerate      # --ease-enter
    exit:          accelerate      # --ease-exit
    state-change:  standard        # --ease-state-change
    attention:     cubic-bezier(0.05, 0.70, 0.10, 1.00)
    playful:       spring-soft

  presets:
    # Ready-to-paste `transition:` values.
    tactile: >
      color, background-color, border-color, box-shadow, opacity
      — all at duration.tactile · ease.state-change
    state: >
      color, background-color, border-color, box-shadow, transform,
      opacity — all at duration.state · ease.state-change
    enter: >
      opacity, transform, filter — duration.enter · ease.enter
      (use with @starting-style for open animations)
    exit: >
      opacity, transform, filter — duration.exit · ease.exit
    overlay: >
      opacity, background-color, backdrop-filter, overlay (allow-discrete),
      display (allow-discrete) — duration.overlay · ease.enter
    emphasize: >
      opacity, transform — duration.emphasize · ease.attention

  choreography:
    stagger-step: 40ms    # delay between sibling entries
    stagger-max:  10      # cap before running serially

# ═════════════════════════════════════════════════════════════
# COMPONENT REGISTRY
# ═════════════════════════════════════════════════════════════
# Tier · atomic classification used inside the package.
# Each entry carries: class, element tag (if web component),
# a11y pattern, and the motion/token sub-surface it uses.
# ═════════════════════════════════════════════════════════════

components:

  primitives:
    - { name: ren-avatar,     tag: none,              type: CSS-only }
    - { name: ren-badge,      tag: none,              type: CSS-only }
    - { name: ren-banner,     tag: none,              type: CSS-only }
    - { name: ren-breadcrumb, tag: none,              type: CSS-only }
    - { name: ren-button,     tag: button.ren-btn,    type: CSS-first + JS }
    - { name: ren-card,       tag: none,              type: CSS-only }
    - { name: ren-checkbox,   tag: native input,      type: CSS-only }
    - { name: ren-field,      tag: ren-field,         type: web component }
    - { name: ren-icon,       tag: none,              type: CSS-only }
    - { name: ren-kbd,        tag: kbd,               type: CSS-only }
    - { name: ren-link,       tag: a,                 type: CSS-only }
    - { name: ren-pagination, tag: nav,               type: CSS-only }
    - { name: ren-progress,   tag: progress,          type: CSS-only }
    - { name: ren-radio,      tag: ren-radio-group,   type: web component }
    - { name: ren-separator,  tag: hr,                type: CSS-only }
    - { name: ren-skeleton,   tag: none,              type: CSS-only (animated) }
    - { name: ren-spinner,    tag: none,              type: CSS-only (animated) }
    - { name: ren-tag,        tag: none,              type: CSS-only }

  composites:
    - { name: ren-accordion,          tag: ren-accordion,       a11y: native details/summary }
    - { name: ren-alert-dialog,       tag: ren-alert-dialog,    a11y: non-dismissible dialog }
    - { name: ren-calendar,           tag: ren-calendar,        a11y: ARIA grid }
    - { name: ren-carousel,           tag: ren-carousel,        a11y: scroll-snap + dots }
    - { name: ren-collapsible,        tag: details,             a11y: native }
    - { name: ren-color-picker,       tag: ren-color-picker,    a11y: keyboard + EyeDropper }
    - { name: ren-combobox,           tag: ren-combobox,        a11y: ARIA combobox }
    - { name: ren-context-menu,       tag: ren-context-menu,    a11y: extends ren-menu }
    - { name: ren-date-picker,        tag: ren-date-picker,     a11y: calendar popover }
    - { name: ren-date-range-picker,  tag: ren-date-range-picker, a11y: range selection }
    - { name: ren-dialog,             tag: ren-dialog,          a11y: native <dialog> + focus trap }
    - { name: ren-dropzone,           tag: none,                a11y: input fallback + DnD }
    - { name: ren-hover-card,         tag: none,                a11y: CSS anchor positioning }
    - { name: ren-menu,               tag: ren-menu,            a11y: Popover API + roving tabindex }
    - { name: ren-number-field,       tag: ren-number-field,    a11y: stepper }
    - { name: ren-otp,                tag: ren-otp,             a11y: slot focus + paste }
    - { name: ren-popover,            tag: ren-popover,         a11y: Popover API + anchor }
    - { name: ren-scroll-area,        tag: none,                a11y: native scroll, styled bar }
    - { name: ren-select,             tag: ren-select,          a11y: keyboard + typeahead }
    - { name: ren-sheet,              tag: ren-sheet,           a11y: focus trap + Escape }
    - { name: ren-slider,             tag: ren-slider,          a11y: native range + labels }
    - { name: ren-tabs,               tag: ren-tabs,            a11y: ARIA tablist + roving tabindex }
    - { name: ren-toast,              tag: none,                a11y: aria-live + dismissible }
    - { name: ren-toggle-group,       tag: ren-toggle-group,    a11y: aria-pressed + roving tabindex }
    - { name: ren-toolbar,            tag: none,                a11y: WAI-ARIA toolbar }
    - { name: ren-tooltip,            tag: ren-tooltip,         a11y: hover + focus + long-press }

  patterns:
    - { name: ren-ai,          tag: none,         a11y: semantic HTML + reduced-motion }
    - { name: ren-command,     tag: ren-command,  a11y: dialog + command palette shortcut }
    - { name: ren-empty-state, tag: none,         a11y: semantic heading + text }
    - { name: ren-form,        tag: ren-form,     a11y: aria-invalid + errormessage }
    - { name: ren-menubar,     tag: ren-menubar,  a11y: WAI-ARIA menubar + typeahead }
    - { name: ren-nav,         tag: ren-nav,      a11y: aria-expanded toggle + aria-current }
    - { name: ren-sidebar,     tag: ren-sidebar,  a11y: aria-current + tooltips when collapsed }
    - { name: ren-table,       tag: ren-table,    a11y: aria-sort + aria-selected + keyboard }

counts:
  primitives: 18
  composites: 26
  patterns:    8
  total:      52
---

# RenDS

A vanilla, accessible, atomic design system. No framework required, no Shadow
DOM, no runtime — just CSS custom properties, custom elements, and web
standards that have been in Chrome, Firefox, and Safari stable for years.

The front-matter above is the wire format: tokens, names, values. Everything
below this line is the prose that explains *why* those values exist, when to
reach for which one, and how components layer on top of them. Agents building
UI with RenDS should treat the two halves as complementary — the YAML gives
exact values, the Markdown gives the editorial rationale.

---

## Overview

### What RenDS is

RenDS is a ~5,000-line, fully auditable design system that ships as a single
CSS file plus a handful of custom elements. Components render in Light DOM so
the host app can style, slot, and select them with ordinary CSS. There is no
build step required on the consumer side — `import 'rends'` and every token
listed above is globally available.

The system is organized in the classic atomic taxonomy: **primitives** (18)
are the smallest cohesive units (buttons, badges, fields); **composites**
(26) combine primitives with behavior (dialog, menu, tabs, select);
**patterns** (8) are page-level organisms (nav, sidebar, table, form,
command palette). Each tier leans on the same token layer, so swapping a
theme cascades cleanly from atoms to pages.

### Philosophy

1. **Tokens before components.** Every value a component uses — a color, a
   radius, a duration — is a custom property. Components are opinionated
   about *structure*; they are deliberately neutral about *values*. Override
   tokens at `:root`, at `[data-theme]`, or at the component root to reskin
   anything.

2. **Semantic, not primitive.** Primitives (`--blue-600`, `--space-4`,
   `--duration-normal`) exist so semantic tokens (`--color-accent`,
   `--space-card-padding`, `--duration-enter`) can point at them. Components
   consume the semantic layer. If a name describes *what* it is instead of
   *what value* it holds, it belongs in the semantic layer.

3. **Light DOM, always.** Styling a web component with the host's own CSS
   should be boring. Shadow DOM is powerful but hostile to the everyday
   designer who wants to tweak padding in DevTools. Every RenDS custom
   element keeps its markup in light DOM and scopes through class names.

4. **Accessibility is the default, not an add-on.** WCAG 2.1 AA is the
   baseline: every text/background pair in the default theme meets 4.5:1
   (small text) or 3:1 (large text / UI components). AAA is a one-line
   opt-in via the theme generator or `[data-contrast="aaa"]`. Focus rings
   are visible, touch targets are 44px, and `prefers-reduced-motion`
   collapses every duration to 0ms at the token layer.

5. **Reduced-motion first.** Motion tokens are designed so that disabling
   them doesn't break a single interaction — state still changes, just
   instantly. Components never animate via hard-coded values.

### Default theme

This document describes the **default** theme: Apple-HIG-derived palette,
system font stack, 8pt grid, major-third type scale, decelerate-on-arrival
easings. It is the theme every component is tuned and regression-tested
against.

Three variant themes ship alongside the default and can be activated via
`<html data-theme="...">`:

- **amber-editorial** · warm neutrals, serif-friendly, designed for reading
  surfaces (blogs, long-form, docs).
- **cyber** · dark-first, saturated neon accents, high-contrast UI.
- **minimal-mono** · grayscale / single-hue, typographic, deliberately
  restrained.

A hex-to-theme generator (`rends/create`) derives an AA-safe theme from any
single brand hex. All three variants stay within the semantic token names
documented here — nothing about a component changes when you swap themes.

### How to read this document

Each section below documents one token family — **Colors**, **Typography**,
**Layout**, **Shapes**, **Elevation & Depth**, **Motion** — followed by the
component catalog and a consolidated **Do's and Don'ts** list. The tone is
prescriptive: these are the decisions that have already been made, so an
agent generating RenDS UI can stop making them.

---

## Colors

RenDS' palette derives from Apple Human Interface Guidelines system colors.
Each hue ships as a 10-step scale (50 → 900, plus a 950/1000 on gray for
dark-mode surfaces). The scales are expressive enough for marketing
illustration and tame enough for dashboard UI — the rule is that you never
pick from them directly in a component.

### Two layers, one discipline

- **Primitive colors** (`--blue-600`, `--gray-100`, `--red-500`) are the raw
  palette. They live in `tokens/primitives/colors.css` and exist so that
  semantic tokens have something to resolve to. Components never consume
  primitives.
- **Semantic colors** (`--color-accent`, `--color-text`, `--color-surface`,
  `--color-border-interactive`, `--color-success-subtle`, …) describe *what
  a color is for*. These are the only tokens a component touches. If a
  semantic name does not exist for the job, add one in
  `tokens/semantic/colors.css` before falling back to a primitive.

The reason for the split is simple: you can reskin the entire system by
rewriting ~80 semantic tokens, because they all point into the primitive
palette. You never have to audit a component for hard-coded colors.

### light-dark() and color-scheme

Every semantic token is defined with the CSS `light-dark()` function:

```css
--color-text:    light-dark(var(--black), var(--white));
--color-surface: light-dark(var(--white), var(--black));
```

`:root` declares `color-scheme: light dark`, which lets the browser pick the
active side based on the user's OS preference. Manual overrides are applied
with `<html data-theme="light">` or `<html data-theme="dark">`, which set
`color-scheme` explicitly. There is no separate `.dark` class, no
duplicated declaration blocks, no JS required. Dark mode is free.

### Accent, status, AI

Four semantic color families are tuned for maximum legibility on their solid
backgrounds:

- **Accent** (`--color-accent` / `-hover` / `-active` / `-subtle` / `-on` /
  `-strong`) — the brand color. Used for primary buttons, focused borders,
  links, and selection states. `--color-on-accent` is the guaranteed-AA
  text color to place on top of `--color-accent` (white in light, black in
  dark). `--color-accent-strong` is the variant to use for accent-colored
  *text* on a surface (blue-700 / blue-300); the base is calibrated as a
  background, not as text on white.
- **Status** (`success`, `warning`, `danger`, `info`) — each has the same
  family of tokens (`-subtle`, `-strong`, `-on-X`). Semantics map to
  intent: success = confirmations, warning = needs attention but not
  blocking, danger = destructive / error, info = neutral system message.
- **AI** (`--color-ai-*`) — the purple family used by `ren-ai` patterns
  (slug, streaming cursor, citations). Carved out so AI surfaces are
  visually distinct from ordinary accent UI even when a theme remaps the
  accent family.

### Text tokens and the `--color-text-faint` carve-out

Text colors are a short ladder: `primary` (full black/white),
`secondary` (high-emphasis muted), `muted` (standard muted — AA at 7.24:1
light and 4.78:1 dark), `faint` (below AA), `inverted`, `link`, and
`link-hover`.

`--color-text-faint` (gray-400 light, gray-800 dark) **does not meet WCAG
AA** and is reserved for incidental, WCAG-exempt content: disabled labels,
placeholder hints, decorative punctuation (breadcrumb separators, ellipsis,
divider dots), and the outside-month dates in a calendar grid. It must
**never** be used for captions, eyebrows, table headers, step numbering,
or any text the user is expected to read. Use `--color-text-muted` for
those cases — it is AA in both modes.

### Borders and the 3:1 rule

Borders serve two roles with very different contrast requirements:

- **Decorative separators** (`--color-border`, `--color-border-muted`,
  `--color-separator`) live between regions (card edges, dividers, section
  lines). They intentionally fail the 3:1 UI-component contrast threshold
  because they're not conveying state — they're visually tidying the
  layout.
- **Interactive borders** (`--color-border-interactive`) outline actionable
  controls: inputs, unchecked checkboxes, toggle buttons. These must meet
  WCAG 1.4.11 (≥3:1 vs their surface). `--color-border-interactive`
  resolves to `gray-500` in both modes — 3.07:1 on white, 7.42:1 on black
  — which clears AA everywhere the system expects a border to communicate
  affordance.

Components enforce this split: `ren-field`, `ren-checkbox`, `ren-radio`,
`ren-select`, `ren-toggle-group`, and `ren-button.ren-btn-outline` all use
`--color-border-interactive`. `ren-card`, `ren-separator`, and
`ren-sidebar` use `--color-border`. If you're deciding which to use, the
test is: *does removing this border make the component ambiguous about
being interactive?* If yes, interactive. If no, decorative.

### Fills, surfaces, and hover states

Surfaces (`--color-surface`, `--color-surface-raised`, `--color-surface-sunken`,
`--color-surface-overlay`) describe painted backgrounds at different
elevation tiers. Dark mode surfaces use `gray-1000` (#1C1C1E) for raised
content so shadows are still visible — pure black swallows shadow softly.

Fills (`--color-fill`, `-hover`, `-active`, `-subtle`) are the grayscale
ramp used for subtle backgrounds: menu-item hover, row zebra-striping,
tag backgrounds, switch track off-state. They step through
gray-100 → gray-200 → gray-300 in light, and gray-950 → gray-900 → gray-800
in dark, so any hover/active pair reads as a single visual step.

### Focus rings and selection

`--color-focus-ring` is aliased to `--color-accent`. The focus ring is
rendered as `box-shadow: 0 0 0 2px var(--color-surface), 0 0 0 4px var(--color-focus-ring)`
so that the offset adapts to whatever surface the control sits on — you get
the right "hollow" effect in light and dark without redefinition.

Selection uses `--color-selection-bg` (blue-100 light, blue-900 dark) with
`--color-selection-text` as the complement. Applied via
`::selection { background: var(--color-selection-bg); color: var(--color-selection-text); }`
in `base/reset.css`.

### AAA mode

`[data-contrast="aaa"]` on `:root` (or generated by the theme tool) lifts
every strong-variant and text-muted pair to WCAG AAA (≥7:1 for small text,
≥4.5:1 for UI). The mechanism is a thin override on the `--color-*-strong`
tokens — no component changes. Use AAA when targeting audiences with low
vision or when a client spec demands it; the system has been regression
tested under AAA with the `smoke-create-generator` script.

---

## Typography

The type system is derived from the Apple HIG hierarchy: display → title →
headline → body → label → caption → code. Each role carries a pre-composed
bundle of size, weight, line-height, and (where relevant) tracking, so a
component styles `.ren-title-md` rather than reaching for six individual
properties.

### System font stack

RenDS defaults to the OS system font — `-apple-system`, `BlinkMacSystemFont`,
`Segoe UI`, `Roboto`, etc. This produces native-feeling UI across macOS,
Windows, Linux, iOS, and Android with no web-font payload. The mono stack
favors `SF Mono` and `ui-monospace` for the same reason: consistent metrics
with zero download.

Projects that want a custom face override `--font-sans` or `--font-mono` at
`:root` — not at the component level. Every component inherits through the
token chain, so overriding once reskins every text surface.

### Size scale: 11 → 60 px

The primitive scale `--text-xs` through `--text-8xl` covers 11px (the Apple
HIG minimum legible size) up to 60px (display hero). Values are expressed
in `rem` so user-agent font-size scaling works out of the box. Never go
below `--text-xs` in UI — accessibility audits will flag it.

The 11 → 22px band (xs through 2xl) does the bulk of interface work: body
text, labels, titles. The 26 → 60px band (3xl through 8xl) is reserved for
editorial and marketing surfaces: display headlines, heroes, splash
screens.

### Semantic roles

Instead of choosing a raw size, compose from one of the role bundles:

- **Display** (`display-lg/md/sm`) · large marketing or hero copy; tight
  leading, tight tracking, bold weight.
- **Title** (`title-lg/md/sm`) · section headings; semibold + snug leading.
  Use these for H2/H3 inside app views.
- **Headline** (`headline`) · emphasized body (17px semibold) — for
  dialog titles, card titles, form section heads.
- **Lead** (`lead`) · introductory paragraphs (20px regular, relaxed
  leading). Good for the first paragraph of an article or the subhead
  under a hero.
- **Body** (`body-lg/body/body-sm`) · default reading text. `body` is
  16px, which sets the browser-default baseline.
- **Label** (`label-lg/label/label-sm`) · UI control text — button labels,
  field labels, menu items. Always `weight-medium` so buttons read crisply
  at small sizes without anti-alias fuzz.
- **Caption** (`caption/caption-sm`) · secondary text — helper text,
  timestamps, metadata.
- **Code** (`code`) · `0.875em` monospace for inline code. Uses `em` so it
  scales with surrounding prose.

Each role has its own `--{role}-size`, `--{role}-weight`,
`--{role}-leading`, and (where tuned) `--{role}-tracking` tokens. There are
alias tokens (`--font-size-body`, `--line-height-caption`) kept for legacy
compatibility — prefer the canonical `--body-size`, `--caption-leading`
forms in new code.

### Dynamic Type

`tokens/semantic/dynamic-type.css` exposes a parallel set of fluid sizes
that interpolate between a min and max viewport width, so the same
component can stay readable on mobile and breathe on desktop without
manual breakpoints. Opt in by consuming `--body-size-fluid` instead of
`--body-size`. Not used by default — components ship with static sizes so
QA across breakpoints is predictable.

### Modular scale (optional)

Projects that prefer a strict modular scale over the absolute values can
set `<html data-type-ratio="perfect-fourth">` and the `--scale-step-*`
tokens will interpolate between base and their ratio. The default ratio
is **major-third (1.250)** — classic web, balanced, friendly. Switching
to `golden-ratio` or `octave` is a one-line change.

### Line length

The content-width token `--width-prose` is defined as `65ch`, which is the
accessibility guideline for optimal reading line length. Long-form text
surfaces (`ren-card` with article body, docs pages) should constrain to
this width. App UI surfaces (forms, tables) use the `--width-*` pixel
ladder instead because line length there is driven by data, not reading
comfort.

### Tracking

The `--tracking-*` tokens are tuned for display and label roles.
Display/title sizes benefit from `tracking-tight` to counteract optical
loosening at scale. Labels at the `xs` size can bump to `tracking-wide`
for uppercase treatments (eyebrows, category tags, form-step labels) — the
widened spacing rescues legibility where lowercase x-height disappears.

---

## Layout

Every layout decision in RenDS flows from the **8pt grid**. If a value isn't
a multiple of 8 (or a half-unit 4), it shouldn't be in a layout declaration.
The spacing scale, component heights, touch targets, and icon sizes are all
derived from this unit so stacks, clusters, and grids snap together without
pixel-hunting.

### Spacing scale

The primitive scale `--space-0` through `--space-64` goes 0 → 256px in 8pt
steps, with half-units at 4/6/12/20px for tight spacing. In practice,
`--space-2` (8px), `--space-3` (12px), `--space-4` (16px), `--space-6`
(24px), and `--space-8` (32px) do most of the work. The hairline tokens
(`--space-px`, `--space-0-5`) exist for borders and icon fine-tuning.

### Semantic spacing

Layouts consume spacing through intent-named tokens in
`tokens/semantic/spacing.css`:

- `--space-card-padding` / `-sm` / `-lg` · padding inside cards, panels,
  dialogs.
- `--space-form-gap` / `-tight` / `-loose` · vertical rhythm between
  fields. `--space-field-label-gap` and `--space-field-helper-gap` set
  the within-field rhythm.
- `--space-inline` / `-tight` / `-loose` · horizontal gap inside clusters
  (button + icon, tag + dismiss).
- `--space-list-gap` / `-tight` · vertical gap in menus and lists.
- `--space-section` / `-lg` / `-sm` · rhythm between page sections.
- `--space-page-top` / `-bottom` · page-level breathing room.
- `--space-stack` / `-tight` / `-loose` · defaults for `ren-stack`
  utilities.

Prefer these over raw `--space-*` in custom layouts — the resulting CSS
reads as intent ("card has a `card-padding`") rather than magic numbers.

### Density

Three densities are driven by `[data-density]` on `<html>`:

- `comfortable` (default) — card-padding = 24px, form-gap = 20px.
- `compact` — card-padding = 16px, form-gap = 12px. Good for data-dense
  admin dashboards.
- `spacious` — card-padding = 32px, form-gap = 24px. Good for marketing
  pages and onboarding.

Density only touches the semantic spacing tokens; the primitive scale is
invariant. This means custom components written against the semantic
layer pick up density switches automatically.

### Touch targets

`--touch-min` is 44px (2.75rem), matching the Apple HIG minimum. Every
interactive primitive honors this — `ren-button`, `ren-field`,
`ren-checkbox`, `ren-radio`, `ren-tag[clickable]`, pagination items, menu
items, etc. — regardless of visual size. Small buttons use padding
top/bottom to *look* compact while keeping the hit area at 44px.

Designs that need a visually smaller control (icon button in a toolbar,
inline close button on a chip) may drop below 44px visually, but must
still provide a 44px hit zone via `:before`/`:after` expanded padding or a
transparent overlay.

### Component heights

The `--size-*` ladder (24 → 60px) is the canonical height for buttons and
inputs:

- `xs` 24px · compact inline (chips, small tags)
- `sm` 32px · small button / badge
- `md` 36px · medium
- `lg` 44px · **default** and touch target
- `xl` 52px · large button
- `2xl` 60px · extra-large / marketing CTA

Keep a single row of interleaved buttons and inputs at the same size tier
so they baseline-align.

### Icon and avatar sizes

Icons follow a 12 → 48px scale; `--icon-md` (20px) is the default for most
contexts. Inline icons inside body text use `--icon-sm` (16px) to match
cap-height. Avatars share a parallel 24 → 80px scale; pair `--avatar-sm`
(32px) with `--size-md` buttons, `--avatar-md` (40px) with navigation
chrome, and reserve `--avatar-xl` and up for profile cards.

### Content widths

Page- and container-level max-widths live in `--width-*` (320 → 1280px).
Use these at the layout level, not on individual components. The
`--width-prose` (65ch) token is specifically for reading text surfaces.

### Responsive strategy

RenDS is mobile-first. Container-based responsive rules (using
`container-type: inline-size`) are preferred over viewport media queries
because they let a component adapt to whatever column it's placed in.
`ren-form`, `ren-sidebar`, and `ren-table` already use this pattern.
Viewport media queries are reserved for truly page-level shifts (e.g.,
flipping a nav bar from horizontal to hamburger).

### Utilities

`base/utilities.css` ships a minimal atomic layer: `.ren-stack`,
`.ren-cluster`, `.ren-sidebar-layout`, `.ren-grid`, visibility helpers,
and `sr-only`. These are deliberately small — the system leans on custom
elements for structure, not utility stacks.

---

## Elevation & Depth

RenDS uses shadow tiers, not surface colors, to communicate depth. Surfaces
are mostly flat (white, near-black, gray-1000); the hierarchy of stacked
content reads through the shadow ladder.

### Shadow ladder

Six tiers from `--shadow-xs` to `--shadow-2xl`, plus `--shadow-inset` and
`--shadow-none`:

- **xs** · hairline lift (1px) · buttons in resting state, tags.
- **sm** · card at rest · the typical card or input shadow.
- **md** · raised card on hover · also used for dropdown/select panels.
- **lg** · popover, dropdown menu, hover-card, tooltip.
- **xl** · dialog panel, sheet.
- **2xl** · modal over important content, full-screen overlays.
- **inset** · pressed state for toggle-able buttons and track fills.

Each tier uses two stacked shadows — one for ambient occlusion (wide, low
opacity) and one for the key light (tight, slightly higher opacity). This
mimics the Apple layered-light model and reads as depth rather than a
drop-shadow artifact.

### Dark-mode shadow compensation

Shadows on dark surfaces have to work harder to be visible. The system
decomposes each tier into `--shadow-color-1` through `--shadow-color-6` —
theme-aware color tokens defined with `light-dark()` — and composes the
final `--shadow-xs` … `--shadow-2xl` values from them. In practice, light
mode uses 5–15% black alpha; dark mode uses 30–50% black alpha. The
component author writes `box-shadow: var(--shadow-md)` and gets the right
visual in both modes for free.

A note on pure-black surfaces: dark mode surfaces use `gray-1000`
(`#1C1C1E`), not pure black, for anything that needs to receive a shadow.
`--color-surface` is true black in dark mode (matching the OLED-friendly
HIG pattern), but `--color-surface-raised` steps up to `gray-1000` so
shadows have something to fall onto.

### Z-index ladder

Layering uses a named scale instead of arbitrary numbers:

- `--z-behind` (-1) · content pushed below the page (background shapes).
- `--z-base` (0) · normal document flow.
- `--z-raised` (1) · sibling lift (hover cards inside a grid).
- `--z-dropdown` (10) · dropdown menus.
- `--z-sticky` (20) · sticky headers, sticky nav.
- `--z-overlay` (30) · overlays, backdrops, scrims.
- `--z-modal` (40) · dialogs.
- `--z-popover` (50) · popovers, floating UI.
- `--z-toast` (60) · toast notifications.
- `--z-tooltip` (70) · tooltips — always on top of interactive layers.
- `--z-max` (9999) · escape hatch; use sparingly.

Each layer is a full decimal step apart so components inside a layer can
nudge themselves without colliding. New features should pick the
closest-named token instead of inventing numbers.

### Focus ring

Focus visibility is part of the depth story. The ring is 2px wide with a
2px offset, colored `--color-focus-ring` (= `--color-accent`). Rendered as
a stacked `box-shadow` so the offset color matches the underlying surface:

```css
box-shadow:
  0 0 0 var(--focus-ring-offset) var(--color-surface),
  0 0 0 calc(var(--focus-ring-offset) + var(--focus-ring-width)) var(--color-focus-ring);
```

This guarantees a visible halo regardless of whether the control sits on
white, gray, or a dark surface. Every interactive RenDS component uses
`:focus-visible` (never `:focus`) so mouse users don't see the ring on
click.

---

## Shapes

Rounding is functional, not decorative. RenDS defaults to softly-rounded
corners — small enough that rectangles still read as rectangles, large
enough that the UI doesn't feel pixel-sharp.

### Radius scale

The nine-step ladder runs from `--radius-none` to `--radius-full`. Each
tier has a job:

- **none** (0) · rare; use for full-bleed surfaces and hairline dividers.
- **xs** (2px) · subtle rounding for tags, kbd keys, micro-badges.
- **sm** (4px) · small controls — buttons (xs/sm), inputs (sm), checkbox.
- **md** (8px) · **standard**, Apple default — button (md/lg), input (md),
  badge, most "pill but not fully round" surfaces.
- **lg** (12px) · cards, dropdown menus, popovers, modal dialogs.
- **xl** (16px) · large panels, side sheets, oversized cards.
- **2xl** (20px) · sheets that feel like a drawer drawn up over the
  viewport (iOS-style).
- **3xl** (24px) · extra-large sheets, splash panels.
- **full** (9999px) · pills and circles — avatars, round buttons,
  progress bars, skeleton text lines.

### Picking a radius

The internal rule: *smaller controls carry smaller radii*. A 24px chip
with a 12px radius reads as a blob; the same chip with a 4px radius reads
as a clean tag. Match the radius to the smallest dimension of the
control — the radius should usually be no more than one-third of the
height for non-pill shapes.

Cards and modals break this rule deliberately: `--radius-lg` (12px) on a
200px-tall dialog looks correct because the corner sweep is a small
fraction of the overall surface. The rule is about *small controls*, not
all surfaces.

### Pills and circles

`--radius-full` is the only value that ignores size matching. Use it for:

- Avatars, user badges.
- Progress bars (track and fill both).
- Loading spinner borders.
- Capsule buttons, status chips that want to emphasize their "pill" shape.
- Skeleton placeholder lines — a pill-shaped skeleton reads as
  generic-content faster than a sharp rectangle.

Never mix pill and non-pill shapes within the same component family. A
button group with three `--radius-md` items and one `--radius-full` item
will read as broken.

### Per-component overrides

Every component that cares about corners exposes a component-level token
(`--ren-card-radius`, `--ren-button-radius`, etc.) in
`tokens/component/tokens.css`. Override the token, not the component CSS.
This keeps the system consistent if someone later flips `--radius-md`
globally.

---

## Motion

Motion in RenDS is task-oriented: every transition carries information
about state change. Nothing animates for flavor. The semantic motion
tokens describe the *intent* (`enter`, `exit`, `state`, `tactile`,
`overlay`, `route`, `emphasize`), and each intent resolves to a
`(duration, easing)` pair that has already been tuned correctly.

### Durations by intent

- **micro** (50ms) — pixel-level feedback, e.g., opacity flicker on a
  pressed checkbox dot.
- **tactile** (100ms) — hover, focus, and press transitions. Fast enough
  to feel responsive; slow enough to avoid snapping.
- **state** (150ms) — on/off toggles, expanded/collapsed state,
  checked/unchecked. The "something changed" interval.
- **enter** (250ms) — widgets *arriving* on screen (dialog open, menu
  open, toast enter, popover open).
- **exit** (100ms) — widgets *leaving*. Exits are always faster than
  entrances — the UX rule of thumb is that leaving should feel like it
  took you at your word.
- **overlay** (250ms) — backdrops, scrims, dialog bodies composited with
  a dim layer.
- **route** (300ms) — page-level transitions (route changes in SPAs).
- **emphasize** (450ms) — hero / onboarding / attention-seeking flows.

### Easings by intent

- **enter** (`cubic-bezier(0, 0, 0.2, 1)`) — decelerate, for anything
  arriving at rest. Default for every open animation.
- **exit** (`cubic-bezier(0.4, 0, 1, 1)`) — accelerate, for anything
  leaving the viewport.
- **state-change** (`cubic-bezier(0.2, 0, 0, 1)`) — symmetric, for motion
  that happens in-flight between two on-screen states.
- **attention** (emphasized-decelerate) — slow start, crisp stop, for
  hero moments.
- **playful** (spring-soft `cubic-bezier(0.34, 1.2, 0.64, 1)`) — gentle
  overshoot. Use on primitives that benefit from a little personality
  (active checkbox dot, tag appearing).

### Presets

Ready-to-paste `transition:` values, composed from the intent tokens:

- `--transition-tactile` — color/bg/border/shadow/opacity at `tactile`.
- `--transition-state` — same plus `transform`, at `state`.
- `--transition-enter` — opacity/transform/filter at `enter` · use with
  `@starting-style` for open animations.
- `--transition-exit` — opacity/transform/filter at `exit`.
- `--transition-overlay` — opacity/bg/backdrop-filter/overlay/display at
  `overlay` with `allow-discrete` for discrete-property animation.
- `--transition-emphasize` — opacity/transform at `emphasize`.

Most of the time a component reaches for one of these presets rather than
composing a transition by hand.

### `@starting-style` and `allow-discrete`

Open animations (dialog, menu, popover, toast) use `@starting-style` to
animate *into* the rendered state, and `transition-behavior: allow-discrete`
so that `display: none → block` interpolates cleanly. Every RenDS overlay
composite uses this pattern; consumers can rely on it rather than
hand-rolling `requestAnimationFrame` hacks.

### Choreography

When multiple siblings enter at once (a grid of cards, a menu's items),
they stagger by `--motion-stagger-step` (40ms). The stagger caps at
`--motion-stagger-max` (10 items) to keep total delay bounded. Applied
either via the `.ren-stagger > *` utility or the `motion.js`
`staggerChildren()` helper.

### Reduced motion

Every primitive duration collapses to `0ms` under
`@media (prefers-reduced-motion: reduce)`, which cascades through every
semantic duration automatically. The semantic layer reapplies the same
collapse so both layers stay in sync, and `--motion-stagger-step` drops
to `0ms` so stagger also disappears. State changes still fire — an
accordion still opens, a dialog still appears — they just do so
instantly. No component has to opt in; reduced-motion is a system
property.

---

## Components

RenDS ships 52 components across three tiers. Every component is
accessible by default (keyboard, screen reader, reduced motion, 44px
touch), and every component consumes the token layer — swap a theme and
every component follows.

### Primitives (18)

Primitives are the smallest cohesive unit: a button, a badge, a field. They
compose freely and never require another primitive to be present. Most are
CSS-only; the handful with JS are there purely to wire ARIA relationships.

#### ren-avatar

Circular user picture with fallback initials and optional presence dot.
Ships six sizes (`xs` 24px → `2xl` 80px) matching the `--avatar-*` scale.
Place inside `ren-avatar-group` for overlap-and-pile clusters.

- **Variants:** solid, outline, gradient.
- **A11y:** decorative by default — provide `alt` on the inner image, or
  `aria-label` on the initials variant.

#### ren-badge

Small atomic label for status, category, or count. CSS-only. Pair with
text ("Active") or use the `.ren-badge-dot` variant for a pure indicator.

- **Variants:** `primary`, `secondary`, `success`, `warning`, `danger`,
  `info`, `outline`, `dot`.
- **A11y:** semantic `<span>`. Add `role="status"` if the badge
  communicates a live update (e.g., a notification count that changes).

#### ren-banner

Persistent inline message for alerts, status updates, and notifications.
Unlike toast, banners do not auto-dismiss — they occupy layout until the
user acknowledges them.

- **Variants:** `success`, `warning`, `danger`, `neutral`; plus
  `-compact`, `-full`, `-dismiss`, and `-actions` modifiers.
- **States:** `[data-dismissing]` plays the exit animation.
- **A11y:** `role="status"` for passive updates, `role="alert"` for
  urgent ones. The dismiss button carries `aria-label`.

#### ren-breadcrumb

Hierarchical navigation trail. Built on `<nav><ol>` so screen readers
announce it as a list. Default separator is `›` via the
`--breadcrumb-separator` variable (override to "/", "→", "·", etc.).

- **Special:** `.ren-breadcrumb-truncated` collapses middle items for
  deep paths.
- **A11y:** `aria-label="Breadcrumb"` on the `<nav>`, `aria-current="page"`
  on the last item.

#### ren-button

The workhorse. Seven variants × three sizes × loading/disabled states. Uses
`--size-md` (36px) by default and honors `--touch-min` (44px) at `lg`.

- **Variants:** `primary` (solid accent), `secondary` (filled gray),
  `ghost` (transparent + hover fill), `outline` (border only), `danger`,
  `link`, `accent`.
- **Sizes:** `sm` / `md` (default) / `lg`.
- **Special:** `.ren-btn-icon` (square icon-only), `.ren-btn-full`
  (100% width), `.ren-btn-group` (segmented).
- **States:** `disabled`, `[data-loading]` (sets `aria-busy=true` and
  shows spinner), `[aria-disabled="true"]`.
- **A11y:** visible focus ring, 44px touch hit area at all sizes,
  spinner announces loading state via `aria-busy`.

#### ren-card

Versatile container for grouped content. Supports header / body / footer
sections and accent-border status variants. The most-used primitive after
`ren-button`.

- **Variants:** `elevated` (shadow-md), `outline` (border only), `ghost`
  (no chrome), `sunken` (gray fill).
- **Special:** `.ren-card-interactive` (full hover lift),
  `.ren-card-selectable` (radio-behavior + aria-pressed),
  `.ren-card-simple` (minimal padding).
- **States:** `[data-status="success|warning|danger|info"]` adds a
  4px accent border on the leading edge.
- **A11y:** use real heading tags inside `.ren-card-header`. The whole
  card becomes a link via nested-anchor technique or full-card click
  handler.

#### ren-checkbox

Custom-styled checkbox built on native `<input type="checkbox">` — the
control is visually restyled while the input keeps all native semantics
(form submission, `:checked`, tab focus).

- **States:** `:checked`, `:indeterminate`, `:disabled`, `:focus-visible`.
- **A11y:** the native input is hidden via `position: absolute; opacity: 0`
  so screen readers still see it; the visible `.ren-checkbox-control` is
  pure decoration.

A switch variant (`.ren-switch`) reuses the checkbox mechanics with a
pill-shaped track and animated thumb.

#### ren-field

Wrapper custom element that auto-wires the ARIA relationships between a
label, control, description, and error message. Write natural HTML inside
it and get `aria-labelledby`, `aria-describedby`, and `aria-errormessage`
assembled for you.

- **States:** `[data-invalid]`, `[data-valid]`, plus the native
  `:user-invalid` / `:user-valid` pseudos.
- **Sizes on inputs:** `.ren-input-sm`, `.ren-input-lg`.
- **Icons:** wrap the input in `.ren-input-wrapper` with a leading/trailing
  `.ren-input-icon`.
- **A11y:** auto-generated stable IDs via `utils/id-generator.js`;
  required state uses `aria-required`; disabled state uses
  `aria-disabled`.

#### ren-icon

Sizing, coloring, and animation utilities for any SVG. Ships as a CSS
class on a wrapper `<span>` (or applied to an inline `<svg>`).

- **Sizes:** `xs` / `sm` / `md` (default) / `lg` / `xl` / `2xl`.
- **Colors:** `primary`, `success`, `warning`, `danger`, `muted` —
  applied via `currentColor`.
- **Animation:** `.ren-icon-spin` (respects reduced motion).
- **A11y:** decorative by default (`aria-hidden="true"` recommended).
  Meaningful icons need an adjacent text label or `aria-label`.

#### ren-kbd

Keyboard shortcut badge. Styles `<kbd>` as a rounded chip with a slight
bevel to read like a physical key. Group consecutive keys with `+`
separators.

- **A11y:** preserves native `<kbd>` semantics — screen readers announce
  "keyboard input: Command K".

#### ren-link

Styled `<a>` with variants for different contexts.

- **Variants:** default (underlined accent), `muted` (secondary color),
  `plain` (no underline), `external` (trailing arrow + `rel="noopener"`),
  `nav` (for nav bars), `skip` (skip-to-main link).
- **A11y:** `aria-current="page"` for active nav link; skip link becomes
  visible on focus and is the first tab stop.

#### ren-pagination

Page navigation for long lists and tables. Hit-tested at 44px minimum.

- **Variants:** default (full numbered set), `simple` (prev + info +
  next only), `compact` (smaller targets), `centered`.
- **States:** `[aria-disabled="true"]` or `:disabled` on prev/next,
  `[aria-current="page"]` on the active number.
- **A11y:** `<nav aria-label="Pagination">`, real links on each page so
  the navigation is shareable, `aria-label` on prev/next.

#### ren-progress

Linear progress bar and meter. Use `<progress>` or `<meter>` semantically;
the CSS styles their tracks and fills.

- **Sizes:** default, `-sm`, `-lg`, `-xl`.
- **Variants:** `success`, `warning`, `danger`, `info` recolor the fill.
- **Special:** `.ren-progress-indeterminate` animates an indeterminate
  loading bar.
- **A11y:** `<progress value max>` is already perfect — screen readers
  announce the percentage. Provide a visible label via
  `.ren-progress-label`.

#### ren-radio

Radio button group with keyboard navigation (arrow keys, Home/End, roving
tabindex). Use the `ren-radio-group` custom element as the container; each
radio is a native `<input type="radio">` in a styled wrapper.

- **Attributes:** `orientation="vertical"` (default) or `"horizontal"`.
- **A11y:** `role="radiogroup"` on the container, arrow-key navigation
  auto-selects the focused radio, disabled radios skip in the roving
  cycle.

#### ren-separator

Thin horizontal or vertical divider. Pure CSS, no custom element — style
`<hr class="ren-separator">`.

- **Variants:** default, `-strong`, `-dashed`.
- **A11y:** native `<hr>` already announces as a separator. Use
  `aria-orientation="vertical"` on vertical separators inside
  toolbars / menubars.

#### ren-skeleton

Shimmer placeholder for loading states. Apply to any element to replace
its content with an animated gradient.

- **Shapes:** default rectangle, `.ren-skeleton-text` (pill), 
  `.ren-skeleton-circle` (avatar), `.ren-skeleton-line` (width + height
  props).
- **A11y:** announce the skeleton region as busy via `aria-busy="true"`
  on the parent container; drop a `sr-only` "Loading…" for screen
  readers.

#### ren-spinner

Circular indeterminate loading indicator. 1s infinite rotation, respects
reduced motion (falls back to a pulsing dot).

- **Sizes:** `sm`, `md` (default), `lg`.
- **Colors:** inherits `currentColor`; compose with `ren-icon-*` color
  modifiers.
- **A11y:** give it an `aria-label="Loading"` or pair with a visible
  status message in an `aria-live` region.

#### ren-tag

Interactive badge for selected items, filters, or categories. Unlike
`ren-badge`, tags are actionable — they can be clicked or dismissed.

- **Variants:** color (`primary` / `success` / `warning` / `danger`),
  size (`sm` / `lg`).
- **Special:** `.ren-tag-removable` includes a dismiss button,
  `.ren-tag-clickable` treats the tag as a button (`role="button"`,
  `tabindex="0"`).
- **States:** `[aria-pressed="true"]` or `[data-selected]` for selected
  filter chips.
- **A11y:** dismiss button needs `aria-label="Remove {tag name}"`.

### Composites (26)

Composites combine primitives with interaction logic — dialogs, menus,
tabs, date pickers. Most ship as custom elements (`<ren-dialog>`,
`<ren-menu>`) that wrap semantic HTML and layer behavior on top.

#### ren-accordion

CSS-first accordion built on native `<details><summary>`. Two modes:
`single` (only one item open at a time) and `multiple`.

- **Variants:** default, `.ren-accordion-bordered`, `.ren-accordion-flush`.
- **Attributes:** `type`, `collapsible`, `default-value`.
- **API:** `openItem(i)`, `closeItem(i)`, `toggleItem(i)`,
  `getOpenItems()`.
- **Events:** `ren-accordion-change`.
- **A11y:** native `<details>` semantics; keyboard Enter/Space on the
  summary toggles.

#### ren-alert-dialog

Non-dismissible confirmation dialog. Extends `ren-dialog` but blocks
click-outside and (optionally) Escape. Use for destructive confirmations
where the user must choose an action.

- **Differences from `ren-dialog`:** `alert` attribute, no click-outside
  dismissal, optional `no-escape` attribute.
- **A11y:** `role="alertdialog"`, focus trap, title + description wired
  via `aria-labelledby` / `aria-describedby`.

#### ren-calendar

Fully accessible calendar grid with single / range / multiple selection
modes. Keyboard-navigable via arrow keys; ARIA grid pattern.

- **Attributes:** `mode` (`single` / `range` / `multiple`), `format`,
  `min-date`, `max-date`.
- **API:** `getSelectedDate()`, `setSelectedDate(d)`.
- **A11y:** days are buttons inside `role="grid"`; today is announced
  via `aria-label`; outside-month days are `aria-disabled` and use
  `--color-text-faint` (decorative context).

#### ren-carousel

Scroll-snap carousel with keyboard nav, autoplay, loop, and pagination
dots. Built on `scroll-snap-type` for native-feel momentum on touch.

- **Attributes:** `autoplay` (ms), `loop`, `slides-per-view`, `fade`.
- **API:** `next()`, `prev()`, `goTo(i)`, `pause()`, `resume()`.
- **Events:** `ren-slide-change`.
- **A11y:** arrow key navigation, auto-pauses on hover/focus, dots are
  real buttons with `aria-label="Go to slide N"`.

#### ren-collapsible

Single-item CSS-only expand/collapse using `<details>`. For cases where
an accordion would be overkill.

- **A11y:** native.

#### ren-color-picker

HSV canvas + hue slider + alpha + swatches. Supports HEX / RGB / HSL
output formats and the EyeDropper API where available.

- **Attributes:** `value`, `alpha`, `format`, `swatches`.
- **API:** `getColor()`, `setColor(hex)`.
- **A11y:** keyboard-navigable canvas (arrow keys = pixel movement, Shift
  = large steps), all slider inputs are real `<input type="range">`.

#### ren-combobox

Searchable autocomplete input with filtering. Implements the ARIA
combobox pattern (1.2 variant — listbox popup).

- **A11y:** `role="combobox"` on the input, `role="listbox"` on the
  popup, `aria-activedescendant` for keyboard navigation without moving
  focus.

#### ren-context-menu

Right-click menu. Extends `ren-menu` with `contextmenu` event handling
and viewport-edge collision positioning.

- **Events:** `ren-context-menu-open { x, y, target }`.
- **A11y:** reachable via keyboard through the target's context menu
  key (Menu key or Shift+F10).

#### ren-date-picker

Date input with calendar popover. The field accepts typed input; the
calendar gives visual selection; both stay in sync.

- **Attributes:** `format`, `placeholder`, `min-date`, `max-date`.
- **API:** `open()`, `close()`, `getDate()`, `setDate(d)`.
- **A11y:** field is a native date-formatted input with validation; the
  popover uses Popover API so dismissal and focus restoration are
  native.

#### ren-date-range-picker

Two-calendar range selector. Start and end dates highlight with a
shaded span between them; keyboard and pointer both supported.

- **API:** `getRange()`, `setRange({ start, end })`.
- **A11y:** range is announced as "Start date: X, End date: Y" on
  selection change.

#### ren-dialog

Modal dialog using the native `<dialog>` element. Size variants, focus
trap, Escape dismissal, click-outside dismissal, mobile bottom-sheet
behavior.

- **Classes:** `.ren-dialog-sm / md / lg / xl / full`,
  `.ren-dialog-header / body / footer`.
- **API:** `show()`, `close()`, `isOpen`.
- **Events:** `ren-open`, `ren-close`.
- **A11y:** native `<dialog>` provides focus management; title and
  description wired via `aria-labelledby` / `aria-describedby`.

#### ren-dropzone

Drag-and-drop file upload area with visual feedback. Works with a hidden
`<input type="file">` as the fallback / click-to-browse path.

- **Events:** `ren-files-added { files }`.
- **A11y:** the file input remains keyboard-focusable; drag-over state
  announced via `aria-live`.

#### ren-hover-card

Rich preview card on hover. Positioned with CSS anchor positioning;
optional arrow indicator.

- **A11y:** delayed show/hide to avoid flicker; hidden from keyboard users
  by default (hover-only). For critical info, use `ren-popover` or
  `ren-tooltip` instead.

#### ren-menu

Dropdown menu with keyboard navigation, typeahead, checkbox / radio
items. Uses Popover API where available for native dismissal.

- **Classes:** `.ren-menu-item`, `.ren-menu-item-danger`,
  `.ren-menu-separator`, `.ren-menu-label`, `.ren-menu-icon`,
  `.ren-menu-shortcut`.
- **Attributes:** `placement` (top/bottom-start/end), `trigger-id`.
- **API:** `open()`, `close()`, `isOpen()`.
- **Events:** `ren-menu-select`, `ren-menu-open`, `ren-menu-close`.
- **A11y:** WAI-ARIA menu pattern, arrow-key nav, typeahead, Escape to
  close, returns focus to the trigger.

#### ren-number-field

Numeric input with increment/decrement buttons, min/max bounds, step.

- **API:** `value`, `increment()`, `decrement()`.
- **A11y:** input is `<input type="number">`; buttons are
  `aria-label`-ed "Increment" / "Decrement"; keyboard Up/Down also works
  on the input.

#### ren-otp

One-time password input with auto-advancing slots and clipboard paste.

- **Attributes:** `length`, `type` (`numeric` / `alphanumeric`),
  `disabled`.
- **API:** `getValue()`, `setValue(str)`, `clear()`.
- **A11y:** each slot is a real input with `autocomplete="one-time-code"`
  where supported; pasting a full code fills all slots.

#### ren-popover

Floating popover with CSS anchor positioning and automatic viewport
collision handling. Uses Popover API for native dismissal.

- **Classes:** `.ren-popover-arrow`, `.ren-popover-header`,
  `.ren-popover-body`, `.ren-popover-footer`.
- **Attributes:** `placement`, `offset`, `trigger-id`.
- **API:** `open()`, `close()`, `toggle()`, `isOpen()`.
- **Events:** `ren-open`, `ren-close`.
- **A11y:** click-outside dismissal, Escape key, `aria-modal`.

#### ren-scroll-area

Custom scrollbar styling with native scroll behavior. Does not
re-implement scrolling — keyboard, momentum, wheel, and touch all use
the browser's native scroll.

- **Variants:** `.ren-scroll-area-auto` (hide bar, show on scroll).
- **A11y:** native; bar is decorative.

#### ren-select

Custom select/dropdown with keyboard navigation, multi-select, and
option groups. Not a native `<select>` — rendered in markup so it can
show rich item content (icons, descriptions, shortcuts).

- **Classes:** `.ren-select-trigger`, `.ren-select-icon`,
  `.ren-select-item`, `.ren-select-label`, `.ren-select-separator`.
- **Attributes:** `placeholder`, `name`, `multiple`, `size` (`sm`/`lg`).
- **API:** `open()`, `close()`, `getValue()`, `setValue(val)`.
- **Events:** `ren-select-change`.
- **A11y:** `role="combobox"` + `role="listbox"`; typeahead; arrow keys
  navigate options; Enter selects; Escape closes and returns focus.

#### ren-sheet

Side / bottom sheet with slide-in animation and swipe-to-dismiss. Uses
Popover API fallback.

- **Attributes:** `data-side` (`left` / `right` / `top` / `bottom`),
  `data-size` (`sm` / `md` / `lg` / `xl` / `full`).
- **API:** `show()`, `close()`.
- **A11y:** focus trap, Escape dismissal, `aria-labelledby` /
  `aria-describedby` via the header/description slots.

#### ren-slider

Range input with styled track and thumb. Wraps a real
`<input type="range">`, so it remains a native form control.

- **Variants:** size (`sm` / `lg`), color (`success` / `warning` /
  `danger`), vertical orientation.
- **API:** `value` property.
- **Events:** `ren-slider-input`, `ren-slider-change`.
- **A11y:** native `<input type="range">` with `aria-valuenow` mirrored
  to the visible `.ren-slider-value` label; keyboard arrow keys step.

#### ren-tabs

Accessible tabbed interface. Arrow keys navigate; Home/End jump to first
/ last; `activation="manual"` (Enter/Space to activate) or `"automatic"`
(focus = active).

- **Variants:** `.ren-tab-list-underline` (default), `-pills`,
  `-enclosed`.
- **API:** `selectTabByIndex(i)`, `selectTabById(id)`, `selectedIndex`,
  `selectedTab`, `selectedPanel`.
- **Events:** `ren-tab-change`.
- **A11y:** WAI-ARIA tablist pattern with roving tabindex; panels have
  `role="tabpanel"` and `aria-labelledby` pointing to their tab.

#### ren-toast

Toast notification system. Imperative API (`toast(msg)`) creates a
viewport-positioned stack with auto-dismiss.

- **Types:** `success`, `error`, `warning`, `info`, `loading`.
- **Positions:** six (top/bottom × left/center/right).
- **A11y:** renders into a persistent `aria-live="polite"` region
  (or `assertive` for `error`); each toast has a real dismiss button.

#### ren-toggle-group

Grouped toggle buttons for single or multiple selection. Like radio
button group, but button-shaped.

- **Classes:** `.ren-toggle-group-item`, plus `-outline`, `-full`,
  `-vertical` modifiers.
- **Attributes:** `type` (`single` / `multiple`), `value`.
- **A11y:** roving tabindex, arrow-key nav, `aria-pressed` on each
  item (single mode uses `role="radiogroup"` + `aria-checked`).

#### ren-toolbar

Grouped actions with roving tabindex and arrow-key keyboard nav.
Separators break the group visually and in screen reader announcements.

- **Classes:** `.ren-toolbar-item`, `.ren-toolbar-separator`.
- **A11y:** WAI-ARIA toolbar pattern, arrow keys, Home/End.

#### ren-tooltip

Lightweight tooltip with hover / focus triggers and configurable delay.

- **Attributes:** `placement`, `show-delay`, `hide-delay`, `offset`.
- **API:** `show()`, `hide()`, `isOpen()`.
- **A11y:** appears on hover *and* focus; auto-hides on blur /
  mouseleave; long-press on touch. Tooltip content is wired to the
  trigger via `aria-describedby`. Do not use a tooltip for
  essential-to-read content — tooltips are progressive enhancement.

### Patterns (8)

Patterns are page-scale organisms: nav bars, sidebars, tables, full
forms. They bring layout responsibilities of their own (responsive
breakpoints, container queries, mobile overlays) and compose multiple
composites and primitives inside.

#### ren-ai

CSS-only visual patterns for AI-generated content, inspired by IBM
Carbon for AI. Provides the vocabulary — slug, message bubble, streaming
cursor, typing dots, citation marker, sources list, confidence bar,
skeleton — without prescribing a chat framework.

- **Classes:** `.ren-ai-slug`, `.ren-ai-message`, `.ren-ai-streaming`,
  `.ren-ai-typing`, `.ren-ai-citation`, `.ren-ai-sources`,
  `.ren-ai-confidence` (with `data-level="high|medium|low"`),
  `.ren-ai-prompt`, `.ren-ai-skeleton`.
- **A11y:** every animated element respects reduced motion. The slug
  reads as "AI"; citations link to their source. The streaming cursor
  should be paired with an `aria-live` region that gets the finished
  text, not the character-by-character stream.

#### ren-command

Command palette / Spotlight. Built on `<dialog>` with real-time
filtering, keyboard navigation, groups, empty state, and a global
keyboard shortcut.

- **Classes:** `.ren-command`, `.ren-command-input-wrapper`,
  `.ren-command-input`, `.ren-command-list`, `.ren-command-group`
  (hides with `data-empty`), `.ren-command-item` (highlighted via
  `data-highlighted`), `.ren-command-empty`.
- **Attributes:** `data-shortcut` (e.g., `ctrl+k`).
- **API:** `open()`, `close()`, `registerAction(name, fn)`.
- **Events:** `ren-command-select { item, value, action }`.
- **A11y:** focus moves to the input on open; arrow keys walk the
  (flat, across groups) item list; Escape closes and returns focus;
  selection is announced by the input's aria-activedescendant.

#### ren-empty-state

Reusable layout for empty / no-data states. CSS-only.

- **Classes:** `.ren-empty-state`, `.ren-empty-state-icon`,
  `.ren-empty-state-title`, `.ren-empty-state-description`,
  `.ren-empty-state-actions`; plus `-compact` and `-bordered`
  modifiers.
- **A11y:** semantic heading inside the pattern (H2 or H3 depending on
  page context). Text is load-bearing — do not communicate the empty
  state through icon alone.

#### ren-form

Multi-step form with validation. Supports field-level rules, error
summaries, step progress, and server-side error injection.

- **Classes:** `.ren-form`, `.ren-form-section`, `.ren-form-row`
  (responsive field columns), `.ren-form-step` (`data-active`,
  `data-completed`, `data-disabled`), `.ren-form-error-summary`
  (shows with `data-has-errors`), `.ren-form-actions`.
- **Validation rules:** `required`, `email`, `min:N`, `max:N`,
  `pattern:/regex/`, `match:fieldName`, plus user-registered custom
  rules via `RenForm.registerValidator(name, fn)`.
- **API:** `validate()`, `getValues()`, `reset()`, `setErrors(...)`,
  `setFieldError(name, message)`, `nextStep()`, `prevStep()`.
- **Events:** `ren-submit`, `ren-invalid`, `ren-step-change`,
  `ren-field-validated`.
- **A11y:** `aria-invalid` on bad fields, `aria-errormessage` linking
  to the error text, required fields marked with `data-required`, the
  error summary receives focus on validation failure so screen readers
  announce it and keyboard users land where they need to be.

#### ren-menubar

Desktop-style horizontal menu bar (File / Edit / View). Implements the
full WAI-ARIA menubar pattern with submenus, checkbox / radio items,
separators, labels, typeahead, and keyboard shortcuts display.

- **Classes:** `.ren-menubar`, `.ren-menubar-trigger`,
  `.ren-menubar-menu` (uses `hidden` attribute), `.ren-menubar-item`,
  `.ren-menubar-separator`, `.ren-menubar-label`,
  `.ren-menubar-submenu` (with chevron), `.ren-menubar-checkbox`
  (with `aria-checked`), `.ren-menubar-radio`.
- **API:** `closeAll()`, `openMenu(triggerIndex)`.
- **Events:** `ren-menubar-select { item, value, checked? }`.
- **Keyboard:** arrow Right/Left between triggers, arrow Down/Up inside
  menus, Enter/Space to activate, Escape to close, Home/End to jump,
  typeahead to land on an item by first letter.
- **A11y:** full menubar pattern; `aria-expanded` on triggers,
  `aria-checked` on checkbox/radio items; roving focus with visible
  indicators.

#### ren-nav

Responsive top navigation bar with mobile hamburger menu, dropdown
support, and sticky / transparent variants.

- **Classes:** `.ren-nav`, `.ren-nav-sticky` (sticky + backdrop blur),
  `.ren-nav-transparent`, `.ren-nav-links`, `.ren-nav-link`,
  `.ren-nav-dropdown`, `.ren-nav-brand`, `.ren-nav-actions`,
  `.ren-nav-toggle` (hamburger).
- **API:** `setActiveLink(href)`, `isOpen` getter.
- **Keyboard:** Escape closes mobile menu; Tab navigates.
- **A11y:** `aria-expanded` on the toggle, `aria-current="page"` on
  the active link, skip-link friendly (nav is not trapped in focus
  order).

#### ren-sidebar

App-shell sidebar with desktop collapse, mobile overlay, state
persistence, and tooltips when collapsed.

- **Classes:** `.ren-sidebar` (uses `data-collapsed`, `data-open`),
  `.ren-sidebar-header`, `.ren-sidebar-content`, `.ren-sidebar-nav`,
  `.ren-sidebar-item`, `.ren-sidebar-item-icon`,
  `.ren-sidebar-item-text`, `.ren-sidebar-section-label`,
  `.ren-sidebar-overlay`, `.ren-sidebar-toggle`.
- **API:** `toggleMenu()`, `setActiveItem(href)`, `openMobileMenu()`,
  `isCollapsed` getter.
- **Events:** `ren-sidebar-toggle { collapsed }`.
- **Keyboard:** Escape closes mobile overlay.
- **A11y:** `aria-current="page"` on the active item; when collapsed,
  each item exposes its label via `data-tooltip` → `ren-tooltip` so
  the sidebar remains usable.

#### ren-table

Data table with sorting, row selection, column resize, pagination, and
density variants. The heaviest pattern in the system.

- **Classes:** `.ren-table`, `.ren-table-wrapper`, `.ren-table-toolbar`,
  `.ren-table-header`, `.ren-th`, `.ren-th-sortable` (gets
  `data-sort="asc|desc"`), `.ren-table-body`, `.ren-tr` (gets
  `aria-selected`), `.ren-td`, `.ren-table-select` (checkbox column),
  `.ren-table-pagination`; plus `-compact` and `-comfortable` density
  modifiers.
- **API:** `setLoading(bool)` (shimmer overlay), `setDensity(mode)`,
  `getSelectedRows()`, `clearSelection()`, `filter(colIdx, value)`.
- **Events:** `ren-sort`, `ren-select`, `ren-page`, `ren-filter`.
- **Keyboard:** arrow keys navigate cells, Space toggles row selection,
  Shift+Click range-selects, Enter on a sortable header sorts.
- **A11y:** `aria-sort` on sortable headers, `aria-selected` on rows,
  checkbox column has a clear `aria-label` on the select-all
  checkbox.

---

## Do's and Don'ts

Short, prescriptive rules distilled from the sections above. An agent
generating RenDS UI should treat these as non-negotiable.

### Tokens

**Do** reach for the semantic layer (`--color-accent`, `--space-card-padding`,
`--duration-enter`). Those names exist so components don't have to make
the decision twice.

**Do** add a new semantic token when no existing name fits. Prefer
extending the semantic layer over hard-coding a primitive value.

**Don't** consume primitive tokens directly in a component (`--blue-600`,
`--space-4`, `--duration-normal`). Primitives are the palette the
semantic layer paints from — they are not the API surface for
components.

**Don't** hard-code hex, rem, or px values inside a component stylesheet.
If a value is worth writing, it's worth naming.

### Colors

**Do** use `--color-border-interactive` on any control that's actionable
(inputs, unchecked checkboxes, toggle-outline buttons). It's the only
border token guaranteed to pass WCAG 1.4.11 ≥3:1.

**Do** use `--color-*-strong` for accent/status *text* on neutral
surfaces. The base variants are tuned as *backgrounds*, not as
foreground text on white.

**Do** place `--color-on-X` text on `--color-X` backgrounds. Those pairs
are contrast-tuned together.

**Don't** use `--color-text-faint` for anything the user is supposed to
read. It's for breadcrumb separators, outside-month calendar dates, and
placeholder hints only — reserved as the WCAG-exempt incidental ramp.

**Don't** write `.dark { ... }` overrides. Use `light-dark()` in the
semantic layer instead.

**Don't** invent a new accent color per feature. Lean on the status
family (success/warning/danger/info) or the AI family (`ren-ai`) before
reaching for a primitive hue.

### Typography

**Do** compose from the semantic roles (`body`, `title-md`, `label`,
etc.). Each bundles the right weight, leading, and tracking.

**Do** keep body text at `--body-size` (16px). The browser default
exists for a reason, and accessibility audits check it.

**Don't** drop below `--text-xs` (11px) anywhere in the UI. Apple HIG's
minimum is audited against iOS; the web equivalent is the same rule.

**Don't** pick sizes from the primitive scale in component CSS. Use the
role tokens so density and fluid-type overrides cascade.

### Layout

**Do** snap to the 8pt grid. All spacing should be a multiple of 8 (or a
half-step of 4 for tight groups).

**Do** prefer container queries over viewport media queries when
responsive behavior depends on the component's own width.

**Do** honor the 44px minimum touch target, even when the visual control
is smaller — use padding or `::before` to expand the hit area.

**Don't** use `margin` between siblings when a parent `gap` would do.
Gap respects flow direction and RTL automatically.

**Don't** set fixed widths on text containers unless you're constraining
to `--width-prose` (65ch).

### Elevation & Shapes

**Do** communicate depth with the shadow ladder, not with surface color.
The system is tuned to stay legible in dark mode via the shadow-color
decomposition — you get depth for free.

**Do** match radius to control size. Small controls get `--radius-sm`
(4px); cards get `--radius-lg` (12px); sheets get `--radius-2xl` (20px).

**Don't** mix pill and non-pill shapes within the same component family.
Button groups with one round and three square items look broken.

**Don't** set `z-index` to an arbitrary number. Pick the closest
`--z-*` token — modal, popover, tooltip, etc.

### Motion

**Do** use the semantic durations (`--duration-enter`, `--duration-exit`,
`--duration-tactile`, `--duration-state`). They encode the exit-faster-
than-enter rule.

**Do** pair durations with their matching easing: enter → `--ease-enter`
(decelerate), exit → `--ease-exit` (accelerate), state → `--ease-state-change`
(standard).

**Do** animate via the preset `--transition-*` variables when you need
a composed value — `--transition-tactile`, `--transition-state`,
`--transition-enter`, `--transition-exit`, `--transition-overlay`.

**Don't** write raw durations or easings in a component. The primitive
values exist to back the semantic layer, not for component consumption.

**Don't** add animation that doesn't communicate a state change.
Decorative motion is noise; every transition should answer "what just
became true?".

### Accessibility

**Do** use `:focus-visible`, never `:focus`. Mouse users don't need to
see the ring.

**Do** wire ARIA relationships via `aria-labelledby` /
`aria-describedby` / `aria-errormessage`. Let `ren-field` do this for
forms — it already handles ID generation.

**Do** label every icon-only button with `aria-label`.

**Do** announce dynamic content via `aria-live` — errors, toasts, loading
completions. Polite by default, assertive only when the user must stop
and attend.

**Don't** trap keyboard focus outside of modal dialogs and sheets. Every
other component should let Tab walk out of it.

**Don't** convey state through color alone. Pair danger red with an
icon, a `danger` label, or `aria-invalid`. Same for success green.

**Don't** use `autofocus` outside of modal dialogs. It fights with
screen readers and keyboard users on normal pages.

### Theming

**Do** set themes with `<html data-theme="name">` and honor
`color-scheme: light dark` on `:root`.

**Do** use the `rends/create` generator to derive an AA-safe theme from
a brand hex. It handles strong-variant tuning automatically.

**Don't** override semantic tokens inside a component — override at
`:root` or at a theme scope so every component adopts the change.

**Don't** ship multiple theme CSS files to the browser. RenDS expects one
active theme at a time via `[data-theme]`.

### Reduced motion

**Do** rely on the token-level collapse — every `--duration-*` becomes
`0ms` under `prefers-reduced-motion`, and every component that uses
semantic durations inherits the behavior.

**Don't** add `@media (prefers-reduced-motion: reduce) { animation: none }`
as a patch. If the motion token system is being bypassed, fix that
instead.

### Web components

**Do** keep markup in light DOM. Style components with the host's own
CSS; don't tuck interaction-critical structure inside Shadow DOM.

**Do** expose state via attributes (`data-state`, `aria-expanded`,
`data-loading`) so consumers can style and query without JS.

**Don't** require JS for presentation. Every RenDS component works
visually with JS disabled — behaviors layer on top, they don't gate the
paint.

