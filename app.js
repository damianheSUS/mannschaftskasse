
const DB = {name:'mkasse-pro', ver:1};
const stores = ['entries','fees','players','catalog'];
let db;

// initial data (from Excel)
const PRESET_PLAYERS = ["Massi", "Nico Kessler", "Ajdin Cehadarevic", "Felix Thiele", "Gerrit Brüning", "Julian Berger", "Thorben Berger", "Vinzent Angerstein", "Tim Glettenberg", "Kai Fischersworring", "Damian Heine", "Nico Wünnenberg", "Mattis Birkel", "Marc Günther", "Maxi Plate", "Andre Ockenga", "Apo Bakas", "Corbi aus dem Siepen", "Marijan Hilgers", "Fabian Hilgers ", "Hamoud Alhuayet ", "Maurice Paul", "Maurice Hundenborn", "Nils Glettenberg", "Bastian Volk", "Daniel Parei", "Lars Rittermeier", "Jan Dörrenhaus", "Armin Ammersilge", "Rene Bien"];
const PRESET_CATALOG = [{"name": "Sieg", "betrag": 5.0, "einheit": "fix", "kontext": "Beides", "kiste": "Nein", "hinweis": null}, {"name": "Gegentor", "betrag": 0.5, "einheit": "fix", "kontext": "Beides", "kiste": "Nein", "hinweis": "€/Gegentor"}, {"name": "Gelbe Karte (Unsportlichkeit)", "betrag": 15.0, "einheit": "fix", "kontext": "Spiel", "kiste": "Nein", "hinweis": null}, {"name": "Gelb-rote Karte (Unsportlichkeit)", "betrag": 30.0, "einheit": "fix", "kontext": "Beides", "kiste": "Nein", "hinweis": null}, {"name": "Rote Karte", "betrag": 10.0, "einheit": "fix", "kontext": "Training", "kiste": "Nein", "hinweis": null}, {"name": "Rote Karte (Unsportlichkeit)", "betrag": 75.0, "einheit": "fix", "kontext": "Spiel", "kiste": "Ja", "hinweis": "75€ + 🍺"}, {"name": "Zu spät (Training)", "betrag": 0.5, "einheit": "pro Minute", "kontext": "Training", "kiste": "Nein", "hinweis": "€/Minute"}, {"name": "Zu spät (Spiel)", "betrag": 1.0, "einheit": "pro Minute", "kontext": "Spiel", "kiste": "Nein", "hinweis": "€/Minute"}, {"name": "Unentschuldigtes Fehlen (Training)", "betrag": 10.0, "einheit": "fix", "kontext": "Training", "kiste": "Nein", "hinweis": null}, {"name": "Unentschuldigtes Fehlen (Spiel)", "betrag": 75.0, "einheit": "fix", "kontext": "Spiel", "kiste": "Nein", "hinweis": null}, {"name": "Falscher Einwurf", "betrag": 3.0, "einheit": "fix", "kontext": "Beides", "kiste": "Nein", "hinweis": null}, {"name": "Ball über'n Zaun", "betrag": 1.5, "einheit": "fix", "kontext": "Beides", "kiste": "Nein", "hinweis": null}, {"name": "Wildpinkeln", "betrag": 5.0, "einheit": "fix", "kontext": "Beides", "kiste": "Nein", "hinweis": null}, {"name": "Toilettengang während Einheit", "betrag": 2.0, "einheit": "fix", "kontext": "Beides", "kiste": "Nein", "hinweis": null}, {"name": "Keine 20er", "betrag": 1.0, "einheit": "fix", "kontext": "Beides", "kiste": "Nein", "hinweis": null}, {"name": "20er-Runde", "betrag": 1.0, "einheit": "fix", "kontext": "Beides", "kiste": "Nein", "hinweis": null}, {"name": "Beini", "betrag": 1.0, "einheit": "fix", "kontext": "Training", "kiste": "Nein", "hinweis": null}, {"name": "Vergessene Tasche", "betrag": 20.0, "einheit": "fix", "kontext": "Spiel", "kiste": "Nein", "hinweis": null}, {"name": "Vergessene Fußballschuhe", "betrag": 10.0, "einheit": "fix", "kontext": "Beides", "kiste": "Nein", "hinweis": null}, {"name": "Vergessene Laufschuhe", "betrag": 5.0, "einheit": "fix", "kontext": "Beides", "kiste": "Nein", "hinweis": null}, {"name": "Vergessene Schienbeinschoner", "betrag": 3.0, "einheit": "fix", "kontext": "Beides", "kiste": "Nein", "hinweis": null}, {"name": "Vergessenes sonstiges Teil", "betrag": 1.0, "einheit": "fix", "kontext": "Spiel", "kiste": "Nein", "hinweis": null}, {"name": "Ungeputzte Fußballschuhe", "betrag": 5.0, "einheit": "fix", "kontext": "Spiel", "kiste": "Nein", "hinweis": null}, {"name": "Trikot/Hose/Stutzen falsch in Trikottasche", "betrag": 3.0, "einheit": "fix", "kontext": "Spiel", "kiste": "Nein", "hinweis": null}, {"name": "Pinkeln in der Dusche", "betrag": 5.0, "einheit": "fix", "kontext": "Beides", "kiste": "Nein", "hinweis": null}, {"name": "Abhauen ohne Hand geben", "betrag": 3.0, "einheit": "fix", "kontext": "Spiel", "kiste": "Nein", "hinweis": null}, {"name": "Rauchen nach Treffpunkt", "betrag": 3.0, "einheit": "fix", "kontext": "Spiel", "kiste": "Nein", "hinweis": null}, {"name": "Rauchen im Trikot", "betrag": 3.0, "einheit": "fix", "kontext": "Beides", "kiste": "Nein", "hinweis": null}, {"name": "Trinken im Trikot", "betrag": 3.0, "einheit": "fix", "kontext": "Training", "kiste": "Nein", "hinweis": null}, {"name": "Bier Bunkern", "betrag": 3.0, "einheit": "fix", "kontext": "Beides", "kiste": "Nein", "hinweis": null}, {"name": "Angetrunken", "betrag": 3.0, "einheit": "fix", "kontext": "Beides", "kiste": "Nein", "hinweis": null}, {"name": "Handy klingelt/vibriert", "betrag": 3.0, "einheit": "fix", "kontext": "Beides", "kiste": "Nein", "hinweis": null}, {"name": "Bier verschüttet", "betrag": 2.0, "einheit": "fix", "kontext": "Beides", "kiste": "Nein", "hinweis": null}, {"name": "Mülleimer nicht getroffen", "betrag": 2.0, "einheit": "fix", "kontext": "Beides", "kiste": "Nein", "hinweis": null}, {"name": "Nicht duschen gehen", "betrag": 1.0, "einheit": "fix", "kontext": "Beides", "kiste": "Nein", "hinweis": null}, {"name": "Lichtfehler", "betrag": 1.0, "einheit": "fix", "kontext": "Beides", "kiste": "Nein", "hinweis": null}, {"name": "Falsche Gruppe", "betrag": 1.0, "einheit": "fix", "kontext": "Beides", "kiste": "Nein", "hinweis": null}, {"name": "Beitrag", "betrag": 10.0, "einheit": "fix", "kontext": "Beides", "kiste": "Nein", "hinweis": null}];

// helpers
const € = (n)=> (n||0).toLocaleString('de-DE',{style:'currency',currency:'EUR'});
const ym = (d)=> { const t=new Date(d); return t.getFullYear()+'-'+String(t.getMonth()+1).padStart(2,'0'); };

function openDB(){
  return new Promise((res,rej)=>{
    const req=indexedDB.open(DB.name, DB.ver);
    req.onupgradeneeded=()=>{
      const d=req.result;
      stores.forEach(s=>{ if(!d.objectStoreNames.contains(s)) d.createObjectStore(s,{keyPath:'id',autoIncrement:true}); });
    };
    req.onsuccess=()=>res(req.result);
    req.onerror=()=>rej(req.error);
  });
}
function txGetAll(s){ return new Promise((res,rej)=>{ const t=db.transaction(s).objectStore(s).getAll(); t.onsuccess=()=>res(t.result||[]); t.onerror=()=>rej(t.error); }); }
function txAdd(s, obj){ return new Promise((res,rej)=>{ const t=db.transaction(s,'readwrite').objectStore(s).add(obj); t.onsuccess=()=>res(t.result); t.onerror=()=>rej(t.error); }); }
function txPut(s, obj){ return new Promise((res,rej)=>{ const t=db.transaction(s,'readwrite').objectStore(s).put(obj); t.onsuccess=()=>res(t.result); t.onerror=()=>rej(t.error); }); }
function txDel(s, id){ return new Promise((res,rej)=>{ const t=db.transaction(s,'readwrite').objectStore(s).delete(id); t.onsuccess=()=>res(); t.onerror=()=>rej(t.error); }); }
function txClear(s){ return new Promise((res,rej)=>{ const t=db.transaction(s,'readwrite').objectStore(s).clear(); t.onsuccess=()=>res(); t.onerror=()=>rej(t.error); }); }

async function ensureInitial(){
  const pls = await txGetAll('players');
  if(pls.length===0 && PRESET_PLAYERS.length){ for(const name of PRESET_PLAYERS) await txAdd('players',{name}); }
  const cat = await txGetAll('catalog');
  if(cat.length===0 && PRESET_CATALOG.length){
    for(const p of PRESET_CATALOG){
      await txAdd('catalog', {name:p.name, betrag:p.betrag||0, einheit:p.einheit||'', hinweis:p.hinweis||''});
    }
  }
}

// UI init
function el(id){ return document.getElementById(id); }
function fillSelect(sel, arr, map=(x=>x)){ sel.innerHTML=''; for(const v of arr){ const o=document.createElement('option'); const m=map(v); o.value=m; o.textContent=m; sel.appendChild(o);} }

function setTab(name){
  document.querySelectorAll('nav button').forEach(b=> b.classList.toggle('active', b.dataset.tab===name));
  document.querySelectorAll('main section').forEach(s=> s.classList.toggle('hide', s.id!=='tab-'+name && s.id!=='b_stats' && s.id!=='tab-buchungen'));
  if(name==='buchungen'){ refreshBookings(); }
  if(name==='monate'){ refreshMonths(); }
  if(name==='spieler'){ refreshPlayers(); }
  if(name==='katalog'){ refreshCatalog(); }
  if(name==='beitraege'){ refreshFees(); }
}

async function refreshPlayers(){
  const pls = await txGetAll('players');
  const names = pls.map(p=>p.name);
  // selects
  fillSelect(el('b_player'), names);
  const f = el('b_filter_player'); f.innerHTML='<option value="">Alle</option>'; names.forEach(n=>{const o=document.createElement('option');o.value=n;o.textContent=n;f.appendChild(o);});
  fillSelect(el('f_player'), names);
  // table
  const tbody=el('s_table').querySelector('tbody'); tbody.innerHTML='';
  pls.forEach(p=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${p.name}</td><td><button class="ghost" data-del="${p.id}">Löschen</button></td>`;
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll('button[data-del]').forEach(btn=> btn.onclick= async()=>{ await txDel('players', Number(btn.dataset.del)); refreshPlayers(); });
}
async function refreshCatalog(){
  const cat = await txGetAll('catalog');
  // fill penalties select
  const sel = el('b_penalty'); sel.innerHTML='';
  cat.forEach(p=>{
    const o=document.createElement('option');
    o.value=p.name; o.textContent = p.name + (p.einheit?` (${p.einheit})`:'');
    o.dataset.unit=p.einheit||''; o.dataset.amount=p.betrag||0;
    sel.appendChild(o);
  });
  sel.onchange = ()=>{
    const opt=sel.selectedOptions[0]; const unit=(opt.dataset.unit||'').toLowerCase();
    el('b_minutes_wrap').classList.toggle('hide', !unit.includes('minute'));
    el('b_amount').value = opt.dataset.amount? Number(opt.dataset.amount).toFixed(2):'';
  };
  // table
  const tbody=el('k_table').querySelector('tbody'); tbody.innerHTML='';
  cat.forEach(p=>{
    const tr=document.createElement('tr');
    tr.innerHTML = `<td>${p.name}</td><td>${p.einheit||'fix'}</td><td>${(p.betrag||0).toFixed(2)} €</td>
      <td><button class="ghost" data-del="${p.id}">Löschen</button></td>`;
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll('button[data-del]').forEach(btn=> btn.onclick= async()=>{ await txDel('catalog', Number(btn.dataset.del)); refreshCatalog(); });
}
async function refreshBookings(){
  const entries = await txGetAll('entries');
  const months=[...new Set(entries.map(e=> ym(e.date)))].sort().reverse();
  // filters
  const monthSel=el('b_filter_month'); monthSel.innerHTML='<option value="">Alle</option>'; months.forEach(m=>{ const o=document.createElement('option'); o.value=m; o.textContent=m; monthSel.appendChild(o); });
  // table
  const fp=el('b_filter_player').value, fm=el('b_filter_month').value;
  const filtered = entries.filter(e=>(!fp || e.player===fp) && (!fm || ym(e.date)===fm));
  const tbody=el('b_table').querySelector('tbody'); tbody.innerHTML='';
  filtered.sort((a,b)=> new Date(b.date)-new Date(a.date));
  let total=0;
  filtered.forEach(e=>{
    total += Number(e.amount||0);
    const tr=document.createElement('tr');
    tr.innerHTML = `<td>${new Date(e.date).toLocaleString('de-DE')}</td><td>${e.player}</td><td>${e.penalty}</td><td>${(e.amount||0).toFixed(2)}</td><td>${e.note||''}</td>`;
    tbody.appendChild(tr);
  });
  el('b_total').textContent = €(total);
}
async function refreshFees(){
  const fees = await txGetAll('fees');
  const tbody=el('f_table').querySelector('tbody'); tbody.innerHTML='';
  fees.sort((a,b)=> new Date(b.date)-new Date(a.date));
  fees.forEach(e=>{
    const tr=document.createElement('tr');
    tr.innerHTML = `<td>${new Date(e.date).toLocaleString('de-DE')}</td><td>${e.player}</td><td>${(e.amount||0).toFixed(2)}</td><td>${e.note||''}</td>`;
    tbody.appendChild(tr);
  });
}
async function refreshMonths(){
  const entries = await txGetAll('entries');
  const fees = await txGetAll('fees');
  const months = [...new Set([...entries.map(e=>ym(e.date)), ...fees.map(f=>ym(f.date))])].sort().reverse();
  const sel = el('m_month'); sel.innerHTML=''; months.forEach(m=>{const o=document.createElement('option'); o.value=m; o.textContent=m; sel.appendChild(o);});
  const current = sel.value || months[0]; if (!sel.value && months[0]) sel.value=months[0];
  const fin = entries.filter(e=> ym(e.date)===current);
  const fee = fees.filter(f=> ym(f.date)===current);
  const sumFines = fin.reduce((s,e)=> s+Number(e.amount||0),0);
  const sumFees = fee.reduce((s,e)=> s+Number(e.amount||0),0);
  el('m_sum_fines').textContent = €(sumFines);
  el('m_sum_fees').textContent = €(sumFees);
  const include = el('m_include_fee').value!=='no';
  el('m_total').textContent = €(include? (sumFines+sumFees): sumFines);
  // per player
  const map = {};
  fin.forEach(e=>{ map[e.player] = map[e.player] || {fines:0, fees:0}; map[e.player].fines += Number(e.amount||0); });
  fee.forEach(e=>{ map[e.player] = map[e.player] || {fines:0, fees:0}; map[e.player].fees += Number(e.amount||0); });
  const tbody=el('m_table').querySelector('tbody'); tbody.innerHTML='';
  Object.keys(map).sort().forEach(name=>{
    const fines = map[name].fines||0, feesv= map[name].fees||0, tot = include? (fines+feesv) : fines;
    const tr=document.createElement('tr');
    tr.innerHTML = `<td>${name}</td><td>${fines.toFixed(2)}</td><td>${feesv.toFixed(2)}</td><td>${tot.toFixed(2)}</td>`;
    tbody.appendChild(tr);
  });
}

// Handlers
async function bindHandlers(){
  // Tabs
  document.querySelectorAll('nav button').forEach(b=> b.onclick=()=> setTab(b.dataset.tab));
  // Add booking
  el('b_add').onclick = async ()=>{
    const player=el('b_player').value, pen=el('b_penalty').value;
    const opt = el('b_penalty').selectedOptions[0];
    const unit=(opt?.dataset.unit||'').toLowerCase();
    const base=parseFloat((el('b_amount').value||'').replace(',','.'));
    const mins=parseFloat((el('b_minutes').value||'0').replace(',','.'));
    let amount = base;
    if(Number.isNaN(base)) { alert('Betrag fehlt.'); return; }
    if(unit.includes('minute')) amount = (Number.isNaN(mins)?0:mins) * base;
    await txAdd('entries',{player, penalty:pen, amount: Math.round(amount*100)/100, note: el('b_note').value.trim(), date: new Date().toISOString()});
    el('b_note').value=''; el('b_minutes').value='';
    refreshBookings();
  };
  el('b_export').onclick = async ()=>{
    const items = await txGetAll('entries');
    const head=['Datum','Spieler','Strafe','Betrag','Notiz'];
    const rows = items.map(e=> [new Date(e.date).toISOString(), e.player, e.penalty, e.amount, (e.note||'').replaceAll('"','""')]);
    const csv = [head.join(','), ...rows.map(r=> r.map(x=> (typeof x==='string' && x.includes(','))?`"${x}"`:x).join(','))].join('\n');
    const blob = new Blob([csv],{type:'text/csv'}), url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='strafen.csv'; a.click(); URL.revokeObjectURL(url);
  };
  // Filters update
  el('b_filter_player').onchange=refreshBookings; el('b_filter_month').onchange=refreshBookings;
  // Players add
  el('s_add').onclick = async ()=>{ const n=el('s_new').value.trim(); if(!n) return; await txAdd('players',{name:n}); el('s_new').value=''; refreshPlayers(); refreshCatalog(); };
  // Catalog add
  el('k_add').onclick = async ()=>{
    const name = el('k_name').value.trim(); if(!name) return;
    const amount = parseFloat((el('k_amount').value||'0').replace(',','.'))||0;
    const unit = el('k_unit').value; const note = el('k_note').value.trim();
    await txAdd('catalog', {name, betrag:amount, einheit:unit, hinweis:note});
    el('k_name').value=''; el('k_amount').value=''; el('k_note').value='';
    refreshCatalog();
  };
  el('k_export').onclick = async ()=>{
    const cat = await txGetAll('catalog');
    const blob=new Blob([JSON.stringify(cat,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='strafenkatalog.json'; a.click(); URL.revokeObjectURL(url);
  };
  // Fees
  el('f_add').onclick = async ()=>{
    const player=el('f_player').value;
    const amount=parseFloat((el('f_amount').value||'').replace(',','.'));
    if(Number.isNaN(amount)) { alert('Betrag fehlt.'); return; }
    await txAdd('fees',{player, amount:Math.round(amount*100)/100, note:el('f_note').value.trim(), date:new Date().toISOString()});
    el('f_note').value=''; el('f_amount').value='';
    refreshFees();
  };
  el('f_export').onclick = async ()=>{
    const items = await txGetAll('fees');
    const head=['Datum','Spieler','Betrag','Notiz'];
    const rows = items.map(e=> [new Date(e.date).toISOString(), e.player, e.amount, (e.note||'').replaceAll('"','""')]);
    const csv=[head.join(','), ...rows.map(r=> r.map(x=> (typeof x==='string' && x.includes(','))?`"${x}"`:x).join(','))].join('\n');
    const blob = new Blob([csv],{type:'text/csv'}), url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='beitraege.csv'; a.click(); URL.revokeObjectURL(url);
  };
  // Months
  el('m_month').onchange=refreshMonths; el('m_include_fee').onchange=refreshMonths;
  // Settings: backup/restore/reset/install
  el('backup').onclick = async ()=>{
    const data={
      entries: await txGetAll('entries'),
      fees: await txGetAll('fees'),
      players: await txGetAll('players'),
      catalog: await txGetAll('catalog'),
    };
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='backup_mkasse.json'; a.click(); URL.revokeObjectURL(url);
  };
  el('restore').onclick = ()=>{
    const inp=document.createElement('input'); inp.type='file'; inp.accept='.json,application/json';
    inp.onchange=async()=>{ const txt= await inp.files[0].text(); const data=JSON.parse(txt);
      for(const s of stores) await txClear(s);
      for(const it of (data.players||[])) await txAdd('players',{name:it.name});
      for(const it of (data.catalog||[])) await txAdd('catalog',it);
      for(const it of (data.entries||[])) await txAdd('entries',it);
      for(const it of (data.fees||[])) await txAdd('fees',it);
      await refreshPlayers(); await refreshCatalog(); await refreshBookings(); await refreshFees(); await refreshMonths();
      alert('Backup wiederhergestellt.');
    };
    inp.click();
  };
  el('reset').onclick = async ()=>{ if(confirm('Wirklich ALLES löschen?')){ for(const s of stores) await txClear(s); await ensureInitial(); refreshPlayers(); refreshCatalog(); refreshBookings(); refreshFees(); refreshMonths(); } };
  el('install').onclick = ()=> alert('Öffne diese Seite in Safari → Teilen → „Zum Home-Bildschirm“. Dann läuft alles wie eine App – auch offline.');
}

window.addEventListener('DOMContentLoaded', async()=>{
  db = await openDB();
  await ensureInitial();
  await refreshPlayers();
  await refreshCatalog();
  await refreshBookings();
  await refreshFees();
  await refreshMonths();
  await bindHandlers();
  setTab('buchungen');
});
