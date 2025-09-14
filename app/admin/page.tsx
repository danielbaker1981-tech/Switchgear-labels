'use client'
import { useEffect, useState } from 'react'
type Size = { w:number; h:number; holeOptionId:'none'|'lr_3mm'|'corners_3mm' }
type Device = { id:string; name:string; sizes: Size[] }
type SetItem = { labelName:string; w:number; h:number; holeOptionId:'none'|'lr_3mm'|'corners_3mm' }
type LabelSet = { id:string; name:string; items: SetItem[] }
const uid = () => Math.random().toString(36).slice(2,10)
function getAdminPass(): string { if(typeof window!=='undefined' && (window as any).__ADMIN_PASS__) return String((window as any).__ADMIN_PASS__); return 'switch' }
export default function AdminPage(){
  const [ok,setOk]=useState(false); const [pw,setPw]=useState('')
  useEffect(()=>{ try{ if(localStorage.getItem('admin_ok')==='1') setOk(true)}catch{} },[])
  const tryLogin=()=>{ if(pw===getAdminPass()){ setOk(true); localStorage.setItem('admin_ok','1') } else alert('Incorrect password') }
  if(!ok){ return (<div className="card p-8 max-w-md mx-auto"><h1 className="text-xl font-bold mb-2">Admin login</h1><input className="input w-full mb-2" type="password" placeholder="Password" value={pw} onChange={e=>setPw(e.target.value)}/><button className="btn btn-primary w-full" onClick={tryLogin}>Enter</button><p className="text-xs text-slate-500 mt-3">Set NEXT_PUBLIC_ADMIN_PASS in .env.local</p></div>) }
  const [catalog,setCatalog]=useState<Device[]>([]); const [sets,setSets]=useState<LabelSet[]>([])
  useEffect(()=>{ try{ setCatalog(JSON.parse(localStorage.getItem('catalog_v1')||'[]')) }catch{}; try{ setSets(JSON.parse(localStorage.getItem('sets_v1')||'[]')) }catch{} },[])
  const saveCatalog=(n:Device[])=>{ setCatalog(n); localStorage.setItem('catalog_v1', JSON.stringify(n)) }
  const saveSets=(n:LabelSet[])=>{ setSets(n); localStorage.setItem('sets_v1', JSON.stringify(n)) }
  // Sizes (renamed vars)
  const [sizeName,setSizeName]=useState(''); const [w,setW]=useState(''); const [h,setH]=useState(''); const [hole,setHole]=useState<'none'|'lr_3mm'|'corners_3mm'>('none')
  const addSize=()=>{ if(!sizeName||!Number(w)||!Number(h)) return alert('Fill name, width, height'); const s={w:Number(w),h:Number(h),holeOptionId:hole}; const next=[...catalog]; let d=next.find(x=>x.name.toLowerCase()===sizeName.toLowerCase()); if(!d){ d={id:uid(),name:sizeName,sizes:[s]} ; next.unshift(d)} else d.sizes.push(s); saveCatalog(next); setW(''); setH('') }
  // Sets
  const [setName,setSetName]=useState(''); const [selSetId,setSelSetId]=useState<string>(''); const [itemLabel,setItemLabel]=useState(''); const [sw,setSw]=useState(''); const [sh,setSh]=useState(''); const [shole,setShole]=useState<'none'|'lr_3mm'|'corners_3mm'>('none')
  const addSet=()=>{ if(!setName.trim()) return; const s:{id:string,name:string,items:SetItem[]}={id:uid(),name:setName.trim(),items:[]}; const next=[s, ...sets]; saveSets(next); setSetName(''); setSelSetId(s.id) }
  const addItemToSet=()=>{ if(!selSetId) return alert('Choose a set below first.'); if(!itemLabel || !Number(sw) || !Number(sh)) return alert('Label name, width, height required.'); const next=[...sets]; const s=next.find(x=>x.id===selSetId); if(!s) return; s.items.push({labelName:itemLabel, w:Number(sw), h:Number(sh), holeOptionId:shole }); saveSets(next); setItemLabel(''); setSw(''); setSh('') }
  return (<div className="space-y-8">
    <section className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 card p-6">
        <h2 className="text-xl font-bold mb-4">Catalog — Individual Sizes</h2>
        <div className="grid md:grid-cols-4 gap-2">
          <input className="input" placeholder="Device name" value={sizeName} onChange={e=>setSizeName(e.target.value)} />
          <input className="input" placeholder="Width (mm)" value={w} onChange={e=>setW(e.target.value)} />
          <input className="input" placeholder="Height (mm)" value={h} onChange={e=>setH(e.target.value)} />
          <select className="input" value={hole} onChange={e=>setHole(e.target.value as any)}>
            <option value="none">No Holes</option>
            <option value="lr_3mm">3 mm Left & Right</option>
            <option value="corners_3mm">3 mm 4-Corners</option>
          </select>
        </div>
        <div className="mt-3"><button className="btn btn-primary" onClick={addSize}>Add size</button></div>
      </div>
      <div className="card p-6">
        <h3 className="font-semibold mb-3">Your sizes</h3>
        <div className="space-y-2">
        {catalog.map(d=> (<div key={d.id} className="border rounded-xl p-3"><div className="font-medium">{d.name}</div><div className="mt-2 flex flex-wrap gap-2">{d.sizes.map((s,idx)=>(<span key={idx} className="badge">{s.w}×{s.h} ({s.holeOptionId})</span>))}</div></div>))}
        {catalog.length===0 && <div className="text-sm text-slate-500">No sizes yet.</div>}
        </div>
      </div>
    </section>
    <section className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 card p-6">
        <h2 className="text-xl font-bold mb-4">Catalog — Predefined Sets</h2>
        <div className="flex gap-2">
          <input className="input flex-1" placeholder="Set name (e.g., Main Panel Set A)" value={setName} onChange={e=>setSetName(e.target.value)} />
          <button className="btn btn-primary" onClick={addSet}>Add set</button>
        </div>
        <div className="mt-4">
          <label className="text-sm block mb-2">Choose a set to add items to:</label>
          <select className="input w-full" value={selSetId} onChange={e=>setSelSetId(e.target.value)}>
            <option value="">— Select a set —</option>
            {sets.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="grid md:grid-cols-4 gap-2 mt-3">
          <input className="input" placeholder="Label name (e.g., MAIN SWITCH)" value={itemLabel} onChange={e=>setItemLabel(e.target.value)} />
          <input className="input" placeholder="Width (mm)" value={sw} onChange={e=>setSw(e.target.value)} />
          <input className="input" placeholder="Height (mm)" value={sh} onChange={e=>setSh(e.target.value)} />
          <select className="input" value={shole} onChange={e=>setShole(e.target.value as any)}>
            <option value="none">No Holes</option>
            <option value="lr_3mm">3 mm Left & Right</option>
            <option value="corners_3mm">3 mm 4-Corners</option>
          </select>
        </div>
        <div className="mt-3"><button className="btn btn-outline" onClick={addItemToSet}>Add item to set</button></div>
      </div>
      <div className="card p-6">
        <h3 className="font-semibold mb-3">Your sets</h3>
        <div className="space-y-3">
        {sets.map(s=> (<div key={s.id} className="border rounded-xl p-3"><div className="font-medium">{s.name}</div><div className="mt-2 text-xs text-slate-600">{s.items.length} item(s)</div></div>))}
        {sets.length===0 && <div className="text-sm text-slate-500">No sets yet.</div>}
        </div>
      </div>
    </section>
  </div>) }
