# Deprecation policy

RenDS deprecations are announced in `CHANGELOG.md`, documented here, and kept
for at least one minor release. A deprecation must include the replacement,
the first version that warns, and the planned removal version. Runtime warnings
are development-only and never change production behavior.

Before removal, update the migration guide, CLI registry, public-contract
checks, GitHub Pages catalog, and the compatibility matrix.
