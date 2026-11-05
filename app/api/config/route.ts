import { env } from 'cloudflare:workers';
export async function GET(){const e=env as unknown as Record<string,string>;return Response.json({configured:!!e.OPENAI_API_KEY,model:e.OPENAI_MODEL||'gpt-5.5'},{headers:{'Cache-Control':'no-store'}});}
