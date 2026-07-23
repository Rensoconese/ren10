const messages = [
  {
    meta: 'Elena Ward · Today at 09:42',
    subject: 'Migration question',
    body: [
      'We are moving the settings surface onto the shared layout primitives. Is there a recommended order for replacing the old wrappers?',
      'Our first goal is to preserve keyboard order while the navigation changes.',
    ],
  },
  {
    meta: 'Sam Lee · Today at 09:32',
    subject: 'Keyboard behavior',
    body: [
      'The new project switcher keeps focus visible, but we want to confirm the expected arrow-key order before release.',
      'Should the active workspace update on focus or only after Enter confirms the selection?',
    ],
  },
  {
    meta: 'June Park · Today at 08:42',
    subject: 'Token guidance',
    body: [
      'We are consolidating the editorial templates and found two local spacing values with the same intent.',
      'Which semantic spacing token should own the gap between a section title and its supporting copy?',
    ],
  },
];

const items = [...document.querySelectorAll('[data-inbox-item]')];
const meta = document.querySelector('[data-inbox-meta]');
const subject = document.querySelector('[data-inbox-subject]');
const body = document.querySelector('[data-inbox-body]');

items.forEach((item, index) => {
  item.addEventListener('click', () => {
    const message = messages[index];
    items.forEach((candidate) => {
      candidate.setAttribute('aria-pressed', String(candidate === item));
    });
    meta.textContent = message.meta;
    subject.textContent = message.subject;
    body.replaceChildren(...message.body.map((copy) => {
      const paragraph = document.createElement('p');
      paragraph.textContent = copy;
      return paragraph;
    }));
  });
});
