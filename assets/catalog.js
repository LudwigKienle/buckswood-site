// Buckswood Studios catalog: the single list of series and episodes for the
// home page and the player. Add a new episode here and both pages pick it up.
// Files: media/episodes/<file>.mp4 (720x1280) and assets/microdramas/<poster>.jpg.
// date = first release (YYYY-MM-DD). After editing, run `node scripts/build-seo.mjs`
// to rebuild the series pages and sitemap.xml.
window.BW = (function(){
  var series=[
    {id:'the-new-cleaner',title:'The New Cleaner',rank:1,
     tags:['Hidden identity','Revenge','Office'],
     hook:'They mocked the cleaner. She owns the company.',
     log:'On her first day, the new cleaner gets kicked, mocked and told she\'s "done by lunch" by people who have no idea she just bought the company.',
     loop:'loop-cleaner',cover:'cleaner1',
     eps:[
      {file:'the-new-cleaner-1',date:'2026-11-10',poster:'cleaner1',title:'They humiliated the cleaner. She owns the company.',len:'2:04'},
      {file:'the-new-cleaner-2',date:'2026-11-11',poster:'cleaner2',title:'She fired him with one sentence: "You\'re done by lunch."',len:'1:17'},
      {file:'the-new-cleaner-3',date:'2026-11-12',poster:'cleaner3',title:'He offered half what she paid. She said one word.',len:'1:15',isNew:true}]},
    {id:'the-anniversary',title:'The Anniversary',rank:2,
     tags:['Betrayal','Divorce','Karma'],
     hook:'Divorce papers at dinner. Then his card got declined.',
     log:'On their 15th anniversary he hands his wife divorce papers in front of the whole restaurant. He keeps the house and the accounts. Or so he thinks.',
     loop:'loop-anniv',cover:'anniv1',
     eps:[
      {file:'the-anniversary-1',date:'2026-11-10',poster:'anniv1',title:'Divorce papers at dinner. Then his card got declined.',len:'2:05'}]},
    {id:'the-worn-jacket',title:'The Worn Jacket',rank:3,
     tags:['Hidden millionaire','Respect','Karma'],
     hook:'They mocked his old jacket. He owns the whole dealership.',
     log:'A 71-year-old man in a worn work jacket walks into a luxury car dealership to buy his granddaughter a car. They show him the door. Then the regional director walks in.',
     loop:'loop-jacket',cover:'jacket1',
     eps:[
      {file:'the-worn-jacket-1',date:'2026-11-12',poster:'jacket1',title:'They mocked his old jacket. He owns the whole dealership.',len:'1:48',isNew:true}]}
  ];
  var playlist=[];
  series.forEach(function(s){s.eps.forEach(function(e,i){e.series=s;e.n=i+1;e.id=e.file;playlist.push(e)})});

  // Per-viewer convenience only (watch progress).
  function read(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}}
  function write(k,v){try{v===null?localStorage.removeItem(k):localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
  write('bw-premium',null); // old preview flag, no longer used

  // Premium comes from the server (/api/me checks the Stripe subscription).
  var member={premium:false,checkout:false},pending=null;
  function membership(force){
    if(!pending||force){
      pending=fetch('/api/me',{credentials:'same-origin'})
        .then(function(r){return r.ok?r.json():{}})
        .catch(function(){return {}})
        .then(function(d){member.premium=!!d.premium;member.checkout=!!d.checkout;return member});
    }
    return pending;
  }
  function post(url,msg,label,btn){
    if(btn){btn.disabled=true;btn.dataset.label=btn.textContent;btn.textContent=label}
    if(msg)msg.textContent='';
    return fetch(url,{method:'POST',credentials:'same-origin'})
      .then(function(r){return r.json()})
      .then(function(d){if(d.url){location.href=d.url;return}throw new Error(d.error||'')})
      .catch(function(e){
        if(btn){btn.disabled=false;btn.textContent=btn.dataset.label}
        if(msg)msg.textContent=e.message||'That did not work. Please try again in a moment.';
      });
  }

  return {
    series:series,playlist:playlist,
    tags:series.reduce(function(a,s){s.tags.forEach(function(t){if(a.indexOf(t)<0)a.push(t)});return a},[]),
    find:function(id){return playlist.filter(function(e){return e.id===id})[0]},
    progress:function(){return read('bw-progress')||{}},
    saveProgress:function(id,t,dur){var p=read('bw-progress')||{};p[id]={t:Math.floor(t),d:Math.floor(dur)};p._last=id;write('bw-progress',p)},
    membership:membership,
    isPremium:function(){return member.premium},
    canBuy:function(){return member.checkout},
    checkout:function(btn,msg){return post('/api/checkout',msg,'Opening checkout…',btn)},
    portal:function(msg){return post('/api/portal',msg,'',null)}
  };
})();
