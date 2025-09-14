'use client'
import { useEffect, useMemo, useState } from 'react'

type Size = { w:number; h:number; holeOptionId:'none'|'lr_3mm'|'corners_3mm' }
type Device = { id:string; name:string; sizes: Size[] }
type SetItem = { labelName:string; w:number; h:number; holeOptionId:'none'|'lr_3mm'|'corners_3mm' }
type LabelSet = { id:string; name:string; items: SetItem[] }

const COLOURS=[{id:'black_white',name:'Black text on White'},{id:'yellow_black',name:'Black text on Yellow'},{id:'red_white',name:'White text on Red'},{id:'white_black',name:'Black text on White (reverse)'}] as const
const ADHESIVES=[{id:'none',name:'No adhesive'},{id:'3m',name:'3M Sticky Back'}] as const

const mmToPx=(mm:number,dpi=96)=> (mm/25.4)*dpi
const ptToMm=(pt:number)=> pt*0.3527
const round2=(n:number)=> Math.round(n*100)/100

function fillForColour(id:string){ return id==='yellow_black'?'#FFEB3B':id==='red_white'?'#D32F2F':id==='white_black'?'#FFF':'#FFF' }
function textColourFor(id:string){ return (id==='yellow_black' || id==='white_black') ? '#000' : '#FFF' }
function getHoles(cfg:any){ const HOLES_LIST=[{id:'none',holes:[] as any[]},{id:'lr_3mm',holes:[{x:5,y:0,d:3},{x:-5,y:0,d:3}]},{id:'corners_3mm',holes:[{x:5,y:5,d:3},{x:-5,y:5,d:3},{x:5,y:-5,d:3},{x:-5,y:-5,d:3}]}] as const; const opt=HOLES_LIST.find(o=>o.id===cfg.holeOptionId); if(!opt) return []; const w=cfg.widthMm,h=cfg.heightMm; return opt.holes.map((p:any)=>({x:p.x>=0?p.x:w+p.x,y:p.y>=0?p.y:h+p.y,d:p.d})) }
function buildSVG(cfg:any){ const w=cfg.widthMm,h=cfg.heightMm,r=cfg.rounded?cfg.cornerRadiusMm:0,fill=fillForColour(cfg.colourId),stroke=textColourFor(cfg.colourId),fw=cfg.bold?'700':'400',lines=(cfg.lines as string[]).filter(l=>l.trim()).map(l=>cfg.allCaps?l.toUpperCase():l),fs=ptToMm(cfg.fontSizePt),baseY=h/2-((lines.length-1)*fs*cfg.lineSpacing)/2; const texts=lines.map((line,idx)=>{ const y=baseY+idx*fs*cfg.lineSpacing; const anchor=cfg.centred?'middle':'start'; const x=cfg.centred?w/2:3; return `<text x="${x}" y="${y}" font-family="${cfg.fontFamily}" font-size="${fs}mm" font-weight="${fw}" text-anchor="${anchor}" dominant-baseline="middle" fill="${stroke}">${line.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</text>` }).join('\n'); const holes=getHoles(cfg).map(hole=>`<circle cx="${hole.x}" cy="${hole.y}" r="${hole.d/2}" fill="none" stroke="#000" stroke-width="0.1" />`).join('\n'); return `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="${w}mm" height="${h}mm" viewBox="0 0 ${w} ${h}"><rect x="0" y="0" rx="${r}" ry="${r}" width="${w}" height="${h}" fill="${fill}" stroke="#000" stroke-width="0.1"/>${holes}${texts}</svg>` }
function price(cfg:any){ const area=(cfg.widthMm*cfg.heightMm)/100, base=1.2, rate=0.18, hole=cfg.holeOptionId==='none'?0:(cfg.holeOptionId==='lr_3mm'?0.2:0.4), rounding=cfg.rounded?0.1:0, lines=(cfg.lines as string[]).filter(l=>l.trim()).length, lineC=Math.max(0,lines-1)*0.05, adh=cfg.adhesiveId==='3m'?0.25:0, unit=(base+area*rate+hole+rounding+lineC+adh), disc=cfg.quantity>=50?0.8:cfg.quantity>=20?0.88:cfg.quantity>=10?0.93:cfg.quantity>=5?0.97:1, unit2=unit*disc; return { unit: round2(unit2), subtotal: round2(unit2*cfg.quantity) } }

export default function Designer(){
  const [tab,setTab]=useState<'custom'|'sets'>('custom')
  const [basket,setBasket]=useState<any[]>(()=>{ try{return JSON.parse(localStorage.getItem('basket_v1')||'[]')}catch{return[]} }); useEffect(()=>{ localStorage.setItem('basket_v1', JSON.stringify(basket)) },[basket])
  // custom
  const [catalog,setCatalog]=useState<Device[]>([]); useEffect(()=>{ try{ setCatalog(JSON.parse(localStorage.getItem('catalog_v1')||'[]')) }catch{} },[])
  const [cfg,setCfg]=useState<any>(()=>{ try{return JSON.parse(localStorage.getItem('label_cfg_v1')||'null')||{widthMm:88,heightMm:25,fontFamily:'Arial',fontSizePt:14,bold:true,allCaps:true,centred:true,rounded:true,cornerRadiusMm:2,lineSpacing:1.1,lines:[''],quantity:1,holeOptionId:'none',colourId:'black_white',adhesiveId:'none'}}catch{return {widthMm:88,heightMm:25,fontFamily:'Arial',fontSizePt:14,bold:true,allCaps:true,centred:true,rounded:true,cornerRadiusMm:2,lineSpacing:1.1,lines:[''],quantity:1,holeOptionId:'none',colourId:'black_white',adhesiveId:'none'}}}); useEffect(()=>{ localStorage.setItem('label_cfg_v1', JSON.stringify(cfg)) },[cfg])
  const svg=useMemo(()=>buildSVG(cfg),[cfg]); const s=Math.min(460/mmToPx(cfg.widthMm),460/mmToPx(cfg.heightMm))
  const addToBasket=()=>{ const p=price(cfg); const item={id:Math.random().toString(36).slice(2,10), cfg:{...cfg}, unit:p.unit, total:p.subtotal, svg}; setBasket([item, ...basket]) }
  // sets
  const [sets,setSets]=useState<LabelSet[]>([]); const [activeSetId,setActiveSetId]=useState<string>(''); const [texts,setTexts]=useState<Record<string,string>>({}); useEffect(()=>{ try{ setSets(JSON.parse(localStorage.getItem('sets_v1')||'[]')) }catch{} },[])
  const activeSet = sets.find(s=>s.id===activeSetId)
  const addSetToBasket = () => { if(!activeSet) return alert('Select a set first.'); const items = activeSet.items.map((it, idx)=>{ const t = texts[`${activeSet.id}:${idx}`] || ''; const config = { ...cfg, widthMm:it.w, heightMm:it.h, holeOptionId:it.holeOptionId, lines:[t] }; const svgX = buildSVG(config); const p = price(config); return { id: Math.random().toString(36).slice(2,10), cfg: config, unit: p.unit, total: p.subtotal, svg: svgX } }); setBasket([...items, ...basket]); alert('Set added to basket. Open Checkout to view.') }

  return (<div className="space-y-6">
    <div className="tabs">
      <button className={`tab ${tab==='custom'?'tab-active text-white':'text-slate-700'}`} onClick={()=>setTab('custom')}>Custom Label</button>
      <button className={`tab ${tab==='sets'?'tab-active text-white':'text-slate-700'}`} onClick={()=>setTab('sets')}>Predefined Sets</button>
    </div>

    {tab==='custom' && (<div className="grid lg:grid-cols-3 gap-6">
      <section className="lg:col-span-2 space-y-6">
        <div className="card p-6">
          <h1 className="text-2xl font-extrabold mb-2">Custom Label</h1>
          {cfg.lines.map((line:string,idx:number)=>(<input key={idx} className="input w-full mb-2" value={line} placeholder={`Line ${idx+1}`} onChange={e=>{ const n=[...cfg.lines]; n[idx]=e.target.value; setCfg({...cfg, lines:n}) }} />))}
          <div className="flex gap-2 mb-4"><button className="btn btn-outline" onClick={()=>setCfg({...cfg,lines:[...cfg.lines,'']})}>Add Line</button>{cfg.lines.length>1 && <button className="btn btn-outline" onClick={()=>setCfg({...cfg,lines:cfg.lines.slice(0,-1)})}>Remove Last</button>}</div>
          <div className="grid md:grid-cols-3 gap-3"><div className="input">Width (mm): <input className="w-24 ml-2" value={cfg.widthMm} onChange={e=>setCfg({...cfg,widthMm:Number(e.target.value)||cfg.widthMm})}/></div><div className="input">Height (mm): <input className="w-24 ml-2" value={cfg.heightMm} onChange={e=>setCfg({...cfg,heightMm:Number(e.target.value)||cfg.heightMm})}/></div><div className="input">Corner radius (mm): <input className="w-20 ml-2" value={cfg.cornerRadiusMm} onChange={e=>setCfg({...cfg,cornerRadiusMm:Number(e.target.value)||cfg.cornerRadiusMm})}/></div></div>
          <div className="grid md:grid-cols-3 gap-3 mt-3"><select className="input" value={cfg.colourId} onChange={e=>setCfg({...cfg,colourId:e.target.value})}>{COLOURS.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select><select className="input" value={cfg.holeOptionId} onChange={e=>setCfg({...cfg,holeOptionId:e.target.value})}><option value="none">No Holes</option><option value="lr_3mm">Left & Right (3 mm)</option><option value="corners_3mm">4 Corners (3 mm)</option></select><select className="input" value={cfg.adhesiveId||'none'} onChange={e=>setCfg({...cfg,adhesiveId:e.target.value})}><option value="none">No adhesive</option><option value="3m">3M Sticky Back</option></select></div>
          <div className="mt-2 flex flex-wrap gap-4 text-sm"><label className="flex items-center gap-2"><input type="checkbox" checked={cfg.bold} onChange={e=>setCfg({...cfg,bold:e.target.checked})}/>Bold</label><label className="flex items-center gap-2"><input type="checkbox" checked={cfg.allCaps} onChange={e=>setCfg({...cfg,allCaps:e.target.checked})}/>All caps</label><label className="flex items-center gap-2"><input type="checkbox" checked={cfg.centred} onChange={e=>setCfg({...cfg,centred:e.target.checked})}/>Centre align</label><label className="flex items-center gap-2"><input type="checkbox" checked={cfg.rounded} onChange={e=>setCfg({...cfg,rounded:e.target.checked})}/>Rounded corners</label></div>
        </div>
        <div className="card p-6">
          <h2 className="font-semibold mb-3">Live Preview</h2>
          <div className="text-sm text-slate-600 mb-2">{cfg.widthMm} × {cfg.heightMm} mm</div>
          <div className="overflow-auto border rounded-xl p-3 bg-white shadow-inner"><div style={{width:(mmToPx(cfg.widthMm)*s)+'px', height:(mmToPx(cfg.heightMm)*s)+'px'}} dangerouslySetInnerHTML={{__html: svg}} /></div>
          <div className="mt-4 grid md:grid-cols-3 gap-3"><div><div className="text-xs text-slate-600">Unit</div><div className="text-xl font-bold">£{price(cfg).unit.toFixed(2)}</div></div><div><div className="text-xs text-slate-600">Qty</div><div className="text-lg">{cfg.quantity}</div></div><div><div className="text-xs text-slate-600">Total</div><div className="text-xl font-bold">£{price(cfg).subtotal.toFixed(2)}</div></div></div>
          <div className="mt-3"><button className="btn btn-primary" onClick={addToBasket}>Add to basket</button></div>
        </div>
      </section>
      <aside className="card p-6 space-y-4"><h2 className="font-semibold">Saved sizes</h2><div className="text-sm text-slate-600">Pick a saved size to apply.</div><div className="space-y-3 max-h-[420px] overflow-auto pr-1">{(JSON.parse(localStorage.getItem('catalog_v1')||'[]') as Device[]).map(dev=>(<div key={dev.id} className="border rounded-xl p-3"><div className="font-medium">{dev.name}</div><div className="mt-2 flex flex-wrap gap-2">{dev.sizes.map((s,idx)=>(<button key={idx} className="badge hover:bg-brand/10" onClick={()=>setCfg({...cfg,widthMm:s.w,heightMm:s.h,holeOptionId:s.holeOptionId})}>{s.w}×{s.h} ({s.holeOptionId})</button>))}</div></div>))}</div></aside>
    </div>)}

    {tab==='sets' && (<div className="grid lg:grid-cols-3 gap-6">
      <section className="lg:col-span-2 card p-6">
        <h1 className="text-2xl font-extrabold mb-2">Predefined Sets</h1>
        {!activeSet && <p className="text-sm text-slate-600">Select a set on the right. You’ll just type the text for each label.</p>}
        {activeSet && (<div className="space-y-4">
          <h2 className="font-semibold">{activeSet.name}</h2>
          {activeSet.items.length===0 && <div className="text-sm text-slate-500">This set has no items yet.</div>}
          {activeSet.items.map((it,idx)=>(<div key={idx} className="border rounded-xl p-3"><div className="text-sm text-slate-600 mb-2">{it.labelName} — {it.w}×{it.h} mm ({it.holeOptionId})</div><input className="input w-full" placeholder="Enter text for this label" value={(texts[`${activeSet.id}:${idx}`] || '')} onChange={e=> setTexts({...texts, [`${activeSet.id}:${idx}`]: e.target.value}) } /></div>))}
          <div className="grid md:grid-cols-3 gap-3"><select className="input" value={cfg.colourId} onChange={e=>setCfg({...cfg,colourId:e.target.value})}>{COLOURS.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select><select className="input" value={cfg.adhesiveId||'none'} onChange={e=>setCfg({...cfg,adhesiveId:e.target.value})}>{ADHESIVES.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select><div className="input">Qty per label: <button className="btn btn-outline ml-2" onClick={()=>setCfg({...cfg,quantity: Math.max(1,(cfg.quantity||1)-1)})}>-</button><span className="mx-2">{cfg.quantity}</span><button className="btn btn-outline" onClick={()=>setCfg({...cfg,quantity: Math.min(999,(cfg.quantity||1)+1)})}>+</button></div></div>
          <button className="btn btn-primary" onClick={addSetToBasket}>Add whole set to basket</button>
        </div>)}
      </section>
      <aside className="card p-6 space-y-4"><h2 className="font-semibold">Available sets</h2><div className="space-y-3 max-h-[480px] overflow-auto pr-1">{(JSON.parse(localStorage.getItem('sets_v1')||'[]') as LabelSet[]).map(s=>(<button key={s.id} className={`w-full text-left border rounded-xl p-3 hover:bg-brand/10 ${activeSetId===s.id?'ring-2 ring-brand':''}`} onClick={()=>setActiveSetId(s.id)}><div className="font-medium">{s.name}</div><div className="text-xs text-slate-600">{s.items.length} item(s)</div></button>))}<div className="text-xs text-slate-500">{((JSON.parse(localStorage.getItem('sets_v1')||'[]') as LabelSet[]).length===0) && 'No sets yet (Admin can add them).'}</div></div></aside>
    </div>)}
  </div>)
}
