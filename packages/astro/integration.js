const CSS_MODES = new Set(['foundation', 'all', 'none']);

export default function ren10Astro(options = {}) {
  const css = options.css ?? 'foundation';
  const appearance = options.appearance ?? true;

  if (!CSS_MODES.has(css)) {
    throw new TypeError(`@ren10/astro: css must be "foundation", "all", or "none"; received ${JSON.stringify(css)}`);
  }
  if (typeof appearance !== 'boolean') {
    throw new TypeError('@ren10/astro: appearance must be a boolean');
  }

  return {
    name: '@ren10/astro',
    hooks: {
      'astro:config:setup': ({ injectScript }) => {
        if (css === 'foundation') injectScript('page-ssr', 'import "ren10/foundation.css";');
        if (css === 'all') injectScript('page-ssr', 'import "ren10";');
        if (appearance) injectScript('page-ssr', 'import "ren10/themes/appearance.css";');
      },
    },
  };
}

export { CSS_MODES };
