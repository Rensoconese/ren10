import { defineConfig } from 'astro/config';
import ren10 from '@ren10/astro';

export default defineConfig({
  integrations: [ren10()],
});
