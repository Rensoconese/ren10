import 'https://cdn.jsdelivr.net/npm/ren10@0.11.0/components/patterns/ren-sidebar/ren-sidebar.js';
import 'https://cdn.jsdelivr.net/npm/ren10@0.11.0/components/patterns/ren-form/ren-form.js';
import 'https://cdn.jsdelivr.net/npm/ren10@0.11.0/components/primitives/ren-field/ren-field.js';

const root = document.documentElement;
const themeToggle = document.querySelector('#theme-toggle');
const sidebar = document.querySelector('#workspace-sidebar');
const mobileNavToggle = document.querySelector('#mobile-nav-toggle');
const savedTheme = localStorage.getItem('ren10-starter-theme');
const preferredTheme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
const MOBILE_BREAKPOINT = 768;

function syncMobileNavigation() {
  const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
  const isOpen = isMobile && sidebar.isMobileOpen;
  mobileNavToggle.hidden = !isMobile;
  mobileNavToggle.setAttribute('aria-expanded', String(isOpen));
  mobileNavToggle.textContent = isOpen ? 'Close navigation' : 'Open navigation';
}

function scheduleMobileNavigationSync() {
  requestAnimationFrame(syncMobileNavigation);
}

syncMobileNavigation();

mobileNavToggle.addEventListener('click', () => {
  const willOpen = !sidebar.isMobileOpen;
  sidebar.toggleMenu();
  syncMobileNavigation();
  if (willOpen && sidebar.isMobileOpen) {
    sidebar.querySelector('.ren-sidebar-item')?.focus();
  }
});

window.addEventListener('resize', scheduleMobileNavigationSync);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && sidebar.isMobileOpen) {
    requestAnimationFrame(() => {
      syncMobileNavigation();
      mobileNavToggle.focus();
    });
  }
}, { capture: true });

new MutationObserver(syncMobileNavigation).observe(sidebar, {
  attributes: true,
  attributeFilter: ['data-open'],
});

function applyTheme(theme) {
  const isDark = theme === 'dark';
  root.dataset.theme = isDark ? 'dark' : 'light';
  themeToggle.setAttribute('aria-pressed', String(isDark));
  themeToggle.textContent = isDark ? 'Use light theme' : 'Use dark theme';
}

applyTheme(savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : preferredTheme);

themeToggle.addEventListener('click', () => {
  const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme);
  localStorage.setItem('ren10-starter-theme', nextTheme);
});

document.querySelectorAll('.ren-sidebar-nav a').forEach((link) => {
  link.addEventListener('click', () => {
    document.querySelectorAll('.ren-sidebar-nav a').forEach((item) => {
      const isCurrent = item === link;
      item.classList.toggle('active', isCurrent);
      if (isCurrent) item.setAttribute('aria-current', 'page');
      else item.removeAttribute('aria-current');
    });
    requestAnimationFrame(() => {
      syncMobileNavigation();
      if (window.innerWidth < MOBILE_BREAKPOINT) mobileNavToggle.focus();
    });
  });
});

document.querySelector('ren-form').addEventListener('ren-submit', (event) => {
  event.preventDefault();
  document.querySelector('#save-status').textContent = 'Settings saved.';
});
