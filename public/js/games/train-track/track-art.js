(function(){
  "use strict";
  const palette=["#c77a45","#4d9db0","#b47acb","#d39b42","#6da77d"];
  let routeColor=palette[0];
  const cornerRails=["M24 0 A36 36 0 0 1 60 36","M36 0 A24 24 0 0 1 60 24"];
  const cornerTies=[[39,4,160],[47,13,135],[55,22,110]];
  const paths={
    2:{rails:["M20 0 V60","M40 0 V60"],ties:[[30,8,0],[30,30,0],[30,52,0]]},
    3:{rails:cornerRails,ties:cornerTies,rotation:0},
    4:{rails:cornerRails,ties:cornerTies,rotation:90},
    5:{rails:cornerRails,ties:cornerTies,rotation:180},
    6:{rails:cornerRails,ties:cornerTies,rotation:270},
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
    const rotation=piece.rotation||0;
    return "<svg viewBox='0 0 60 60' aria-hidden='true'><g class='rail-art' transform='rotate("+rotation+" 30 30)'>"+ties+rails+"</g></svg>";
  }
  window.TrainTrackArt={configure,render};
})();