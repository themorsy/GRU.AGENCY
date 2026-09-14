import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

// This is generated with the static admin build. CMS template edits are available
// after their Git-backed Cloudflare rebuild completes, just like page edits.
export const GET: APIRoute = () => {
  const directory = path.join(process.cwd(), 'src', 'content', 'page-templates');
  if (!fs.existsSync(directory)) {
    return new Response('[]', { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
  }
  const templates = fs.readdirSync(directory)
    .filter((name) => name.endsWith('.json'))
    .flatMap((name) => {
      try {
        const entry = JSON.parse(fs.readFileSync(path.join(directory, name), 'utf8'));
        return entry?.title && entry?.content ? [{ title: entry.title, content: entry.content }] : [];
      } catch {
        return [];
      }
    });
  return new Response(JSON.stringify(templates), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
};
