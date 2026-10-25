(()=>{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
const store={get:k=>{try{return localStorage.getItem(k)}catch{return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch{}}};
let mood='night',fxOn=!reduce;   // always start in Night with particles on

/* ---------- mood + particles toggles ---------- */
function setMood(m){mood=m;document.body.dataset.mood=m;$$('.seg button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.mood===m));mix()}
$$('.seg button').forEach(b=>b.onclick=()=>setMood(b.dataset.mood));
const fxb=$('#fxbtn');fxb.setAttribute('aria-pressed',fxOn);
fxb.onclick=()=>{fxOn=!fxOn;fxb.setAttribute('aria-pressed',fxOn)};

/* ---------- ambient sound (synthesized, off by default) ---------- */
let AC,N,sndOn=false;
function build(){AC=new(window.AudioContext||window.webkitAudioContext)();
 const m=AC.createGain();m.gain.value=0;m.connect(AC.destination);
 const buf=AC.createBuffer(1,AC.sampleRate*3,AC.sampleRate),d=buf.getChannelData(0);let l=0;
 for(let i=0;i<d.length;i++){l=(l+.02*(Math.random()*2-1))/1.02;d[i]=l*3.5}
 const ns=AC.createBufferSource();ns.buffer=buf;ns.loop=true;
 const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=600;
 const wind=AC.createGain();wind.gain.value=0;ns.connect(lp);lp.connect(wind);wind.connect(m);ns.start();
 const lfo=(f,depth,param)=>{const o=AC.createOscillator(),g=AC.createGain();o.frequency.value=f;g.gain.value=depth;o.connect(g);g.connect(param);o.start()};
 lfo(.08,300,lp.frequency);
 const c=AC.createOscillator();c.frequency.value=4300;
 const g1=AC.createGain(),g2=AC.createGain(),cr=AC.createGain();g1.gain.value=.5;g2.gain.value=.5;cr.gain.value=0;
 lfo(26,.5,g1.gain);lfo(1.1,.5,g2.gain);c.connect(g1);g1.connect(g2);g2.connect(cr);cr.connect(m);c.start();
 const pad=AC.createGain();pad.gain.value=0;
 [220,329.6,440.7].forEach(f=>{const o=AC.createOscillator();o.frequency.value=f;o.connect(pad);o.start()});pad.connect(m);
 N={m,wind,cr,pad};mix()}
function mix(){if(!N)return;const t=AC.currentTime,s={dusk:[.5,0,0],night:[.35,.035,0],aurora:[.3,0,.02]}[mood];
 N.wind.gain.setTargetAtTime(s[0],t,1);N.cr.gain.setTargetAtTime(s[1],t,1);N.pad.gain.setTargetAtTime(s[2],t,1.5)}
const volEl=$('#vol'),sv=store.get('vol');let vol=sv!==null&&!isNaN(+sv)?+sv:70;
const level=()=>(vol/100)**2*1.4;   // squared curve: finer control at low volume
const vIcon=()=>volEl.parentElement.classList.toggle('mute',vol===0);
volEl.value=vol;volEl.style.setProperty('--p',vol+'%');vIcon();
volEl.oninput=()=>{vol=+volEl.value;volEl.style.setProperty('--p',vol+'%');vIcon();store.set('vol',vol);
 if(AC&&sndOn)N.m.gain.setTargetAtTime(level(),AC.currentTime,.05)};
$('#snd').onclick=e=>{sndOn=!sndOn;e.currentTarget.setAttribute('aria-pressed',sndOn);volEl.parentElement.hidden=!sndOn;
 if(sndOn){if(!AC)build();AC.resume()}
 if(AC)N.m.gain.setTargetAtTime(sndOn?level():0,AC.currentTime,.4)};

setMood('night');

/* ---------- keys 1-6 ---------- */
addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey)return;const c=$$('.card')[+e.key-1];if(c)window.open(c.href,'_blank','noopener')});

/* ---------- canvas: snow / fireflies / stars / shooting stars / confetti ---------- */
const cv=$('#fx'),ctx=cv.getContext('2d');let W,H,D;
const P=Array.from({length:innerWidth<600?50:100},()=>({x:Math.random(),y:Math.random(),r:.6+Math.random()*2.4,v:.25+Math.random()*.75,p:Math.random()*6.28}));
const S=Array.from({length:70},()=>({x:Math.random(),y:Math.random()*.6,r:.4+Math.random()*1.1,p:Math.random()*6.28}));
let sh=null;const B=[];
let lw=0;
function size(){lw=innerWidth;D=Math.min(devicePixelRatio||1,fine?2:1.5);W=cv.width=Math.round(cv.clientWidth*D);H=cv.height=Math.round(cv.clientHeight*D)}
size();addEventListener('resize',()=>{if(innerWidth!==lw)size()});   // ignore height-only resizes from the phone's address bar
function frame(t){requestAnimationFrame(frame);ctx.clearRect(0,0,W,H);if(document.hidden)return;
 if(fxOn){const night=mood==='night';
  if(night){for(const s of S){ctx.fillStyle=`rgba(255,255,255,${.3+.5*Math.sin(t/700+s.p)**2})`;ctx.beginPath();ctx.arc(s.x*W,s.y*H,s.r*D,0,6.283);ctx.fill()}
   if(!sh&&Math.random()<.004)sh={x:Math.random()*.7,y:Math.random()*.25,l:1};
   if(sh){sh.x+=.012;sh.y+=.006;sh.l-=.02;ctx.strokeStyle=`rgba(255,255,255,${Math.max(sh.l,0)})`;ctx.lineWidth=2*D;ctx.beginPath();ctx.moveTo(sh.x*W,sh.y*H);ctx.lineTo((sh.x-.07)*W,(sh.y-.035)*H);ctx.stroke();if(sh.l<=0)sh=null}}
  for(const q of P){
   if(night){q.x+=Math.sin(t/1800+q.p)*.0006;q.y+=Math.cos(t/2300+q.p)*.0005;
    const a=.35+.45*Math.sin(t/600+q.p),x=q.x*W,y=q.y*H,r=(q.r*5+4)*D,g=ctx.createRadialGradient(x,y,0,x,y,r);
    g.addColorStop(0,`rgba(255,226,130,${a})`);g.addColorStop(1,'rgba(255,226,130,0)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);
    if(q.y<0)q.y=1;if(q.y>1)q.y=0}
   else{q.y+=q.v*.0008*q.r;q.x+=Math.sin(t/1500+q.p)*.0003;if(q.y>1.02){q.y=-.02;q.x=Math.random()}
    ctx.fillStyle=`rgba(255,255,255,${.25+q.r/7})`;ctx.beginPath();ctx.arc(q.x*W,q.y*H,q.r*D,0,6.283);ctx.fill()}
   if(q.x<0)q.x=1;if(q.x>1)q.x=0}}
 for(let i=B.length;i--;){const b=B[i];b.vy+=.0004;b.x+=b.vx;b.y+=b.vy;b.l-=.012;if(b.l<=0){B.splice(i,1);continue}
  ctx.globalAlpha=b.l;ctx.fillStyle=b.c;ctx.fillRect(b.x*W,b.y*H,5*D,8*D)}
 ctx.globalAlpha=1}
if(!reduce){requestAnimationFrame(frame);
 const logo=$('.logo'),cols=$$('.card').map(c=>c.style.getPropertyValue('--c'));
 logo.onclick=()=>{const r=logo.getBoundingClientRect(),x=(r.left+r.width/2)/innerWidth,y=(r.top+r.height/2)/innerHeight;
  for(let i=0;i<90;i++){const a=Math.random()*6.283,s=.004+Math.random()*.012;B.push({x,y,vx:Math.cos(a)*s*.6,vy:Math.sin(a)*s-.006,l:1,c:cols[i%cols.length]||'#fff'})}}}

/* ---------- parallax: mouse, or device tilt on phones ---------- */
if(!reduce){
 const L=$$('#scene img').map(el=>({el,dx:+el.dataset.dx||0,dy:+el.dataset.dy||0})).filter(l=>l.dx||l.dy);
 let tx=0,ty=0,cx=0,cy=0,raf=0;const K=fine?200:120;   // gentler travel on phones
 const tick=()=>{cx+=(tx-cx)*.08;cy+=(ty-cy)*.08;
  for(const l of L)l.el.style.transform=`translate3d(${(-cx*l.dx*K).toFixed(1)}px,${(-cy*l.dy*K).toFixed(1)}px,0)`;
  raf=Math.abs(tx-cx)>.001||Math.abs(ty-cy)>.001?requestAnimationFrame(tick):0};
 const aim=(x,y)=>{tx=x;ty=y;if(!raf)raf=requestAnimationFrame(tick)};
 if(fine){
  addEventListener('pointermove',e=>{aim((e.clientX/innerWidth-.5)*2,(e.clientY/innerHeight-.5)*2);
   document.body.style.setProperty('--gx',e.clientX+'px');document.body.style.setProperty('--gy',e.clientY+'px')},{passive:true});
  $$('.card').forEach(c=>{
   c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect(),px=(e.clientX-r.left)/r.width,py=(e.clientY-r.top)/r.height;
    c.style.setProperty('--mx',px*100+'%');c.style.setProperty('--my',py*100+'%');
    c.style.setProperty('--rx',((.5-py)*8).toFixed(1)+'deg');c.style.setProperty('--ry',((px-.5)*8).toFixed(1)+'deg')});
   c.addEventListener('pointerleave',()=>{c.style.setProperty('--rx','0deg');c.style.setProperty('--ry','0deg')})})}
 else if('DeviceOrientationEvent' in window){
  const mb=$('#mot'),clamp=v=>Math.max(-1,Math.min(1,v));let on=false;
  const h=e=>{if(e.gamma!=null)aim(clamp(e.gamma/30),clamp((e.beta-45)/30))};
  mb.hidden=false;
  mb.onclick=async()=>{if(on){removeEventListener('deviceorientation',h);on=false;aim(0,0);document.body.classList.remove('motion')}
   else{try{if(typeof DeviceOrientationEvent.requestPermission==='function'&&await DeviceOrientationEvent.requestPermission()!=='granted')return}catch{return}
    document.body.classList.add('motion');addEventListener('deviceorientation',h);on=true}
   mb.setAttribute('aria-pressed',on)}}}

/* ---------- cycling tagline ---------- */
const ln=$$('.ln');
if(ln.length>1&&!reduce){let n=0;setInterval(()=>{if(document.hidden)return;
 const o=ln[n];o.classList.remove('on');o.classList.add('out');o.setAttribute('aria-hidden','true');
 setTimeout(()=>o.classList.remove('out'),700);   // reset below the baseline, unseen, ready for its next entrance
 n=(n+1)%ln.length;const i=ln[n];i.classList.remove('out');i.classList.add('on');i.removeAttribute('aria-hidden')},6500)}

/* ---------- scroll cue, reveal-on-scroll, lazy Twitch player ---------- */
const dn=$('#down'),onScroll=()=>dn.classList.toggle('gone',scrollY>30);
addEventListener('scroll',onScroll,{passive:true});onScroll();
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
$$('.more .rev').forEach(el=>io.observe(el));
const tw=$('#tw'),twCard=$('[data-k=twitch]'),EMBED='https://player.twitch.tv/';   // the one non-social URL: an embed can't work without its host
const loadTw=()=>{if(!location.hostname||!twCard)return;
 const ch=new URL(twCard.href).pathname.replace(/\//g,'');   // channel comes from your Twitch social link
 const f=document.createElement('iframe');f.src=EMBED+'?channel='+encodeURIComponent(ch)+'&parent='+location.hostname+'&muted=true&autoplay=false';
 f.title='Twitch player';f.allowFullscreen=true;tw.replaceChildren(f)};
if(fine){const io2=new IntersectionObserver(es=>{if(es[0].isIntersecting){io2.disconnect();loadTw()}},{rootMargin:'300px'});io2.observe(tw)}
else{const b=document.createElement('button');b.className='pill';b.textContent='Load Twitch player';b.onclick=loadTw;tw.append(b)}   // phones: embedded players make scrolling choppy, so load on tap

/* ---------- hamburger menu: opens briefly at load, then only on click ---------- */
const menu=$('#menu'),panel=$('#panel');
const setOpen=o=>{panel.classList.toggle('open',o);menu.setAttribute('aria-expanded',o);menu.setAttribute('aria-label',o?'Close controls':'Open controls')};
const t1=setTimeout(()=>setOpen(true),1500),
 t2=setTimeout(()=>{if(!panel.matches(':hover,:focus-within'))setOpen(false)},6500);
const stop=()=>{clearTimeout(t1);clearTimeout(t2)};
menu.onclick=()=>{stop();setOpen(!panel.classList.contains('open'))};
panel.addEventListener('pointerdown',stop);panel.addEventListener('focusin',stop);
addEventListener('pointerdown',e=>{if(panel.classList.contains('open')&&!panel.contains(e.target)&&!menu.contains(e.target))setOpen(false)});
addEventListener('keydown',e=>{if(e.key==='Escape'&&panel.classList.contains('open')){setOpen(false);menu.focus()}});

/* ---------- snappy paging: landing <-> #more ---------- */
let lock=false,lastWheel=0,tS=null,st;
const mTop=()=>$('#more').getBoundingClientRect().top+scrollY;
const fits=()=>mTop()-innerHeight<120;            // only page-snap when the landing screen fits (tall phones/desktops)
const atHero=()=>scrollY<3,atMore=()=>Math.abs(scrollY-mTop())<3;
function glide(to){if(lock)return;lock=true;const from=scrollY,d=to-from,t0=performance.now(),dur=reduce?1:520;
 const step=t=>{const p=Math.min(1,(t-t0)/dur);scrollTo({top:from+d*(1-Math.pow(1-p,4)),behavior:'instant'});
  if(p<1)requestAnimationFrame(step);else setTimeout(()=>{lock=false},120)};
 requestAnimationFrame(step)}
const goDown=()=>glide(mTop()),goUp=()=>glide(0);
dn.addEventListener('click',e=>{e.preventDefault();goDown()});
addEventListener('wheel',e=>{
 if(lock){e.preventDefault();lastWheel=performance.now();return}
 const now=performance.now(),fresh=now-lastWheel>100,dy=e.deltaY*(e.deltaMode===1?16:1);lastWheel=now;
 if(e.ctrlKey||!fits()||Math.abs(dy)<3)return;
 if(dy>0&&atHero()){e.preventDefault();goDown()}
 else if(dy<0&&atMore()){e.preventDefault();if(fresh)goUp()}   // fresh = a new gesture, not leftover momentum
 else if(dy<0&&scrollY>mTop()+3&&scrollY+dy<mTop()){e.preventDefault();scrollTo({top:mTop(),behavior:'instant'})}   // don't overshoot into the landing screen
},{passive:false});
addEventListener('touchstart',e=>{const t=e.touches[0];tS={x:t.clientX,y:t.clientY,hero:atHero(),more:atMore()}},{passive:true});
addEventListener('touchmove',e=>{if(!tS||lock||!fits())return;const t=e.touches[0],dy=t.clientY-tS.y,dx=t.clientX-tS.x;
 if(Math.abs(dy)<10||Math.abs(dx)>Math.abs(dy))return;
 if(tS.hero&&dy<0&&atHero()){if(e.cancelable)e.preventDefault();tS=null;goDown()}
 else if(tS.more&&dy>0&&atMore()){if(e.cancelable)e.preventDefault();tS=null;goUp()}},{passive:false});
addEventListener('keydown',e=>{if(lock||e.ctrlKey||e.metaKey||e.altKey||!fits())return;
 if(e.key===' '&&e.target.closest?.('button,a,input,textarea'))return;
 if((['ArrowDown','PageDown'].includes(e.key)||(e.key===' '&&!e.shiftKey))&&atHero()){e.preventDefault();goDown()}
 else if((['ArrowUp','PageUp'].includes(e.key)||(e.key===' '&&e.shiftKey))&&atMore()){e.preventDefault();goUp()}});
addEventListener('scroll',()=>{clearTimeout(st);   // if a drag/flick ends between the two screens, finish the move
 st=setTimeout(()=>{if(lock||!fits())return;const m=mTop();if(scrollY>3&&scrollY<m-3)glide(scrollY<m/2?0:m)},140)},{passive:true});

/* ---------- live status + videos + clips (written by the GitHub Action) ---------- */
const SRC=['status.json'];
const nf=new Intl.NumberFormat('en',{notation:'compact'}),rf=new Intl.RelativeTimeFormat('en',{numeric:'auto'});
const ago=iso=>{const d=(new Date(iso)-Date.now())/864e5,x=Math.abs(d);return x<1?'today':x<30?rf.format(Math.round(d),'day'):x<365?rf.format(Math.round(d/30),'month'):rf.format(Math.round(d/365),'year')};
function tile(href,thumb,title,meta){const a=document.createElement('a');a.className='tile';a.href=href;a.target='_blank';a.rel='noopener noreferrer';
 const i=document.createElement('img');i.src=thumb;i.alt='';i.loading='lazy';
 const s=document.createElement('span');s.className='tx';const b=document.createElement('b');b.textContent=title;const m=document.createElement('small');m.textContent=meta;
 s.append(b,m);a.append(i,s);return a}
function fill(id,items){const g=$('#g-'+id);g.querySelector('.vgrid').replaceChildren(...items);g.hidden=!items.length}
function apply(s){
 const fresh=Date.now()/1000-(s.updated||0)<5400,t=s.twitch||{},c=twCard;
 if(c){const sm=c.querySelector('small');if(!sm.dataset.h)sm.dataset.h=sm.textContent;
  c.querySelector('.live')?.remove();sm.textContent=sm.dataset.h;
  if(t.live&&fresh){const b=document.createElement('span');b.className='live';b.textContent='Live';c.append(b);
   const bits=[t.game,t.viewers!=null?t.viewers+' watching':''].filter(Boolean).join(' · ');if(bits)sm.textContent=bits}}
 const vids=(s.videos||[]).filter(v=>v.url&&v.thumb).slice(0,3);
 fill('vids',vids.map(v=>tile(v.url,v.thumb,v.title||'Watch now',v.published?ago(v.published):'')));
 fill('clips',(s.clips||[]).slice(0,6).map(k=>tile(k.url,k.thumb,k.title||'Clip',nf.format(k.views||0)+' views')))}
async function poll(){
 const bust='?t='+Date.now();   // unique URL each time so no cache can serve an old copy
 for(const u of SRC){try{const r=await fetch(u+bust,{cache:'no-store'});if(r.ok){apply(await r.json());return}}catch{}}}
poll();setInterval(()=>{if(!document.hidden)poll()},120000);
addEventListener('visibilitychange',()=>{if(!document.hidden)poll()});
})();
