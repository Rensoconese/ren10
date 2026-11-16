/**
 * A custom element that acquires one of everything the leak tests account for
 * (tests/components/leaks.spec.cjs), so the checks can be checked.
 *
 * With no `leak` attribute it gives everything back on disconnect and must
 * pass. Each word in `leak` makes it forget one release, and the suite must
 * report exactly that resource:
 *
 *   <ren-leaky-fixture leak="interval document-listener"></ren-leaky-fixture>
 *
 * The module also holds one deliberate singleton, a `visibilitychange`
 * listener shared by every instance, to exercise the shared declarations.
 */

/** leak="instance": a module-level reference that keeps removed elements alive. */
const retained = [];

document.addEventListener('visibilitychange', () => {});

class RenLeakyFixture extends HTMLElement {
  connectedCallback() {
    const leaks = new Set((this.getAttribute('leak') ?? '').split(/\s+/).filter(Boolean));
    const releases = [];
    /** Register how to give `kind` back, unless this instance is told to leak it. */
    const owned = (kind, release) => {
      if (!leaks.has(kind)) releases.push(release);
    };
    this._releases = releases;

    // Listeners on targets that outlive the element.
    const onKey = () => {};
    document.addEventListener('keydown', onKey);
    owned('document-listener', () => document.removeEventListener('keydown', onKey));

    const abort = new AbortController();
    window.addEventListener('resize', () => {}, { signal: abort.signal });
    owned('signal-listener', () => abort.abort());

    const media = matchMedia('(min-width: 600px)');
    const onMedia = () => {};
    media.addEventListener('change', onMedia);
    owned('media-listener', () => media.removeEventListener('change', onMedia));

    const onViewport = () => {};
    window.visualViewport.addEventListener('resize', onViewport);
    owned('viewport-listener', () => window.visualViewport.removeEventListener('resize', onViewport));

    // A `once` listener is released by firing, not by removal.
    document.addEventListener('ren-leaky-ready', () => {}, { once: true });
    if (!leaks.has('once-listener')) document.dispatchEvent(new Event('ren-leaky-ready'));

    // A listener on the element itself. Leaving it is harmless when the
    // element goes for good, but connecting again then adds a second one.
    const onClick = () => {};
    this.addEventListener('click', onClick);
    owned('own-listener', () => this.removeEventListener('click', onClick));

    // A node outside the element's subtree that stays in the page.
    const outside = this.nextElementSibling;
    const onOutside = () => {};
    outside?.addEventListener('click', onOutside);
    owned('outside-listener', () => outside?.removeEventListener('click', onOutside));

    // Timers. The short one fires on its own and is never a leak.
    const interval = setInterval(() => {}, 1000);
    owned('interval', () => clearInterval(interval));
    const timeout = setTimeout(() => {}, 60000);
    owned('timeout', () => clearTimeout(timeout));
    setTimeout(() => {}, 20);

    // An animation-frame loop.
    let frame;
    const loop = () => {
      frame = requestAnimationFrame(loop);
    };
    loop();
    owned('frame', () => cancelAnimationFrame(frame));

    // Observers.
    const mutation = new MutationObserver(() => {});
    mutation.observe(this, { childList: true });
    owned('mutation-observer', () => mutation.disconnect());
    const resize = new ResizeObserver(() => {});
    resize.observe(document.body);
    owned('resize-observer', () => resize.disconnect());
    const intersection = new IntersectionObserver(() => {});
    intersection.observe(this);
    owned('intersection-observer', () => intersection.disconnect());

    // Page state: a portal and a scroll lock.
    const portal = document.createElement('div');
    portal.className = 'ren-leaky-portal';
    document.body.append(portal);
    owned('node', () => portal.remove());
    document.body.setAttribute('data-ren-leaky-lock', '');
    owned('attribute', () => document.body.removeAttribute('data-ren-leaky-lock'));

    if (leaks.has('instance')) retained.push(this);
  }

  disconnectedCallback() {
    for (const release of this._releases) release();
    this._releases = [];
  }
}

customElements.define('ren-leaky-fixture', RenLeakyFixture);
