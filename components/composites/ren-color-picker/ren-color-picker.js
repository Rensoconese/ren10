/**
 * RenDS — Color Picker Composite Component
 * ═════════════════════════════════════════════════════════════════════
 *
 * A fully featured, accessible color picker with support for:
 * - HSV/HSB internal color model with conversion to/from HEX, RGB, HSL
 * - Interactive saturation/brightness canvas area
 * - Hue slider with rainbow gradient
 * - Optional alpha/opacity slider
 * - Text inputs for manual color entry (HEX, RGB, HSL)
 * - Preset color swatches
 * - EyeDropper API for screen color picking (when available)
 * - Full keyboard navigation: the saturation/brightness area, the hue slider
 *   and the alpha slider are tab stops with slider semantics (arrows,
 *   Shift+arrows, PageUp/PageDown, Home/End); Tab, Enter and Escape elsewhere
 * - ARIA labels and semantic markup
 * - Smooth Popover API animations
 *
 * Features:
 * - Light DOM, no Shadow DOM
 * - Uses design tokens for all UI chrome
 * - Canvas-based saturation area for accurate color rendering
 * - Real-time color conversion and validation
 * - Custom events: ren-change (committed), ren-input (live)
 * - Automatic sRGB color space handling
 *
 * @example
 * <ren-color-picker
 *   value="#3b82f6"
 *   alpha
 *   format="hex"
 *   swatches="#ef4444,#f97316,#eab308,#22c55e,#3b82f6,#8b5cf6,#ec4899">
 * </ren-color-picker>
 *
 * @fires ren-change - Dispatched when color is committed
 * @fires ren-input - Dispatched during interactive changes
 */

import { createAnchorLink, supportsAnchorPositioning } from '../../../utils/anchor.js';
import { t } from '../../../utils/i18n.js';

/* ═════════════════════════════════════════════════════════════════════
   COLOR CONVERSION UTILITIES
   ═════════════════════════════════════════════════════════════════════ */

/**
 * Convert RGB to HSV (hue, saturation, value/brightness)
 * Handles sRGB color space properly
 * Returns: { h: 0-360, s: 0-100, v: 0-100 }
 */
function rgbToHsv(r, g, b, a = 1) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  let s = 0;
  let v = max;

  if (delta !== 0) {
    s = delta / max;

    if (max === r) {
      h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
    } else if (max === g) {
      h = ((b - r) / delta + 2) / 6;
    } else {
      h = ((r - g) / delta + 4) / 6;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
    a,
  };
}

/**
 * Convert HSV to RGB
 * Inverse of rgbToHsv
 * Accepts: { h: 0-360, s: 0-100, v: 0-100, a: 0-1 }
 * Returns: { r: 0-255, g: 0-255, b: 0-255, a: 0-1 }
 */
function hsvToRgb(h, s, v, a = 1) {
  h = (h % 360) / 60;
  s = s / 100;
  v = v / 100;

  const c = v * s;
  const x = c * (1 - Math.abs((h % 2) - 1));
  const m = v - c;

  let r = 0,
    g = 0,
    b = 0;

  if (h >= 0 && h < 1) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 1 && h < 2) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 2 && h < 3) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 3 && h < 4) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 4 && h < 5) {
    r = x;
    g = 0;
    b = c;
  } else if (h >= 5 && h < 6) {
    r = c;
    g = 0;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
    a,
  };
}

/**
 * Convert RGB to HEX string
 * Returns: "#RRGGBB" or "#RRGGBBAA" if alpha < 1
 */
function rgbToHex(r, g, b, a = 1) {
  const toHex = (n) => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

  if (a < 1) {
    return hex + toHex(a * 255);
  }
  return hex;
}

/**
 * Parse HEX color string to RGB values
 * Accepts: "#RGB", "#RRGGBB", "#RGBA", "#RRGGBBAA"
 * Returns: { r, g, b, a } or null if invalid
 */
function hexToRgb(hex) {
  hex = hex.replace(/^#/, '');

  // Handle shorthand
  if (hex.length === 3 || hex.length === 4) {
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('');
  }

  if (hex.length !== 6 && hex.length !== 8) {
    return null;
  }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const a = hex.length === 8 ? parseInt(hex.substring(6, 8), 16) / 255 : 1;

  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return null;
  }

  return { r, g, b, a };
}

/**
 * Convert RGB to HSL
 * Returns: { h: 0-360, s: 0-100, l: 0-100, a: 0-1 }
 */
function rgbToHsl(r, g, b, a = 1) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));

    if (max === r) {
      h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
    } else if (max === g) {
      h = ((b - r) / delta + 2) / 6;
    } else {
      h = ((r - g) / delta + 4) / 6;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
    a,
  };
}

/**
 * Convert HSL to RGB
 * Accepts: { h: 0-360, s: 0-100, l: 0-100, a: 0-1 }
 * Returns: { r: 0-255, g: 0-255, b: 0-255, a: 0-1 }
 */
function hslToRgb(h, s, l, a = 1) {
  h = (h % 360) / 360;
  s = s / 100;
  l = l / 100;

  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
    a,
  };
}

const COLOR_PICKER_SIDES = new Set(['top', 'right', 'bottom', 'left']);

/** Shift+Arrow and PageUp/PageDown step, in the units of the slider. */
const LARGE_STEP = 10;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function normalizeColorPickerSide(value) {
  const side = String(value || 'bottom').toLowerCase().split('-')[0];

  return COLOR_PICKER_SIDES.has(side) ? side : 'bottom';
}

/* ═════════════════════════════════════════════════════════════════════
   COLOR PICKER WEB COMPONENT
   ═════════════════════════════════════════════════════════════════════ */

export class RenColorPicker extends HTMLElement {
  static observedAttributes = ['placement'];
  static supportsAnchor = supportsAnchorPositioning();

  #isOpen = false;
  #hsv = { h: 0, s: 100, v: 100, a: 1 };
  /**
   * The colour as it was given (a value, a preset, a typed hex), with the
   * model position it maps to. The model holds hue in whole degrees and the
   * other two in whole percents, far fewer positions than there are colours,
   * so a colour read back through it comes out a step away. While the model
   * still sits where that colour put it, #rgb() answers with the colour.
   */
  #given = null;
  #format = 'hex'; // 'hex', 'rgb', 'hsl'
  #saturationCanvas = null;
  #dragState = null;
  #popover = null;
  #trigger = null;
  #anchorLink = null;
  #isDragging = false;
  #listenerController = null;
  /** Preset swatch button → the hex the picker reports once that color is picked. */
  #swatchHex = new WeakMap();

  constructor() {
    super();
    this.handleTriggerClick = this.handleTriggerClick.bind(this);
    this.handleSaturationMouseDown = this.handleSaturationMouseDown.bind(this);
    this.handleHueMouseDown = this.handleHueMouseDown.bind(this);
    this.handleAlphaMouseDown = this.handleAlphaMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleFormatToggle = this.handleFormatToggle.bind(this);
    this.handleSwatchClick = this.handleSwatchClick.bind(this);
    this.handleEyedropper = this.handleEyedropper.bind(this);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'placement' && oldValue !== newValue) {
      this.#syncPlacement();
    }
  }

  connectedCallback() {
    this.#listenerController?.abort();
    this.#listenerController = new AbortController();
    const { signal } = this.#listenerController;

    // ═══ PARSE ATTRIBUTES ═══
    const value = this.getAttribute('value') || '#3b82f6';
    const hasAlpha = this.hasAttribute('alpha');
    const format = this.getAttribute('format') || 'hex';
    const swatches = this.getAttribute('swatches') || '';
    const disabled = this.hasAttribute('disabled');

    this.#format = ['hex', 'rgb', 'hsl'].includes(format) ? format : 'hex';

    // ═══ PARSE INITIAL COLOR ═══
    this.setValue(value);

    // ═══ RENDER TRIGGER ═══
    this.#renderTrigger(disabled);

    // ═══ SET UP EVENT LISTENERS ═══
    if (this.#trigger) {
      this.#trigger.addEventListener('click', this.handleTriggerClick, { signal });
      this.#trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          this.handleTriggerClick();
          e.preventDefault();
        }
      }, { signal });
    }

    // ═══ RENDER DROPDOWN (will be populated on open) ═══
    this.#popover = this.querySelector(':scope > .ren-color-picker-dropdown');
    if (!this.#popover) {
      this.#popover = document.createElement('div');
      this.#popover.className = 'ren-color-picker-dropdown';
      this.appendChild(this.#popover);
    }
    const popoverId = this.#popover.id || `ren-color-picker-${Math.random().toString(36).slice(2)}`;
    this.#popover.id = popoverId;
    this.#popover.setAttribute('popover', 'auto');

    if (this.#trigger) {
      this.#trigger.setAttribute('aria-haspopup', 'dialog');
      this.#trigger.setAttribute('aria-expanded', 'false');
      this.#trigger.setAttribute('popovertarget', popoverId);
    }

    // Trigger and dropdown both exist now — wire their anchor pairing.
    this.#linkAnchor();

    this.#syncPlacement();

    // ═══ POPULATE POPOVER ON OPEN ═══
    this.#popover.addEventListener('toggle', (e) => {
      if (e.newState === 'open') {
        this.#isOpen = true;
        if (this.#trigger) {
          this.#trigger.setAttribute('aria-expanded', 'true');
        }
        this.#renderDropdownContent(hasAlpha, swatches, disabled);
      } else {
        this.#isOpen = false;
        if (this.#trigger) {
          this.#trigger.setAttribute('aria-expanded', 'false');
        }
      }
    }, { signal });
  }

  disconnectedCallback() {
    this.#listenerController?.abort();
    this.#listenerController = null;
    this.#anchorLink?.release();
    this.#anchorLink = null;
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }

  /* ═════════════════════════════════════════════════════════════════
     RENDERING METHODS
     ═════════════════════════════════════════════════════════════════ */

  /**
   * Pair this instance's trigger with its dropdown using a unique anchor name.
   *
   * `anchor-name` is a document-wide identifier: if every trigger declared the
   * same name from the stylesheet, the spec would resolve it to the *last*
   * matching element in tree order and every dropdown on the page would
   * position itself against the final trigger. The name is therefore generated
   * per instance and injected inline. Safe to call again after the trigger or
   * dropdown is rebuilt — the previous pairing is released first.
   */
  #linkAnchor() {
    this.#anchorLink?.release();
    this.#anchorLink = null;

    if (!RenColorPicker.supportsAnchor) return;
    if (!this.#trigger || !this.#popover) return;

    this.#anchorLink = createAnchorLink(this.#trigger, this.#popover, 'ren-color-picker');
  }

  #syncPlacement() {
    const side = normalizeColorPickerSide(this.getAttribute('placement'));

    this.setAttribute('data-side', side);
    if (this.#popover) {
      this.#popover.setAttribute('data-side', side);
    }
  }

  /**
   * Render the trigger button showing the selected color
   */
  #renderTrigger(disabled = false) {
    // Remove existing trigger
    const existing = this.querySelector('.ren-color-picker-trigger');
    if (existing) existing.remove();

    const trigger = document.createElement('button');
    trigger.className = 'ren-color-picker-trigger';
    trigger.type = 'button';
    if (disabled) trigger.disabled = true;

    const rgb = this.#rgb();
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b, rgb.a);

    trigger.innerHTML = `
      <div class="ren-color-picker-trigger-swatch" style="background-color: ${this.#hsvToCss()}"></div>
      <div class="ren-color-picker-trigger-value">${hex}</div>
    `;

    trigger.setAttribute('aria-label', t('colorPicker.trigger', { color: hex }));

    this.insertBefore(trigger, this.#popover);
    this.#trigger = trigger;

    // The old trigger carried the injected anchor name; re-pair the new one.
    // No-op while the dropdown does not exist yet (first pass in
    // connectedCallback, which links explicitly once both are in place).
    this.#linkAnchor();
  }

  /**
   * Render the full dropdown content (called when popover opens)
   */
  #renderDropdownContent(hasAlpha = false, swatches = '', disabled = false) {
    if (!this.#popover) return;

    // Clear existing content
    this.#popover.innerHTML = '';

    // ═══ SATURATION/BRIGHTNESS AREA ═══
    // A two-dimensional slider. ARIA has no 2D role, so it is a slider whose
    // value is the saturation and whose value text names both axes
    // (#updateSaturationHandle keeps them current).
    const saturationContainer = document.createElement('div');
    saturationContainer.className = 'ren-color-picker-saturation';
    saturationContainer.setAttribute('role', 'slider');
    saturationContainer.setAttribute('aria-label', t('colorPicker.saturation'));
    saturationContainer.setAttribute('aria-roledescription', t('colorPicker.area'));
    saturationContainer.setAttribute('aria-valuemin', '0');
    saturationContainer.setAttribute('aria-valuemax', '100');
    saturationContainer.setAttribute('tabindex', '0');

    this.#saturationCanvas = document.createElement('canvas');
    this.#saturationCanvas.className = 'ren-color-picker-saturation-canvas';
    this.#saturationCanvas.width = 240;
    this.#saturationCanvas.height = 240;

    saturationContainer.appendChild(this.#saturationCanvas);

    const handle = document.createElement('div');
    handle.className = 'ren-color-picker-saturation-handle';
    saturationContainer.appendChild(handle);

    this.#drawSaturationCanvas();
    this.#updateSaturationHandle();

    saturationContainer.addEventListener('mousedown', this.handleSaturationMouseDown);
    saturationContainer.addEventListener('keydown', (e) => {
      this.#handleSliderKeydown(e, 'saturation');
    });
    this.#popover.appendChild(saturationContainer);

    // ═══ HUE SLIDER ═══
    const hueContainer = document.createElement('div');
    hueContainer.className = 'ren-color-picker-hue';
    hueContainer.setAttribute('aria-label', t('colorPicker.hue'));
    hueContainer.setAttribute('role', 'slider');
    hueContainer.setAttribute('aria-valuemin', '0');
    hueContainer.setAttribute('aria-valuemax', '360');
    hueContainer.setAttribute('aria-orientation', 'horizontal');
    hueContainer.setAttribute('tabindex', '0');

    const hueHandle = document.createElement('div');
    hueHandle.className = 'ren-color-picker-hue-handle';
    hueContainer.appendChild(hueHandle);

    hueContainer.addEventListener('mousedown', this.handleHueMouseDown);
    hueContainer.addEventListener('keydown', (e) => {
      this.#handleSliderKeydown(e, 'hue');
    });

    // Attach first: #updateHueHandle() finds the track through the dropdown,
    // and it is what positions the thumb and writes aria-valuenow.
    this.#popover.appendChild(hueContainer);
    this.#updateHueHandle();

    // ═══ ALPHA SLIDER (Optional) ═══
    if (hasAlpha) {
      const alphaContainer = document.createElement('div');
      alphaContainer.className = 'ren-color-picker-alpha';
      alphaContainer.setAttribute('aria-label', t('colorPicker.opacity'));
      alphaContainer.setAttribute('role', 'slider');
      alphaContainer.setAttribute('aria-valuemin', '0');
      alphaContainer.setAttribute('aria-valuemax', '100');
      alphaContainer.setAttribute('aria-orientation', 'horizontal');
      alphaContainer.setAttribute('tabindex', '0');

      const alphaGradient = document.createElement('div');
      alphaGradient.className = 'ren-color-picker-alpha-gradient';
      alphaContainer.appendChild(alphaGradient);

      const alphaHandle = document.createElement('div');
      alphaHandle.className = 'ren-color-picker-alpha-handle';
      alphaContainer.appendChild(alphaHandle);

      alphaContainer.addEventListener('mousedown', this.handleAlphaMouseDown);
      alphaContainer.addEventListener('keydown', (e) => {
        this.#handleSliderKeydown(e, 'alpha');
      });

      // Attach first, for the same reason as the hue track.
      this.#popover.appendChild(alphaContainer);
      this.#updateAlphaGradient();
      this.#updateAlphaHandle();
    }

    // ═══ COLOR PREVIEW ═══
    const preview = document.createElement('div');
    preview.className = 'ren-color-picker-preview';

    const swatch = document.createElement('div');
    swatch.className = 'ren-color-picker-preview-swatch';
    swatch.style.backgroundColor = this.#hsvToCss();

    const info = document.createElement('div');
    info.className = 'ren-color-picker-preview-info';

    const label = document.createElement('div');
    label.className = 'ren-color-picker-preview-label';
    label.textContent = t('colorPicker.current');

    const value = document.createElement('div');
    value.className = 'ren-color-picker-preview-value';
    const rgb = this.#rgb();
    value.textContent = rgbToHex(rgb.r, rgb.g, rgb.b, rgb.a);

    info.appendChild(label);
    info.appendChild(value);
    preview.appendChild(swatch);
    preview.appendChild(info);
    this.#popover.appendChild(preview);

    // ═══ TEXT INPUTS SECTION ═══
    const inputsSection = document.createElement('div');
    inputsSection.className = 'ren-color-picker-inputs';

    // Hex input
    const hexInput = document.createElement('input');
    hexInput.className = 'ren-color-picker-hex-input';
    hexInput.type = 'text';
    hexInput.placeholder = '#000000';
    hexInput.value = rgbToHex(rgb.r, rgb.g, rgb.b, rgb.a);
    hexInput.setAttribute('aria-label', t('colorPicker.hexValue'));
    hexInput.disabled = disabled;
    hexInput.addEventListener('change', this.handleInputChange);
    inputsSection.appendChild(hexInput);

    // RGB or HSL channels
    const channelsContainer = document.createElement('div');
    channelsContainer.className = 'ren-color-picker-channels';

    let channels = [];
    if (this.#format === 'rgb') {
      channels = [
        { label: 'R', value: rgb.r, min: 0, max: 255, key: 'r' },
        { label: 'G', value: rgb.g, min: 0, max: 255, key: 'g' },
        { label: 'B', value: rgb.b, min: 0, max: 255, key: 'b' },
      ];
    } else if (this.#format === 'hsl') {
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b, rgb.a);
      channels = [
        { label: 'H', value: hsl.h, min: 0, max: 360, key: 'h' },
        { label: 'S', value: hsl.s, min: 0, max: 100, key: 's' },
        { label: 'L', value: hsl.l, min: 0, max: 100, key: 'l' },
      ];
    } else {
      channels = [
        { label: 'R', value: rgb.r, min: 0, max: 255, key: 'r' },
        { label: 'G', value: rgb.g, min: 0, max: 255, key: 'g' },
        { label: 'B', value: rgb.b, min: 0, max: 255, key: 'b' },
      ];
    }

    channels.forEach(({ label, value, min, max, key }) => {
      const channel = document.createElement('div');
      channel.className = 'ren-color-picker-channel';

      const channelLabel = document.createElement('label');
      channelLabel.className = 'ren-color-picker-channel-label';
      channelLabel.textContent = label;

      const channelInput = document.createElement('input');
      channelInput.className = 'ren-color-picker-channel-input';
      channelInput.type = 'number';
      channelInput.min = min;
      channelInput.max = max;
      channelInput.value = value;
      channelInput.disabled = disabled;
      channelInput.setAttribute('aria-label', `${label} channel`);
      channelInput.addEventListener('change', this.handleInputChange);

      channel.appendChild(channelLabel);
      channel.appendChild(channelInput);
      channelsContainer.appendChild(channel);
    });

    inputsSection.appendChild(channelsContainer);
    this.#popover.appendChild(inputsSection);

    // ═══ CONTROLS (Format Toggle + Eyedropper) ═══
    const controls = document.createElement('div');
    controls.className = 'ren-color-picker-controls';

    const controlsLeft = document.createElement('div');
    controlsLeft.className = 'ren-color-picker-controls-left';

    const formatToggle = document.createElement('button');
    formatToggle.className = 'ren-color-picker-format-toggle';
    formatToggle.type = 'button';
    formatToggle.textContent = this.#format.toUpperCase();
    formatToggle.setAttribute('aria-label', t('colorPicker.formatToggle'));
    formatToggle.disabled = disabled;
    formatToggle.addEventListener('click', this.handleFormatToggle);

    controlsLeft.appendChild(formatToggle);

    // Eyedropper (if available)
    if ('EyeDropper' in window) {
      const eyedropperBtn = document.createElement('button');
      eyedropperBtn.className = 'ren-color-picker-eyedropper';
      eyedropperBtn.type = 'button';
      eyedropperBtn.setAttribute('aria-label', t('colorPicker.eyeDropper'));
      eyedropperBtn.disabled = disabled;

      // Simple eyedropper icon (SVG)
      const icon = document.createElement('span');
      icon.className = 'ren-color-picker-eyedropper-icon';
      icon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L22 12L12 22L2 12Z"></path></svg>`;

      eyedropperBtn.appendChild(icon);
      eyedropperBtn.addEventListener('click', this.handleEyedropper);
      controlsLeft.appendChild(eyedropperBtn);
    }

    controls.appendChild(controlsLeft);
    this.#popover.appendChild(controls);

    // ═══ PRESETS/SWATCHES (Optional) ═══
    if (swatches.trim()) {
      const swatchesContainer = document.createElement('div');
      swatchesContainer.className = 'ren-color-picker-swatches';
      // A label needs a role to hang on.
      swatchesContainer.setAttribute('role', 'group');
      swatchesContainer.setAttribute('aria-label', t('colorPicker.presets'));

      const colors = swatches.split(',').map((s) => s.trim());
      colors.forEach((color) => {
        const swatch = document.createElement('button');
        swatch.className = 'ren-color-picker-swatch';
        swatch.type = 'button';
        swatch.setAttribute('aria-label', t('colorPicker.swatch', { color }));

        const colorDiv = document.createElement('div');
        colorDiv.className = 'ren-color-picker-swatch-color';
        colorDiv.style.backgroundColor = color;

        swatch.appendChild(colorDiv);
        swatch.addEventListener('click', this.handleSwatchClick);
        this.#swatchHex.set(swatch, this.#presetHex(color));

        swatchesContainer.appendChild(swatch);
      });

      this.#popover.appendChild(swatchesContainer);
      this.#updateSwatches();
    }
  }

  /* ═════════════════════════════════════════════════════════════════
     CANVAS & HANDLE UPDATES
     ═════════════════════════════════════════════════════════════════ */

  /**
   * Draw the saturation/brightness canvas
   */
  #drawSaturationCanvas() {
    if (!this.#saturationCanvas) return;

    const ctx = this.#saturationCanvas.getContext('2d');
    const { width, height } = this.#saturationCanvas;

    // Create horizontal gradient: white (left) to hue (right)
    const rgb = hsvToRgb(this.#hsv.h, 100, 100, 1);
    const hueColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

    const hGradient = ctx.createLinearGradient(0, 0, width, 0);
    hGradient.addColorStop(0, 'white');
    hGradient.addColorStop(1, hueColor);

    ctx.fillStyle = hGradient;
    ctx.fillRect(0, 0, width, height);

    // Create vertical gradient overlay: transparent (top) to black (bottom)
    const vGradient = ctx.createLinearGradient(0, 0, 0, height);
    vGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vGradient.addColorStop(1, 'rgba(0, 0, 0, 1)');

    ctx.fillStyle = vGradient;
    ctx.fillRect(0, 0, width, height);
  }

  /**
   * Update saturation handle position
   */
  #updateSaturationHandle() {
    if (!this.#saturationCanvas) return;

    const handle = this.#saturationCanvas.parentElement.querySelector(
      '.ren-color-picker-saturation-handle'
    );
    if (!handle) return;

    const { width, height } = this.#saturationCanvas;
    const x = (this.#hsv.s / 100) * width;
    const y = ((100 - this.#hsv.v) / 100) * height;

    handle.style.left = x + 'px';
    handle.style.top = y + 'px';

    const area = this.#saturationCanvas.parentElement;
    area.setAttribute('aria-valuenow', this.#hsv.s);
    area.setAttribute(
      'aria-valuetext',
      t('colorPicker.areaValue', { saturation: this.#hsv.s, brightness: this.#hsv.v })
    );
  }

  /**
   * Mark the preset that is the current color. aria-current, because
   * aria-selected is not a state a button can carry.
   */
  #updateSwatches() {
    const swatches = this.#popover?.querySelectorAll('.ren-color-picker-swatch');
    if (!swatches || swatches.length === 0) return;

    const rgb = this.#rgb();
    const current = rgbToHex(rgb.r, rgb.g, rgb.b, rgb.a);

    swatches.forEach((swatch) => {
      if (this.#swatchHex.get(swatch) === current) {
        swatch.setAttribute('aria-current', 'true');
      } else {
        swatch.removeAttribute('aria-current');
      }
    });
  }

  /**
   * Put a track thumb at a percentage of its track. The thumb is shifted back
   * by the same share of its own width, so it stays inside the track at both
   * ends: at 100% it would otherwise sit past the edge, where the track's
   * overflow clips it.
   */
  #placeThumb(handle, percent) {
    handle.style.left = percent + '%';
    handle.style.translate = `${-percent}%`;
  }

  /**
   * Update hue handle position
   */
  #updateHueHandle() {
    const hueContainer = this.#popover?.querySelector('.ren-color-picker-hue');
    if (!hueContainer) return;

    const handle = hueContainer.querySelector('.ren-color-picker-hue-handle');
    if (!handle) return;

    const percent = (this.#hsv.h / 360) * 100;
    this.#placeThumb(handle, percent);

    hueContainer.setAttribute('aria-valuenow', this.#hsv.h);
    hueContainer.setAttribute('aria-valuetext', t('colorPicker.hueValue', { value: this.#hsv.h }));
  }

  /**
   * Update alpha gradient and handle
   */
  #updateAlphaGradient() {
    const alphaContainer = this.#popover?.querySelector('.ren-color-picker-alpha');
    if (!alphaContainer) return;

    const gradient = alphaContainer.querySelector('.ren-color-picker-alpha-gradient');
    if (!gradient) return;

    const rgb = this.#rgb();
    const color = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

    gradient.style.background = `linear-gradient(to right, rgba(0,0,0,0), ${color})`;
  }

  /**
   * Update alpha handle position
   */
  #updateAlphaHandle() {
    const alphaContainer = this.#popover?.querySelector('.ren-color-picker-alpha');
    if (!alphaContainer) return;

    const handle = alphaContainer.querySelector('.ren-color-picker-alpha-handle');
    if (!handle) return;

    const percent = this.#hsv.a * 100;
    this.#placeThumb(handle, percent);

    alphaContainer.setAttribute('aria-valuenow', Math.round(percent));
    alphaContainer.setAttribute(
      'aria-valuetext',
      t('colorPicker.opacityValue', { value: Math.round(percent) })
    );
  }

  /* ═════════════════════════════════════════════════════════════════
     EVENT HANDLERS
     ═════════════════════════════════════════════════════════════════ */

  handleTriggerClick(event) {
    event?.preventDefault();
    if (!this.#popover) return;

    try {
      if (this.#popover.matches(':popover-open')) {
        this.#popover.hidePopover?.();
      } else {
        this.#popover.showPopover?.();
      }
    } catch {
      // Native popover can throw if browser state changes mid-click.
    }
  }

  handleSaturationMouseDown(e) {
    e.preventDefault();
    this.#focusSlider(e.currentTarget);
    this.#isDragging = true;
    this.#dragState = { type: 'saturation' };

    this.#updateSaturationFromMouse(e);

    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
  }

  handleHueMouseDown(e) {
    e.preventDefault();
    this.#focusSlider(e.currentTarget);
    this.#isDragging = true;
    this.#dragState = { type: 'hue' };

    this.#updateHueFromMouse(e);

    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
  }

  handleAlphaMouseDown(e) {
    e.preventDefault();
    this.#focusSlider(e.currentTarget);
    this.#isDragging = true;
    this.#dragState = { type: 'alpha' };

    this.#updateAlphaFromMouse(e);

    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
  }

  /**
   * preventDefault() on mousedown (it stops text selection while dragging)
   * also stops the click from focusing the slider, so focus it by hand: a
   * pointer user can then fine-tune with the arrow keys.
   */
  #focusSlider(surface) {
    surface?.focus?.({ preventScroll: true });
  }

  handleMouseMove(e) {
    if (!this.#isDragging || !this.#dragState) return;

    if (this.#dragState.type === 'saturation') {
      this.#updateSaturationFromMouse(e);
    } else if (this.#dragState.type === 'hue') {
      this.#updateHueFromMouse(e);
    } else if (this.#dragState.type === 'alpha') {
      this.#updateAlphaFromMouse(e);
    }
  }

  handleMouseUp(e) {
    this.#isDragging = false;
    this.#dragState = null;

    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);

    this.#emitChange();
  }

  handleInputChange(e) {
    const input = e.target;
    const value = input.value.trim();

    if (input.classList.contains('ren-color-picker-hex-input')) {
      const rgb = hexToRgb(value);
      if (rgb) {
        this.#setFromRgb(rgb);
        this.#updateAllViews();
        this.#emitChange();
      }
    } else if (input.classList.contains('ren-color-picker-channel-input')) {
      this.#updateFromChannelInputs();
      this.#emitChange();
    }
  }

  handleFormatToggle() {
    const formats = ['hex', 'rgb', 'hsl'];
    const currentIndex = formats.indexOf(this.#format);
    this.#format = formats[(currentIndex + 1) % formats.length];

    // Re-render inputs. That rebuilds the whole dropdown, including the button
    // that was just pressed, so focus is put back on its replacement instead
    // of being dropped on <body>.
    const hadFocus = Boolean(this.#popover?.contains(document.activeElement));
    this.#renderDropdownContent(
      this.hasAttribute('alpha'),
      this.getAttribute('swatches') || '',
      this.hasAttribute('disabled')
    );
    if (hadFocus) {
      this.#popover.querySelector('.ren-color-picker-format-toggle')?.focus();
    }
  }

  handleSwatchClick(e) {
    const swatch = e.currentTarget;
    const colorDiv = swatch.querySelector('.ren-color-picker-swatch-color');
    const color = colorDiv.style.backgroundColor;

    this.setValue(color);
    this.#updateAllViews();
    this.#emitChange();
  }

  async handleEyedropper() {
    try {
      const eyeDropper = new EyeDropper();
      const result = await eyeDropper.open();
      this.setValue(result.sRGBHex);
      this.#updateAllViews();
      this.#emitChange();
    } catch {
      // User cancelled or not supported
    }
  }

  /* ═════════════════════════════════════════════════════════════════
     KEYBOARD NAVIGATION
     ═════════════════════════════════════════════════════════════════ */

  /**
   * Keyboard for the three slider surfaces: the saturation/brightness area,
   * the hue slider and the alpha slider.
   *
   * Arrows step by 1, Shift+Arrow and PageUp/PageDown by LARGE_STEP, Home/End
   * jump to the ends. On the two-dimensional area Left/Right (and Home/End)
   * drive saturation, Up/Down (and PageUp/PageDown) drive brightness. On the
   * one-axis sliders Up and PageUp raise the value like Right. Hue is a
   * circle, so its steps wrap around; opacity, saturation and brightness stop
   * at their ends.
   *
   * Each key press emits ren-input and ren-change, like a native range input:
   * a keyboard step is a committed change, there is no drag to end.
   */
  #handleSliderKeydown(e, type) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;

    const step = e.shiftKey ? LARGE_STEP : 1;
    let along = 0; // Left/Right axis
    let across = 0; // Up/Down axis
    let end = null;

    switch (e.key) {
      case 'ArrowRight': along = step; break;
      case 'ArrowLeft': along = -step; break;
      case 'ArrowUp': across = step; break;
      case 'ArrowDown': across = -step; break;
      case 'PageUp': across = LARGE_STEP; break;
      case 'PageDown': across = -LARGE_STEP; break;
      case 'Home': end = 'min'; break;
      case 'End': end = 'max'; break;
      default: return;
    }

    e.preventDefault();

    if (type === 'saturation') {
      if (end) {
        this.#hsv.s = end === 'min' ? 0 : 100;
      } else {
        this.#hsv.s = clamp(this.#hsv.s + along, 0, 100);
        this.#hsv.v = clamp(this.#hsv.v + across, 0, 100);
      }
    } else if (type === 'hue') {
      if (end) {
        this.#hsv.h = end === 'min' ? 0 : 360;
      } else {
        this.#hsv.h = (this.#hsv.h + along + across + 360) % 360;
      }
    } else if (end) {
      this.#hsv.a = end === 'min' ? 0 : 1;
    } else {
      // Whole percents, so repeated steps never drift (0.57000000000000001).
      this.#hsv.a = clamp(Math.round(this.#hsv.a * 100) + along + across, 0, 100) / 100;
    }

    this.#updateAllViews();
    this.#emitInput();
    this.#emitChange();
  }

  /* ═════════════════════════════════════════════════════════════════
     INTERNAL UPDATES
     ═════════════════════════════════════════════════════════════════ */

  #updateSaturationFromMouse(e) {
    if (!this.#saturationCanvas) return;

    const rect = this.#saturationCanvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    this.#hsv.s = Math.round((x / rect.width) * 100);
    this.#hsv.v = Math.round(100 - (y / rect.height) * 100);

    this.#updateAllViews();
    this.#emitInput();
  }

  #updateHueFromMouse(e) {
    const hueContainer = this.#popover?.querySelector('.ren-color-picker-hue');
    if (!hueContainer) return;

    const rect = hueContainer.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    this.#hsv.h = Math.round((x / rect.width) * 360) % 360;

    this.#updateAllViews();
    this.#emitInput();
  }

  #updateAlphaFromMouse(e) {
    const alphaContainer = this.#popover?.querySelector('.ren-color-picker-alpha');
    if (!alphaContainer) return;

    const rect = alphaContainer.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    this.#hsv.a = Math.round((x / rect.width) * 100) / 100;

    this.#updateAllViews();
    this.#emitInput();
  }

  #updateFromChannelInputs() {
    const inputs = this.#popover?.querySelectorAll('.ren-color-picker-channel-input');
    if (!inputs || inputs.length === 0) return;

    const values = Array.from(inputs).map((inp) => parseFloat(inp.value) || 0);

    if (this.#format === 'hsl') {
      const [h, s, l] = values;
      this.#setFromRgb(hslToRgb(h, s, l, this.#hsv.a));
    } else {
      const [r, g, b] = values;
      this.#setFromRgb({ r, g, b, a: this.#hsv.a });
    }

    this.#updateAllViews();
  }

  #updateAllViews() {
    this.#drawSaturationCanvas();
    this.#updateSaturationHandle();
    this.#updateHueHandle();
    this.#updateAlphaGradient();
    this.#updateAlphaHandle();
    this.#updatePreview();
    this.#updateChannelInputs();
    this.#updateHexInput();
    this.#updateTrigger();
    this.#updateSwatches();
  }

  #updatePreview() {
    const preview = this.#popover?.querySelector('.ren-color-picker-preview-swatch');
    const value = this.#popover?.querySelector('.ren-color-picker-preview-value');

    if (preview) {
      preview.style.backgroundColor = this.#hsvToCss();
    }

    if (value) {
      const rgb = this.#rgb();
      value.textContent = rgbToHex(rgb.r, rgb.g, rgb.b, rgb.a);
    }
  }

  #updateHexInput() {
    const input = this.#popover?.querySelector('.ren-color-picker-hex-input');
    if (!input) return;

    const rgb = this.#rgb();
    input.value = rgbToHex(rgb.r, rgb.g, rgb.b, rgb.a);
  }

  #updateChannelInputs() {
    const inputs = this.#popover?.querySelectorAll('.ren-color-picker-channel-input');
    if (!inputs || inputs.length === 0) return;

    const rgb = this.#rgb();

    if (this.#format === 'rgb') {
      const values = [rgb.r, rgb.g, rgb.b];
      Array.from(inputs).forEach((inp, i) => {
        inp.value = values[i];
      });
    } else if (this.#format === 'hsl') {
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b, rgb.a);
      const values = [hsl.h, hsl.s, hsl.l];
      Array.from(inputs).forEach((inp, i) => {
        inp.value = values[i];
      });
    } else {
      const values = [rgb.r, rgb.g, rgb.b];
      Array.from(inputs).forEach((inp, i) => {
        inp.value = values[i];
      });
    }
  }

  #updateTrigger() {
    if (!this.#trigger) return;

    const swatch = this.#trigger.querySelector('.ren-color-picker-trigger-swatch');
    const value = this.#trigger.querySelector('.ren-color-picker-trigger-value');

    if (swatch) {
      swatch.style.backgroundColor = this.#hsvToCss();
    }

    const rgb = this.#rgb();
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b, rgb.a);

    if (value) {
      value.textContent = hex;
    }

    // The accessible name carries the color, so it has to follow it.
    this.#trigger.setAttribute('aria-label', t('colorPicker.trigger', { color: hex }));
  }

  #hsvToCss() {
    const rgb = this.#rgb();
    if (this.#hsv.a < 1) {
      return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`;
    }
    return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  }

  /* ═════════════════════════════════════════════════════════════════
     EVENT DISPATCHERS
     ═════════════════════════════════════════════════════════════════ */

  #emitInput() {
    const rgb = this.#rgb();
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b, rgb.a);
    const rgbStr = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`;
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b, rgb.a);
    const hslStr = `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${hsl.a})`;

    this.dispatchEvent(
      new CustomEvent('ren-input', {
        detail: { hex, rgb: rgbStr, hsl: hslStr, alpha: rgb.a },
        bubbles: true,
        composed: true,
      })
    );
  }

  #emitChange() {
    const rgb = this.#rgb();
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b, rgb.a);
    const rgbStr = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`;
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b, rgb.a);
    const hslStr = `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${hsl.a})`;

    this.dispatchEvent(
      new CustomEvent('ren-change', {
        detail: { hex, rgb: rgbStr, hsl: hslStr, alpha: rgb.a },
        bubbles: true,
        composed: true,
      })
    );
  }

  /* ═════════════════════════════════════════════════════════════════
     PUBLIC API
     ═════════════════════════════════════════════════════════════════ */

  /**
   * Set the color value
   * Accepts: hex string, rgb/rgba string, hsl/hsla string, or color name
   */
  setValue(color) {
    const rgb = this.#parseColor(color);

    if (rgb) {
      this.#setFromRgb(rgb);
    }
  }

  /** Move the model to a colour, and keep the colour itself. */
  #setFromRgb({ r, g, b, a = 1 }) {
    const clampChannel = (n) => Math.min(255, Math.max(0, Math.round(n)));
    const rgb = { r: clampChannel(r), g: clampChannel(g), b: clampChannel(b) };
    this.#hsv = rgbToHsv(rgb.r, rgb.g, rgb.b, a);
    this.#given = { h: this.#hsv.h, s: this.#hsv.s, v: this.#hsv.v, rgb };
  }

  /**
   * The current colour as { r, g, b, a }: the given colour while hue,
   * saturation and brightness are where it put them, the model's own
   * conversion once a control has moved. Opacity is always the model's.
   */
  #rgb() {
    const { h, s, v, a } = this.#hsv;
    const given = this.#given;
    if (given && given.h === h && given.s === s && given.v === v) return { ...given.rgb, a };
    return hsvToRgb(h, s, v, a);
  }

  /**
   * Parse a hex string or any CSS color into { r, g, b, a }; null if it is
   * not a color.
   */
  #parseColor(color) {
    let rgb = null;

    if (typeof color === 'string') {
      // Try to parse as hex
      rgb = hexToRgb(color);

      // If not hex, assume it's rgb/hsl/color name
      if (!rgb) {
        // Use temporary element to parse CSS color
        const div = document.createElement('div');
        div.style.color = color;
        document.body.appendChild(div);
        const computed = getComputedStyle(div).color;
        document.body.removeChild(div);

        // Parse rgb() string
        const match = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (match) {
          rgb = {
            r: parseInt(match[1]),
            g: parseInt(match[2]),
            b: parseInt(match[3]),
            a: match[4] ? parseFloat(match[4]) : 1,
          };
        }
      }
    }

    return rgb;
  }

  /** The hex of a preset's own colour, to compare with the current value. */
  #presetHex(color) {
    const rgb = this.#parseColor(color);
    return rgb ? rgbToHex(rgb.r, rgb.g, rgb.b, rgb.a) : null;
  }

  /**
   * Get the current color value
   * Returns: { hex, rgb, hsl, alpha }
   */
  getValue() {
    const rgb = this.#rgb();
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b, rgb.a);
    const rgbStr = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`;
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b, rgb.a);
    const hslStr = `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${hsl.a})`;

    return {
      hex,
      rgb: rgbStr,
      hsl: hslStr,
      alpha: rgb.a,
    };
  }
}

customElements.define('ren-color-picker', RenColorPicker);
