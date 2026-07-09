const { test, expect } = require('@playwright/test');
const path = require('path');
const ROOT = path.resolve(__dirname, '../..');

test.describe('Lifecycle, reactivity and ARIA contracts', () => {
  test('accordion reconnect does not duplicate toggle events', async ({ page }) => {
    await page.goto(`file://${ROOT}/docs/components.html`);
    const result = await page.evaluate(async () => {
      const host = document.createElement('ren-accordion');
      host.innerHTML = '<details><summary>One</summary><p>Content</p></details>';
      document.body.append(host);
      await customElements.whenDefined('ren-accordion');
      let events = 0;
      host.addEventListener('ren-accordion-change', () => events++);
      host.remove(); document.body.append(host);
      const detail = host.querySelector('details');
      detail.open = true;
      detail.dispatchEvent(new Event('toggle', { bubbles: true }));
      return { events, role: host.className.includes('ren-accordion') };
    });
    expect(result.events).toBe(1);
    expect(result.role).toBeTruthy();
  });

  test('carousel refreshes ARIA relationships when slides are added', async ({ page }) => {
    await page.goto(`file://${ROOT}/docs/components.html`);
    const result = await page.evaluate(async () => {
      const host = document.createElement('ren-carousel');
      host.innerHTML = '<div class="ren-carousel-viewport"><div class="ren-carousel-slide">A</div></div>';
      document.body.append(host);
      await customElements.whenDefined('ren-carousel');
      host.querySelector('.ren-carousel-viewport').append(
        Object.assign(document.createElement('div'), { className: 'ren-carousel-slide', textContent: 'B' })
      );
      await new Promise((resolve) => queueMicrotask(() => setTimeout(resolve, 0)));
      return [...host.querySelectorAll('.ren-carousel-slide')].map((slide) => slide.getAttribute('aria-label'));
    });
    expect(result).toEqual(['Slide 1 of 2', 'Slide 2 of 2']);
  });

  test('carousel clears controls and clamps state when slides are removed', async ({ page }) => {
    await page.goto(`file://${ROOT}/docs/components.html`);
    const result = await page.evaluate(async () => {
      const host = document.createElement('ren-carousel');
      host.innerHTML = '<div class="ren-carousel-viewport"><div class="ren-carousel-slide">A</div><div class="ren-carousel-slide">B</div></div>';
      document.body.append(host);
      await customElements.whenDefined('ren-carousel');
      host.goTo(1);
      host.querySelectorAll('.ren-carousel-slide')[0].remove();
      await new Promise((resolve) => setTimeout(resolve, 10));
      const viewport = host.querySelector('.ren-carousel-viewport');
      [...viewport.querySelectorAll('.ren-carousel-slide')].forEach((slide) => slide.remove());
      await new Promise((resolve) => setTimeout(resolve, 10));
      return { index: host._currentIndex, total: host._totalSlides, current: host.querySelectorAll('[aria-current="true"]').length, controls: host.querySelectorAll('.ren-carousel-dots,.ren-carousel-counter,.ren-carousel-prev,.ren-carousel-next').length };
    });
    expect(result.index).toBe(0);
    expect(result.total).toBe(0);
    expect(result.current).toBe(0);
    expect(result.controls).toBe(0);
  });

  test('carousel disconnects intersection observer when switching to fade', async ({ page }) => {
    await page.goto(`file://${ROOT}/docs/components.html`);
    const observed = await page.evaluate(async () => {
      const host = document.createElement('ren-carousel');
      host.innerHTML = '<div class="ren-carousel-viewport"><div class="ren-carousel-slide">A</div></div>';
      document.body.append(host);
      await customElements.whenDefined('ren-carousel');
      const hadObserver = Boolean(host._intersectionObserver);
      host.setAttribute('fade', '');
      await new Promise((resolve) => setTimeout(resolve, 0));
      return { hadObserver, disconnected: host._intersectionObserver === null };
    });
    expect(observed.hadObserver).toBeTruthy();
    expect(observed.disconnected).toBeTruthy();
  });
});
