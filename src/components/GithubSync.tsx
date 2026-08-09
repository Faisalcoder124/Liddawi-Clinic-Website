import { useState, useEffect } from 'react';

const REPO = 'Faisalcoder124/Liddawi-Clinic-Website';

export default function GithubSync() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [autoTried, setAutoTried] = useState(false);

  const trigger = async (isAuto=false) => {
    setLoading(true);
    if (!isAuto) { setLogs([]); setResult(null); }
    try {
      const endpoints = ['/api/push-now', '/api/sync-github'];
      for (const ep of endpoints) {
        try {
          setLogs(prev => [...prev, { file: `Calling ${ep}...`, ok: true }]);
          const res = await fetch(ep, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: '{}' });
          const data = await res.json();
          if (res.ok && data.hasToken !== false) {
            setResult(data);
            if (data.results) setLogs(data.results);
            else setLogs(prev=>[...prev, { file: JSON.stringify(data).slice(0,200), ok: true }]);
            if (data.synced>0 || (data.total>0 && data.synced===data.total)) return;
          } else {
            setLogs(prev=>[...prev, { file: `${ep} -> ${data.error||'no token'}`, ok: false }]);
          }
        } catch (e:any) {
          setLogs(prev=>[...prev, { file: `${ep} error: ${e.message}`, ok:false }]);
        }
      }
    } finally {
      setLoading(false);
      setAutoTried(true);
    }
  };

  useEffect(()=>{
    // auto push on mount if token exists
    if (!autoTried) {
      trigger(true);
    }
  },[]);

  return (
    <div className="min-h-screen bg-[#FCFCF7] text-[#0B1F18] p-6 lg:p-12">
      <div className="max-w-[760px] mx-auto">
        <div className="rounded-[28px] bg-white border border-black/10 p-8 shadow-xl">
          <h1 className="text-[28px] font-[800] tracking-tight">GitHub Push — {REPO}</h1>
          <p className="mt-2 text-[13px] text-black/60">Auto-pushing all files to <a className="underline font-bold" href={`https://github.com/${REPO}`} target="_blank">{REPO}</a>. Token detected via Secrets.</p>
          <div className="mt-4 rounded-[14px] bg-[#0B1F18] text-white p-4 text-[13px]">
            Status: {loading ? '⏳ Pushing to GitHub...' : result ? `✅ Done — ${result.synced||0}/${result.total||0} files synced` : 'Waiting...'}
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={()=>trigger(false)} disabled={loading} className="flex-1 rounded-full bg-[#0B1F18] text-white h-11 font-[700] disabled:opacity-50">{loading?'Pushing...':'Push Again'}</button>
            <a href={`https://github.com/${REPO}`} target="_blank" className="rounded-full border border-black/10 px-6 h-11 grid place-items-center font-semibold text-[13px]">Open Repo</a>
          </div>
          {result && (
            <div className="mt-4 rounded-[12px] bg-black/[0.04] p-3 text-[11px] font-mono">Synced {result.synced}/{result.total} — {result.ownerRepo||REPO}</div>
          )}
          <div className="mt-6 max-h-[420px] overflow-auto rounded-[14px] bg-[#FBFAF6] border border-black/10 p-3 space-y-1">
            {logs.length===0 ? <div className="text-[12px] text-black/40">Logs...</div> : logs.map((l,i)=><div key={i} className={`text-[11px] font-mono flex justify-between py-1 border-b border-black/5 ${l.ok?'text-green-700':'text-red-600'}`}><span className="truncate max-w-[60%]">{l.file}</span><span>{l.ok?'✓':'✗'} {l.error?l.error.slice(0,60):''}</span></div>)}
          </div>
          <a href="/" className="block text-center mt-4 text-[13px] font-semibold underline">← Back to site</a>
        </div>
      </div>
    </div>
  );
}
