export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return res.status(200).json({ hasToken: false, error: 'No GITHUB_TOKEN env var' });
  }

  const owner = 'Faisalcoder124';
  const repo = 'Liddawi-Clinic-Website';
  const branch = 'main';

  const fs = await import('fs');
  const pathMod = await import('path');
  const root = process.cwd();
  const excludeDirs = new Set(['node_modules','dist','.git','.vercel','.vite','dist-ssr']);

  function walk(dir, list=[]) {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return list; }
    for (const e of entries) {
      const full = pathMod.join(dir, e.name);
      const rel = pathMod.relative(root, full).replace(/\\/g,'/');
      if (rel.startsWith('public/liddawi') || rel.startsWith('public/Liddawi')) continue;
      if (['.env','.env.local'].includes(e.name)) continue;
      if (rel.endsWith('.zip') || rel.endsWith('.tar.gz')) continue;
      if (excludeDirs.has(e.name)) continue;
      const parts = rel.split('/');
      if (parts.some(p=>excludeDirs.has(p))) continue;
      if (e.isDirectory()) walk(full, list);
      else {
        const allowedRoots = ['.gitignore','package.json','package-lock.json','README.md','.env.example','index.html','vite.config.ts','vercel.json','tsconfig.json','tsconfig.app.json','tsconfig.node.json','eslint.config.js'];
        if (parts[0]==='src' || parts[0]==='api' || parts[0]==='public' || parts[0]==='scripts' || allowedRoots.includes(rel)) {
          try { const st = fs.statSync(full); if (st.size > 800*1024) continue; list.push(rel); } catch {}
        }
      }
    }
    return list;
  }

  const files = walk(root);
  const results = [];
  for (const fp of files) {
    try {
      const full = pathMod.join(root, fp);
      const content = fs.readFileSync(full).toString('base64');
      let sha = null;
      const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(fp)}?ref=${branch}`;
      const getRes = await fetch(getUrl, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json', 'User-Agent': 'liddawi-push' } });
      if (getRes.ok) { const j = await getRes.json(); sha = j.sha; }
      const putRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(fp)}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json', 'User-Agent': 'liddawi-push' },
        body: JSON.stringify({ message: `feat: sync ${fp}`, content, branch, ...(sha?{sha}:{}) })
      });
      const pj = await putRes.json();
      if (!putRes.ok) results.push({ file: fp, ok: false, error: pj.message || JSON.stringify(pj).slice(0,300) });
      else results.push({ file: fp, ok: true, commit: pj.commit?.sha?.slice(0,7) });
    } catch (e) { results.push({ file: fp, ok: false, error: e.message }); }
    await new Promise(r=>setTimeout(r,260));
  }

  return res.status(200).json({ hasToken: true, ownerRepo: `${owner}/${repo}`, synced: results.filter(r=>r.ok).length, total: results.length, results });
}
