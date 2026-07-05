/**
 * RenDS Stylelint configuration
 *
 * Focused on RenDS' two enforcement goals:
 *
 *   1. Component CSS must consume semantic / component tokens, not primitive
 *      palette tokens (`--blue-*`, `--gray-*`, `--red-*`, etc.).
 *   2. Component CSS must not hard-code hex colors.
 *
 * Standard cosmetic rules (formatting, ordering, capitalisation, etc.) are
 * intentionally relaxed. The point is to catch actual token / color
 * violations, not to police whitespace.
 *
 * Token-layer files (`tokens/**`) and design-foundation files (`base/**`)
 * are exempt because they DEFINE the primitives and semantic mappings.
 *
 * A small set of component files are also exempt because they intentionally
 * use primitive tokens or literal colors (color-picker hue gradients, autofill
 * native styling, etc.). Each exemption is
 * documented inline and mirrored in `scripts/lint-tokens.mjs`.
 */

const PRIMITIVE_TOKEN_REGEX = '/var\\(\\s*--(blue|gray|grey|red|green|orange|yellow|teal|purple|pink)-/';

const COLOR_PROPS = '/^(color|background|background-color|fill|stroke|outline|outline-color|caret-color|column-rule-color|text-decoration-color|accent-color|border|border-color|border-(top|right|bottom|left|inline|inline-start|inline-end|block|block-start|block-end)-color|box-shadow|text-shadow|filter|backdrop-filter)$/';

export default {
  extends: ['stylelint-config-standard'],

  // Quiet rules that fire on idiomatic RenDS CSS without adding signal.
  rules: {
    'no-descending-specificity': null,
    'declaration-block-no-redundant-longhand-properties': null,
    'no-duplicate-selectors': null,
    'selector-class-pattern': null,
    'media-feature-range-notation': null,
    'shorthand-property-no-redundant-values': null,
    'alpha-value-notation': null,
    'color-function-notation': null,
    'value-keyword-case': null,
    'property-no-vendor-prefix': null,
    'comment-empty-line-before': null,
    'rule-empty-line-before': null,
    'declaration-empty-line-before': null,
    'at-rule-empty-line-before': null,
    'custom-property-empty-line-before': null,
    'comment-whitespace-inside': null,
    'declaration-block-single-line-max-declarations': null,
    'no-empty-source': null,
    'function-no-unknown': null,
    'at-rule-no-unknown': null,
    'selector-not-notation': null,
    'no-invalid-position-at-import-rule': null,
    'string-no-newline': null,
    'media-query-no-invalid': null,
    'declaration-property-value-no-unknown': null,
    'length-zero-no-unit': null,
    'font-family-name-quotes': null,
    'no-duplicate-at-import-rules': null,
    'import-notation': null,
    'keyframes-name-pattern': null,
    'custom-property-pattern': null,
    'no-unknown-animations': null,
    'number-max-precision': null,
    'declaration-block-no-shorthand-property-overrides': null,
    'declaration-block-no-duplicate-properties': null,
    'block-no-empty': null,
    'keyframe-selector-notation': null,
    'color-hex-length': null,
    'hue-degree-notation': null,
    'declaration-property-value-keyword-no-deprecated': null,
    'selector-pseudo-class-no-unknown': [
      true,
      { ignorePseudoClasses: ['user-invalid', 'user-valid', 'has', 'where', 'is'] },
    ],
    'selector-pseudo-element-no-unknown': [
      true,
      { ignorePseudoElements: ['highlight', 'view-transition-group', 'view-transition-image-pair'] },
    ],
    'function-calc-no-unspaced-operator': null,
    'function-name-case': null,
    'no-unknown-custom-properties': null,
  },

  overrides: [
    // ─────────────────────────────────────────────────────────────
    // Component CSS — strict mode.
    // Block primitive palette tokens and hardcoded hex colors.
    // ─────────────────────────────────────────────────────────────
    {
      files: ['components/**/*.css'],
      rules: {
        'color-no-hex': true,
        'declaration-property-value-disallowed-list': [
          {
            [COLOR_PROPS]: [PRIMITIVE_TOKEN_REGEX],
          },
          {
            message:
              'Use semantic (`--color-*`) or component (`--ren-*`) tokens, not primitive palette tokens. See `tokens/tokens.md`.',
          },
        ],
      },
    },

    // ─────────────────────────────────────────────────────────────
    // Documented exemptions.
    //
    // Each entry records WHY the file is exempt. New exemptions
    // require a colocated comment in the CSS explaining the
    // non-trivial primitive / hex use.
    //
    // Hardening debt (TODO 0.9.x): these are full-file exemptions —
    // a stricter pass should narrow them to per-line / per-block
    // disable comments (`/* stylelint-disable-next-line ... */`) so
    // future additions to these files inherit the strict rule.
    // Keep this list in sync with EXEMPT_FILES in
    // scripts/lint-tokens.mjs.
    // ─────────────────────────────────────────────────────────────
    {
      files: [
        // Hue gradient is a literal RGB color wheel; semantic tokens cannot
        // express the saturated full-spectrum stops.
        'components/composites/ren-color-picker/ren-color-picker.css',

        // Avatar offline indicator uses --gray-400 for a clearly desaturated
        // status dot. No semantic equivalent ("disabled chip on neutral
        // surface") exists.
        'components/primitives/ren-avatar/ren-avatar.css',

        // Danger button hover/active steps use primitive --red-500/--red-600
        // to step down from --color-danger. Preserved for visual parity.
        'components/primitives/ren-button/ren-button.css',

        // Switch checked-hover transitions to --green-500 to maintain the
        // toggle-on tactile color. Visual parity preserved.
        'components/primitives/ren-checkbox/ren-checkbox.css',

        // Autofill / select-option states reach for primitive --blue-* and
        // --gray-* in @supports + browser fallbacks. Native UA painting only
        // reads literal colors here.
        'components/primitives/ren-field/ren-field.css',

        // OTP and number-field validation focus glows use the saturated
        // rgba (255,59,48,0.15) / (52,199,89,0.15) recipe paired with
        // --color-danger / --color-success. Switching to color-mix() would
        // tonally darken the glow in light mode (red-500 #D70015 vs
        // red-400 #FF3B30); preserved for visual parity.
        'components/composites/ren-number-field/ren-number-field.css',
        'components/composites/ren-otp/ren-otp.css',
      ],
      rules: {
        'color-no-hex': null,
        'declaration-property-value-disallowed-list': null,
      },
    },

    // ─────────────────────────────────────────────────────────────
    // Token + base layers — full primitive access by design.
    // ─────────────────────────────────────────────────────────────
    {
      files: ['tokens/**/*.css', 'base/**/*.css'],
      rules: {
        'color-no-hex': null,
        'declaration-property-value-disallowed-list': null,
      },
    },
  ],
};
