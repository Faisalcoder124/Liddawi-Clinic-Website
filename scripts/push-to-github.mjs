import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.log('[github-sync] No GITHUB_TOKEN env var, skipping auto-push (local build)');
  process.exit(0);
}

const owner = 'Faisalcoder124';
const repo = 'Liddawi-Clinic-Website';
const branch = 'main';

console.log(`[github-sync] Pushing to ${owner}/${repo} with token ${token.slice(0,6)}***`);

const excludeDirs = new Set(['node_modules','dist','.git','.vercel','.vite','dist-ssr']);

function walk(dir, list=[]) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return list; }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    const rel = path.relative(root, full).replace(/\\/g,'/');
    // skip big artifacts
    if (rel.startsWith('public/liddawi') || rel.startsWith('public/Liddawi')) continue;
    if (e.name === '.env' || e.name === '.env.local') continue;
    if (rel.endsWith('.zip') || rel.endsWith('.tar.gz')) continue;
    if (excludeDirs.has(e.name)) continue;
    const parts = rel.split('/');
    if (parts.some(p=>excludeDirs.has(p))) continue;
    if (e.isDirectory()) {
      walk(full, list);
    } else {
      // include list
      const allowedRoots = ['.gitignore','package.json','package-lock.json','README.md','.env.example','index.html','vite.config.ts','vercel.json','tsconfig.json','tsconfig.app.json','tsconfig.node.json','eslint.config.js'];
      const isAllowed =
        parts[0]==='src' ||
        parts[0]==='api' ||
        parts[0]==='public' ||
        parts[0]==='scripts' ||
        allowedRoots.includes(rel) ||
        allowedRoots.includes(e.name);
      if (!isAllowed) continue;
      try {
        const st = fs.statSync(full);
        if (st.size > 800*1024) { console.log(`[skip large ${st.size}] ${rel}`); continue; }
        list.push(rel);
      } catch {}
    }
  }
  return list;
}

const files = walk(root).sort();
console.log(`[github-sync] Found ${files.length} files:\n  ${files.join('\n  ')}`);
let ok=0, fail=0;
for (const fp of files) {
  try {
    const full = path.join(root, fp);
    const content = fs.readFileSync(full).toString('base64');
    let sha=null;
    const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(fp)}?ref=${branch}`;
    const getRes = await fetch(getUrl, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json', 'User-Agent':'liddawi-build-push' } });
    if (getRes.ok) { const j=await getRes.json(); sha=j.sha; }
    const putRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(fp)}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json', 'Content-Type':'application/json', 'User-Agent':'liddawi-build-push' },
      body: JSON.stringify({ message: `feat: sync ${fp} via vercel build`, content, branch, ...(sha?{sha}:{}) })
    });
    const pj = await putRes.json();
    if (!putRes.ok) {
      console.log(`[fail] ${fp} -> ${pj.message||JSON.stringify(pj).slice(0,300)}`);
      fail++;
    } else {
      console.log(`[ok] ${fp} -> ${pj.commit?.sha?.slice(0,7)}`);
      ok++;
    }
  } catch (e) {
    console.log(`[error] ${fp} ${e.message}`);
    fail++;
  }
  await new Promise(r=>setTimeout(r,260));
}
console.log(`[github-sync] Done: ${ok} ok, ${fail} fail of ${files.length}`);
process.exit(0);
