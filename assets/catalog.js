// Buckswood Studios catalog: the single list of series and episodes for the
// home page and the player. Add a new episode here and both pages pick it up.
// Files: media/episodes/<file>.mp4 (720x1280) and assets/microdramas/<poster>.jpg.
window.BW = (function(){
  var series=[
    {id:'the-new-cleaner',title:'The New Cleaner',rank:1,
     tags:['Hidden identity','Revenge','Office'],
     hook:'They mocked the cleaner. She owns the company.',
     log:'On her first day, the new cleaner gets kicked, mocked and told she\'s "done by lunch" by people who have no idea she just bought the company.',
     loop:'loop-cleaner',cover:'cleaner1',
     eps:[
      {file:'the-new-cleaner-1',poster:'cleaner1',title:'They humiliated the cleaner. She owns the company.',len:'2:04'},
      {file:'the-new-cleaner-2',poster:'cleaner2',title:'She fired him with one sentence: "You\'re done by lunch."',len:'1:17'},
      {file:'the-new-cleaner-3',poster:'cleaner3',title:'He offered half what she paid. She said one word.',len:'1:15',isNew:true}]},
    {id:'the-anniversary',title:'The Anniversary',rank:2,
     tags:['Betrayal','Divorce','Karma'],
     hook:'Divorce papers at dinner. Then his card got declined.',
     log:'On their 15th anniversary he hands his wife divorce papers in front of the whole restaurant. He keeps the house and the accounts. Or so he thinks.',
     loop:'loop-anniv',cover:'anniv1',
     eps:[
      {file:'the-anniversary-1',poster:'anniv1',title:'Divorce papers at dinner. Then his card got declined.',len:'2:05'}]},
    {id:'the-worn-jacket',title:'The Worn Jacket',rank:3,
     tags:['Hidden millionaire','Respect','Karma'],
     hook:'They mocked his old jacket. He owns the whole dealership.',
     log:'A 71-year-old man in a worn work jacket walks into a luxury car dealership to buy his granddaughter a car. They show him the door. Then the regional director walks in.',
     loop:'loop-jacket',cover:'jacket1',
     eps:[
      {file:'the-worn-jacket-1',poster:'jacket1',title:'They mocked his old jacket. He owns the whole dealership.',len:'1:48',isNew:true}]}
  ];
  var playlist=[];
  series.forEach(function(s){s.eps.forEach(function(e,i){e.series=s;e.n=i+1;e.id=e.file;playlist.push(e)})});

  // Per-viewer conveniences only (watch progress, the Premium preview flag).
  function read(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}}
  function write(k,v){try{v===null?localStorage.removeItem(k):localStorage.setItem(k,JSON.stringify(v))}catch(e){}}

  return {
    series:series,playlist:playlist,
    tags:series.reduce(function(a,s){s.tags.forEach(function(t){if(a.indexOf(t)<0)a.push(t)});return a},[]),
    find:function(id){return playlist.filter(function(e){return e.id===id})[0]},
    progress:function(){return read('bw-progress')||{}},
    saveProgress:function(id,t,dur){var p=read('bw-progress')||{};p[id]={t:Math.floor(t),d:Math.floor(dur)};p._last=id;write('bw-progress',p)},
    isPremium:function(){return read('bw-premium')===1},
    setPremium:function(on){write('bw-premium',on?1:null)}
  };
})();
