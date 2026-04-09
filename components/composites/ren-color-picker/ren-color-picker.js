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
 * - Full keyboard navigation (arrow keys, Tab, Enter)
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

/**
 * Validate and normalize hex color string
 */
function normalizeHex(hex) {
  if (typeof hex !== 'string') return null;
  hex = hex.trim();
  if (!hex.startsWith('#')) hex = '#' + hex;
  const result = hexToRgb(hex);
  return result ? rgbToHex(result.r, result.g, result.b, result.a) : null;
}

/* ═════════════════════════════════════════════════════════════════════
   COLOR PICKER WEB COMPONENT
   ═════════════════════════════════════════════════════════════════════ */

export class RenColorPicker extends HTMLElement {
  #isOpen = false;
  #hsv = { h: 0, s: 100, v: 100, a: 1 };
  #format = 'hex'; // 'hex', 'rgb', 'hsl'
  #saturationCanvas = null;
  #dragState = null;
  #popover = null;
  #trigger = null;
  #isDragging = false;

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

  connectedCallback() {
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
      this.#trigger.addEventListener('click', this.handleTriggerClick);
      this.#trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          this.handleTriggerClick();
          e.preventDefault();
        }
      });
    }

    // ═══ RENDER DROPDOWN (will be populated on open) ═══
    const popoverId = `ren-color-picker-${Math.random().toString(36).slice(2)}`;
    this.#popover = document.createElement('div');
    this.#popover.className = 'ren-color-picker-dropdown';
    this.#popover.id = popoverId;
    this.#popover.setAttribute('popover', 'auto');
    this.appendChild(this.#popover);

    if (this.#trigger) {
      this.#trigger.setAttribute('aria-haspopup', 'dialog');
      this.#trigger.setAttribute('aria-expanded', 'false');
      this.#trigger.setAttribute('popovertarget', popoverId);
    }

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
    });
  }

  disconnectCallback() {
    if (this.#trigger) {
      this.#trigger.removeEventListener('click', this.handleTriggerClick);
    }
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }

  /* ═════════════════════════════════════════════════════════════════
     RENDERING METHODS
     ═════════════════════════════════════════════════════════════════ */

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

    const rgb = hsvToRgb(this.#hsv.h, this.#hsv.s, this.#hsv.v, this.#hsv.a);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b, rgb.a);

    trigger.innerHTML = `
      <div class="ren-color-picker-trigger-swatch" style="background-color: ${this.#hsvToCss()}"></div>
      <div class="ren-color-picker-trigger-value">${hex}</div>
    `;

    trigger.setAttribute('aria-label', `Color picker, current color ${hex}`);

    this.insertBefore(trigger, this.#popover);
    this.#trigger = trigger;
  }

  /**
   * Render the full dropdown content (called when popover opens)
   */
  #renderDropdownContent(hasAlpha = false, swatches = '', disabled = false) {
    if (!this.#popover) return;

    // Clear existing content
    this.#popover.innerHTML = '';

    // ═══ SATURATION/BRIGHTNESS AREA ═══
    const saturationContainer = document.createElement('div');
    saturationContainer.className = 'ren-color-picker-saturation';
    saturationContainer.setAttribute('aria-label', 'Color saturation and brightness');

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
    this.#popover.appendChild(saturationContainer);

    // ═══ HUE SLIDER ═══
    const hueContainer = document.createElement('div');
    hueContainer.className = 'ren-color-picker-hue';
    hueContainer.setAttribute('aria-label', 'Color hue');
    hueContainer.setAttribute('role', 'slider');
    hueContainer.setAttribute('aria-valuenow', this.#hsv.h);
    hueContainer.setAttribute('aria-valuemin', '0');
    hueContainer.setAttribute('aria-valuemax', '360');
    hueContainer.setAttribute('aria-orientation', 'horizontal');
    hueContainer.setAttribute('tabindex', '0');

    const hueHandle = document.createElement('div');
    hueHandle.className = 'ren-color-picker-hue-handle';
    hueContainer.appendChild(hueHandle);

    this.#updateHueHandle();

    hueContainer.addEventListener('mousedown', this.handleHueMouseDown);
    hueContainer.addEventListener('keydown', (e) => {
      this.#handleHueKeydown(e, hueContainer);
    });

    this.#popover.appendChild(hueContainer);

    // ═══ ALPHA SLIDER (Optional) ═══
    if (hasAlpha) {
      const alphaContainer = document.createElement('div');
      alphaContainer.className = 'ren-color-picker-alpha';
      alphaContainer.setAttribute('aria-label', 'Color opacity');
      alphaContainer.setAttribute('role', 'slider');
      alphaContainer.setAttribute('aria-valuenow', Math.round(this.#hsv.a * 100));
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

      this.#updateAlphaGradient();
      this.#updateAlphaHandle();

      alphaContainer.addEventListener('mousedown', this.handleAlphaMouseDown);
      alphaContainer.addEventListener('keydown', (e) => {
        this.#handleAlphaKeydown(e, alphaContainer);
      });

      this.#popover.appendChild(alphaContainer);
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
    label.textContent = 'Current';

    const value = document.createElement('div');
    value.className = 'ren-color-picker-preview-value';
    const rgb = hsvToRgb(this.#hsv.h, this.#hsv.s, this.#hsv.v, this.#hsv.a);
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
    hexInput.setAttribute('aria-label', 'Hex color value');
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
    formatToggle.setAttribute('aria-label', 'Toggle color format between HEX, RGB, and HSL');
    formatToggle.disabled = disabled;
    formatToggle.addEventListener('click', this.handleFormatToggle);

    controlsLeft.appendChild(formatToggle);

    // Eyedropper (if available)
    if ('EyeDropper' in window) {
      const eyedropperBtn = document.createElement('button');
      eyedropperBtn.className = 'ren-color-picker-eyedropper';
      eyedropperBtn.type = 'button';
      eyedropperBtn.setAttribute('aria-label', 'Pick color from screen');
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
      swatchesContainer.setAttribute('aria-label', 'Preset color swatches');

      const colors = swatches.split(',').map((s) => s.trim());
      colors.forEach((color) => {
        const swatch = document.createElement('button');
        swatch.className = 'ren-color-picker-swatch';
        swatch.type = 'button';
        swatch.setAttribute('aria-label', `Color ${color}`);

        const colorDiv = document.createElement('div');
        colorDiv.className = 'ren-color-picker-swatch-color';
        colorDiv.style.backgroundColor = color;

        swatch.appendChild(colorDiv);
        swatch.addEventListener('click', this.handleSwatchClick);

        // Check if this is the current color
        const normalized = normalizeHex(color);
        const currentHex = rgbToHex(rgb.r, rgb.g, rgb.b, rgb.a);
        if (normalized === currentHex) {
          swatch.setAttribute('aria-selected', 'true');
        }

        swatchesContainer.appendChild(swatch);
      });

      this.#popover.appendChild(swatchesContainer);
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
    handle.style.left = percent + '%';

    hueContainer.setAttribute('aria-valuenow', this.#hsv.h);
  }

  /**
   * Update alpha gradient and handle
   */
  #updateAlphaGradient() {
    const alphaContainer = this.#popover?.querySelector('.ren-color-picker-alpha');
    if (!alphaContainer) return;

    const gradient = alphaContainer.querySelector('.ren-color-picker-alpha-gradient');
    if (!gradient) return;

    const rgb = hsvToRgb(this.#hsv.h, this.#hsv.s, this.#hsv.v, 1);
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
    handle.style.left = percent + '%';

    alphaContainer.setAttribute('aria-valuenow', Math.round(percent));
  }

  /* ═════════════════════════════════════════════════════════════════
     EVENT HANDLERS
     ═════════════════════════════════════════════════════════════════ */

  handleTriggerClick() {
    if (this.#popover) {
      this.#popover.showPopover?.();
    }
  }

  handleSaturationMouseDown(e) {
    e.preventDefault();
    this.#isDragging = true;
    this.#dragState = { type: 'saturation' };

    this.#updateSaturationFromMouse(e);

    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
  }

  handleHueMouseDown(e) {
    e.preventDefault();
    this.#isDragging = true;
    this.#dragState = { type: 'hue' };

    this.#updateHueFromMouse(e);

    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
  }

  handleAlphaMouseDown(e) {
    e.preventDefault();
    this.#isDragging = true;
    this.#dragState = { type: 'alpha' };

    this.#updateAlphaFromMouse(e);

    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
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
        const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b, rgb.a);
        this.#hsv = hsv;
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

    // Re-render inputs
    this.#renderDropdownContent(
      this.hasAttribute('alpha'),
      this.getAttribute('swatches') || '',
      this.hasAttribute('disabled')
    );
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
    } catch (err) {
      // User cancelled or not supported
    }
  }

  /* ═════════════════════════════════════════════════════════════════
     KEYBOARD NAVIGATION
     ═════════════════════════════════════════════════════════════════ */

  #handleHueKeydown(e, hueContainer) {
    const step = e.shiftKey ? 10 : 1;

    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      this.#hsv.h = (this.#hsv.h + step) % 360;
      this.#updateAllViews();
      this.#emitInput();
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      this.#hsv.h = (this.#hsv.h - step + 360) % 360;
      this.#updateAllViews();
      this.#emitInput();
      e.preventDefault();
    }
  }

  #handleAlphaKeydown(e, alphaContainer) {
    const step = e.shiftKey ? 0.1 : 0.01;

    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      this.#hsv.a = Math.min(1, this.#hsv.a + step);
      this.#updateAllViews();
      this.#emitInput();
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      this.#hsv.a = Math.max(0, this.#hsv.a - step);
      this.#updateAllViews();
      this.#emitInput();
      e.preventDefault();
    }
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

    this.#updateSaturationHandle();
    this.#updateAlphaGradient();
    this.#updatePreview();
    this.#emitInput();
  }

  #updateHueFromMouse(e) {
    const hueContainer = this.#popover?.querySelector('.ren-color-picker-hue');
    if (!hueContainer) return;

    const rect = hueContainer.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    this.#hsv.h = Math.round((x / rect.width) * 360) % 360;

    this.#drawSaturationCanvas();
    this.#updateSaturationHandle();
    this.#updateHueHandle();
    this.#updateAlphaGradient();
    this.#updatePreview();
    this.#updateChannelInputs();
    this.#emitInput();
  }

  #updateAlphaFromMouse(e) {
    const alphaContainer = this.#popover?.querySelector('.ren-color-picker-alpha');
    if (!alphaContainer) return;

    const rect = alphaContainer.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    this.#hsv.a = Math.round((x / rect.width) * 100) / 100;

    this.#updateAlphaHandle();
    this.#updatePreview();
    this.#emitInput();
  }

  #updateFromChannelInputs() {
    const inputs = this.#popover?.querySelectorAll('.ren-color-picker-channel-input');
    if (!inputs || inputs.length === 0) return;

    const values = Array.from(inputs).map((inp) => parseFloat(inp.value) || 0);

    if (this.#format === 'rgb') {
      const [r, g, b] = values;
      const hsv = rgbToHsv(r, g, b, this.#hsv.a);
      this.#hsv = hsv;
    } else if (this.#format === 'hsl') {
      const [h, s, l] = values;
      const rgb = hslToRgb(h, s, l, this.#hsv.a);
      const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b, rgb.a);
      this.#hsv = hsv;
    } else {
      const [r, g, b] = values;
      const hsv = rgbToHsv(r, g, b, this.#hsv.a);
      this.#hsv = hsv;
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
  }

  #updatePreview() {
    const preview = this.#popover?.querySelector('.ren-color-picker-preview-swatch');
    const value = this.#popover?.querySelector('.ren-color-picker-preview-value');

    if (preview) {
      preview.style.backgroundColor = this.#hsvToCss();
    }

    if (value) {
      const rgb = hsvToRgb(this.#hsv.h, this.#hsv.s, this.#hsv.v, this.#hsv.a);
      value.textContent = rgbToHex(rgb.r, rgb.g, rgb.b, rgb.a);
    }
  }

  #updateHexInput() {
    const input = this.#popover?.querySelector('.ren-color-picker-hex-input');
    if (!input) return;

    const rgb = hsvToRgb(this.#hsv.h, this.#hsv.s, this.#hsv.v, this.#hsv.a);
    input.value = rgbToHex(rgb.r, rgb.g, rgb.b, rgb.a);
  }

  #updateChannelInputs() {
    const inputs = this.#popover?.querySelectorAll('.ren-color-picker-channel-input');
    if (!inputs || inputs.length === 0) return;

    const rgb = hsvToRgb(this.#hsv.h, this.#hsv.s, this.#hsv.v, this.#hsv.a);

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

    if (value) {
      const rgb = hsvToRgb(this.#hsv.h, this.#hsv.s, this.#hsv.v, this.#hsv.a);
      value.textContent = rgbToHex(rgb.r, rgb.g, rgb.b, rgb.a);
    }
  }

  #hsvToCss() {
    const rgb = hsvToRgb(this.#hsv.h, this.#hsv.s, this.#hsv.v, this.#hsv.a);
    if (this.#hsv.a < 1) {
      return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`;
    }
    return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  }

  /* ═════════════════════════════════════════════════════════════════
     EVENT DISPATCHERS
     ═════════════════════════════════════════════════════════════════ */

  #emitInput() {
    const rgb = hsvToRgb(this.#hsv.h, this.#hsv.s, this.#hsv.v, this.#hsv.a);
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
    const rgb = hsvToRgb(this.#hsv.h, this.#hsv.s, this.#hsv.v, this.#hsv.a);
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

    if (rgb) {
      this.#hsv = rgbToHsv(rgb.r, rgb.g, rgb.b, rgb.a);
    }
  }

  /**
   * Get the current color value
   * Returns: { hex, rgb, hsl, alpha }
   */
  getValue() {
    const rgb = hsvToRgb(this.#hsv.h, this.#hsv.s, this.#hsv.v, this.#hsv.a);
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
