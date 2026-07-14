/** Lightweight opt-in diagnostics for RenDS consumers. */
const state = { enabled: false, sink: null };

export function configureRenDebug({ enabled = true, sink = console } = {}) {
  state.enabled = Boolean(enabled);
  state.sink = sink;
  return () => { state.enabled = false; state.sink = null; };
}

export function renDebug(component, message, details) {
  if (!state.enabled) return;
  const logger = state.sink?.debug ?? state.sink?.log;
  if (typeof logger === 'function') logger.call(state.sink, `[RenDS:${component}] ${message}`, details ?? '');
}

export function isRenDebugEnabled() { return state.enabled; }
