(function(){
  "use strict";
  const palette=["#c77a45","#4d9db0","#b47acb","#d39b42","#6da77d"];
  let routeColor=palette[0];
  const paths={
    2:{rails:["M20 2 V58","M40 2 V58"],ties:[[30,8,0],[30,30,0],[30,52,0]]},
    3:{rails:["M20 2 V20 H58","M40 2 V40 H58"],ties:[[30,8,0],[52,30,90]]},
    4:{rails:["M58 20 H20 V58","M58 40 H40 V58"],ties:[[52,30,90],[30,52,0]]},
    5:{rails:["M40 58 V40 H2","M20 58 V20 H2"],ties:[[30,52,0],[8,30,90]]},
    6:{rails:["M2 40 H40 V2","M2 20 H20 V2"],ties:[[8,30,90],[30,8,0]]},
    7:{rails:["M2 20 H58","M2 40 H58"],ties:[[8,30,90],[30,30,90],[52,30,90]]}
  };
  function configure(){ routeColor=palette[Math.floor(Math.random()*palette.length)]; }
  function sleeper(x,y,angle){
    return "<rect class='wood-tie' fill='"+routeColor+"' x='"+(x-20)+"' y='"+(y-5)+"' width='40' height='10' rx='2' transform='rotate("+angle+" "+x+" "+y+")'/><path class='wood-grain' d='M"+(x-13)+" "+y+" h26' transform='rotate("+angle+" "+x+" "+y+")'/>";
  }
  function render(value,index){
    if(value===1)return "<svg viewBox='0 0 60 60' aria-hidden='true'><text class='x-mark' x='30' y='39' text-anchor='middle'>×</text></svg>";
    const piece=paths[value];
    if(!piece)return "<svg viewBox='0 0 60 60' aria-hidden='true'></svg>";
    const ties=piece.ties.map(t=>sleeper(t[0],t[1],t[2])).join("");
    const rails=piece.rails.map(d=>"<path class='rail-shadow' d='"+d+"' transform='translate(0 2)'/><path class='rail' d='"+d+"'/><path class='rail-glint' d='"+d+"'/>").join("");
    return "<svg viewBox='0 0 60 60' aria-hidden='true'><g class='rail-art'>"+ties+rails+"</g></svg>";
  }
  window.TrainTrackArt={configure,render};
})();