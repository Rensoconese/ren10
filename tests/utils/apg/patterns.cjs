// @ts-check
/**
 * What each WAI-ARIA Authoring Practices Guide (APG) pattern requires.
 *
 * Every entry mirrors the two normative sections of its APG page:
 *
 *   rules     "WAI-ARIA Roles, States, and Properties", as declarative rules
 *             the engine evaluates (tests/utils/apg/check-pattern.cjs):
 *               { part, role }                 the part has this role
 *               { part, named }                it has an accessible name
 *               { part, labelled }             ...given by a label, aria-labelledby or aria-label
 *               { part, inside }               it sits inside (or is owned by) another part
 *               { part, attr, oneOf }          a state or property holds one of these values
 *               { part, attr, value, exactly } how many elements hold a value
 *               { part, ref, to, pairwise }    an IDREF points at another part (its own, with pairwise)
 *               { part, attr, tracks: { shown } }  the state follows what is on screen
 *               { check }                      anything else, as a function returning problems
 *             `live: true` re-checks the rule after every key, `optional: true`
 *             skips it when the part is absent, and `text` quotes APG.
 *   keyboard  "Keyboard Interaction", as a script of t.key(id, what APG says,
 *             body) steps. Keys APG marks optional pass { optional: '<claim>' }
 *             and run only for components whose contract claims them.
 *
 * `parts` names the pattern's elements and how to find them, by role or by
 * selector; a component can point a part at its own selector in
 * pattern-map.cjs.
 *
 * Source: https://www.w3.org/WAI/ARIA/apg/patterns/ (text checked 2026-11).
 */
const { expect } = require('@playwright/test');

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/';

/* ── Script helpers ── */

/** Count the click events an element receives from now on (links do not navigate). */
async function countActivations(locator) {
  await locator.evaluate((el) => {
    el.__apgActivations = 0;
    el.addEventListener('click', (event) => {
      el.__apgActivations += 1;
      if (el.closest('a[href]')) event.preventDefault();
    });
  });
  return () => locator.evaluate((el) => el.__apgActivations);
}

/** Index of the focused element within a part, -1 when focus is elsewhere. */
const focusedIndex = (locator) => locator.evaluateAll((els) => els.indexOf(document.activeElement));

/** A numeric state such as aria-valuenow (attribute or native value). */
const numberState = async (t, locator, attr) => Number(await t.state(locator, attr));

/** Elements a keyboard user can Tab to inside a container, in order. */
const tabbableIn = (container) => container.evaluateHandle((root) => {
  const candidates = [...root.querySelectorAll('a[href], button, input, select, textarea, summary, [tabindex]')];
  return candidates.filter((el) => el.tabIndex >= 0 && !el.matches(':disabled') && el.getAttribute('type') !== 'hidden' && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden');
});

/** A label supplied the way APG asks: <label>, aria-labelledby, aria-label, or the native caption/legend. */
const labelProblems = async (t, partName) => {
  const part = t.part(partName);
  const labels = await t.labels(part);
  const sources = await part.evaluateAll((els) => els.map((el) => {
    const byId = (el.getAttribute('aria-labelledby') || '').split(/\s+/).filter(Boolean)
      .map((id) => document.getElementById(id)?.textContent?.trim() || '').join('');
    if (byId) return 'aria-labelledby';
    if ((el.getAttribute('aria-label') || '').trim()) return 'aria-label';
    if (el.labels?.length && [...el.labels].some((label) => label.textContent.trim())) return 'label';
    if (el.localName === 'table' && el.caption?.textContent.trim()) return 'caption';
    if (el.localName === 'fieldset' && el.querySelector(':scope > legend')?.textContent.trim()) return 'legend';
    return null;
  }));
  return sources.flatMap((source, index) => (source ? [] : [`${labels[index]} has no label, aria-labelledby or aria-label`]));
};

/** The landmark role must not be repeated inside the label ("Site Navigation Navigation"). */
const nameAvoids = (partName, word) => async (t) => {
  const part = t.part(partName);
  const labels = await t.labels(part);
  const problems = [];
  for (let i = 0; i < labels.length; i += 1) {
    const repeats = await expect(part.nth(i)).toHaveAccessibleName(new RegExp(`\\b${word}\\b`, 'i'), { timeout: 1 }).then(() => true, () => false);
    if (repeats) problems.push(`${labels[i]} has the word "${word}" in its accessible name`);
  }
  return problems;
};

/** Numeric value properties are present and consistent. */
const valueRangeProblems = (partName, { requireRange }) => async (t) => {
  const part = t.part(partName);
  const labels = await t.labels(part);
  const [now, min, max] = await Promise.all(['aria-valuenow', 'aria-valuemin', 'aria-valuemax'].map((attr) => t.states(part, attr)));
  const problems = [];
  labels.forEach((label, i) => {
    const value = now[i] === null ? NaN : Number(now[i]);
    if (requireRange && (min[i] === null || Number.isNaN(Number(min[i])))) problems.push(`${label} has no numeric aria-valuemin`);
    if (requireRange && (max[i] === null || Number.isNaN(Number(max[i])))) problems.push(`${label} has no numeric aria-valuemax`);
    if (requireRange && Number.isNaN(value)) problems.push(`${label} has no numeric aria-valuenow`);
    if (!Number.isNaN(value) && min[i] !== null && value < Number(min[i])) problems.push(`${label} aria-valuenow ${value} is below aria-valuemin ${min[i]}`);
    if (!Number.isNaN(value) && max[i] !== null && value > Number(max[i])) problems.push(`${label} aria-valuenow ${value} is above aria-valuemax ${max[i]}`);
  });
  return problems;
};

/* ── Shared rule sets and scripts ── */

const dialogRules = (role) => [
  role === 'alertdialog'
    ? { id: 'dialog-role', text: 'The element that contains all elements of the dialog, including the alert message and any dialog buttons, has role alertdialog.', part: 'dialog', role: 'alertdialog' }
    : { id: 'dialog-role', text: 'The element that serves as the dialog container has a role of dialog.', part: 'dialog', role: 'dialog' },
  { id: 'dialog-modal', text: 'The dialog container element has aria-modal set to true.', part: 'dialog', attr: 'aria-modal', oneOf: ['true'] },
  { id: 'dialog-name', text: 'The dialog has either a value set for aria-labelledby that refers to a visible dialog title, or a label specified by aria-label.', part: 'dialog', check: (t) => labelProblems(t, 'dialog') },
];

/** Keyboard interaction of the modal dialog pattern; the alert dialog pattern defers to it. */
async function modalDialogKeyboard(t) {
  const dialog = t.part('dialog');
  const tabbables = await tabbableIn(dialog);
  const count = await tabbables.evaluate((els) => els.length);
  expect(count, 'the dialog has something to Tab to').toBeGreaterThan(0);
  const isFocused = (index) => tabbables.evaluate((els, i) => els.at(i) === document.activeElement, index);
  const focus = (index) => tabbables.evaluate((els, i) => els.at(i).focus(), index);

  await t.key('focus-moves-inside', 'When a dialog opens, focus moves to an element inside the dialog.', async () => {
    await expect.poll(() => dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
  });

  await t.key('tab', 'Tab: Moves focus to the next tabbable element inside the dialog.', async () => {
    if (count < 2) return;
    await focus(0);
    await t.press('Tab');
    await expect.poll(() => isFocused(1)).toBe(true);
  });

  await t.key('tab-wraps', 'Tab: If focus is on the last tabbable element inside the dialog, moves focus to the first tabbable element inside the dialog.', async () => {
    await focus(-1);
    await t.press('Tab');
    await expect.poll(() => isFocused(0)).toBe(true);
  });

  await t.key('shift-tab-wraps', 'Shift + Tab: If focus is on the first tabbable element inside the dialog, moves focus to the last tabbable element inside the dialog.', async () => {
    await focus(0);
    await t.press('Shift+Tab');
    await expect.poll(() => isFocused(-1)).toBe(true);
  });

  await t.key('escape-closes', 'Escape: Closes the dialog.', async () => {
    await t.press('Escape');
    await expect(dialog).toBeHidden();
  });

  await t.key('focus-returns', 'When a dialog closes, focus returns to the element that invoked the dialog.', async () => {
    await expect(t.invoker).toBeFocused();
  });
}

/** Open the dialog from a focused invoker so focus has somewhere to return to. */
async function openDialog(t) {
  await t.before.focus();
  t.invoker = (await t.act('open')) ?? t.before;
  await expect(t.part('dialog')).toBeVisible();
}

/** Keys shared by every `menu`, whether it hangs from a button, a menubar item or a context. */
async function menuKeyboard(t, { menu, open, invoker }) {
  const items = menu.getByRole('menuitem', { includeHidden: true })
    .or(menu.getByRole('menuitemcheckbox', { includeHidden: true }))
    .or(menu.getByRole('menuitemradio', { includeHidden: true }));
  const count = await items.count();
  expect(count, 'the menu has at least two items to move between').toBeGreaterThan(1);

  await t.key('menu-opens-on-first-item', 'When a menu opens, keyboard focus is placed on the first item.', async () => {
    await open();
    await expect(menu).toBeVisible();
    await expect(items.first()).toBeFocused();
  });

  await t.key('menu-down', 'Down Arrow: When focus is in a menu, moves focus to the next item, optionally wrapping from the last to the first.', async () => {
    await t.press('ArrowDown');
    await expect(items.nth(1)).toBeFocused();
  });

  await t.key('menu-up', 'Up Arrow: When focus is in a menu, moves focus to the previous item, optionally wrapping from the first to the last.', async () => {
    await t.press('ArrowUp');
    await expect(items.first()).toBeFocused();
  });

  // Home and End are required only "if arrow key wrapping is not supported".
  await t.press('ArrowUp');
  const wraps = (await focusedIndex(items)) === count - 1;
  if (wraps) await t.press('ArrowDown');
  await expect(items.first()).toBeFocused();
  if (!wraps || t.claims('Home/End')) {
    await t.key('menu-end', 'End: moves focus to the last item in the current menu.', async () => {
      await t.press('End');
      await expect(items.last()).toBeFocused();
    });
    await t.key('menu-home', 'Home: moves focus to the first item in the current menu.', async () => {
      await t.press('Home');
      await expect(items.first()).toBeFocused();
    });
  }

  await t.key('menu-escape', 'Escape: Close the menu that contains focus and return focus to the element or context from which the menu was opened.', async () => {
    await t.press('Escape');
    await expect(menu).toBeHidden();
    await expect(invoker).toBeFocused();
  });

  await t.key('menu-enter', 'Enter: activates the item and closes the menu.', async () => {
    await open();
    const activations = await countActivations(items.first());
    await expect(items.first()).toBeFocused();
    await t.press('Enter');
    await expect.poll(activations).toBe(1);
    await expect(menu).toBeHidden();
  });

  await t.key('menu-tab', 'Tab: When focus is on a menuitem in a menu, move focus out of the menu, and close all menus and submenus.', async () => {
    await open();
    await expect(items.first()).toBeFocused();
    await t.press('Tab');
    await expect(menu).toBeHidden();
    await expect.poll(() => menu.evaluate((el) => el.contains(document.activeElement))).toBe(false);
  });
}

const MENU_ITEMS = '[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]';

const menuRules = [
  { id: 'menu-role', text: 'The element serving as the menu has a role of either menu or menubar.', part: 'menu', role: ['menu', 'menubar'] },
  { id: 'item-role', text: 'The items contained in a menu are child elements of the containing menu or menubar and have role menuitem, menuitemcheckbox or menuitemradio.', part: 'item', role: ['menuitem', 'menuitemcheckbox', 'menuitemradio'], inside: 'container' },
  { id: 'menu-name', text: 'An element with role menu either has aria-labelledby set to a value that refers to the menuitem or button that controls its display, or a label provided by aria-label.', part: 'menu', check: (t) => labelProblems(t, 'menu') },
  {
    id: 'item-tabindex',
    text: 'Each item in the menu has tabindex set to -1, except in a menubar, where the first item has tabindex set to 0.',
    check: async (t) => {
      const problems = [];
      const popupItems = t.part('menu').locator('[role^="menuitem"]');
      const labels = await t.labels(popupItems);
      (await popupItems.evaluateAll((els) => els.map((el) => el.getAttribute('tabindex')))).forEach((tabindex, i) => {
        if (tabindex !== '-1') problems.push(`${labels[i]} in a menu has tabindex=${JSON.stringify(tabindex)}`);
      });
      if (t.pattern.parts.menubar && (await t.part('menubar').count())) {
        const stops = await t.part('menubarItem').evaluateAll((els) => els.filter((el) => el.tabIndex === 0).length);
        if (stops !== 1) problems.push(`${stops} menubar items are tab stops, expected exactly 1`);
      }
      return problems;
    },
    live: true,
  },
];

/* ── Patterns ── */

const PATTERNS = {
  accordion: {
    name: 'Accordion',
    url: `${APG}accordion/`,
    parts: { header: { role: 'button' }, heading: { role: 'heading' } },
    rules: [
      { id: 'header-button', text: 'The title of each accordion header is contained in an element with role button.', part: 'header', role: 'button' },
      { id: 'header-heading', text: 'Each accordion header button is wrapped in an element with role heading that has a value set for aria-level.', part: 'header', inside: 'heading' },
      { id: 'header-expanded', text: 'If the accordion panel associated with an accordion header is visible, the header button element has aria-expanded set to true. If the panel is not visible, aria-expanded is set to false.', part: 'header', attr: 'aria-expanded', tracks: { shown: 'panel' }, live: true },
      { id: 'header-controls', text: 'The accordion header button element has aria-controls set to the ID of the element containing the accordion panel content.', part: 'header', ref: 'aria-controls', to: 'panel', pairwise: true },
    ],
    keyboard: async (t) => {
      const headers = t.part('header');
      const panels = t.part('panel');
      await headers.first().focus();

      await t.key('enter-expands', 'Enter: When focus is on the accordion header for a collapsed panel, expands the associated panel.', async () => {
        await t.press('Enter');
        await expect(panels.first()).toBeVisible();
      });

      await t.key('space-collapses', 'Space: When focus is on the accordion header for an expanded panel, collapses the panel if the implementation supports collapsing.', async () => {
        await t.press('Space');
        await expect(panels.first()).toBeHidden();
      });

      await t.key('space-expands', 'Space: When focus is on the accordion header for a collapsed panel, expands the associated panel.', async () => {
        await t.press('Space');
        await expect(panels.first()).toBeVisible();
      });

      await t.key('tab', 'Tab: Moves focus to the next focusable element; all focusable elements in the accordion are included in the page Tab sequence.', async () => {
        await t.press('Tab');
        await expect(headers.nth(1)).toBeFocused();
      });

      await t.key('single-expand', 'If the implementation allows only one panel to be expanded, and if another panel is expanded, collapses that panel.', async () => {
        await t.press('Enter');
        await expect(panels.nth(1)).toBeVisible();
        await expect(panels.first()).toBeHidden();
      }, { optional: 'one panel at a time' });

      await t.key('shift-tab', 'Shift + Tab: Moves focus to the previous focusable element.', async () => {
        await t.press('Shift+Tab');
        await expect(headers.first()).toBeFocused();
      });
    },
  },

  alert: {
    name: 'Alert',
    url: `${APG}alert/`,
    parts: { alert: { role: 'alert' } },
    // Show it while something else has focus: that is what an alert interrupts.
    prepare: async (t) => {
      await t.before.focus();
      await t.act('show');
      await expect(t.part('alert').first()).toBeVisible();
    },
    rules: [
      { id: 'alert-role', text: 'The widget has a role of alert.', part: 'alert', role: 'alert' },
      {
        id: 'alert-keeps-focus',
        text: 'Because alerts are intended to provide important information without interfering with the user\'s ability to continue working, it is crucial they do not affect keyboard focus.',
        check: async (t) => ((await t.before.evaluate((el) => el === document.activeElement)) ? [] : ['showing the alert moved keyboard focus']),
      },
      {
        id: 'alert-persists',
        text: 'It is also important to avoid designing alerts that disappear automatically.',
        check: async (t) => ((await t.act('dismissesItself')) ? ['the alert dismisses itself'] : []),
      },
    ],
  },

  alertdialog: {
    name: 'Alert and Message Dialogs',
    url: `${APG}alertdialog/`,
    parts: { dialog: { role: 'alertdialog' } },
    prepare: openDialog,
    rules: [
      ...dialogRules('alertdialog'),
      { id: 'dialog-description', text: 'The element with role alertdialog has a value set for aria-describedby that refers to the element containing the alert message.', part: 'dialog', ref: 'aria-describedby', to: 'message' },
    ],
    keyboard: modalDialogKeyboard,
  },

  breadcrumb: {
    name: 'Breadcrumb',
    url: `${APG}breadcrumb/`,
    parts: { landmark: { role: 'navigation' }, link: { role: 'link' } },
    rules: [
      { id: 'trail-in-navigation', text: 'Breadcrumb trail is contained within a navigation landmark region.', part: 'link', inside: 'landmark' },
      { id: 'landmark-label', text: 'The landmark region is labelled via aria-label or aria-labelledby.', part: 'landmark', check: (t) => labelProblems(t, 'landmark') },
      {
        id: 'current-page',
        text: 'The link to the current page has aria-current set to page. If the element representing the current page is not a link, aria-current is optional.',
        check: async (t) => {
          const values = await t.part('landmark').locator('[aria-current]').evaluateAll((els) => els.map((el) => el.getAttribute('aria-current')));
          const problems = values.filter((value) => value !== 'page').map((value) => `an item has aria-current="${value}", expected "page"`);
          if (values.length > 1) problems.push(`${values.length} items claim to be the current page`);
          return problems;
        },
      },
    ],
  },

  button: {
    name: 'Button',
    url: `${APG}button/`,
    parts: { button: { role: 'button' } },
    rules: [
      { id: 'button-role', text: 'The button has role of button.', part: 'button', role: 'button' },
      { id: 'button-name', text: 'The button has an accessible label.', part: 'button', named: true },
      { id: 'toggle-pressed', text: 'If the button is a toggle button, it has an aria-pressed state. When the button is toggled on, the value of this state is true, and when toggled off, the state is false.', part: 'toggle', attr: 'aria-pressed', oneOf: ['true', 'false'], optional: true, live: true },
    ],
    keyboard: async (t) => {
      const button = t.part('button').first();
      const activations = await countActivations(button);
      await button.focus();

      await t.key('space', 'Space: Activates the button.', async () => {
        await t.press('Space');
        await expect.poll(activations).toBe(1);
      });

      await t.key('enter', 'Enter: Activates the button.', async () => {
        await t.press('Enter');
        await expect.poll(activations).toBe(2);
      });

      await t.key('focus-stays', 'If activating the button does not dismiss the current context, then focus typically remains on the button after activation.', async () => {
        await expect(button).toBeFocused();
      });

      if (t.implementation.parts?.toggle) {
        await t.key('toggle', 'When the button is toggled on, the value of aria-pressed is true, and when toggled off, the state is false.', async () => {
          const toggles = t.part('toggle');
          const off = (await t.states(toggles, 'aria-pressed')).indexOf('false');
          expect(off, 'a toggle that is off').toBeGreaterThan(-1);
          // The ARIA state has to match what the component itself reports.
          const reported = async () => t.act('pressed');
          const announced = () => toggles.evaluateAll((els) => els.map((el) => el.getAttribute('aria-pressed') === 'true'));
          await toggles.nth(off).focus();
          await t.press('Space');
          await expect(toggles.nth(off)).toHaveAttribute('aria-pressed', 'true');
          await expect.poll(reported).toEqual(await announced());
          if (t.claims('toggles off')) {
            await t.press('Enter');
            await expect(toggles.nth(off)).toHaveAttribute('aria-pressed', 'false');
            await expect.poll(reported).toEqual(await announced());
          }
        });
      }
    },
  },

  carousel: {
    name: 'Carousel',
    url: `${APG}carousel/`,
    parts: {},
    rules: [
      { id: 'container-role', text: 'A carousel container element that encompasses all components of the carousel has either role region or role group.', part: 'carousel', role: ['region', 'group'] },
      { id: 'container-roledescription', text: 'The carousel container has the aria-roledescription property set to carousel.', part: 'carousel', attr: 'aria-roledescription', oneOf: ['carousel'] },
      { id: 'container-label', text: 'An accessible label is provided by aria-labelledby or aria-label on the carousel container.', part: 'carousel', check: (t) => labelProblems(t, 'carousel') },
      { id: 'container-label-wording', text: 'Since the aria-roledescription is set to "carousel", the label does not contain the word "carousel".', check: nameAvoids('carousel', 'carousel') },
      { id: 'controls-are-buttons', text: 'The rotation control, next slide control, and previous slide control are either native button elements (recommended) or implement the button pattern.', part: 'control', role: 'button', named: true },
      { id: 'slide-role', text: 'Each slide container has role group with the property aria-roledescription set to slide.', part: 'slide', role: 'group', attr: 'aria-roledescription', oneOf: ['slide'] },
      { id: 'slide-label', text: 'Each slide has an accessible name, by aria-labelledby or aria-label on the slide container.', part: 'slide', check: (t) => labelProblems(t, 'slide') },
      { id: 'slide-label-wording', text: 'Since the aria-roledescription is set to "slide", the label does not contain the word "slide".', check: nameAvoids('slide', 'slide') },
      // Grouped carousel: slide picker controls.
      { id: 'picker-group', text: 'The set of slide picker controls is contained in an element with role group, with an accessible label provided by aria-label.', part: 'pickerGroup', role: 'group', named: true, optional: true },
      { id: 'picker-buttons', text: 'Each picker control is a native button element (recommended) or implements the button pattern.', part: 'picker', role: 'button', optional: true },
      {
        id: 'picker-names',
        text: 'The accessible name of each picker button matches the name of the slide it displays.',
        check: async (t) => {
          const pickers = t.part('picker');
          const slideNames = await t.part('slide').evaluateAll((els) => els.map((el) => (el.getAttribute('aria-labelledby') || '').split(/\s+/).filter(Boolean).map((id) => document.getElementById(id)?.textContent.trim()).join(' ') || el.getAttribute('aria-label') || ''));
          const problems = [];
          for (let i = 0; i < (await pickers.count()); i += 1) {
            const matches = await expect(pickers.nth(i)).toHaveAccessibleName(slideNames[i], { timeout: 1 }).then(() => true, () => false);
            if (!matches) problems.push(`picker ${i + 1} is not named "${slideNames[i]}" like its slide`);
          }
          return problems;
        },
      },
      {
        id: 'picker-current',
        text: 'The picker button representing the currently displayed slide has the property aria-disabled set to true.',
        check: async (t) => {
          const current = await t.act('currentSlide');
          const disabled = await t.part('picker').evaluateAll((els) => els.map((el) => el.getAttribute('aria-disabled')));
          return disabled.flatMap((value, i) => ((value === 'true') === (i === current) ? [] : [`picker ${i + 1} has aria-disabled=${JSON.stringify(value)} while slide ${current + 1} is displayed`]));
        },
        live: true,
      },
      {
        id: 'rotation-control',
        text: 'If the carousel can automatically rotate, it has a button for stopping and restarting rotation.',
        check: async (t) => ((await t.act('rotates')) && !(await t.act('hasRotationControl')) ? ['the carousel rotates automatically and has no rotation control'] : []),
      },
    ],
    keyboard: async (t) => {
      const next = t.part('next');
      const previous = t.part('previous');

      if (await t.act('rotates')) {
        await t.key('rotation-stops-on-focus', 'If the carousel has an auto-rotate feature, automatic slide rotation stops when any element in the carousel receives keyboard focus.', async () => {
          await expect.poll(() => t.act('isRotating'), 'the carousel rotates until something stops it').toBe(true);
          await next.focus();
          await expect.poll(() => t.act('isRotating')).toBe(false);
        });

        await t.key('rotation-stays-stopped', 'It does not resume unless the user activates the rotation control.', async () => {
          await t.before.focus();
          expect(await t.act('isRotating'), 'rotation stays stopped after focus leaves the carousel').toBe(false);
        });

        await t.key('rotation-control-first', 'If present, the rotation control is the first element in the Tab sequence inside the carousel. Its label changes to match the action the button will perform.', async () => {
          const control = t.part('rotation');
          await t.tabInto();
          await expect(control).toBeFocused();
          await expect(control).toHaveAccessibleName(/\S/);
          const stopped = await control.getAttribute('aria-label') ?? await control.textContent();
          await t.press('Enter');
          await expect.poll(() => t.act('isRotating')).toBe(true);
          await expect.poll(async () => await control.getAttribute('aria-label') ?? await control.textContent(), 'the label names the next action').not.toBe(stopped);
          await expect(control).toBeFocused();
          await t.press('Space');
          await expect.poll(() => t.act('isRotating')).toBe(false);
        });
      }

      await t.key('tab-sequence', 'Tab and Shift + Tab: Move focus through the interactive elements of the carousel as specified by the page tab sequence -- scripting for Tab is not necessary.', async () => {
        const controls = t.part('control');
        const labels = await t.labels(controls);
        const outOfSequence = (await controls.evaluateAll((els) => els.map((el) => !el.matches(':disabled') && el.tabIndex < 0))).flatMap((out, i) => (out ? [labels[i]] : []));
        expect(outOfSequence, 'every enabled carousel control is in the page Tab sequence').toEqual([]);
        // And nothing in the carousel swallows Tab: it moves on, and back.
        await next.focus();
        await t.press('Tab');
        await expect.poll(() => focusedIndex(controls), 'Tab moves on from the next-slide control to the control after it').toBeGreaterThan(await next.evaluate((el, all) => all.indexOf(el), await controls.elementHandles()));
        await t.press('Shift+Tab');
        await expect(next).toBeFocused();
      });

      await t.key('next-button', 'Button elements implement the keyboard interaction defined in the button pattern: Enter and Space activate the next slide control.', async () => {
        await next.focus();
        const start = await t.act('currentSlide');
        await t.press('Enter');
        await expect.poll(() => t.act('currentSlide')).toBe(start + 1);
      });

      await t.key('controls-keep-focus', 'Activating the rotation control, next slide, and previous slide do not move focus, so users may easily repetitively activate them as many times as desired.', async () => {
        await expect(next).toBeFocused();
      });

      await t.key('previous-button', 'Button elements implement the button pattern: Space activates the previous slide control, and focus stays on it.', async () => {
        // Go one further first, so stepping back does not land on the first slide.
        await t.press('Enter');
        const start = await t.act('currentSlide');
        expect(start, 'the usage has at least three slides').toBeGreaterThan(1);
        await previous.focus();
        await t.press('Space');
        await expect.poll(() => t.act('currentSlide')).toBe(start - 1);
        await expect(previous).toBeFocused();
      });
    },
  },

  checkbox: {
    name: 'Checkbox',
    url: `${APG}checkbox/`,
    parts: { checkbox: { role: 'checkbox' } },
    rules: [
      { id: 'checkbox-role', text: 'The checkbox has role checkbox.', part: 'checkbox', role: 'checkbox' },
      { id: 'checkbox-name', text: 'The checkbox has an accessible label.', part: 'checkbox', named: true },
      { id: 'checkbox-checked', text: 'When checked, the checkbox element has state aria-checked set to true; when not checked, false; when partially checked, mixed.', part: 'checkbox', attr: 'aria-checked', oneOf: ['true', 'false', 'mixed'], live: true },
    ],
    keyboard: async (t) => {
      const checkbox = t.part('checkbox').first();
      await checkbox.focus();
      await expect(checkbox).toBeFocused();
      await t.key('space', 'When the checkbox has focus, pressing the Space key changes the state of the checkbox.', async () => {
        const before = await t.state(checkbox, 'aria-checked');
        await t.press('Space');
        await expect.poll(() => t.state(checkbox, 'aria-checked')).toBe(before === 'true' ? 'false' : 'true');
        await t.press('Space');
        await expect.poll(() => t.state(checkbox, 'aria-checked')).toBe(before);
      });
    },
  },

  combobox: {
    name: 'Combobox',
    url: `${APG}combobox/`,
    parts: { combobox: { role: 'combobox' }, popup: { role: 'listbox' }, option: { role: 'option' } },
    rules: [
      { id: 'combobox-role', text: 'The element that serves as an input and displays the combobox value has role combobox.', part: 'combobox', role: 'combobox' },
      { id: 'combobox-controls', text: 'The combobox element has aria-controls set to a value that refers to the element that serves as the popup.', part: 'combobox', ref: 'aria-controls', to: 'popup' },
      { id: 'popup-role', text: 'The popup is an element that has role listbox, tree, grid, or dialog.', part: 'popup', role: ['listbox', 'tree', 'grid', 'dialog'] },
      { id: 'combobox-expanded', text: 'When the combobox popup is not visible, the element with role combobox has aria-expanded set to false. When the popup element is visible, aria-expanded is set to true.', part: 'combobox', attr: 'aria-expanded', tracks: { shown: 'popup' }, live: true },
      { id: 'combobox-label', text: 'The combobox is labeled using the label element, aria-labelledby, or aria-label.', part: 'combobox', check: (t) => labelProblems(t, 'combobox') },
      { id: 'combobox-autocomplete', text: 'The combobox element has aria-autocomplete set to a value that corresponds to its autocomplete behavior: none, list or both.', part: 'combobox', attr: 'aria-autocomplete', oneOf: ['none', 'list', 'both', null] },
    ],
    keyboard: async (t) => {
      const combobox = t.part('combobox');
      const popup = t.part('popup');
      const options = t.part('option');
      const editable = await combobox.evaluate((el) => el.matches('input, textarea, [contenteditable]'));
      /** The option the user is on: the active descendant, or DOM focus when the component moves it. */
      const activeOption = async () => options.evaluateAll((els, input) => {
        const id = input.getAttribute('aria-activedescendant');
        return els.indexOf(id ? document.getElementById(id) : document.activeElement);
      }, await combobox.elementHandle());

      await t.key('tab-stop', 'Tab: The combobox is in the page Tab sequence. The popup and the popup descendants are excluded from the page Tab sequence.', async () => {
        await t.tabInto();
        await expect(combobox).toBeFocused();
        await t.press('Tab');
        await expect.poll(() => popup.evaluate((el) => el.contains(document.activeElement))).toBe(false);
        await combobox.focus();
      });

      await t.key('down-arrow', 'Down Arrow: If the popup is available, moves focus into the popup: places focus on the first focusable element in the popup.', async () => {
        await t.press('ArrowDown');
        await expect(popup).toBeVisible();
        await expect.poll(activeOption).toBe(0);
      });

      await t.key('focus-stays-on-combobox', 'When a descendant of a listbox popup is focused, DOM focus remains on the combobox and the combobox has aria-activedescendant set to a value that refers to the focused element within the popup.', async () => {
        await expect(combobox).toBeFocused();
        await expect(combobox).toHaveAttribute('aria-activedescendant', await options.first().getAttribute('id') ?? 'an option id');
      });

      await t.key('popup-down', 'Listbox popup, Down Arrow: Moves focus to and selects the next option.', async () => {
        await t.press('ArrowDown');
        await expect.poll(activeOption).toBe(1);
      });

      await t.key('selection-follows-focus', 'Selection follows focus in the listbox: the option that has focus has aria-selected set to true.', async () => {
        await expect(options.nth(1)).toHaveAttribute('aria-selected', 'true');
      });

      await t.key('popup-up', 'Listbox popup, Up Arrow: Moves focus to and selects the previous option.', async () => {
        await t.press('ArrowUp');
        await expect.poll(activeOption).toBe(0);
      });

      await t.key('popup-escape', 'Listbox popup, Escape: Closes the popup and returns focus to the combobox.', async () => {
        await t.press('Escape');
        await expect(popup).toBeHidden();
        await expect(combobox).toBeFocused();
      });

      await t.key('popup-enter', 'Listbox popup, Enter: Accepts the focused option in the listbox by closing the popup, placing the accepted value in the combobox.', async () => {
        await t.press('ArrowDown');
        await expect.poll(activeOption).toBe(0);
        await t.press('ArrowDown');
        await expect.poll(activeOption).toBe(1);
        const accepted = (await options.nth(1).textContent()).trim();
        await t.press('Enter');
        await expect(popup).toBeHidden();
        await expect.poll(() => combobox.evaluate((el) => ('value' in el && typeof el.value === 'string' && el.value ? el.value : el.textContent).trim())).toBe(accepted);
        await expect(options.nth(1), 'the value shown as selected carries aria-selected').toHaveAttribute('aria-selected', 'true');
      });

      if (editable) {
        await t.key('printable-characters', 'Printable Characters: If the combobox is editable, type characters in the combobox. With aria-autocomplete="list" the popup presents values that correspond to the characters typed.', async () => {
          const first = (await options.first().textContent()).trim();
          await combobox.fill('');
          await t.page.keyboard.type(first.slice(0, 2));
          await expect(combobox).toHaveValue(first.slice(0, 2));
          if ((await combobox.getAttribute('aria-autocomplete')) === 'list') {
            await expect(popup).toBeVisible();
            await expect(options.filter({ hasText: first }).first()).toBeVisible();
            await expect(options.filter({ hasNotText: first.slice(0, 2) }).filter({ visible: true })).toHaveCount(0);
          }
          await t.press('Escape');
          await expect(popup).toBeHidden();
        });
      }
    },
  },

  dialog: {
    name: 'Dialog (Modal)',
    url: `${APG}dialog-modal/`,
    parts: { dialog: { role: 'dialog' } },
    prepare: openDialog,
    rules: dialogRules('dialog'),
    keyboard: modalDialogKeyboard,
  },

  disclosure: {
    name: 'Disclosure (Show/Hide)',
    url: `${APG}disclosure/`,
    parts: { button: { role: 'button' } },
    rules: [
      { id: 'button-role', text: 'The element that shows and hides the content has role button.', part: 'button', role: 'button' },
      { id: 'button-expanded', text: 'When the content is visible, the element with role button has aria-expanded set to true. When the content area is hidden, it is set to false.', part: 'button', attr: 'aria-expanded', tracks: { shown: 'content' }, live: true },
      {
        id: 'button-controls',
        text: 'Optionally, the element with role button has a value specified for aria-controls that refers to the element that contains all the content that is shown or hidden.',
        check: async (t) => {
          const button = t.part('button');
          if ((await button.getAttribute('aria-controls')) === null) return [];
          const content = await t.part('content').first().elementHandle();
          const holds = await button.evaluate((el, shown) => (el.getAttribute('aria-controls') || '').split(/\s+/).some((id) => document.getElementById(id)?.contains(shown)), content);
          return holds ? [] : ['aria-controls does not refer to the element that contains the content'];
        },
      },
    ],
    keyboard: async (t) => {
      const button = t.part('button');
      const content = t.part('content').first();
      const startsShown = await t.isShown(content);
      for (const key of ['Enter', 'Space']) {
        await t.key(key.toLowerCase(), `${key}: activates the disclosure control and toggles the visibility of the disclosure content.`, async () => {
          await button.focus();
          await t.press(key);
          await t.expectShown(content, !startsShown, `${key} ${startsShown ? 'hides' : 'shows'} the content`);
          // A panel that takes focus when it opens does so a frame or a timer
          // later. Wait for that move before going back to the button, or it
          // would land between the focus and the key.
          if (t.claims('moves focus into the content') && !startsShown) {
            await expect.poll(() => content.evaluate((el) => el.contains(document.activeElement)), 'opening moves focus into the content').toBe(true);
          }
          await button.focus();
          await t.press(key);
          await t.expectShown(content, startsShown, `${key} again ${startsShown ? 'shows' : 'hides'} the content`);
        });
      }
    },
  },

  grid: {
    name: 'Grid',
    url: `${APG}grid/`,
    parts: { grid: { role: 'grid' }, row: { role: 'row' }, columnheader: { role: 'columnheader' }, gridcell: { role: 'gridcell' } },
    rules: [
      { id: 'grid-role', text: 'The grid container has role grid.', part: 'grid', role: 'grid' },
      { id: 'row-role', text: 'Each row container has role row and is either a DOM descendant of or owned by the grid element or an element with role rowgroup.', part: 'row', role: 'row', inside: 'grid' },
      { id: 'cell-role', text: 'Each cell is a DOM descendant of or owned by a row element and has role gridcell when it does not contain column or row header information.', part: 'gridcell', role: 'gridcell', inside: 'row' },
      { id: 'columnheader-role', text: 'Each cell that contains a title or header information for the column has role columnheader and is a descendant of a row.', part: 'columnheader', role: 'columnheader', inside: 'row', optional: true },
      { id: 'grid-label', text: 'If there is an element in the user interface that serves as a label for the grid, aria-labelledby is set on the grid element. Otherwise, a label is specified for the grid element using aria-label.', part: 'grid', check: (t) => labelProblems(t, 'grid') },
      {
        id: 'one-tab-stop',
        text: 'Only one element in the entire grid is included in the tab sequence.',
        check: async (t) => {
          const stops = await t.part('grid').first().evaluate((grid) => [...grid.querySelectorAll('*')].filter((el) => el.tabIndex >= 0 && !el.matches(':disabled')).length);
          return stops === 1 ? [] : [`${stops} elements in the grid are tab stops`];
        },
        live: true,
      },
      {
        id: 'cell-selected',
        text: 'If the grid supports selection, when a cell or row is selected, the selected element has aria-selected set true.',
        check: async (t) => {
          const selected = await t.act('selectedCells');
          const marked = await t.part('gridcell').evaluateAll((els) => els.flatMap((el, i) => (el.getAttribute('aria-selected') === 'true' ? [i] : [])));
          return JSON.stringify(selected) === JSON.stringify(marked) ? [] : [`cells ${JSON.stringify(marked)} have aria-selected="true" while the component reports ${JSON.stringify(selected)} as selected`];
        },
        live: true,
      },
    ],
    keyboard: async (t) => {
      const grid = t.part('grid').first();
      /** [row, column] of the focused cell, counting only rows that hold gridcells. */
      const position = () => grid.evaluate((root) => {
        const rows = [...root.querySelectorAll('[role="row"], tr')].map((row) => [...row.querySelectorAll('[role="gridcell"], td')]).filter((cells) => cells.length);
        const holds = (cell) => cell === document.activeElement || cell.contains(document.activeElement);
        const row = rows.findIndex((cells) => cells.some(holds));
        return row === -1 ? null : [row, rows[row].findIndex(holds), rows[row].length];
      });

      // The keys apply "when an element in the grid has received focus": start
      // on the grid's single tab stop.
      await grid.locator('[tabindex="0"]').focus();
      const [row, column] = await position() ?? [];
      expect(row, 'the grid\'s tab stop is one of its cells').not.toBeUndefined();

      await t.key('right-arrow', 'Right Arrow: Moves focus one cell to the right.', async () => {
        await t.press('ArrowRight');
        await expect.poll(async () => (await position())?.slice(0, 2)).toEqual([row, column + 1]);
      });
      await t.key('down-arrow', 'Down Arrow: Moves focus one cell down.', async () => {
        await t.press('ArrowDown');
        await expect.poll(async () => (await position())?.slice(0, 2)).toEqual([row + 1, column + 1]);
      });
      await t.key('left-arrow', 'Left Arrow: Moves focus one cell to the left.', async () => {
        await t.press('ArrowLeft');
        await expect.poll(async () => (await position())?.slice(0, 2)).toEqual([row + 1, column]);
      });
      await t.key('up-arrow', 'Up Arrow: Moves focus one cell up.', async () => {
        await t.press('ArrowUp');
        await expect.poll(async () => (await position())?.slice(0, 2)).toEqual([row, column]);
      });
      await t.key('end', 'End: moves focus to the last cell in the row that contains focus.', async () => {
        await t.press('End');
        await expect.poll(async () => { const at = await position(); return at && [at[0], at[1] === at[2] - 1]; }).toEqual([row, true]);
      });
      await t.key('home', 'Home: moves focus to the first cell in the row that contains focus.', async () => {
        await t.press('Home');
        await expect.poll(async () => (await position())?.slice(0, 2)).toEqual([row, 0]);
      });
      await t.key('select', 'When a cell is selected, the selected element has aria-selected set true.', async () => {
        await t.press('ArrowRight');
        await t.press('Enter');
        await expect.poll(() => grid.evaluate(() => document.activeElement?.getAttribute('aria-selected'))).toBe('true');
      }, { optional: 'selection' });
    },
  },

  landmarks: {
    name: 'Landmarks',
    url: `${APG}landmarks/`,
    parts: { landmark: { role: 'navigation' } },
    // A component ships into pages that already have navigation: add one, so
    // the "more than one of the same role" rule applies as it will in use.
    prepare: (t) => t.page.evaluate(() => document.body.insertAdjacentHTML('beforeend', '<nav aria-label="Site"><a href="#apg">Other</a></nav>')),
    rules: [
      { id: 'landmark-role', text: 'Use the HTML nav element (or role="navigation") to define a navigation landmark.', part: 'landmark', role: 'navigation' },
      {
        id: 'landmark-unique-label',
        text: 'If a specific landmark role is used more than once on a page, provide each instance of that landmark with a unique label.',
        check: async (t) => {
          const all = t.page.getByRole('navigation');
          const problems = await labelProblems({ part: () => all, labels: (locator) => t.labels(locator) }, 'landmark');
          const names = await all.evaluateAll((els) => els.map((el) => (el.getAttribute('aria-labelledby') || '').split(/\s+/).filter(Boolean).map((id) => document.getElementById(id)?.textContent.trim()).join(' ') || el.getAttribute('aria-label') || ''));
          const repeated = names.filter((name, i) => name && names.indexOf(name) !== i);
          if (repeated.length) problems.push(`navigation landmarks share the label "${repeated[0]}"`);
          return problems;
        },
      },
      { id: 'landmark-label-wording', text: 'Do not use the landmark role as part of the label: a navigation landmark labelled "Site Navigation" is announced as "Site Navigation Navigation".', check: nameAvoids('landmark', 'navigation') },
    ],
  },

  link: {
    name: 'Link',
    url: `${APG}link/`,
    parts: { link: { role: 'link' } },
    rules: [
      { id: 'link-role', text: 'The element containing the link text or graphic has role of link.', part: 'link', role: 'link' },
    ],
    keyboard: async (t) => {
      const link = t.part('link').first();
      const activations = await countActivations(link);
      await link.focus();
      await expect(link).toBeFocused();
      await t.key('enter', 'Enter: Executes the link.', async () => {
        await t.press('Enter');
        await expect.poll(activations).toBe(1);
      });
    },
  },

  listbox: {
    name: 'Listbox',
    url: `${APG}listbox/`,
    parts: { listbox: { role: 'listbox' }, option: { role: 'option' } },
    prepare: (t) => t.implementation.actions?.open?.(t),
    rules: [
      { id: 'listbox-role', text: 'An element that contains or owns all the listbox options has role listbox.', part: 'listbox', role: 'listbox' },
      { id: 'option-role', text: 'Each option in the listbox has role option and is contained in or owned by the element with role listbox.', part: 'option', role: 'option', inside: 'listbox' },
      { id: 'listbox-label', text: 'If the element with role listbox is not part of another widget, such as a combobox, then it has either a visible label referenced by aria-labelledby or a value specified for aria-label.', part: 'listbox', check: (t) => (t.claims('part of a combobox') ? [] : labelProblems(t, 'listbox')) },
      {
        id: 'option-selected',
        text: 'Each selected option has either aria-selected or aria-checked set to true. All options that are selectable but not selected have either aria-selected or aria-checked set to false.',
        check: async (t) => {
          const options = t.part('option');
          const labels = await t.labels(options);
          const [selected, checked] = [await t.states(options, 'aria-selected'), await t.states(options, 'aria-checked')];
          return labels.flatMap((label, i) => (['true', 'false'].includes(selected[i] ?? checked[i]) ? [] : [`${label} has neither aria-selected nor aria-checked set to true or false`]));
        },
        live: true,
      },
      {
        id: 'single-selection',
        text: 'No more than one option is selected at a time if the element with role listbox does not have aria-multiselectable set to true.',
        check: async (t) => {
          if ((await t.part('listbox').first().getAttribute('aria-multiselectable')) === 'true') return [];
          const selected = (await t.states(t.part('option'), 'aria-selected')).filter((value) => value === 'true').length;
          return selected > 1 ? [`${selected} options are selected in a single-select listbox`] : [];
        },
        live: true,
      },
    ],
    keyboard: async (t) => {
      const options = t.part('option');

      await t.key('focus-on-entry', 'When a single-select listbox receives focus: if none of the options are selected, the first option receives focus; if an option is selected, focus is set on the selected option.', async () => {
        await t.act('focusListbox');
        const selected = (await t.states(options, 'aria-selected')).indexOf('true');
        await expect.poll(() => focusedIndex(options)).toBe(Math.max(selected, 0));
      });

      await t.key('down-arrow', 'Down Arrow: Moves focus to the next option.', async () => {
        const start = await focusedIndex(options);
        await t.press('ArrowDown');
        await expect.poll(() => focusedIndex(options)).toBe(start + 1);
      });

      await t.key('up-arrow', 'Up Arrow: Moves focus to the previous option.', async () => {
        const start = await focusedIndex(options);
        await t.press('ArrowUp');
        await expect.poll(() => focusedIndex(options)).toBe(start - 1);
      });

      // A popup listbox is not in the page Tab sequence; a standing one is
      // entered and left with Tab like any other widget.
      if (!t.claims('part of a combobox')) {
        await t.key('focus-on-reentry', 'When a single-select listbox receives focus (here: coming back with Shift + Tab): if none of the options are selected, the first option receives focus; if an option is selected, focus is set on the selected option.', async () => {
          const selected = (await t.states(options, 'aria-selected')).indexOf('true');
          await t.press('ArrowDown');
          await t.press('Tab');
          await expect.poll(() => focusedIndex(options), 'Tab leaves the listbox').toBe(-1);
          await t.press('Shift+Tab');
          await expect.poll(() => focusedIndex(options)).toBe(Math.max(selected, 0));
        });
      }

      await t.key('end', 'End (Optional): Moves focus to last option.', async () => {
        await t.press('End');
        await expect(options.last()).toBeFocused();
      }, { optional: 'Home/End' });

      await t.key('home', 'Home (Optional): Moves focus to first option.', async () => {
        await t.press('Home');
        await expect(options.first()).toBeFocused();
      }, { optional: 'Home/End' });
    },
  },

  menu: {
    name: 'Menu and Menubar',
    url: `${APG}menubar/`,
    parts: { menu: { role: 'menu' }, item: { selector: MENU_ITEMS }, container: { selector: '[role="menu"]' } },
    rules: menuRules,
    keyboard: async (t) => {
      await menuKeyboard(t, { menu: t.part('menu'), open: () => t.act('open'), invoker: t.part('invoker') });
    },
  },

  menubar: {
    name: 'Menu and Menubar',
    url: `${APG}menubar/`,
    parts: {
      menubar: { role: 'menubar' },
      menu: { role: 'menu' },
      item: { selector: MENU_ITEMS },
      container: { selector: '[role="menubar"], [role="menu"]' },
      menubarItem: { selector: '[role="menubar"] > [role^="menuitem"]' },
    },
    rules: [
      { id: 'menubar-role', text: 'The element serving as the menu has a role of either menu or menubar.', part: 'menubar', role: 'menubar' },
      ...menuRules,
      { id: 'menubar-label', text: 'If a menubar has a visible label, the element with role menubar has aria-labelledby set to a value that refers to the labelling element. Otherwise, the menubar element has a label provided by aria-label.', part: 'menubar', check: (t) => labelProblems(t, 'menubar') },
      { id: 'parent-haspopup', text: 'A parent menuitem has aria-haspopup set to either menu or true.', part: 'menubarItem', attr: 'aria-haspopup', oneOf: ['menu', 'true'] },
      { id: 'parent-expanded', text: 'A parent menuitem has aria-expanded set to false when its child menu is not visible and set to true when the child menu is visible.', part: 'menubarItem', attr: 'aria-expanded', tracks: { shown: 'menu' }, live: true },
      {
        id: 'submenu-position',
        text: 'A submenu\'s menu element is contained inside the same menu element as its parent menuitem and is the sibling element immediately following its parent menuitem.',
        check: async (t) => {
          const parents = t.part('menubarItem');
          const labels = await t.labels(parents);
          const follows = await parents.evaluateAll((els) => els.map((el) => el.nextElementSibling?.getAttribute('role') === 'menu'));
          return follows.flatMap((ok, i) => (ok ? [] : [`${labels[i]} is not immediately followed by its menu`]));
        },
      },
    ],
    keyboard: async (t) => {
      const bar = t.part('menubarItem');
      const menus = t.part('menu');
      const itemsOf = (menu) => menu.locator('[role^="menuitem"]');
      const barCount = await bar.count();
      expect(barCount, 'the menubar has at least two items').toBeGreaterThan(1);

      await t.key('tab-into-menubar', 'Tab: If focus is moving into the menubar for the first time, focus is set on the first menuitem.', async () => {
        await t.tabInto();
        await expect(bar.first()).toBeFocused();
      });

      await t.key('menubar-right', 'Right Arrow: When focus is in a menubar, moves focus to the next item, optionally wrapping from the last to the first.', async () => {
        await t.press('ArrowRight');
        await expect(bar.nth(1)).toBeFocused();
      });

      await t.key('menubar-left', 'Left Arrow: When focus is in a menubar, moves focus to the previous item, optionally wrapping from the first to the last.', async () => {
        await t.press('ArrowLeft');
        await expect(bar.first()).toBeFocused();
      });

      await t.key('menubar-tab-leaves', 'Tab: When focus is on a menuitem in a menubar, move focus out of the menubar. Tab and Shift + Tab do not move focus among the items.', async () => {
        await t.press('Tab');
        await expect(t.after).toBeFocused();
        await t.press('Shift+Tab');
        await expect.poll(() => focusedIndex(bar), 'Shift+Tab returns to the menubar').toBeGreaterThan(-1);
        await bar.first().focus();
      });

      await t.key('menubar-down', 'Down Arrow: When focus is on a menuitem in a menubar, and that menuitem has a submenu, opens the submenu and places focus on the first item in the submenu.', async () => {
        await t.press('ArrowDown');
        await expect(menus.first()).toBeVisible();
        await expect(itemsOf(menus.first()).first()).toBeFocused();
      });

      await t.key('submenu-down-up', 'Down Arrow / Up Arrow: When focus is in a menu, moves focus to the next / previous item.', async () => {
        await t.press('ArrowDown');
        await expect(itemsOf(menus.first()).nth(1)).toBeFocused();
        await t.press('ArrowUp');
        await expect(itemsOf(menus.first()).first()).toBeFocused();
      });

      await t.key('submenu-right', 'Right Arrow: When focus is in a menu and on an item that does not have a submenu: closes the submenu, moves focus to the next item in the menubar, and either opens its submenu without moving focus into it or opens it and places focus on its first item.', async () => {
        await t.press('ArrowRight');
        await expect(menus.first()).toBeHidden();
        await expect(menus.nth(1)).toBeVisible();
        await expect.poll(async () => (await focusedIndex(bar)) === 1 || (await focusedIndex(itemsOf(menus.nth(1)))) === 0).toBe(true);
      });

      await t.key('submenu-left', 'Left Arrow: When focus is in a submenu of an item in a menubar: closes the submenu, moves focus to the previous item in the menubar, and opens its submenu.', async () => {
        if ((await focusedIndex(bar)) === 1) await t.press('ArrowDown');
        await t.press('ArrowLeft');
        await expect(menus.nth(1)).toBeHidden();
        await expect(menus.first()).toBeVisible();
        await expect.poll(async () => (await focusedIndex(bar)) === 0 || (await focusedIndex(itemsOf(menus.first()))) === 0).toBe(true);
      });

      await t.key('submenu-escape', 'Escape: Close the menu that contains focus and return focus to the parent menuitem from which the menu was opened.', async () => {
        if ((await focusedIndex(bar)) === 0) await t.press('ArrowDown');
        await t.press('Escape');
        await expect(menus.first()).toBeHidden();
        await expect(bar.first()).toBeFocused();
      });

      await t.key('menubar-enter', 'Enter: When focus is on a menuitem that has a submenu, opens the submenu and places focus on its first item.', async () => {
        await t.press('Enter');
        await expect(menus.first()).toBeVisible();
        await expect(itemsOf(menus.first()).first()).toBeFocused();
      });

      await t.key('submenu-enter', 'Enter: activates the item and closes the menu.', async () => {
        const activations = await countActivations(itemsOf(menus.first()).first());
        await t.press('Enter');
        await expect.poll(activations).toBe(1);
        await expect(menus.first()).toBeHidden();
      });

      await t.key('submenu-tab', 'Tab: When focus is on a menuitem in a menu, move focus out of the menu or menubar, and close all menus and submenus.', async () => {
        await bar.first().focus();
        await t.press('ArrowDown');
        await expect(itemsOf(menus.first()).first()).toBeFocused();
        await t.press('Tab');
        await expect(menus.first()).toBeHidden();
        await expect(t.after).toBeFocused();
      });

      await t.key('menubar-home-end', 'Home / End: moves focus to the first / last item in the current menubar.', async () => {
        await bar.first().focus();
        await t.press('End');
        await expect(bar.last()).toBeFocused();
        await t.press('Home');
        await expect(bar.first()).toBeFocused();
      }, { optional: 'Home/End' });
    },
  },

  'menu-button': {
    name: 'Menu Button',
    url: `${APG}menu-button/`,
    parts: { menu: { role: 'menu' }, item: { role: 'menuitem' } },
    rules: [
      { id: 'button-role', text: 'The element that opens the menu has role button.', part: 'button', role: 'button' },
      { id: 'button-haspopup', text: 'The element with role button has aria-haspopup set to either menu or true.', part: 'button', attr: 'aria-haspopup', oneOf: ['menu', 'true'] },
      { id: 'button-expanded', text: 'When the menu is displayed, the element with role button has aria-expanded set to true. When the menu is hidden, aria-expanded is set to false.', part: 'button', attr: 'aria-expanded', tracks: { shown: 'menu' }, live: true },
      { id: 'menu-role', text: 'The element that contains the menu items displayed by activating the button has role menu.', part: 'menu', role: 'menu' },
      {
        id: 'button-controls',
        text: 'Optionally, the element with role button has a value specified for aria-controls that refers to the element with role menu.',
        check: async (t) => {
          const id = await t.part('button').getAttribute('aria-controls');
          return id === null || id === (await t.part('menu').getAttribute('id')) ? [] : [`aria-controls="${id}" does not refer to the menu`];
        },
      },
    ],
    keyboard: async (t) => {
      const button = t.part('button');
      const menu = t.part('menu');
      const items = t.part('item');
      const close = async () => {
        await t.press('Escape');
        await expect(menu).toBeHidden();
        await expect(button).toBeFocused();
      };
      await button.focus();

      await t.key('enter', 'Enter: opens the menu and places focus on the first menu item.', async () => {
        await t.press('Enter');
        await expect(menu).toBeVisible();
        await expect(items.first()).toBeFocused();
      });
      await close();

      await t.key('space', 'Space: Opens the menu and places focus on the first menu item.', async () => {
        await t.press('Space');
        await expect(menu).toBeVisible();
        await expect(items.first()).toBeFocused();
      });
      await close();

      await t.key('down-arrow', '(Optional) Down Arrow: opens the menu and moves focus to the first menu item.', async () => {
        await t.press('ArrowDown');
        await expect(menu).toBeVisible();
        await expect(items.first()).toBeFocused();
        await close();
      }, { optional: 'ArrowDown opens' });

      await t.key('up-arrow', '(Optional) Up Arrow: opens the menu and moves focus to the last menu item.', async () => {
        await t.press('ArrowUp');
        await expect(menu).toBeVisible();
        await expect(items.last()).toBeFocused();
        await close();
      }, { optional: 'ArrowUp opens on the last item' });
    },
  },

  radio: {
    name: 'Radio Group',
    url: `${APG}radio/`,
    parts: { radiogroup: { role: 'radiogroup' }, radio: { role: 'radio' } },
    rules: [
      { id: 'radiogroup-role', text: 'The radio buttons are contained in or owned by an element with role radiogroup.', part: 'radio', inside: 'radiogroup' },
      { id: 'radio-role', text: 'Each radio button element has role radio.', part: 'radio', role: 'radio' },
      { id: 'radio-checked', text: 'If a radio button is checked, the radio element has aria-checked set to true. If it is not checked, it has aria-checked set to false.', part: 'radio', attr: 'aria-checked', oneOf: ['true', 'false'], live: true },
      { id: 'radio-name', text: 'Each radio element is labelled by its content, has a visible label referenced by aria-labelledby, or has a label specified with aria-label.', part: 'radio', named: true },
      { id: 'radiogroup-label', text: 'The radiogroup element has a visible label referenced by aria-labelledby or has a label specified with aria-label.', part: 'radiogroup', check: (t) => labelProblems(t, 'radiogroup') },
    ],
    keyboard: async (t) => {
      const radios = t.part('radio');
      const count = await radios.count();
      const checked = () => t.states(radios, 'aria-checked');
      const only = (index) => Array.from({ length: count }, (_, i) => String(i === index));
      const start = (await checked()).indexOf('true');
      let at = Math.max(start, 0);

      await t.key('tab-into', 'Tab: When focus moves into a radio group: if a radio button is checked, focus is set on the checked button. If none of the radio buttons are checked, focus is set on the first radio button in the group.', async () => {
        await t.tabInto();
        await expect(radios.nth(at)).toBeFocused();
        expect(await checked(), 'moving focus in does not change what is checked').toEqual(only(start));
      });

      if (start === -1) {
        await t.key('space', 'Space: checks the focused radio button if it is not already checked.', async () => {
          await t.press('Space');
          await expect.poll(checked).toEqual(only(at));
        });
      }

      for (const [key, direction, wording] of [['ArrowRight', 1, 'next'], ['ArrowDown', 1, 'next'], ['ArrowLeft', -1, 'previous'], ['ArrowUp', -1, 'previous']]) {
        await t.key(key, `${key}: move focus to the ${wording} radio button in the group, uncheck the previously focused button, and check the newly focused button, wrapping at the end of the group.`, async () => {
          // Once around the group, so the wrap is always crossed.
          for (let step = 0; step < count; step += 1) {
            await t.press(key);
            at = (at + direction + count) % count;
            await expect(radios.nth(at)).toBeFocused();
            await expect.poll(checked).toEqual(only(at));
          }
        });
      }

      await t.key('tab-out-and-back', 'Tab and Shift + Tab: Move focus into and out of the radio group; when focus moves back in, it is set on the checked button.', async () => {
        await t.press('ArrowDown');
        at = (at + 1) % count;
        await expect.poll(checked).toEqual(only(at));
        await t.press('Tab');
        await expect(t.after).toBeFocused();
        await t.press('Shift+Tab');
        await expect(radios.nth(at)).toBeFocused();
        await t.tabInto();
        await expect(radios.nth(at)).toBeFocused();
        expect(await checked(), 'moving focus in and out does not change what is checked').toEqual(only(at));
      });
    },
  },

  slider: {
    name: 'Slider',
    url: `${APG}slider/`,
    parts: { slider: { role: 'slider' } },
    rules: [
      { id: 'slider-role', text: 'The element serving as the focusable slider control has role slider.', part: 'slider', role: 'slider' },
      { id: 'slider-values', text: 'The slider element has aria-valuenow, aria-valuemin and aria-valuemax set to decimal values representing the current, minimum and maximum allowed value.', check: valueRangeProblems('slider', { requireRange: true }), live: true },
      { id: 'slider-label', text: 'If the slider has a visible label, it is referenced by aria-labelledby on the slider element. Otherwise, the slider element has a label provided by aria-label.', part: 'slider', check: (t) => labelProblems(t, 'slider') },
    ],
    keyboard: (t) => sliderKeyboard(t, t.part('slider').first()),
  },

  'slider-multithumb': {
    name: 'Slider (Multi-Thumb)',
    url: `${APG}slider-multithumb/`,
    parts: { slider: { role: 'slider' } },
    rules: [
      { id: 'thumb-role', text: 'Each element serving as a focusable slider thumb has role slider.', part: 'slider', role: 'slider' },
      { id: 'thumb-values', text: 'Each slider element has aria-valuenow, aria-valuemin and aria-valuemax set to decimal values.', check: valueRangeProblems('slider', { requireRange: true }), live: true },
      { id: 'thumb-label', text: 'If a slider has a visible label, it is referenced by aria-labelledby on the slider element. Otherwise, the slider element has a label provided by aria-label.', part: 'slider', check: (t) => labelProblems(t, 'slider') },
      {
        id: 'dependent-range',
        text: 'When the range (e.g. minimum and/or maximum value) of another slider is dependent on the current value of a slider, the values of aria-valuemin or aria-valuemax of the dependent sliders are updated when the value changes.',
        check: async (t) => {
          const thumbs = t.part('slider');
          const [lower, upper] = [thumbs.first(), thumbs.last()];
          const problems = [];
          if ((await numberState(t, lower, 'aria-valuemax')) !== (await numberState(t, upper, 'aria-valuenow'))) problems.push('the lower thumb\'s aria-valuemax is not the upper thumb\'s value');
          if ((await numberState(t, upper, 'aria-valuemin')) !== (await numberState(t, lower, 'aria-valuenow'))) problems.push('the upper thumb\'s aria-valuemin is not the lower thumb\'s value');
          return problems;
        },
        live: true,
      },
    ],
    keyboard: async (t) => {
      const thumbs = t.part('slider');
      await t.key('each-thumb-is-a-tab-stop', 'Each thumb is in the page tab sequence. The tab order remains constant regardless of thumb value and visual position within the slider.', async () => {
        await t.tabInto();
        await expect(thumbs.first()).toBeFocused();
        await t.press('Tab');
        await expect(thumbs.nth(1)).toBeFocused();
      });
      await t.key('thumb-keys', 'Each thumb has the keyboard interactions described in the Slider Pattern.', async () => {
        const [lower, upper] = [thumbs.first(), thumbs.nth(1)];
        const start = await numberState(t, upper, 'aria-valuenow');
        await t.press('ArrowLeft');
        await expect.poll(() => numberState(t, upper, 'aria-valuenow')).toBeLessThan(start);
        await t.press('ArrowRight');
        await expect.poll(() => numberState(t, upper, 'aria-valuenow')).toBe(start);
        await lower.focus();
        const low = await numberState(t, lower, 'aria-valuenow');
        await t.press('ArrowUp');
        await expect.poll(() => numberState(t, lower, 'aria-valuenow')).toBeGreaterThan(low);
        await t.press('ArrowDown');
        await expect.poll(() => numberState(t, lower, 'aria-valuenow')).toBe(low);
      });
      await t.key('thumbs-do-not-cross', 'The maximum value of the thumb that sets the lower end of the range is limited by the current value of the thumb that sets the upper end of the range.', async () => {
        await thumbs.first().focus();
        await t.press('End');
        await expect.poll(async () => (await numberState(t, thumbs.first(), 'aria-valuenow')) <= (await numberState(t, thumbs.nth(1), 'aria-valuenow'))).toBe(true);
      });
    },
  },

  spinbutton: {
    name: 'Spinbutton',
    url: `${APG}spinbutton/`,
    parts: { spinbutton: { role: 'spinbutton' } },
    rules: [
      { id: 'spinbutton-role', text: 'The focusable element serving as the spinbutton has role spinbutton.', part: 'spinbutton', role: 'spinbutton' },
      { id: 'spinbutton-values', text: 'The spinbutton element has aria-valuenow set to the current value, and aria-valuemin / aria-valuemax if it has a known minimum / maximum.', check: valueRangeProblems('spinbutton', { requireRange: false }), live: true },
      { id: 'spinbutton-label', text: 'If the spinbutton has a visible label, it is referenced by aria-labelledby on the spinbutton element. Otherwise, the spinbutton element has a label provided by aria-label.', part: 'spinbutton', check: (t) => labelProblems(t, 'spinbutton') },
    ],
    keyboard: async (t) => {
      const spin = t.part('spinbutton').first();
      const value = () => numberState(t, spin, 'aria-valuenow');
      const [min, max] = [await numberState(t, spin, 'aria-valuemin'), await numberState(t, spin, 'aria-valuemax')];
      await spin.focus();
      const start = await value();

      await t.key('up-arrow', 'Up Arrow: Increases the value.', async () => {
        await t.press('ArrowUp');
        await expect.poll(value).toBeGreaterThan(start);
      });
      await t.key('down-arrow', 'Down Arrow: Decreases the value.', async () => {
        await t.press('ArrowDown');
        await expect.poll(value).toBe(start);
      });
      await t.key('end', 'End: If the spinbutton has a maximum value, sets the value to its maximum.', async () => {
        expect(Number.isNaN(max), 'the usage declares a maximum').toBe(false);
        await t.press('End');
        await expect.poll(value).toBe(max);
      });
      await t.key('home', 'Home: If the spinbutton has a minimum value, sets the value to its minimum.', async () => {
        expect(Number.isNaN(min), 'the usage declares a minimum').toBe(false);
        await t.press('Home');
        await expect.poll(value).toBe(min);
      });
      await t.key('focus-stays', 'Focus remains on the text field during operation.', async () => {
        await expect(spin).toBeFocused();
      });
      await t.key('typing', 'If the spinbutton text field allows directly editing the value: Printable Characters: Type characters in the textbox.', async () => {
        await spin.fill('');
        await t.page.keyboard.type(String(min + 1));
        await expect.poll(value).toBe(min + 1);
      });
      await t.key('page-up-down', 'Page Up / Page Down (Optional): Increases / decreases the value by a larger step than Up Arrow / Down Arrow.', async () => {
        await t.press('Home');
        await t.press('ArrowUp');
        const step = (await value()) - min;
        await t.press('Home');
        await t.press('PageUp');
        await expect.poll(async () => (await value()) - min).toBeGreaterThan(step);
      }, { optional: 'PageUp/PageDown' });
    },
  },

  switch: {
    name: 'Switch',
    url: `${APG}switch/`,
    parts: { switch: { role: 'switch' } },
    rules: [
      { id: 'switch-role', text: 'The switch has role switch.', part: 'switch', role: 'switch' },
      { id: 'switch-name', text: 'The switch has an accessible label.', part: 'switch', named: true },
      { id: 'switch-checked', text: 'When on, the switch element has state aria-checked set to true. When off, false. If the switch element is an HTML input[type="checkbox"], it uses the HTML checked attribute instead of the aria-checked property.', part: 'switch', attr: 'aria-checked', oneOf: ['true', 'false'], live: true },
    ],
    keyboard: async (t) => {
      const control = t.part('switch').first();
      await control.focus();
      await expect(control).toBeFocused();
      await t.key('space', 'Space: When focus is on the switch, changes the state of the switch.', async () => {
        const before = await t.state(control, 'aria-checked');
        await t.press('Space');
        await expect.poll(() => t.state(control, 'aria-checked')).toBe(before === 'true' ? 'false' : 'true');
        await t.press('Space');
        await expect.poll(() => t.state(control, 'aria-checked')).toBe(before);
      });
      await t.key('enter', 'Enter (Optional): When focus is on the switch, changes the state of the switch.', async () => {
        const before = await t.state(control, 'aria-checked');
        await t.press('Enter');
        await expect.poll(() => t.state(control, 'aria-checked')).toBe(before === 'true' ? 'false' : 'true');
      }, { optional: 'Enter toggles' });
    },
  },

  table: {
    name: 'Table',
    url: `${APG}table/`,
    parts: { table: { role: 'table' }, row: { role: 'row' }, columnheader: { role: 'columnheader' }, cell: { role: 'cell' } },
    rules: [
      { id: 'table-role', text: 'The table container has role table.', part: 'table', role: 'table' },
      { id: 'row-role', text: 'Each row container has role row and is either a DOM descendant of or owned by the table element or an element with role rowgroup.', part: 'row', role: 'row', inside: 'table' },
      { id: 'columnheader-role', text: 'Each cell that contains a title or header information for the column has role columnheader and is a DOM descendant of a row.', part: 'columnheader', role: 'columnheader', inside: 'row' },
      { id: 'cell-role', text: 'Each cell that does not contain column or row header information has role cell and is a DOM descendant of a row.', part: 'cell', role: 'cell', inside: 'row' },
      { id: 'table-label', text: 'If there is an element in the user interface that serves as a label for the table, aria-labelledby is set on the table element. Otherwise, a label is specified for the table element using aria-label.', part: 'table', check: (t) => labelProblems(t, 'table') },
      {
        id: 'cells-not-focusable',
        text: 'A table is a static tabular structure; it is not an interactive widget. Thus, its cells are not focusable or selectable.',
        check: async (t) => {
          const cells = t.part('table').locator('th, td, [role="columnheader"], [role="rowheader"], [role="cell"]');
          const labels = await t.labels(cells);
          return (await cells.evaluateAll((els) => els.map((el) => el.tabIndex >= 0))).flatMap((focusable, i) => (focusable ? [`${labels[i]} is focusable`] : []));
        },
      },
      {
        id: 'sorted-column',
        text: 'If the table contains sortable columns or rows, aria-sort is set to an appropriate value on the header cell element for the sorted column or row.',
        check: async (t) => {
          const headers = t.part('columnheader');
          const labels = await t.labels(headers);
          const values = await headers.evaluateAll((els) => els.map((el) => el.getAttribute('aria-sort')));
          const problems = [];
          const sorted = values.flatMap((value, i) => (value === 'ascending' || value === 'descending' ? [i] : []));
          if (sorted.length > 1) problems.push(`${sorted.length} columns claim to be the sorted one`);
          for (const i of sorted) {
            const order = await t.act('rowOrder', i);
            if (order !== values[i]) problems.push(`${labels[i]} has aria-sort="${values[i]}" while its rows are in ${order} order`);
          }
          return problems;
        },
        live: true,
      },
    ],
    // "Keyboard Interaction: Not applicable." Sorting is driven here only to
    // prove that aria-sort follows the real order of the rows.
    keyboard: async (t) => {
      const headers = t.part('columnheader');
      let column = -1;
      await t.key('sort-ascending', 'aria-sort is set to ascending on the header cell of the column the rows are sorted by.', async () => {
        column = await t.act('sort');
        await expect(headers.nth(column)).toHaveAttribute('aria-sort', 'ascending');
        await expect.poll(() => t.act('rowOrder', column)).toBe('ascending');
      });
      await t.key('sort-descending', 'aria-sort is set to descending when the order is reversed.', async () => {
        await t.act('sort');
        await expect(headers.nth(column)).toHaveAttribute('aria-sort', 'descending');
        await expect.poll(() => t.act('rowOrder', column)).toBe('descending');
      });
    },
  },

  tabs: {
    name: 'Tabs',
    url: `${APG}tabs/`,
    parts: { tablist: { role: 'tablist' }, tab: { role: 'tab' }, tabpanel: { role: 'tabpanel' } },
    rules: [
      { id: 'tablist-role', text: 'The element that serves as the container for the set of tabs has role tablist.', part: 'tablist', role: 'tablist' },
      { id: 'tab-role', text: 'Each element that serves as a tab has role tab and is contained within the element with role tablist.', part: 'tab', role: 'tab', inside: 'tablist' },
      { id: 'tabpanel-role', text: 'Each element that contains the content panel for a tab has role tabpanel.', part: 'tabpanel', role: 'tabpanel' },
      { id: 'tablist-label', text: 'If the tab list has a visible label, the element with role tablist has aria-labelledby set to a value that refers to the labelling element. Otherwise, the tablist element has a label provided by aria-label.', part: 'tablist', check: (t) => labelProblems(t, 'tablist') },
      { id: 'tab-controls', text: 'Each element with role tab has the property aria-controls referring to its associated tabpanel element.', part: 'tab', ref: 'aria-controls', to: 'tabpanel', pairwise: true },
      { id: 'tab-selected', text: 'The active tab element has the state aria-selected set to true and all other tab elements have it set to false.', part: 'tab', attr: 'aria-selected', oneOf: ['true', 'false'], value: 'true', exactly: 1, live: true },
      { id: 'selected-panel-shown', text: 'When a tab is active, its associated tab panel is the one displayed.', part: 'tab', attr: 'aria-selected', tracks: { shown: 'tabpanel' }, live: true },
      { id: 'tabpanel-labelledby', text: 'Each element with role tabpanel has the property aria-labelledby referring to its associated tab element.', part: 'tabpanel', ref: 'aria-labelledby', to: 'tab', pairwise: true },
    ],
    keyboard: async (t) => {
      const tabs = t.part('tab');
      const panels = t.part('tabpanel');
      const count = await tabs.count();
      expect(count, 'at least three tabs, so first, middle and last differ').toBeGreaterThan(2);
      const selected = async () => (await t.states(tabs, 'aria-selected')).indexOf('true');

      await t.key('tab-into', 'Tab: When focus moves into the tab list, places focus on the active tab element.', async () => {
        await t.tabInto();
        await expect(tabs.nth(await selected())).toBeFocused();
      });

      await t.key('right-arrow', 'Right Arrow: Moves focus to the next tab. If focus is on the last tab element, moves focus to the first tab.', async () => {
        for (let step = 1; step <= count; step += 1) {
          await t.press('ArrowRight');
          await expect(tabs.nth(step % count)).toBeFocused();
        }
      });

      await t.key('left-arrow', 'Left Arrow: moves focus to the previous tab. If focus is on the first tab, moves focus to the last tab.', async () => {
        await t.press('ArrowLeft');
        await expect(tabs.last()).toBeFocused();
        await t.press('ArrowLeft');
        await expect(tabs.nth(count - 2)).toBeFocused();
      });

      await t.key('enter', 'Space or Enter: Activates the tab if it was not activated automatically on focus.', async () => {
        await t.press('Enter');
        await expect.poll(selected).toBe(count - 2);
        await expect(panels.nth(count - 2)).toBeVisible();
      });

      await t.key('space', 'Space or Enter: Activates the tab if it was not activated automatically on focus.', async () => {
        await t.press('ArrowRight');
        await expect(tabs.last()).toBeFocused();
        await t.press('Space');
        await expect.poll(selected).toBe(count - 1);
        await expect(panels.last()).toBeVisible();
      });

      await t.key('home-end', 'Home / End (Optional): Moves focus to the first / last tab.', async () => {
        await t.press('Home');
        await expect(tabs.first()).toBeFocused();
        await t.press('End');
        await expect(tabs.last()).toBeFocused();
      }, { optional: 'Home/End' });

      await t.key('tab-to-panel', 'Tab: When the tab list contains the focus, moves focus to the next element in the page tab sequence outside the tablist, which is the tabpanel unless the first element containing meaningful content inside the tabpanel is focusable.', async () => {
        await t.press('ArrowLeft');
        await t.press('Tab');
        await expect.poll(async () => panels.nth(await selected()).evaluate((panel) => panel.contains(document.activeElement))).toBe(true);
      });

      await t.key('tab-returns-to-active', 'Tab: When focus moves into the tab list, places focus on the active tab element (also when another tab had focus last).', async () => {
        await t.press('Shift+Tab');
        await expect(tabs.nth(await selected())).toBeFocused();
      });
    },
  },

  toolbar: {
    name: 'Toolbar',
    url: `${APG}toolbar/`,
    parts: { toolbar: { role: 'toolbar' } },
    rules: [
      { id: 'toolbar-role', text: 'The element that serves as the toolbar container has role toolbar.', part: 'toolbar', role: 'toolbar' },
      { id: 'toolbar-label', text: 'If the toolbar has a visible label, it is referenced by aria-labelledby on the toolbar element. Otherwise, the toolbar element has a label provided by aria-label.', part: 'toolbar', check: (t) => labelProblems(t, 'toolbar') },
    ],
    keyboard: async (t) => {
      const controls = t.part('control');
      const count = await controls.count();
      expect(count, 'at least three controls').toBeGreaterThan(2);

      await t.key('tab-into', 'Tab: If focus is moving into the toolbar for the first time, focus is set on the first control that is not disabled.', async () => {
        await t.tabInto();
        await expect(controls.first()).toBeFocused();
      });

      await t.key('right-arrow', 'Right Arrow: Moves focus to the next control.', async () => {
        await t.press('ArrowRight');
        await expect(controls.nth(1)).toBeFocused();
        await t.press('ArrowRight');
        await expect(controls.nth(2)).toBeFocused();
      });

      await t.key('left-arrow', 'Left Arrow: Moves focus to the previous control.', async () => {
        await t.press('ArrowLeft');
        await expect(controls.nth(1)).toBeFocused();
      });

      await t.key('tab-out', 'Tab and Shift + Tab: Move focus into and out of the toolbar.', async () => {
        await t.press('Tab');
        await expect(t.after).toBeFocused();
      });

      await t.key('tab-back', 'If the toolbar has previously contained focus, focus is optionally set on the control that last had focus. Otherwise, it is set on the first control that is not disabled.', async () => {
        await t.press('Shift+Tab');
        await expect.poll(() => focusedIndex(controls)).toBe(t.claims('returns to the last control') ? 1 : 0);
      });

      await t.key('home-end', 'Home / End (Optional): Moves focus to first / last element.', async () => {
        await t.press('End');
        await expect(controls.last()).toBeFocused();
        await t.press('Home');
        await expect(controls.first()).toBeFocused();
      }, { optional: 'Home/End' });
    },
  },

  tooltip: {
    name: 'Tooltip',
    url: `${APG}tooltip/`,
    parts: { tooltip: { role: 'tooltip' } },
    rules: [
      { id: 'tooltip-role', text: 'The element that serves as the tooltip container has role tooltip.', part: 'tooltip', role: 'tooltip' },
      { id: 'trigger-describedby', text: 'The element that triggers the tooltip references the tooltip element with aria-describedby.', part: 'trigger', ref: 'aria-describedby', to: 'tooltip' },
    ],
    keyboard: async (t) => {
      const trigger = t.part('trigger');
      const tooltip = t.part('tooltip');

      await t.key('shows-on-focus', 'A tooltip is a popup that displays information related to an element when the element receives keyboard focus.', async () => {
        await t.tabInto();
        await expect(trigger).toBeFocused();
        await expect(tooltip).toBeVisible();
      });

      await t.key('focus-stays', 'Focus stays on the triggering element while the tooltip is displayed. Tooltip widgets do not receive focus.', async () => {
        await expect(trigger).toBeFocused();
      });

      await t.key('escape', 'Escape: Dismisses the Tooltip.', async () => {
        await t.press('Escape');
        await expect(tooltip).toBeHidden();
        await expect(trigger).toBeFocused();
      });

      await t.key('dismissed-on-blur', 'If the tooltip is invoked when the trigger element receives focus, then it is dismissed when it no longer has focus (onBlur).', async () => {
        await t.press('Shift+Tab');
        await expect(t.before).toBeFocused();
        await t.press('Tab');
        await expect(tooltip).toBeVisible();
        await t.press('Shift+Tab');
        await expect(t.before).toBeFocused();
        await expect(tooltip).toBeHidden();
      });
    },
  },
};

/** Keyboard interaction of the slider pattern, for one thumb. */
async function sliderKeyboard(t, slider) {
  const value = () => numberState(t, slider, 'aria-valuenow');
  const [min, max] = [await numberState(t, slider, 'aria-valuemin'), await numberState(t, slider, 'aria-valuemax')];
  await slider.focus();
  await expect(slider).toBeFocused();
  const start = await value();
  let step = 0;

  await t.key('right-arrow', 'Right Arrow: Increase the value of the slider by one step.', async () => {
    await t.press('ArrowRight');
    await expect.poll(value).toBeGreaterThan(start);
    step = (await value()) - start;
  });
  await t.key('up-arrow', 'Up Arrow: Increase the value of the slider by one step.', async () => {
    await t.press('ArrowUp');
    await expect.poll(value).toBe(start + 2 * step);
  });
  await t.key('left-arrow', 'Left Arrow: Decrease the value of the slider by one step.', async () => {
    await t.press('ArrowLeft');
    await expect.poll(value).toBe(start + step);
  });
  await t.key('down-arrow', 'Down Arrow: Decrease the value of the slider by one step.', async () => {
    await t.press('ArrowDown');
    await expect.poll(value).toBe(start);
  });
  await t.key('home', 'Home: Set the slider to the first allowed value in its range.', async () => {
    await t.press('Home');
    await expect.poll(value).toBe(min);
  });
  await t.key('end', 'End: Set the slider to the last allowed value in its range.', async () => {
    await t.press('End');
    await expect.poll(value).toBe(max);
  });
  await t.key('page-up-down', 'Page Up / Page Down (Optional): Increase / decrease the slider value by an amount larger than the step change made by Up Arrow / Down Arrow.', async () => {
    await t.press('PageDown');
    await expect.poll(async () => max - (await value())).toBeGreaterThan(step);
    await t.press('PageUp');
    await expect.poll(value).toBe(max);
  }, { optional: 'PageUp/PageDown' });
}

module.exports = { PATTERNS, APG };
