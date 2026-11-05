import { env } from 'cloudflare:workers';
import { generate } from '../../../lib/generation';
export async function POST(request: Request) {
 const e=env as unknown as Record<string,string>;
 return generate(request,{key:e.OPENAI_API_KEY,base:e.OPENAI_BASE_URL,model:e.OPENAI_MODEL});
}
