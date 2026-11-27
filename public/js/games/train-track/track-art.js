(function(){
  "use strict";
  const palette=["#c77a45","#4d9db0","#b47acb","#d39b42","#6da77d"];
  let routeColor=palette[0];
  const paths={
    2:{rails:["M23 2 V58","M37 2 V58"],ties:[[30,9,0],[30,30,0],[30,51,0]]},
    3:{rails:["M23 2 V30 Q23 37 30 37 H58","M37 2 V30 Q37 23 30 23 H58"],ties:[[30,9,0],[30,25,0],[39,30,90],[53,30,90]]},
    4:{rails:["M58 23 H30 Q23 23 23 30 V58","M58 37 H30 Q37 37 37 30 V58"],ties:[[51,30,90],[35,30,90],[30,39,0],[30,53,0]]},
    5:{rails:["M37 58 V30 Q37 23 30 23 H2","M23 58 V30 Q23 37 30 37 H2"],ties:[[30,51,0],[30,35,0],[21,30,90],[7,30,90]]},
    6:{rails:["M2 37 H30 Q37 37 37 30 V2","M2 23 H30 Q23 23 23 30 V2"],ties:[[7,30,90],[21,30,90],[30,21,0],[30,7,0]]},
    7:{rails:["M2 23 H58","M2 37 H58"],ties:[[9,30,90],[30,30,90],[51,30,90]]}
  };
  function configure(){ routeColor=palette[Math.floor(Math.random()*palette.length)]; }
  function sleeper(x,y,angle){
    return "<rect class='wood-tie' fill='"+routeColor+"' x='"+(x-20)+"' y='"+(y-8)+"' width='40' height='16' rx='2' transform='rotate("+angle+" "+x+" "+y+")'/><path class='wood-grain' d='M"+(x-13)+" "+y+" h26' transform='rotate("+angle+" "+x+" "+y+")'/>";
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