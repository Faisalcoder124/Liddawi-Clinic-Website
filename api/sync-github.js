import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return res.status(400).json({
      error: 'Missing GITHUB_TOKEN',
      how_to_fix: '1) Go to GitHub -> Settings -> Developer settings -> Personal Access Tokens -> Tokens (classic) -> Generate new token -> check [repo] scope -> Copy token. 2) In Design Arena, open Secrets tab -> Add Secret -> Name: GITHUB_TOKEN Value: paste token -> Save. 3) Then call POST /api/sync-github again.'
    });
  }

  const owner = 'Faisalcoder124';
  const repo = 'Liddawi-Clinic-Website';
  const branch = 'main';
  const root = process.cwd();

  const excludeDirs = new Set(['node_modules', 'dist', '.git', '.vercel', '.vite', 'dist-ssr']);
  const excludeFilesExact = new Set(['.env', '.env.local', 'liddawi-clinic-website.zip', 'Liddawi-Clinic-Website.zip', 'liddawi-clinic-website.tar.gz', 'liddawi-clinic-source.tar.gz']);
  const excludePrefixes = ['public/liddawi', 'public/Liddawi', 'public/uploads', 'public/images', 'public/videos'];
  
  function shouldExclude(relativePath) {
    if (excludeFilesExact.has(path.basename(relativePath))) return true;
    for (const pref of excludePrefixes) if (relativePath.startsWith(pref)) return true;
    const parts = relativePath.split('/');
    if (parts.some(p => excludeDirs.has(p))) return true;
    if (relativePath.includes('sync-github')) return false; // allow this file itself will be later removed? but ok
    return false;
  }

  function walk(dir, list = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      const rel = path.relative(root, full).replace(/\\/g, '/');
      if (shouldExclude(rel)) continue;
      if (entry.isDirectory()) {
        if (excludeDirs.has(entry.name)) continue;
        walk(full, list);
      } else {
        // skip large binary > 800kb and zip/tar
        try {
          const stat = fs.statSync(full);
          if (stat.size > 800 * 1024) continue;
          if (rel.endsWith('.zip') || rel.endsWith('.tar.gz')) continue;
          list.push(rel);
        } catch {}
      }
    }
    return list;
  }

  // explicit allowlist to keep repo clean - only project files
  const allowed = [
    'package.json',
    'package-lock.json',
    '.gitignore',
    'README.md',
    '.env.example',
    'index.html',
    'vite.config.ts',
    'vercel.json',
    'tsconfig.json',
    'tsconfig.app.json',
    'tsconfig.node.json',
    'eslint.config.js'
  ];

  let allFiles = walk(root);
  // filter to meaningful files
  allFiles = allFiles.filter(f => 
    f.startsWith('src/') || 
    f.startsWith('api/') || 
    f.startsWith('public/') || 
    allowed.includes(f)
  );
  // ensure api/sync-github.js itself is NOT infinite loop pushing but we can include
  allFiles = [...new Set(allFiles)];

  const results = [];
  for (const filePath of allFiles) {
    try {
      const fullPath = path.join(root, filePath);
      const contentBuf = fs.readFileSync(fullPath);
      const b64 = contentBuf.toString('base64');

      // Get existing sha
      let sha = null;
      const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath)}?ref=${branch}`;
      const getRes = await fetch(getUrl, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json', 'User-Agent': 'liddawi-sync' }
      });
      if (getRes.ok) {
        const j = await getRes.json();
        if (j.sha) sha = j.sha;
        // skip if same content (optional optimization: compare)
        // we still push to be safe
      } else if (getRes.status !== 404) {
        const txt = await getRes.text();
        console.log('GET failed', filePath, txt.slice(0,200));
      }

      const putBody = {
        message: `feat: sync ${filePath}`,
        content: b64,
        branch,
        ...(sha ? { sha } : {})
      };
      const putRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath)}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'liddawi-sync'
        },
        body: JSON.stringify(putBody)
      });
      const pj = await putRes.json();
      if (!putRes.ok) {
        results.push({ file: filePath, ok: false, error: pj.message || JSON.stringify(pj).slice(0,400) });
      } else {
        results.push({ file: filePath, ok: true, commit: pj.commit?.sha?.slice(0,7) });
      }
    } catch (e) {
      results.push({ file: filePath, ok: false, error: e.message });
    }
    // rate limit friendly
    await new Promise(r => setTimeout(r, 180));
  }

  // Clean up temporary sync file from repo after sync? Keep it for future syncs but optionally we can delete it from GitHub after success
  // Here we will leave it, but you can delete api/sync-github.js manually from GitHub later

  return res.status(200).json({ 
    message: `Synced ${results.filter(r=>r.ok).length}/${results.length} files to ${owner}/${repo}`,
    synced: results.length,
    results,
    repo_url: `https://github.com/${owner}/${repo}`
  });
}
