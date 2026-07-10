import path from 'node:path';
import { pathToFileURL } from 'node:url';

const cli = path.resolve(import.meta.dirname, '..', 'cli', 'index.js');
process.argv = [process.execPath, cli, 'manifest', '--json'];
await import(pathToFileURL(cli).href);

// Node reports maxRSS in KiB on every supported platform.
const maxRssBytes = process.resourceUsage().maxRSS * 1024;
process.stderr.write(`REN10_MAX_RSS_BYTES=${maxRssBytes}\n`);
