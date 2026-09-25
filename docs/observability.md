# Observability and diagnostics

RenDS has two output channels, with opposite defaults.

## Integration warnings — on by default

When a component cannot find the markup it needs, it says so:

```
RenTable: Missing required table structure
RenTabs: No tablist found
```

These are wiring errors, not traces: the component will not work until the
markup is fixed, so they are loud on purpose. They go to `console.warn` unless
you route them elsewhere.

```js
import { configureRenDebug } from 'ren10/utils';

// Send warnings to your own logger instead of the console.
configureRenDebug({ sink: myLogger });

// Or silence them entirely — opt-in, e.g. for a test suite that treats
// unexpected console output as a failure.
configureRenDebug({ warnings: false });
```

## Debug traces — off by default

Verbose diagnostics stay quiet until you ask for them:

```js
import { configureRenDebug } from 'ren10/utils';
const stop = configureRenDebug({ enabled: true, sink: console });
// stop() restores the defaults when leaving a development session.
```

`configureRenDebug()` replaces the whole configuration: keys you omit fall back
to their defaults. Pass `{ enabled: true }` alone and warnings stay on, which is
what you want; pass `{ warnings: false }` alone and traces stay off.

Both channels share one sink. It is resolved as `sink.warn`, then `sink.error`,
then `sink.log`; a sink exposing none of those falls back to `console.warn`, so
a warning is never swallowed by a misconfigured logger.

Diagnostics are intentionally local (no network, storage, or telemetry). Use
the package budget checker and browser performance marks in the host app for
FCP, upgrade time, and interaction latency.
