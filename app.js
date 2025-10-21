
// DB setup
const DB = {name:'mkasse-v2', ver:2};
const STORES = ['entries','fees','players','catalog','active','meta']; // active: {ym, player, active}
// meta: {key:'activation_'+player, value: ym when first activated}
let db;

// initial data from Python
const PRESET_PLAYERS = ["Massi", "Nico Kessler", "Ajdin Cehadarevic", "Felix Thiele", "Gerrit Brüning", "Julian Berger", "Thorben Berger", "Vinzent Angerstein", "Tim Glettenberg", "Kai Fischersworring", "Damit Heine", "Nico Wünnenberg", "Mattis Birkel", "Marc Günter", "Maxi Plate", "Andre Ockenga", "Apo Bakas", "Corbi aus den Siepen", "Marijan", "Fabi ", "Hamoud ", "Maurice Paul", "Maurice Hundenborn", "Nils Glettenberg"];
const PRESET_CATALOG = [{"name": "Sieg", "betrag": 5.0, "einheit": "fix", "hinweis": null}, {"name": "Gegentor", "betrag": 0.5, "einheit": "fix", "hinweis": "€/Gegentor"}, {"name": "Gelbe Karte (Unsportlichkeit)", "betrag": 15.0, "einheit": "fix", "hinweis": null}, {"name": "Gelb-rote Karte (Unsportlichkeit)", "betrag": 30.0, "einheit": "fix", "hinweis": null}, {"name": "Rote Karte", "betrag": 10.0, "einheit": "fix", "hinweis": null}, {"name": "Rote Karte (Unsportlichkeit)", "betrag": 75.0, "einheit": "fix", "hinweis": "75€ + 🍺"}, {"name": "Zu spät (Training)", "betrag": 0.5, "einheit": "pro Minute", "hinweis": "€/Minute"}, {"name": "Zu spät (Spiel)", "betrag": 1.0, "einheit": "pro Minute", "hinweis": "€/Minute"}, {"name": "Unentschuldigtes Fehlen (Training)", "betrag": 10.0, "einheit": "fix", "hinweis": null}, {"name": "Unentschuldigtes Fehlen (Spiel)", "betrag": 75.0, "einheit": "fix", "hinweis": null}, {"name": "Falscher Einwurf", "betrag": 3.0, "einheit": "fix", "hinweis": null}, {"name": "Ball über'n Zaun", "betrag": 1.5, "einheit": "fix", "hinweis": null}, {"name": "Wildpinkeln", "betrag": 5.0, "einheit": "fix", "hinweis": null}, {"name": "Toilettengang während Einheit", "betrag": 2.0, "einheit": "fix", "hinweis": null}, {"name": "Keine 20er", "betrag": 1.0, "einheit": "fix", "hinweis": null}, {"name": "20er-Runde", "betrag": 1.0, "einheit": "fix", "hinweis": null}, {"name": "Beini", "betrag": 1.0, "einheit": "fix", "hinweis": null}, {"name": "Vergessene Tasche", "betrag": 20.0, "einheit": "fix", "hinweis": null}, {"name": "Vergessene Fußballschuhe", "betrag": 10.0, "einheit": "fix", "hinweis": null}, {"name": "Vergessene Laufschuhe", "betrag": 5.0, "einheit": "fix", "hinweis": null}, {"name": "Vergessene Schienbeinschoner", "betrag": 3.0, "einheit": "fix", "hinweis": null}, {"name": "Vergessenes sonstiges Teil", "betrag": 1.0, "einheit": "fix", "hinweis": null}, {"name": "Ungeputzte Fußballschuhe", "betrag": 5.0, "einheit": "fix", "hinweis": null}, {"name": "Trikot/Hose/Stutzen falsch in Trikottasche", "betrag": 3.0, "einheit": "fix", "hinweis": null}, {"name": "Pinkeln in der Dusche", "betrag": 5.0, "einheit": "fix", "hinweis": null}, {"name": "Abhauen ohne Hand geben", "betrag": 3.0, "einheit": "fix", "hinweis": null}, {"name": "Rauchen nach Treffpunkt", "betrag": 3.0, "einheit": "fix", "hinweis": null}, {"name": "Rauchen im Trikot", "betrag": 3.0, "einheit": "fix", "hinweis": null}, {"name": "Trinken im Trikot", "betrag": 3.0, "einheit": "fix", "hinweis": null}, {"name": "Bier Bunkern", "betrag": 3.0, "einheit": "fix", "hinweis": null}, {"name": "Angetrunken", "betrag": 3.0, "einheit": "fix", "hinweis": null}, {"name": "Handy klingelt/vibriert", "betrag": 3.0, "einheit": "fix", "hinweis": null}, {"name": "Bier verschüttet", "betrag": 2.0, "einheit": "fix", "hinweis": null}, {"name": "Mülleimer nicht getroffen", "betrag": 2.0, "einheit": "fix", "hinweis": null}, {"name": "Nicht duschen gehen", "betrag": 1.0, "einheit": "fix", "hinweis": null}, {"name": "Lichtfehler", "betrag": 1.0, "einheit": "fix", "hinweis": null}, {"name": "Falsche Gruppe", "betrag": 1.0, "einheit": "fix", "hinweis": null}];

// Helpers
const EURO = (n)=> (n||0).toLocaleString('de-DE',{style:'currency',currency:'EUR'});
const ym = (d)=> { const t=new Date(d); return t.getFullYear()+'-'+String(t.getMonth()+1).padStart(2,'0'); };
const ymFirstDayISO = (ymstr)=> { const [y,m]=ymstr.split('-').map(x=>parseInt(x,10)); return new Date(y, m-1, 1).toISOString(); };

function openDB(){
  return new Promise((res,rej)=>{
    const req=indexedDB.open(DB.name, DB.ver);
    req.onupgradeneeded=()=>{
      const d=req.result;
      STORES.forEach(s=>{ if(!d.objectStoreNames.contains(s)) d.createObjectStore(s,{keyPath:'id',autoIncrement:true}); });
    };
    req.onsuccess=()=>res(req.result);
    req.onerror=()=>rej(req.error);
  });
}
function getAll(s){ return new Promise((res,rej)=>{ const t=db.transaction(s).objectStore(s).getAll(); t.onsuccess=()=>res(t.result||[]); t.onerror=()=>rej(t.error); }); }
function add(s,o){ return new Promise((res,rej)=>{ const t=db.transaction(s,'readwrite').objectStore(s).add(o); t.onsuccess=()=>res(t.result); t.onerror=()=>rej(t.error); }); }
function put(s,o){ return new Promise((res,rej)=>{ const t=db.transaction(s,'readwrite').objectStore(s).put(o); t.onsuccess=()=>res(t.result); t.onerror=()=>rej(t.error); }); }
function del(s,id){ return new Promise((res,rej)=>{ const t=db.transaction(s,'readwrite').objectStore(s).delete(id); t.onsuccess=()=>res(); t.onerror=()=>rej(t.error); }); }
function clearStore(s){ return new Promise((res,rej)=>{ const t=db.transaction(s,'readwrite').objectStore(s).clear(); t.onsuccess=()=>res(); t.onerror=()=>rej(t.error); }); }

async function ensureInitial(){
  const pls = await getAll('players'); if(pls.length===0 && PRESET_PLAYERS.length){ for(const name of PRESET_PLAYERS) await add('players',{name}); }
  const cat = await getAll('catalog'); if(cat.length===0 && PRESET_CATALOG.length){
    for(const p of PRESET_CATALOG){ await add('catalog',{name:p.name, betrag:p.betrag||0, einheit:p.einheit||'', hinweis:p.hinweis||''}); }
  }
}

// UI helpers
function el(id){ return document.getElementById(id); }
function fillSelect(sel, arr, map=(x=>x)){ sel.innerHTML=''; for(const v of arr){ const o=document.createElement('option'); const m=map(v); o.value=m; o.textContent=m; sel.appendChild(o);} }

// Tabs
function setTab(name){
  document.querySelectorAll('nav button').forEach(b=> b.classList.toggle('active', b.dataset.tab===name));
  const ids=['buchungen','monate','aktiv','spieler','katalog','gesamt','settings'];
  ids.forEach(i=> el('tab-'+i).classList.toggle('hide', i!==name));
  if(name==='buchungen') refreshBookings();
  if(name==='monate') refreshMonths();
  if(name==='aktiv') refreshActive();
  if(name==='spieler') refreshPlayers();
  if(name==='katalog') refreshCatalog();
  if(name==='gesamt') refreshOverall();
}

// Players
async function refreshPlayers(){
  const pls = await getAll('players');
  const names = pls.map(p=>p.name);
  fillSelect(el('b_player'), names);
  const f = el('b_filter_player'); f.innerHTML='<option value="">Alle</option>'; names.forEach(n=>{const o=document.createElement('option');o.value=n;o.textContent=n;f.appendChild(o);});
  fillSelect(el('f_player')||document.createElement('select'), names); // if fees tab removed, ignore
  const tbody=el('s_table').querySelector('tbody'); tbody.innerHTML='';
  pls.forEach(p=>{
    const tr=document.createElement('tr');
    tr.innerHTML = `<td>${p.name}</td><td><button class="ghost" data-del="${p.id}">Löschen</button></td>`;
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll('button[data-del]').forEach(btn=> btn.onclick= async()=>{ await del('players', Number(btn.dataset.del)); refreshPlayers(); refreshActive(); });
}

// Catalog
async function refreshCatalog(){
  const cat = await getAll('catalog');
  // Fill penalties
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
  tbody.querySelectorAll('button[data-del]').forEach(btn=> btn.onclick= async()=>{ await del('catalog', Number(btn.dataset.del)); refreshCatalog(); });
}

// Bookings
async function refreshBookings(){
  const entries = await getAll('entries');
  const months=[...new Set(entries.map(e=> ym(e.date)))].sort().reverse();
  const monthSel=el('b_filter_month'); monthSel.innerHTML='<option value="">Alle</option>'; months.forEach(m=>{ const o=document.createElement('option'); o.value=m; o.textContent=m; monthSel.appendChild(o); });
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
  el('b_total').textContent = EURO(total);
}

// Active per month
function monthListAroundToday(){
  const now=new Date(); const y=now.getFullYear(); const m=now.getMonth()+1;
  const out=[]; for(let i=-6;i<=6;i++){ const d=new Date(y, m-1+i); out.push(d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')); }
  return out.reverse();
}
async function refreshActive(){
  const pls = await getAll('players'); const names=pls.map(p=>p.name).sort();
  const months = monthListAroundToday();
  const sel=el('a_month'); sel.innerHTML=''; months.forEach(m=>{const o=document.createElement('option'); o.value=m; o.textContent=m; sel.appendChild(o);});
  const cur = sel.value || months[Math.floor(months.length/2)]; if(!sel.value) sel.value=cur;
  const act = await getAll('active'); const map={}; act.forEach(a=>{ map[a.ym+'|'+a.player]=a; });
  const tbody=el('a_table').querySelector('tbody'); tbody.innerHTML='';
  names.forEach(name=>{
    const key=cur+'|'+name; const isActive = !!(map[key]?.active);
    const tr=document.createElement('tr');
    tr.innerHTML = `<td><input type="checkbox" data-player="${name}" ${isActive?'checked':''}></td><td>${name}</td>`;
    tbody.appendChild(tr);
  });
  // Bind change
  tbody.querySelectorAll('input[type=checkbox]').forEach(ch=> ch.onchange= async()=>{
    const player=ch.dataset.player; const ymv=el('a_month').value; const val=ch.checked;
    // upsert active record
    const existing = Object.values(map).find(a=> a.player===player && a.ym===ymv);
    if(existing){ existing.active=val; await put('active', existing); }
    else { await add('active',{ym:ymv, player, active:val}); }
    // If first-time activation: add Startbeitrag 10€ as fine in that month
    const meta = await getAll('meta');
    const key = 'activation_'+player;
    const was = meta.find(m=> m.key===key);
    if(val && !was){
      await add('entries', {player, penalty:'Startbeitrag', amount:10.00, note:'Einmalig bei erster Aktivierung', date: ymFirstDayISO(ymv)});
      await add('meta', {key, value: ymv});
      alert(player+': Startbeitrag 10€ im Monat '+ymv+' verbucht.');
      refreshBookings(); refreshMonths(); refreshOverall();
    }
  });
}

// Months overview
async function refreshMonths(){
  const entries = await getAll('entries');
  const fees = await getAll('fees'); // kept for future use
  const active = await getAll('active');
  const months = [...new Set([...entries.map(e=>ym(e.date)), ...active.map(a=>a.ym)])].sort().reverse();
  const sel = el('m_month'); sel.innerHTML=''; months.forEach(m=>{const o=document.createElement('option'); o.value=m; o.textContent=m; sel.appendChild(o);});
  const current = sel.value || months[0]; if (!sel.value && months[0]) sel.value=months[0];

  // Only include entries for players who are active in that month
  const activePlayers = new Set(active.filter(a=> a.ym===current && a.active).map(a=> a.player));
  const monthEntries = entries.filter(e=> ym(e.date)===current && activePlayers.has(e.player));
  const sumFines = monthEntries.reduce((s,e)=> s+Number(e.amount||0),0);
  const sumFees = fees.filter(f=> ym(f.date)===current).reduce((s,e)=> s+Number(e.amount||0),0);
  const include = el('m_include_fee').value!=='no';
  el('m_sum_fines').textContent = EURO(sumFines);
  el('m_sum_fees').textContent = EURO(sumFees);
  el('m_total').textContent = EURO(include? (sumFines+sumFees): sumFines);
  // per player
  const map={};
  monthEntries.forEach(e=>{ map[e.player]=map[e.player]||{fines:0,fees:0}; map[e.player].fines += Number(e.amount||0); });
  fees.filter(f=> ym(f.date)===current).forEach(f=>{ map[f.player]=map[f.player]||{fines:0,fees:0}; map[f.player].fees += Number(f.amount||0); });
  const tbody=el('m_table').querySelector('tbody'); tbody.innerHTML='';
  Object.keys(map).sort().forEach(name=>{
    const fines = map[name].fines||0, feesv= map[name].fees||0, tot = include? (fines+feesv) : fines;
    const tr=document.createElement('tr');
    tr.innerHTML = `<td>${name}</td><td>${fines.toFixed(2)}</td><td>${feesv.toFixed(2)}</td><td>${tot.toFixed(2)}</td>`;
    tbody.appendChild(tr);
  });
}

// Overall
async function refreshOverall(){
  const entries = await getAll('entries');
  const fees = await getAll('fees');
  const months = [...new Set([...entries.map(e=>ym(e.date)), ...fees.map(f=>ym(f.date))])].sort();
  const tbody=el('g_table').querySelector('tbody'); tbody.innerHTML='';
  let grand=0;
  months.forEach(m=>{
    const sf = entries.filter(e=> ym(e.date)===m).reduce((s,e)=> s+Number(e.amount||0),0);
    const fe = fees.filter(f=> ym(f.date)===m).reduce((s,e)=> s+Number(e.amount||0),0);
    const tot = sf+fe; grand+=tot;
    const tr=document.createElement('tr'); tr.innerHTML = `<td>${m}</td><td>${sf.toFixed(2)}</td><td>${fe.toFixed(2)}</td><td>${tot.toFixed(2)}</td>`;
    tbody.appendChild(tr);
  });
  el('g_total').textContent = EURO(grand);
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
    await add('entries',{player, penalty:pen, amount: Math.round(amount*100)/100, note: el('b_note').value.trim(), date: new Date().toISOString()});
    el('b_note').value=''; el('b_minutes').value='';
    refreshBookings(); refreshMonths(); refreshOverall();
  };
  // Export month
  el('b_export_month').onclick = async ()=>{
    const m = el('b_filter_month').value || (()=>{const e=await getAll('entries'); return [...new Set(e.map(x=>ym(x.date)))].sort().pop(); })();
    const entries = await getAll('entries');
    const active = await getAll('active');
    const activePlayers = new Set(active.filter(a=> a.ym===m && a.active).map(a=> a.player));
    const rows = entries.filter(e=> ym(e.date)===m && activePlayers.has(e.player)).map(e=> [new Date(e.date).toISOString(), e.player, e.penalty, e.amount, (e.note||'').replaceAll('"','""')]);
    const head=['Datum','Spieler','Strafe','Betrag','Notiz'];
    const csv=[head.join(','), ...rows.map(r=> r.map(x=> (typeof x==='string' && x.includes(','))?`"${x}"`:x).join(','))].join('\n');
    const blob=new Blob([csv],{type:'text/csv'}), url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=(m||'monat')+'_strafen.csv'; a.click(); URL.revokeObjectURL(url);
  };
  // Filters update
  el('b_filter_player').onchange=refreshBookings; el('b_filter_month').onchange=refreshBookings;
  // Players add
  el('s_add').onclick = async ()=>{ const n=el('s_new').value.trim(); if(!n) return; await add('players',{name:n}); el('s_new').value=''; refreshPlayers(); refreshActive(); };
  // Catalog add
  el('k_add').onclick = async ()=>{
    const name = el('k_name').value.trim(); if(!name) return;
    const amount = parseFloat((el('k_amount').value||'0').replace(',','.'))||0;
    const unit = el('k_unit').value; const note = el('k_note').value.trim();
    await add('catalog', {name, betrag:amount, einheit:unit, hinweis:note});
    el('k_name').value=''; el('k_amount').value=''; el('k_note').value='';
    refreshCatalog();
  };
  el('k_export').onclick = async ()=>{
    const cat = await getAll('catalog');
    const blob=new Blob([JSON.stringify(cat,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='strafenkatalog.json'; a.click(); URL.revokeObjectURL(url);
  };
  // Active section
  el('a_month').onchange=refreshActive;
  el('a_export').onclick = async ()=>{
    const m = el('a_month').value;
    const act = await getAll('active');
    const rows = act.filter(a=>a.ym===m).map(a=> [a.ym, a.player, a.active?'1':'0']);
    const head=['Monat','Spieler','Aktiv'];
    const csv=[head.join(','), ...rows.map(r=> r.join(','))].join('\n');
    const blob=new Blob([csv],{type:'text/csv'}), url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=(m||'monat')+'_aktiv.csv'; a.click(); URL.revokeObjectURL(url);
  };
  // Months
  el('m_month').onchange=refreshMonths; el('m_include_fee').onchange=refreshMonths;
  // Settings
  el('backup').onclick = async ()=>{
    const data={
      entries: await getAll('entries'),
      fees: await getAll('fees'),
      players: await getAll('players'),
      catalog: await getAll('catalog'),
      active: await getAll('active'),
      meta: await getAll('meta'),
    };
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='backup_mkasse_v2.json'; a.click(); URL.revokeObjectURL(url);
  };
  el('restore').onclick = ()=>{
    const inp=document.createElement('input'); inp.type='file'; inp.accept='.json,application/json';
    inp.onchange=async()=>{ const txt= await inp.files[0].text(); const data=JSON.parse(txt);
      for(const s of STORES) await clearStore(s);
      for(const it of (data.players||[])) await add('players',it);
      for(const it of (data.catalog||[])) await add('catalog',it);
      for(const it of (data.entries||[])) await add('entries',it);
      for(const it of (data.fees||[])) await add('fees',it);
      for(const it of (data.active||[])) await add('active',it);
      for(const it of (data.meta||[])) await add('meta',it);
      await refreshPlayers(); await refreshCatalog(); await refreshBookings(); await refreshActive(); await refreshMonths(); await refreshOverall();
      alert('Backup wiederhergestellt.');
    };
    inp.click();
  };
  el('reset').onclick = async ()=>{ if(confirm('Wirklich ALLES löschen?')){ for(const s of STORES) await clearStore(s); await ensureInitial(); await refreshPlayers(); await refreshCatalog(); await refreshBookings(); await refreshActive(); await refreshMonths(); await refreshOverall(); } };
  const installBtn = document.getElementById('install'); if(installBtn) installBtn.onclick = ()=> alert('In Safari: Teilen → "Zum Home‑Bildschirm".');
}

window.addEventListener('DOMContentLoaded', async()=>{
  db = await openDB();
  await ensureInitial();
  await refreshPlayers();
  await refreshCatalog();
  await refreshBookings();
  await refreshActive();
  await refreshMonths();
  await refreshOverall();
  await bindHandlers();
  setTab('buchungen');
});
