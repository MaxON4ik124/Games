/* Original procedural 2D illustrations. All artwork is drawn locally, with no downloaded assets. */
(() => {
  'use strict';
  const F = window.Fish, W = 1200, H = 720;
  const seed = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const path = (c, points, color, stroke, width = 1) => { c.beginPath(); points.forEach((p, i) => i ? c.lineTo(...p) : c.moveTo(...p)); c.closePath(); if (color) { c.fillStyle = color; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = width; c.stroke(); } };
  const ellipse = (c, x, y, rx, ry, color) => { c.beginPath(); c.ellipse(x,y,rx,ry,0,0,Math.PI*2); c.fillStyle=color;c.fill(); };
  const line = (c, points, color, width = 2) => { c.beginPath(); points.forEach((p,i) => i ? c.lineTo(...p) : c.moveTo(...p)); c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke(); };
  function pine(c, x, y, s, color, light = false) {
    c.save();c.translate(x,y);c.scale(s,s); c.fillStyle='#6c7255';c.fillRect(-3,-72,6,74);
    path(c,[[-29,-33],[0,-111],[29,-33],[18,-36],[37,-12],[-36,-12],[-19,-39]],color);
    path(c,[[-23,-64],[0,-133],[23,-64],[14,-68],[29,-45],[-28,-45],[-12,-69]],color);
    if(light) { c.globalAlpha=.15;path(c,[[0,-132],[3,-72],[28,-45],[12,-48],[35,-12],[2,-17]],'#f8f3c9'); }
    c.restore();
  }
  function bush(c,x,y,s,color) { ellipse(c,x,y,33*s,14*s,color);ellipse(c,x-18*s,y-8*s,19*s,18*s,color);ellipse(c,x+9*s,y-14*s,21*s,22*s,color);ellipse(c,x+29*s,y-4*s,17*s,14*s,color); }
  function cloud(c,x,y,s,color) { ellipse(c,x,y,40*s,12*s,color);ellipse(c,x-18*s,y-6*s,22*s,13*s,color);ellipse(c,x+9*s,y-11*s,22*s,18*s,color);ellipse(c,x+35*s,y,20*s,10*s,color); }
  function background(c,loc) {
    const location = F.config.locations[loc], a=location.colors;
    const sky=c.createLinearGradient(0,0,0,380);sky.addColorStop(0,a[0]);sky.addColorStop(1,'#f3edd2');c.fillStyle=sky;c.fillRect(0,0,W,H);
    ellipse(c,862,100,48,48,loc===3?'#efb884':'#f4e7b2');ellipse(c,862,100,62,62,loc===3?'#efb88420':'#f4e7b220');
    cloud(c,180,96,1.4,'#faf7e7');cloud(c,572,70,1,'#faf7e7');cloud(c,1040,165,.8,'#f7f4e0');
    path(c,[[0,275],[110,177],[180,203],[295,93],[376,184],[464,137],[568,217],[655,166],[735,242],[849,188],[988,246],[1100,180],[1200,237],[1200,380],[0,380]],a[1]);
    if(loc===2){path(c,[[225,159],[295,93],[344,151],[318,143],[300,125],[279,155],[263,144]],'#f1f2e7');path(c,[[402,184],[464,137],[509,185],[478,169],[467,174],[454,164],[431,186]],'#f1f2e7');}
    if(loc===3){path(c,[[760,250],[898,102],[1020,253]],'#8d8291');path(c,[[873,130],[898,102],[925,133],[900,128]],'#d8947e');cloud(c,894,86,.6,'#d6b7b8');}
    c.beginPath();c.moveTo(0,270);c.bezierCurveTo(150,198,214,260,359,241);c.bezierCurveTo(510,214,550,293,697,259);c.bezierCurveTo(904,214,1046,278,1200,248);c.lineTo(1200,390);c.lineTo(0,390);c.fillStyle=a[2];c.fill();
    for(let i=0;i<70;i++){const x=i*19, y=300+Math.sin(i*.4)*18;pine(c,x,y,.38+seed(i)*.3,a[3]);}
    const water=c.createLinearGradient(0,300,0,H);water.addColorStop(0,a[4]);water.addColorStop(.5,a[4]);water.addColorStop(1,a[5]);c.fillStyle=water;c.fillRect(0,305,W,H-305);
    c.globalAlpha=.12;for(let i=0;i<45;i++){const x=i*29,y=305;path(c,[[x,y],[x-12,385+seed(i)*100],[x+13,385+seed(i)*100],[x+5,y]],a[3]);}c.globalAlpha=1;
    // Distant island, weathered timber cabin and layered shore.
    c.beginPath();c.moveTo(859,365);c.bezierCurveTo(963,292,1125,296,1200,325);c.lineTo(1200,403);c.bezierCurveTo(1073,405,951,394,859,365);c.fillStyle=a[3];c.fill();
    c.beginPath();c.moveTo(864,364);c.bezierCurveTo(982,329,1113,351,1200,363);c.lineTo(1200,384);c.bezierCurveTo(1071,384,939,385,864,364);c.fillStyle=a[7];c.fill();
    [957,1012,1063,1113,1170,1209].forEach((x,i)=>pine(c,x,355+seed(i)*12,.7+seed(i+12)*.65,a[3],true));
    ellipse(c,1006,386,78,7,a[4]);
    c.beginPath();c.moveTo(0,290);c.bezierCurveTo(150,270,274,328,312,392);c.bezierCurveTo(338,431,437,441,493,477);c.bezierCurveTo(522,500,455,525,403,531);c.bezierCurveTo(285,555,294,608,429,633);c.bezierCurveTo(495,647,505,684,544,720);c.lineTo(0,720);c.fillStyle=a[6];c.fill();
    c.beginPath();c.moveTo(0,290);c.bezierCurveTo(155,276,261,337,288,396);c.bezierCurveTo(303,435,404,451,460,475);c.bezierCurveTo(409,487,344,476,297,496);c.bezierCurveTo(177,547,211,626,341,657);c.lineTo(433,720);c.lineTo(0,720);c.fillStyle=a[7];c.fill();
    // Trail from the cabin to the jetty.
    c.beginPath();c.moveTo(147,389);c.bezierCurveTo(153,435,251,448,294,498);c.lineTo(333,496);c.bezierCurveTo(252,411,200,437,178,389);c.fillStyle='#d4c795';c.fill();
    ellipse(c,123,397,119,23,'#526d4930');
    // Cabin.
    path(c,[[53,317],[204,319],[204,397],[53,387]],'#c6a276');path(c,[[204,319],[231,306],[231,380],[204,397]],'#9b7d59');
    for(let i=0;i<5;i++)line(c,[[54,330+i*13],[203,333+i*13]],'#af8c61',2);
    path(c,[[30,322],[119,253],[222,316]],'#5d7160');path(c,[[119,253],[156,245],[246,298],[222,316]],'#3e6256');
    line(c,[[29,322],[118,253],[222,316]],'#819079',6);c.fillStyle='#a79675';c.fillRect(174,249,18,35);path(c,[[171,248],[195,248],[194,254],[171,254]],'#c3b392');
    c.fillStyle='#5a7568';c.fillRect(139,339,32,56);c.fillStyle='#d5c287';c.fillRect(143,343,24,25);line(c,[[155,343],[155,367]],'#7a8060',2);ellipse(c,164,377,2,2,'#e6cc87');
    c.fillStyle='#ece0b3';c.fillRect(75,336,38,28);c.fillStyle='#7b9d8d';c.fillRect(79,340,30,20);line(c,[[94,339],[94,362]],'#dbcb9c',3);line(c,[[77,350],[110,350]],'#dbcb9c',3);
    path(c,[[132,394],[178,394],[183,401],[127,401]],'#a58c64');
    for(let i=0;i<3;i++)pine(c,20+i*35,346+i*13,1.3+seed(i)*.4,'#496e59',true);
    pine(c,269,373,1.12,'#57785b',true);pine(c,310,403,.8,'#6c8861',true);
    // Planks, posts, rope and tackle basket on the jetty.
    path(c,[[278,486],[574,480],[653,532],[334,549]],'#775f43');
    path(c,[[276,477],[572,471],[655,518],[331,535]],'#d0aa76');
    for(let i=0;i<11;i++){const t=i/11;line(c,[[282+t*286,477-t*5],[335+t*312,533-t*15]],'#a38057',1.5);}
    line(c,[[279,478],[574,472],[654,519]],'#e2c293',4);line(c,[[335,535],[655,519]],'#94704a',4);
    [[345,527],[623,514],[306,478],[573,476]].forEach(([x,y],i)=>{c.fillStyle=i<2?'#94734c':'#ae8e63';c.fillRect(x-5,y-15,10,i<2?67:37);ellipse(c,x,y-15,6,3,'#d8bc8e');});
    line(c,[[344,507],[622,495]],'#d8c69b',2);
    ellipse(c,366,503,19,6,'#886c48');path(c,[[348,489],[384,489],[380,505],[353,506]],'#b28d52');ellipse(c,366,489,18,5,'#d5bd80');line(c,[[355,489],[359,476],[375,476],[380,489]],'#8b7754',2);
    // Shore pebbles, meadow, ferns and flowers.
    for(let i=0;i<35;i++){const x=seed(i+80)*305,y=540+seed(i+90)*180;ellipse(c,x,y,4+seed(i)*10,3+seed(i+1)*4,i%2?'#7c8b68':'#adad85');}
    for(let i=0;i<90;i++){const x=seed(i+360)*315,y=412+seed(i+200)*310;if(x>260 && y<500)continue;line(c,[[x,y],[x-4,y-9],[x,y-4],[x+4,y-12]],i%2?'#8da574':'#65845d',1.6);if(i%6===0){ellipse(c,x+4,y-12,2.7,2.7,'#f4e7b2');ellipse(c,x+4,y-12,1,1,'#c3a361');}}
    bush(c,30,667,1.5,'#426e56');bush(c,99,721,1.5,'#527956');bush(c,-2,557,.9,'#63825b');
    const reeds=[[283,611],[303,626],[365,685],[395,709],[321,643]];reeds.forEach(([x,y],i)=>{line(c,[[x,y],[x-6,y-38],[x-11,y-47]],'#7e885a',3);line(c,[[x,y],[x+6,y-50]],'#66815b',3);line(c,[[x+6,y-50],[x+7,y-64]],'#9b7950',5);});
    // Lily pads.
    [[926,578,15],[1038,628,19],[1106,552,13],[965,641,10],[883,597,9]].forEach(([x,y,r],i)=>{ellipse(c,x,y+5,r+6,3,a[5]);c.beginPath();c.ellipse(x,y,r,r*.42,0,.2,Math.PI*1.88);c.lineTo(x,y);c.fillStyle=i%2?'#7c9d75':'#93ad7d';c.fill();if(i===1){ellipse(c,x-2,y-6,6,4,'#f4e6ca');ellipse(c,x+2,y-10,4,5,'#efd8c1');}});
    // Boat by the shore, repaired appearance follows progress dynamically elsewhere.
    c.save();c.translate(700,582);c.rotate(-.07);ellipse(c,0,15,65,9,a[5]);path(c,[[-62,-9],[55,-9],[41,20],[-39,20]],'#ac8057');ellipse(c,-3,-9,59,14,'#d5b184');ellipse(c,-3,-10,45,9,'#826c4c');line(c,[[-24,-17],[-20,3]],'#d5ae79',7);line(c,[[15,-17],[16,2]],'#d5ae79',7);line(c,[[-33,-27],[41,22]],'#e1c697',4);line(c,[[29,15],[49,28]],'#d1b185',8);c.restore();
    if(loc===1){const fog=c.createLinearGradient(0,230,0,420);fog.addColorStop(0,'#e7ecd300');fog.addColorStop(.5,'#e7ecd345');fog.addColorStop(1,'#e7ecd300');c.fillStyle=fog;c.fillRect(0,230,W,190);}
    if(loc===2){path(c,[[1060,370],[1070,340],[1082,368]],'#a0d1d6');path(c,[[1090,375],[1102,334],[1113,373]],'#c1e4e5');}
    if(loc===3){for(let i=0;i<8;i++){const x=950+seed(i+60)*230,y=400+seed(i+10)*230;ellipse(c,x,y,2,2,'#e5b67e');}}
  }
  function fisher(c,t) {
    const f=F.fishing;let lift=f.phase==='reeling'?Math.sin(f.progress*Math.PI)*15:0;
    c.save();c.translate(442,454);
    ellipse(c,-8,49,30,7,'#6a694833');
    // Standing fisherman, trousers and boots.
    line(c,[[-17,11],[-19,28],[-19,47]],'#5d7980',13);line(c,[[-4,11],[3,27],[6,45]],'#526d73',12);line(c,[[-22,48],[-8,48]],'#4b5750',9);line(c,[[3,47],[18,47]],'#4b5750',9);
    path(c,[[-22,-25],[0,-24],[10,11],[-22,21],[-30,7]],'#e9ddad');line(c,[[-25,-17],[-33,10]],'#dfcf9e',10);
    line(c,[[-2,-17],[13,1-lift/2],[36,-7-lift]],'#e9ddad',11);ellipse(c,36,-7-lift,6,5,'#cda37a');
    // Neck, head, hair, broad brimmed sun hat.
    c.fillStyle='#cda37a';c.fillRect(-15,-40,13,18);ellipse(c,-9,-47,15,19,'#dcb58a');path(c,[[-24,-48],[-20,-59],[-4,-61],[-7,-46],[-17,-41]],'#6f6851');ellipse(c,2,-47,4,4,'#dcb58a');
    ellipse(c,-12,-62,34,7,'#b69c58');path(c,[[-31,-66],[-25,-87],[0,-84],[9,-63]],'#d4ba73');path(c,[[-30,-69],[7,-67],[9,-61],[-32,-62]],'#8f9d74');ellipse(c,-11,-87,12,3,'#e2cd91');
    c.restore();
    const tipX=618-lift,tipY=328-lift*3;
    line(c,[[473,451-lift],[tipX,tipY]],F.config.rods[F.state.rod].color,4);line(c,[[470,454-lift],[492,435-lift]],'#6c5e43',7);ellipse(c,495,438-lift,6,6,'#d1b67e');
    let bx=728,by=486+Math.sin(t*3)*2;
    if(f.phase==='casting'){const p=f.progress;bx=535+p*193;by=437+p*49-Math.sin(p*Math.PI)*110;}
    if(f.phase==='idle'){bx=615;by=487+Math.sin(t*2)*2;}
    if(f.phase==='reeling'){bx=728-f.progress*210;by=486-f.progress*90-Math.sin(f.progress*Math.PI)*65;}
    c.beginPath();c.moveTo(tipX,tipY);c.quadraticCurveTo(tipX+70,tipY+15,bx,by-9);c.strokeStyle='#f4ead1';c.globalAlpha=.8;c.lineWidth=1.5;c.stroke();c.globalAlpha=1;
    if(f.phase!=='reeling') {
      const rip=f.phase==='bite'?t*3:t;
      for(let i=0;i<3;i++){const p=(rip+i*.34)%1;c.globalAlpha=(1-p)*.45;c.beginPath();c.ellipse(bx,by+7,8+p*33,2+p*9,0,0,Math.PI*2);c.strokeStyle='#f2f1cf';c.lineWidth=1.4;c.stroke();}c.globalAlpha=1;
      if(f.phase==='bite')by+=Math.sin(t*24)*6;
      line(c,[[bx,by-15],[bx,by+7]],'#5f7167',1.4);ellipse(c,bx,by-2,4,7,'#f3ead0');c.save();c.beginPath();c.rect(bx-6,by-10,12,8);c.clip();ellipse(c,bx,by-2,4,7,'#dd7854');c.restore();
    }
  }
  F.scene = {
    canvas: null, context: null, cached: null, location: -1, time: 0, thumbnails: {},
    init() { this.canvas=document.getElementById('scene');this.context=this.canvas.getContext('2d');if(!this.context){document.getElementById('canvas-fallback').hidden=false;return;}this.render(0); },
    render(ms) {
      if(!this.context)return;this.time+=ms/1000;
      if(this.location!==F.state.location){this.location=F.state.location;this.cached=document.createElement('canvas');this.cached.width=W;this.cached.height=H;background(this.cached.getContext('2d'),this.location);}
      const c=this.context,t=this.time;c.clearRect(0,0,W,H);c.drawImage(this.cached,0,0);
      // Moving highlights and small circles make the painted water feel alive.
      c.save();c.globalAlpha=.24;
      for(let i=0;i<45;i++){const x=420+seed(i+50)*770+Math.sin(t*.5+i)*7,y=340+seed(i+10)*350;if(x<550&&y>590)continue;line(c,[[x,y],[x+10+seed(i)*28,y]],'#e6ecd1',1.5);}
      c.restore();
      // Two birds lazily crossing the mountains.
      for(let i=0;i<3;i++){const x=(600+i*39+t*3)%1250,y=148+i*11;const wing=Math.sin(t*2+i)*4;line(c,[[x-7,y-wing],[x,y],[x+7,y-wing]],'#789489',1.6);}
      fisher(c,t);
    },
    thumbnail(loc) { if(!this.thumbnails[loc]){const canvas=document.createElement('canvas');canvas.width=480;canvas.height=280;const c=canvas.getContext('2d');if(!c)return '';c.scale(.4,.4);background(c,loc);this.thumbnails[loc]=canvas.toDataURL();}return this.thumbnails[loc]; }
  };
})();
