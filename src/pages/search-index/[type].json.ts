import type { APIRoute, GetStaticPaths } from 'astro';
import { builders, type SearchEntry } from '../../lib/search-index';

const types = Object.keys(builders) as Array<keyof typeof builders>;

export const getStaticPaths = (() =>
  types.map((type) => ({ params: { type } }))) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params }) => {
  const type = params.type as keyof typeof builders;
  const build = builders[type];

  if (!build) {
    return new Response(JSON.stringify({ error: 'unknown index' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }

  const rows: SearchEntry[] = await build();

  return new Response(JSON.stringify(rows), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=600',
    },
  });
};
