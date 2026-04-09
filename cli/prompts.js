/**
 * RenDS CLI — Interactive prompts module
 * Lightweight prompts using Node's built-in readline
 * No external dependencies required.
 */

import readline from 'readline';

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  dim: '\x1b[2m',
  underline: '\x1b[4m',
  magenta: '\x1b[35m',
};

/**
 * Create a readline interface
 */
function createRL() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

/**
 * Ask a simple text question
 * @param {string} question - The question to ask
 * @param {string} defaultValue - Default value if user presses Enter
 * @returns {Promise<string>}
 */
export async function askText(question, defaultValue = '') {
  const rl = createRL();
  const defaultHint = defaultValue ? ` ${c.dim}(${defaultValue})${c.reset}` : '';

  return new Promise((resolve) => {
    rl.question(`${c.cyan}?${c.reset} ${question}${defaultHint} `, (answer) => {
      rl.close();
      resolve(answer.trim() || defaultValue);
    });
  });
}

/**
 * Ask a yes/no confirmation question
 * @param {string} question - The question to ask
 * @param {boolean} defaultValue - Default value
 * @returns {Promise<boolean>}
 */
export async function askConfirm(question, defaultValue = true) {
  const rl = createRL();
  const hint = defaultValue ? 'Y/n' : 'y/N';

  return new Promise((resolve) => {
    rl.question(`${c.cyan}?${c.reset} ${question} ${c.dim}(${hint})${c.reset} `, (answer) => {
      rl.close();
      const a = answer.trim().toLowerCase();
      if (a === '') resolve(defaultValue);
      else resolve(a === 'y' || a === 'yes');
    });
  });
}

/**
 * Ask user to select one option from a list
 * @param {string} question - The question to ask
 * @param {Array<{label: string, value: string, hint?: string}>} options - Available options
 * @param {string} defaultValue - Default value
 * @returns {Promise<string>}
 */
export async function askSelect(question, options, defaultValue = '') {
  console.log(`\n${c.cyan}?${c.reset} ${c.bold}${question}${c.reset}`);

  options.forEach((opt, i) => {
    const isDefault = opt.value === defaultValue;
    const marker = isDefault ? `${c.green}❯${c.reset}` : ' ';
    const hint = opt.hint ? ` ${c.dim}${opt.hint}${c.reset}` : '';
    const label = isDefault ? `${c.green}${opt.label}${c.reset}` : opt.label;
    console.log(`  ${marker} ${c.bold}${i + 1}${c.reset}) ${label}${hint}`);
  });

  const rl = createRL();
  const defaultIdx = options.findIndex((o) => o.value === defaultValue);
  const defaultHint = defaultIdx >= 0 ? `${defaultIdx + 1}` : '1';

  return new Promise((resolve) => {
    rl.question(`\n  ${c.dim}Enter number${c.reset} ${c.dim}(${defaultHint})${c.reset}: `, (answer) => {
      rl.close();
      const num = parseInt(answer.trim(), 10);
      if (answer.trim() === '' && defaultValue) {
        resolve(defaultValue);
      } else if (num >= 1 && num <= options.length) {
        resolve(options[num - 1].value);
      } else {
        resolve(options[0].value);
      }
    });
  });
}

/**
 * Ask user to select multiple options from a list
 * @param {string} question - The question to ask
 * @param {Array<{label: string, value: string, hint?: string, checked?: boolean}>} options
 * @returns {Promise<string[]>}
 */
export async function askMultiSelect(question, options) {
  console.log(`\n${c.cyan}?${c.reset} ${c.bold}${question}${c.reset} ${c.dim}(comma-separated numbers, or 'all')${c.reset}`);

  options.forEach((opt, i) => {
    const check = opt.checked ? `${c.green}✓${c.reset}` : ' ';
    const hint = opt.hint ? ` ${c.dim}${opt.hint}${c.reset}` : '';
    console.log(`  ${check} ${c.bold}${i + 1}${c.reset}) ${opt.label}${hint}`);
  });

  const rl = createRL();

  return new Promise((resolve) => {
    rl.question(`\n  ${c.dim}Enter numbers${c.reset}: `, (answer) => {
      rl.close();
      const input = answer.trim().toLowerCase();

      if (input === 'all') {
        resolve(options.map((o) => o.value));
        return;
      }

      if (input === '' || input === 'none') {
        resolve(options.filter((o) => o.checked).map((o) => o.value));
        return;
      }

      const nums = input.split(',').map((s) => parseInt(s.trim(), 10));
      const selected = nums
        .filter((n) => n >= 1 && n <= options.length)
        .map((n) => options[n - 1].value);

      resolve(selected.length > 0 ? selected : options.filter((o) => o.checked).map((o) => o.value));
    });
  });
}

/**
 * Print a styled banner
 */
export function banner() {
  console.log(`
${c.bold}${c.cyan}╭─────────────────────────────────────╮${c.reset}
${c.bold}${c.cyan}│${c.reset}   ${c.bold}RenDS${c.reset} — Design System Setup       ${c.bold}${c.cyan}│${c.reset}
${c.bold}${c.cyan}│${c.reset}   ${c.dim}Vanilla • Accessible • Atomic${c.reset}     ${c.bold}${c.cyan}│${c.reset}
${c.bold}${c.cyan}╰─────────────────────────────────────╯${c.reset}
`);
}

/**
 * Print a step indicator
 * @param {number} current - Current step
 * @param {number} total - Total steps
 * @param {string} label - Step label
 */
export function step(current, total, label) {
  console.log(`\n${c.dim}[${current}/${total}]${c.reset} ${c.bold}${label}${c.reset}`);
}

/**
 * Print a success message
 */
export function success(message) {
  console.log(`${c.green}✓${c.reset} ${message}`);
}

/**
 * Print an info message
 */
export function info(message) {
  console.log(`${c.cyan}ℹ${c.reset} ${message}`);
}

/**
 * Print a warning message
 */
export function warn(message) {
  console.log(`${c.yellow}⚠${c.reset} ${message}`);
}

export { c };
