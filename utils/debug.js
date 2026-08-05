/**
 * RenDS — diagnostics and integration warnings
 * ============================================
 *
 * Two channels, one configuration, one sink:
 *
 * - `renDebug(component, message, details)` — verbose traces. OFF by
 *   default; purely opt-in.
 * - `renWarn(component, message, details)` — integration errors ("the host
 *   markup is missing something the component requires"). ON by default:
 *   these are not diagnostics, they are bugs in the consumer's markup, and
 *   silencing them by default would hide real breakage.
 *
 * With nothing configured, `renWarn` writes to `console.warn` using the
 * plain `"<Component>: <message>"` format — byte for byte what RenDS
 * components have always emitted.
 *
 * Redirect both channels to an application logger:
 *
 *   configureRenDebug({ sink: myLogger });
 *
 * Silence integration warnings — opt-in, e.g. a test suite that fails on
 * unexpected console output:
 *
 *   configureRenDebug({ enabled: false, warnings: false });
 *
 * `configureRenDebug()` replaces the whole configuration: omitted keys fall
 * back to their documented defaults (`enabled: true`, `sink: console`,
 * `warnings: true`), so pass `enabled: false` when you only want to mute
 * warnings without turning traces on. The returned function restores the
 * unconfigured state (traces off, no sink, warnings on).
 *
 * Diagnostics stay local: no network, no storage, no telemetry.
 */

/** Unconfigured state: traces off, no sink, integration warnings on. */
const DEFAULTS = { enabled: false, sink: null, warnings: true };

const state = { ...DEFAULTS };

/**
 * Configure both channels at once.
 * @param {object} [options]
 * @param {boolean} [options.enabled=true] Enable `renDebug` traces.
 * @param {object} [options.sink=console] Logger for both channels.
 * @param {boolean} [options.warnings=true] Emit `renWarn` integration warnings.
 * @returns {() => void} Restores the unconfigured state.
 */
export function configureRenDebug({ enabled = true, sink = console, warnings = true } = {}) {
  state.enabled = Boolean(enabled);
  state.sink = sink;
  state.warnings = Boolean(warnings);
  return () => { Object.assign(state, DEFAULTS); };
}

export function renDebug(component, message, details) {
  if (!state.enabled) return;
  const logger = state.sink?.debug ?? state.sink?.log;
  if (typeof logger === 'function') logger.call(state.sink, `[RenDS:${component}] ${message}`, details ?? '');
}

/**
 * Report an integration error to the consumer.
 *
 * Emits `"<component>: <message>"` — `renWarn('RenTable', 'Missing required
 * table structure')` produces `RenTable: Missing required table structure`.
 *
 * Routing: the configured sink (`warn`, else `error`, else `log`) when it
 * exposes one of those; otherwise `console.warn`. A sink that cannot accept
 * warnings never swallows them.
 *
 * @param {string} component Component name, e.g. `'RenTable'`.
 * @param {string} message What the markup is missing.
 * @param {unknown} [details] Optional extra payload; omitted from output when undefined.
 */
export function renWarn(component, message, details) {
  if (!state.warnings) return;
  const args = details === undefined
    ? [`${component}: ${message}`]
    : [`${component}: ${message}`, details];
  const sink = state.sink;
  const logger = sink?.warn ?? sink?.error ?? sink?.log;
  if (typeof logger === 'function') {
    logger.apply(sink, args);
    return;
  }
  console.warn(...args);
}

export function isRenDebugEnabled() { return state.enabled; }

export function areRenWarningsEnabled() { return state.warnings; }
