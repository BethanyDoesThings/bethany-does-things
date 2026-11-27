(function(){
  "use strict";
  const palette=["#c77a45","#4d9db0","#b47acb","#d39b42","#6da77d"];
  const tunnelStyles=["brick","stone","fantasy"];
  let routeColor=palette[0],tunnelStyle="brick",ends={};
  const paths={
    2:{d:"M30 2 V58",ties:[[30,10,0],[30,30,0],[30,50,0]]},
    3:{d:"M30 2 V30 Q30 30 58 30",ties:[[30,10,0],[30,25,0],[38,30,0],[52,30,0]]},
    4:{d:"M58 30 H30 V58",ties:[[50,30,0],[35,30,0],[30,38,90],[30,52,90]]},
    5:{d:"M30 58 V30 Q30 30 2 30",ties:[[30,50,0],[30,35,0],[22,30,0],[8,30,0]]},
    6:{d:"M2 30 H30 V2",ties:[[8,30,0],[22,30,0],[30,22,90],[30,8,90]]},
    7:{d:"M2 30 H58",ties:[[10,30,0],[30,30,0],[50,30,0]]}
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
  function sleeper(x,y,angle){return "<rect class='wood-tie' fill='"+routeColor+"' x='"+(x-5.5)+"' y='"+(y-3)+"' width='11' height='6' rx='1.5' transform='rotate("+angle+" "+x+" "+y+")'/><path class='wood-grain' d='M"+(x-3)+" "+y+" h6' transform='rotate("+angle+" "+x+" "+y+")'/>";}
  function tunnel(side){
    const transform=side==="top"?"rotate(0 30 30)":side==="bottom"?"rotate(180 30 30)":side==="left"?"rotate(-90 30 30)":"rotate(90 30 30)";
    let arch="";
    if(tunnelStyle==="brick")arch="<path class='portal-brick' d='M12 60 V34 A18 18 0 0 1 48 34 V60 Z'/><path class='portal-detail' d='M12 44 H48 M15 34 H45 M20 23 L23 19 M40 23 L37 19 M20 52 H40'/>";
    else if(tunnelStyle==="stone")arch="<path class='portal-stone' d='M11 60 V34 A19 19 0 0 1 49 34 V60 Z'/><path class='portal-detail' d='M12 43 H48 M17 28 L24 30 M37 30 L44 28 M18 52 H42'/>";
    else arch="<path class='portal-fantasy' d='M11 60 V34 A19 19 0 0 1 49 34 V60 Z'/><path class='portal-detail' d='M30 8 V16 M26 12 H34 M15 25 L19 29 M45 25 L41 29'/>";
    return "<g class='tunnel tunnel-"+tunnelStyle+"' transform='"+transform+"'>"+arch+"</g>";
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