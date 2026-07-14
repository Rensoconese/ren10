const root = document.documentElement;
const themeSwitch = document.querySelector('#theme-switch');
const settingsForm = document.querySelector('#settings ren-form');
const settingsStatus = document.querySelector('#settings-status');
const sidebar = document.querySelector('#primary-sidebar');
const mobileNavTrigger = document.querySelector('#mobile-nav-trigger');

function applyTheme(theme) {
  const nextTheme = theme === 'dark' ? 'dark' : 'light';
  root.dataset.theme = nextTheme;
  root.style.colorScheme = nextTheme;
  themeSwitch.checked = nextTheme === 'dark';
}

applyTheme(localStorage.getItem('ren10-reference-theme') || 'light');

themeSwitch.addEventListener('change', () => {
  const theme = themeSwitch.checked ? 'dark' : 'light';
  applyTheme(theme);
  localStorage.setItem('ren10-reference-theme', theme);
});

function syncMobileNavTrigger() {
  mobileNavTrigger.setAttribute('aria-expanded', String(sidebar.hasAttribute('data-open')));
}

mobileNavTrigger.addEventListener('click', () => {
  sidebar.toggleMenu();
  syncMobileNavTrigger();
});

new MutationObserver(syncMobileNavTrigger).observe(sidebar, {
  attributes: true,
  attributeFilter: ['data-open'],
});

settingsForm.addEventListener('ren-submit', (event) => {
  event.preventDefault();
  settingsStatus.textContent = 'Settings saved successfully.';
});
