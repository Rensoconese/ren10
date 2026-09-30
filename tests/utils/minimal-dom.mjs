/** Minimal DOM stand-in for exact-source logic tests, not browser verification. */
export class TestElement extends EventTarget {
  constructor(tag = 'div') {
    super();
    this.tagName = tag.toUpperCase();
    this.attributes = new Map();
    this.children = [];
    this.className = '';
    this.textContent = '';
    this.hidden = false;
    this.style = {};
    if (tag === 'input' || tag === 'button') this.disabled = false;
    if (tag === 'input') this.value = '';
    this.classList = {
      contains: (name) => this.className.split(' ').includes(name),
      remove: (...names) => { this.className = this.className.split(' ').filter((name) => !names.includes(name)).join(' '); },
      add: (...names) => { this.className = [...new Set([...this.className.split(' '), ...names])].filter(Boolean).join(' '); },
    };
  }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  hasAttribute(name) { return this.attributes.has(name); }
  setAttribute(name, value) {
    this.attributes.set(name, String(value));
    if (name === 'id') this.id = String(value);
    if (name === 'class') this.className = String(value);
  }
  removeAttribute(name) { this.attributes.delete(name); }
  toggleAttribute(name, force = !this.hasAttribute(name)) {
    if (force) this.setAttribute(name, '');
    else this.removeAttribute(name);
  }
  appendChild(element) {
    if (element.tagName === '#FRAGMENT') {
      [...element.children].forEach((child) => this.appendChild(child));
    } else {
      element.remove();
      this.children.push(element);
      element.parentElement = this;
    }
    return element;
  }
  append(...elements) { elements.forEach((element) => this.appendChild(element)); }
  insertBefore(element, before) {
    element.remove();
    const index = this.children.indexOf(before);
    if (index < 0) this.children.push(element);
    else this.children.splice(index, 0, element);
    element.parentElement = this;
    return element;
  }
  remove() {
    if (!this.parentElement) return;
    this.parentElement.children = this.parentElement.children.filter((child) => child !== this);
    this.parentElement = null;
  }
  get innerHTML() { return this.children.length ? 'child' : ''; }
  get type() { return this.getAttribute('type') || ''; }
  set type(value) { this.setAttribute('type', value); }
  get name() { return this.getAttribute('name') || ''; }
  set name(value) { this.setAttribute('name', value); }
  contains(element) { return element === this || this.children.some((child) => child.contains(element)); }
  get firstChild() { return this.children[0] || null; }
  matches(selector) {
    return selector.split(',').some((part) => {
      const tag = part.trim().match(/^[a-z][\w-]*/i)?.[0];
      if (tag && this.tagName !== tag.toUpperCase()) return false;
      for (const [, name] of part.matchAll(/\.([\w-]+)/g)) {
        if (!this.classList.contains(name)) return false;
      }
      for (const [, name, value] of part.matchAll(/\[([\w-]+)(?:="([^"]*)")?\]/g)) {
        if (!this.hasAttribute(name) || (value !== undefined && this.getAttribute(name) !== value)) return false;
      }
      return true;
    });
  }
  querySelectorAll(selector) {
    return this.children.flatMap((child) => [
      ...(child.matches(selector) ? [child] : []), ...child.querySelectorAll(selector),
    ]);
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  closest(selector) { return this.matches(selector) ? this : this.parentElement?.closest(selector) || null; }
  focus() { document.activeElement = this; }
  scrollIntoView() {}
}

export function installMinimalDOM() {
  const registry = new Map();
  globalThis.HTMLElement = TestElement;
  globalThis.customElements = { get: (name) => registry.get(name), define: (name, ctor) => registry.set(name, ctor) };
  globalThis.document = new TestElement('document');
  document.documentElement = { lang: 'en' };
  document.createElement = (tag) => new TestElement(tag);
  document.createDocumentFragment = () => new TestElement('#fragment');
}

export function element(tag, attributes = {}, text = '') {
  const node = new TestElement(tag);
  for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
  node.textContent = text;
  return node;
}
export function fire(receiver, type, properties = {}) {
  const event = new Event(type, { cancelable: true });
  for (const [name, value] of Object.entries(properties)) Object.defineProperty(event, name, { value });
  receiver.dispatchEvent(event);
}
export function key(receiver, value) { fire(receiver, 'keydown', { key: value }); }
