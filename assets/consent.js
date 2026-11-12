// Consent for ads. Nothing from Google's ad servers loads until the viewer has
// chosen "Accept all". The choice is kept in this browser (localStorage) and can be
// changed any time from a link with the data-consent attribute ("Cookie settings").
// Once Google Ad Manager is set up, Google's own certified consent message
// (Privacy & messaging) should replace this banner; see README.
window.BWConsent = (function(){
  var KEY='bw-consent',listeners=[],el=null;
  function read(){try{return JSON.parse(localStorage.getItem(KEY))}catch(e){return null}}
  var current=read();

  function save(ads){
    current={ads:!!ads,date:new Date().toISOString().slice(0,10)};
    try{localStorage.setItem(KEY,JSON.stringify(current))}catch(e){}
    hide();
    listeners.forEach(function(f){f(current)});
  }
  function build(){
    el=document.createElement('section');
    el.className='consent';
    el.setAttribute('role','dialog');
    el.setAttribute('aria-labelledby','consent-title');
    el.innerHTML='<h2 id="consent-title">Cookies and ads</h2>'+
      '<p>Free episodes are paid for by a short ad. With your consent, Google loads these ads and may use cookies to measure and personalise them. '+
      'Without consent you can still watch every episode, just without ads. You can change your choice any time under “Cookie settings”. '+
      '<a href="/datenschutz">Privacy policy</a></p>'+
      '<div class="consent-acts"><button type="button" data-choice="0">Only necessary</button>'+
      '<button type="button" data-choice="1">Accept all</button></div>';
    el.addEventListener('click',function(e){
      var b=e.target.closest('[data-choice]');if(b)save(b.getAttribute('data-choice')==='1');
    });
    document.body.appendChild(el);
  }
  function show(){if(!el)build();el.hidden=false}
  function hide(){if(el)el.hidden=true}

  function init(){
    document.querySelectorAll('[data-consent]').forEach(function(a){
      a.addEventListener('click',function(e){e.preventDefault();show()});
    });
    if(!current)show();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();

  return {
    ads:function(){return current?current.ads:null},  // true, false or null (not decided yet)
    open:show,
    on:function(f){listeners.push(f)}
  };
})();
