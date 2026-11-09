import {readFileSync} from 'node:fs';
import {parseEnv} from 'node:util';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const env=parseEnv(readFileSync(new URL('../.dev.vars',import.meta.url),'utf8'));
const names=['OPENAI_API_KEY','OPENAI_BASE_URL','OPENAI_MODEL'];
if(names.some(name=>!env[name]?.trim()))throw new Error('请先填写 .dev.vars 中的三个模型参数。');
const values=Object.fromEntries(names.map(name=>[name,env[name]]));
const result=spawnSync(process.execPath,[root+'node_modules/wrangler/bin/wrangler.js','secret','bulk','--config',root+'wrangler.cloudflare.json'],{
 cwd:root,input:JSON.stringify(values),encoding:'utf8',stdio:['pipe','pipe','pipe'],
 env:{...process.env,WRANGLER_SEND_METRICS:'false',WRANGLER_LOG:'error'}
});
// Do not relay CLI output: even upstream errors must never echo secret values.
if(result.error||result.status!==0){console.error('Cloudflare 密钥同步失败，请检查 Wrangler 登录状态和账户权限。');process.exit(1);}
console.log('三个模型参数已作为 Cloudflare Secrets 保存；未显示其内容。');
