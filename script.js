const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer=matchMedia('(pointer: fine)').matches;
const root=document.documentElement;

function loadImage(image,sources,{loading='lazy',fetchPriority,alt}={}){
  if(!image||!sources.length)return;
  let i=0;
  image.decoding='async';
  image.loading=loading;
  image.referrerPolicy='no-referrer';
  if(fetchPriority)image.fetchPriority=fetchPriority;
  if(alt)image.alt=alt;
  const next=()=>{if(i>=sources.length){image.onerror=null;return}image.src=sources[i++]};
  image.onerror=next;
  next();
}

loadImage(document.querySelector('.profile img'),[
  './profile.jpg?v=20260715-local',
  '/profile.jpg?v=20260715-local',
  'https://cdn.jsdelivr.net/gh/jiahaozheng406/jiahaozheng406.github.io@main/profile.jpg?v=20260715-local',
  'https://raw.githubusercontent.com/jiahaozheng406/jiahaozheng406.github.io/main/profile.jpg?v=20260715-local'
],{loading:'eager',fetchPriority:'high',alt:'Jiahao Zheng profile photo'});

loadImage(document.querySelector('.interest-photo img'),[
  'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Kylian_Mbappe_France_v_Senegal_16_June_2026-391_%28cropped%29.jpg/250px-Kylian_Mbappe_France_v_Senegal_16_June_2026-391_%28cropped%29.jpg?v=20260715',
  'https://upload.wikimedia.org/wikipedia/commons/9/95/Kylian_Mbappe_France_v_Senegal_16_June_2026-391_%28cropped%29.jpg?v=20260715'
],{alt:'Kylian Mbappe with France national team'});

document.querySelectorAll('.interest-body p').forEach(p=>{
  if(p.textContent.includes('Kylian Mbappé')&&!p.querySelector('.mbappe-name')){
    p.innerHTML=p.innerHTML.replace('Kylian Mbappé','<span class="mbappe-name">Kylian Mbappé</span>');
  }
});

const news=document.querySelector('.news-list');
if(news){
  [...news.children].map((item,index)=>{
    const m=(item.querySelector('span')?.textContent.trim()||'').match(/^(\d{4})\.(\d{1,2})$/);
    return{item,index,value:m?+m[1]*100 + +m[2]:-1};
  }).sort((a,b)=>b.value-a.value||a.index-b.index).forEach(({item})=>news.appendChild(item));
}

let pointerFrame=null,mouseX=innerWidth/2,mouseY=innerHeight*.3;
function updateSideBackground(){
  root.style.setProperty('--mouse-x',`${mouseX}px`);
  root.style.setProperty('--mouse-y',`${mouseY}px`);
  const x=Math.max(0,Math.min(1,mouseX/Math.max(innerWidth,1)));
  const y=Math.max(0,Math.min(1,mouseY/Math.max(innerHeight,1)));
  root.style.setProperty('--side-hue-a',178+x*145);
  root.style.setProperty('--side-hue-b',326-x*118+y*24);
  pointerFrame=null;
}
if(finePointer&&!reducedMotion)addEventListener('pointermove',e=>{
  mouseX=e.clientX;mouseY=e.clientY;
  if(!pointerFrame)pointerFrame=requestAnimationFrame(updateSideBackground);
},{passive:true});

let particleContainer=null,anchors=[],inside=false,returnFrame=null,returning=false;
const particles=()=>particleContainer?.particles?.array||[];
function inSideField(x){
  const half=Math.min(520,Math.max(0,innerWidth/2-28));
  return x<innerWidth/2-half||x>innerWidth/2+half;
}
function snapshot(){
  anchors=particles().map(p=>({p,x:p.position.x,y:p.position.y,vx:Number(p.velocity?.x)||0,vy:Number(p.velocity?.y)||0}));
}
function stopReturn(){
  if(returnFrame)cancelAnimationFrame(returnFrame);
  returnFrame=null;returning=false;
}
function startReturn(){
  if(!particleContainer||!anchors.length||reducedMotion)return;
  stopReturn();returning=true;
  const duration=600,start=performance.now();
  const starts=anchors.map(a=>({a,x:a.p.position.x,y:a.p.position.y}));
  const animate=now=>{
    const t=Math.min(1,(now-start)/duration);
    const spring=1-Math.exp(-8.8*t)*Math.cos(11.2*t);
    const resume=.16+.84*Math.pow(t,.72);
    starts.forEach(({a,x,y})=>{
      const p=a.p;if(!p?.position)return;
      p.position.x=x+(a.x-x)*spring;
      p.position.y=y+(a.y-y)*spring;
      if(p.velocity){
        const dx=a.x-innerWidth/2,dy=a.y-innerHeight/2;
        const sx=Math.max(-.2,Math.min(.2,-dy*.00024));
        const sy=Math.max(-.2,Math.min(.2,dx*.00024));
        p.velocity.x=a.vx*resume+sx*t;
        p.velocity.y=a.vy*resume+sy*t;
      }
    });
    if(t<1){returnFrame=requestAnimationFrame(animate);return}
    anchors.forEach(a=>{
      const p=a.p;if(!p?.position)return;
      p.position.x=a.x;p.position.y=a.y;
      if(p.velocity){
        const dx=a.x-innerWidth/2,dy=a.y-innerHeight/2;
        p.velocity.x=a.vx*.96+Math.max(-.2,Math.min(.2,-dy*.00024));
        p.velocity.y=a.vy*.96+Math.max(-.2,Math.min(.2,dx*.00024));
      }
    });
    returnFrame=null;returning=false;anchors=[];
  };
  returnFrame=requestAnimationFrame(animate);
}
function magneticMove(e){
  if(!finePointer||reducedMotion||!particleContainer)return;
  const nowInside=inSideField(e.clientX);
  if(nowInside&&!inside){inside=true;if(returning)stopReturn();snapshot()}
  else if(!nowInside&&inside){inside=false;startReturn()}
}
if(finePointer&&!reducedMotion){
  addEventListener('pointermove',magneticMove,{passive:true});
  addEventListener('pointerleave',()=>{if(inside){inside=false;startReturn()}},{passive:true});
}

if(window.tsParticles)tsParticles.load('tsparticles',{
  fullScreen:{enable:false},background:{color:{value:'transparent'}},detectRetina:true,fpsLimit:reducedMotion?30:60,
  particles:{
    number:{value:reducedMotion?64:152,density:{enable:true,area:760}},
    color:{value:['#22d3ee','#38bdf8','#60a5fa','#818cf8','#a78bfa','#c084fc','#f472b6']},shape:{type:'circle'},
    opacity:{value:{min:.32,max:.8},animation:{enable:!reducedMotion,speed:.42,minimumValue:.23,sync:false}},
    size:{value:{min:1.7,max:4.9},animation:{enable:!reducedMotion,speed:1.05,minimumValue:1.25,sync:false}},
    links:{enable:true,distance:182,color:'random',opacity:.5,width:1.7},
    move:{enable:true,speed:reducedMotion?.22:2,direction:'none',random:true,straight:false,attract:{enable:!reducedMotion,rotate:{x:1120,y:1120}},outModes:{default:'bounce'}}
  },
  interactivity:{detectsOn:'window',events:{onHover:{enable:finePointer&&!reducedMotion,mode:['grab','bubble','repulse']},resize:true},modes:{grab:{distance:198,links:{opacity:.84}},bubble:{distance:150,size:6.6,duration:.2,opacity:.93},repulse:{distance:102,duration:.18,factor:108,speed:1.2}}}
}).then(c=>particleContainer=c).catch(()=>particleContainer=null);

if(finePointer&&!reducedMotion){
  const existingCanvases=new Set(document.querySelectorAll('canvas'));
  const promoteCursorCanvas=()=>{
    document.querySelectorAll('canvas').forEach(canvas=>{
      if(existingCanvases.has(canvas))return;
      canvas.dataset.cursorTrailOverlay='true';
      canvas.setAttribute('aria-hidden','true');
      canvas.setAttribute('tabindex','-1');
      canvas.draggable=false;
      canvas.style.setProperty('position','fixed','important');
      canvas.style.setProperty('inset','0','important');
      canvas.style.setProperty('width','100vw','important');
      canvas.style.setProperty('height','100vh','important');
      canvas.style.setProperty('max-width','none','important');
      canvas.style.setProperty('max-height','none','important');
      canvas.style.setProperty('margin','0','important');
      canvas.style.setProperty('padding','0','important');
      canvas.style.setProperty('border','0','important');
      canvas.style.setProperty('background','transparent','important');
      canvas.style.setProperty('pointer-events','none','important');
      canvas.style.setProperty('user-select','none','important');
      canvas.style.setProperty('-webkit-user-select','none','important');
      canvas.style.setProperty('z-index','2147483647','important');
      canvas.style.setProperty('mix-blend-mode','normal','important');
      canvas.style.setProperty('isolation','isolate','important');
      canvas.style.setProperty('contain','strict','important');
      if(canvas.parentElement!==document.documentElement){
        document.documentElement.appendChild(canvas);
      }
    });
  };
  const cursorCanvasObserver=new MutationObserver(promoteCursorCanvas);
  cursorCanvasObserver.observe(document.documentElement,{childList:true,subtree:true});
  import('https://unpkg.com/cursor-effects@latest/dist/esm.js')
    .then(({fairyDustCursor})=>{
      new fairyDustCursor();
      requestAnimationFrame(()=>{
        promoteCursorCanvas();
        requestAnimationFrame(promoteCursorCanvas);
      });
      setTimeout(promoteCursorCanvas,300);
      setTimeout(()=>{
        promoteCursorCanvas();
        cursorCanvasObserver.disconnect();
      },1500);
    })
    .catch(()=>{
      cursorCanvasObserver.disconnect();
    });
}

updateSideBackground();