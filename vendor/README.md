# Magicast security patch

`magicast-0.5.4-ren10.1.tgz` is a private local derivative of the exact official
Magicast 0.5.4 tarball. It retains upstream's version, exports, implementation and
MIT license. The sole code change removes **all** embedded source-map-js 1.2.1
modules and connects Recast to the external source-map-js dependency, now required
at `^1.2.2`. This adopts the complete upstream consumer, generator and SourceNode
fix rather than patching one loop. No postinstall mutation is used.

Astro 7.3.5 accepts Magicast `^0.5.2`; the local replacement remains 0.5.4.
Root `overrides` selects this artifact only for this repository's dependency
installation. The integration's public peer ranges remain unchanged. Dependencies
are locked with npm's tarball integrity. This directory is not in the core or
Astro package's published file list.

To reproduce, download the official artifact without executing scripts:

```sh
npm pack magicast@0.5.4 --ignore-scripts --pack-destination /tmp
node scripts/vendor-magicast.mjs /tmp/magicast-0.5.4.tgz
```

The generator rejects an upstream integrity mismatch or changed bundle structure.
Re-running it must produce the identical tarball hash. Run the security regression
tests, supply-chain check, clean installation and Astro integration tests after
regeneration. Do not relabel an unpatched upstream tarball as this derivative.

Retire this artifact and override when a compatible official release removes or
updates the embedded copy; inspect the actual tarball, then repeat these checks.
Magicast 0.5.5 still declares an embedded 1.2.1 copy at this review's date.

Source: https://github.com/unjs/magicast/tree/v0.5.4
Fix adopted: https://github.com/7rulnik/source-map-js/commit/cf7658058ceeaa8619d5ae0ec90be6905209d016
Advisory: https://github.com/advisories/GHSA-68fv-2mgg-jv7q

## Braces private security derivative

`braces-3.0.3-ren10.1.tgz` is explicitly named `@ren10/braces`, private, and
based on the integrity-pinned upstream 3.0.3 artifact. It is not an upstream
patched release. All recursive parsing, AST walking, flattening and parent
traversal use a fixed nesting limit of 128. Container-to-scalar coercion and
oversized range argument lists are rejected before native operations.

npm audit cannot assess this private derivative. The zero-advisory result is
not proof of remediation: `test:security-dependencies` exercises the effective
installed code and fast-glob routes, while `check:supply-chain` checks tarball
integrity, source hashes, identity and provenance. The reviewed artifact also
passed the 764 upstream compatibility tests on 13 October 2026.

```sh
npm pack braces@3.0.3 --ignore-scripts --pack-destination /tmp
node scripts/vendor-braces.mjs /tmp/braces-3.0.3.tgz
npm run test:security-dependencies
npm run check:supply-chain
```

Keep both audit commands blocking. Retire this override when a compatible
upstream release addresses GHSA-vfj7-8cjw-p6xm; inspect the artifact and repeat
regression, compatibility, clean-install and full-suite checks. These local
overrides protect this repository's tooling; they do not alter the dependencies
chosen by an external Astro consumer.

http-cache-semantics 4.3.0 is outside npm's advisory range, not a confirmed semantic
patch. Ren10's Astro image-build path uses generated requests and TTL metadata;
it does not pass visitor headers into shared-cache reuse methods. Regression
checks preserve this boundary. Reassess before adding a proxy cache, custom image
fetcher, SSR auth/session caching or forwarding visitor headers. Upstream issue:
https://github.com/kornelski/http-cache-semantics/issues/56
