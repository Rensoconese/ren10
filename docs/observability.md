# Observability and diagnostics

RenDS is silent by default. Applications can opt into lightweight diagnostics:

```js
import { configureRenDebug } from 'ren10/utils';
const stop = configureRenDebug({ enabled: true, sink: console });
// stop() disables diagnostics when leaving a development session.
```

Diagnostics are intentionally local (no network, storage, or telemetry). Use
the package budget checker and browser performance marks in the host app for
FCP, upgrade time, and interaction latency.
