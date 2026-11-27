(function(){
  "use strict";
  const palette=["#c77a45","#4d9db0","#b47acb","#d39b42","#6da77d"];
  const tunnelStyles=["brick","stone","fantasy"];
  let routeColor=palette[0],tunnelStyle="brick",ends={};
  const paths={
    2:{d:"M30 2 V58",ties:[[30,9,0],[30,30,0],[30,51,0]]},
    3:{d:"M30 2 V30 Q30 30 58 30",ties:[[30,9,0],[30,25,0],[39,30,0],[53,30,0]]},
    4:{d:"M58 30 H30 V58",ties:[[51,30,0],[35,30,0],[30,39,90],[30,53,90]]},
    5:{d:"M30 58 V30 Q30 30 2 30",ties:[[30,51,0],[30,35,0],[21,30,0],[7,30,0]]},
    6:{d:"M2 30 H30 V2",ties:[[7,30,0],[21,30,0],[30,21,90],[30,7,90]]},
    7:{d:"M2 30 H58",ties:[[9,30,0],[30,30,0],[51,30,0]]}
  };
  function configure(solution,size,locked){
    routeColor=palette[Math.floor(Math.random()*palette.length)];
    tunnelStyle=tunnelStyles[Math.floor(Math.random()*tunnelStyles.length)];
    ends={};
    (locked||[]).forEach(index=>{
      const row=Math.floor(index/size),col=index%size;
      if(row===0)ends[index]="top"; else if(row===size-1)ends[index]="bottom"; else if(col===0)ends[index]="left"; else if(col===size-1)ends[index]="right";
    });
  }
  function sleeper(x,y,angle){
    return "<rect class='wood-tie' fill='"+routeColor+"' x='"+(x-10)+"' y='"+(y-4.5)+"' width='20' height='9' rx='2' transform='rotate("+angle+" "+x+" "+y+")'/><path class='wood-grain' d='M"+(x-6)+" "+y+" h12' transform='rotate("+angle+" "+x+" "+y+")'/>";
  }
  function tunnel(side){
    const transform=side==="top"?"rotate(0 30 30)":side==="bottom"?"rotate(180 30 30)":side==="left"?"rotate(-90 30 30)":"rotate(90 30 30)";
    let roof="";
    if(tunnelStyle==="brick") roof="<path class='tunnel-roof portal-brick' d='M7 28 L11 8 Q30 -1 49 8 L53 28 L45 37 H15 Z'/><path class='portal-detail' d='M11 12 L18 17 M49 12 L42 17 M14 24 H46 M18 31 H42'/>";
    else if(tunnelStyle==="stone") roof="<path class='tunnel-roof portal-stone' d='M6 28 L10 7 Q30 -3 50 7 L54 28 L45 37 H15 Z'/><path class='portal-detail' d='M11 12 L18 17 M49 12 L42 17 M13 24 H47 M18 31 H42'/>";
    else roof="<path class='tunnel-roof portal-fantasy' d='M7 28 L11 8 Q30 -2 49 8 L53 28 L45 37 H15 Z'/><path class='portal-detail' d='M30 5 V16 M25 10 H35 M13 22 L19 27 M47 22 L41 27'/>";
    const opening="<path class='tunnel-opening' d='M15 8 Q30 -5 45 8 L42 17 Q30 9 18 17 Z'/><path class='tunnel-opening-glint' d='M18 9 Q30 0 42 9'/>";
    return "<g class='tunnel tunnel-"+tunnelStyle+"' transform='"+transform+"'>"+opening+roof+"</g>";
  }
  function render(value,index){
    if(value===1)return "<svg viewBox='0 0 60 60' aria-hidden='true'><text class='x-mark' x='30' y='39' text-anchor='middle'>×</text></svg>";
    const piece=paths[value];
    if(!piece)return "<svg viewBox='0 0 60 60' aria-hidden='true'></svg>";
    const ties=piece.ties.map(t=>sleeper(t[0],t[1],t[2])).join("");
    const portal=ends[index]?tunnel(ends[index]):"";
    return "<svg viewBox='0 0 60 60' aria-hidden='true'><g class='rail-art'>"+ties+"<path class='rail-shadow' d='"+piece.d+"' transform='translate(0 3)'/><path class='rail' d='"+piece.d+"'/><path class='rail-glint' d='"+piece.d+"'/></g>"+portal+"</svg>";
  }
  window.TrainTrackArt={configure,render};
})();