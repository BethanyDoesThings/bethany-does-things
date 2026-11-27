(function(){
  "use strict";
  const palette=["#c77a45","#4d9db0","#b47acb","#d39b42","#6da77d"];
  let routeColor=palette[0];
  const paths={
    2:{d:"M30 2 V58",ties:[[30,9,0],[30,30,0],[30,51,0]]},
    3:{d:"M30 2 V30 Q30 30 58 30",ties:[[30,9,0],[30,25,0],[39,30,90],[53,30,90]]},
    4:{d:"M58 30 H30 V58",ties:[[51,30,90],[35,30,90],[30,39,0],[30,53,0]]},
    5:{d:"M30 58 V30 Q30 30 2 30",ties:[[30,51,0],[30,35,0],[21,30,90],[7,30,90]]},
    6:{d:"M2 30 H30 V2",ties:[[7,30,90],[21,30,90],[30,21,0],[30,7,0]]},
    7:{d:"M2 30 H58",ties:[[9,30,90],[30,30,90],[51,30,90]]}
  };
  function configure(){ routeColor=palette[Math.floor(Math.random()*palette.length)]; }
  function sleeper(x,y,angle){
    return "<rect class='wood-tie' fill='"+routeColor+"' x='"+(x-15)+"' y='"+(y-6)+"' width='30' height='12' rx='2' transform='rotate("+angle+" "+x+" "+y+")'/><path class='wood-grain' d='M"+(x-10)+" "+y+" h20' transform='rotate("+angle+" "+x+" "+y+")'/>";
  }
  function render(value,index){
    if(value===1)return "<svg viewBox='0 0 60 60' aria-hidden='true'><text class='x-mark' x='30' y='39' text-anchor='middle'>×</text></svg>";
    const piece=paths[value];
    if(!piece)return "<svg viewBox='0 0 60 60' aria-hidden='true'></svg>";
    const ties=piece.ties.map(t=>sleeper(t[0],t[1],t[2])).join("");
    return "<svg viewBox='0 0 60 60' aria-hidden='true'><g class='rail-art'>"+ties+"<path class='rail-shadow' d='"+piece.d+"' transform='translate(0 3)'/><path class='rail' d='"+piece.d+"'/><path class='rail-glint' d='"+piece.d+"'/></g></svg>";
  }
  window.TrainTrackArt={configure,render};
})();