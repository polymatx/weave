import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://polymatx.dev',
  base: '/weave',
  integrations: [
    starlight({
      title: 'weave',
      description: 'TypeScript-native agent orchestrator. MCP-native. Observability built-in.',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/polymatx/weave' },
      ],
      editLink: {
        baseUrl: 'https://github.com/polymatx/weave/edit/main/apps/docs/',
      },
      sidebar: [
        {
          label: 'Getting started',
          items: [
            { label: 'Introduction', link: '/getting-started/introduction/' },
            { label: 'Install', link: '/getting-started/install/' },
            { label: 'Hello, weave', link: '/getting-started/hello/' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'Agents', link: '/guides/agents/' },
            { label: 'Graphs & state', link: '/guides/graphs/' },
            { label: 'MCP tools', link: '/guides/mcp/' },
            { label: 'Streaming', link: '/guides/streaming/' },
            { label: 'Checkpoints', link: '/guides/checkpoints/' },
            { label: 'Observability', link: '/guides/observability/' },
          ],
        },
        {
          label: 'Reference',
          items: [
            { label: 'agent()', link: '/reference/agent/' },
            { label: 'graph()', link: '/reference/graph/' },
            { label: 'SqliteTracer', link: '/reference/tracer/' },
            { label: 'SqliteCheckpointStore', link: '/reference/checkpoint/' },
          ],
        },
      ],
      customCss: ['./src/styles/custom.css'],
    }),
  ],
});
