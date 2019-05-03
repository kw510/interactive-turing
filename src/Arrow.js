function Arrow(x1,y1,x2,y2,txt){
  this.x1 = x1;
  this.x2 = x2;
  this.y1 = y1;
  this.y2 = y2;

  //save initial points
  this.oldx1 = x1;
  this.oldy1 = y1;
  this.oldx2 = x2;
  this.oldy2 = y2;

  this.txt = txt;
  this.curveFlag = 0;
  var ghostSvg;

  /**
   * Construct SVG elements
   */
  // Triangle to put at the end of the real line
  var marker = canvas.polyline("0,10 5,0 10,10").attr({fill: "#000"}).transform('r90').marker(0,0,10,10,9,5);
  var line = canvas.path(`M ${x1},${y1} L${x2},${y2}`)
  .attr({
    stroke: "#000",
    strokeWidth: 2,
    markerEnd: marker,
    fill :"none",
    cursor: 'pointer'
  });
  var linetxt = canvas.text(0,0,txt).attr({
    textpath : line,
    "text-anchor": "middle",
    "font": "25px sans-serif",
    "dominant-baseline" : "middle",
    dy:"-1em",
    cursor: 'pointer'
  });
  linetxt.textPath.attr({ startOffset: '50%' });
  // Create a SVG group for the arrow
  this.svg = canvas.group(line,linetxt)

  // Triangle to put at the end of the ghost line
  var ghostmarker = canvas.polyline("0,10 5,0 10,10").attr({fill: "#999"}).transform('r90').marker(0,0,10,10,9,5);
  var ghostline = canvas.path(`M ${this.oldx1},${this.oldy1} L${this.oldx2},${this.oldy2}`)
  .attr({
    stroke: "#999",
    strokeWidth: 2,
    markerEnd: ghostmarker,
    fill :"none",
    cursor: 'pointer'
  });
  var ghostlinetxt = canvas.text(0,0,txt).attr({
    textpath : ghostline,
    "text-anchor": "middle",
    "font": "25px sans-serif",
    "dominant-baseline" : "middle",
    dy:"-1em",
    fill: "#999",
    cursor: 'pointer'
  });
  ghostlinetxt.textPath.attr({ startOffset: '50%' });
  ghostSvg = canvas.group(ghostline,ghostlinetxt)
  ghostSvg.remove()

  /**
   * Line control functions
   */
  this.straight = function() {
    // get angle between -180 and 180 from the x axis
    var angle = Snap.angle(this.x1, this.y1,this.x2, this.y2)-180

    //Create path from the edge of a state to the edge of another state, hard coded 50 radius
    line.attr({
      // (x1,y1) uses the angle normally as it is exiting there
      // (x2,y2) adds 180 to the angle, as incoming angle is 180 degrees out of phase.
      d : `M  ${this.x1 + Snap.cos(angle)*50},
              ${this.y1 + Snap.sin(angle)*50} 
           L  ${this.x2  + Snap.cos(angle+180)*50},
              ${this.y2 + Snap.sin(angle+180)*50}`
    })
  }

  this.curve = function(){
    var flag = 0;

    //calculate length and angle between the states
    var length = Snap.len(this.x1, this.y1,this.x2, this.y2)
    var angle = Snap.angle(this.x1, this.y1,this.x2, this.y2)-180

    //if the length is less than this distance, then draw it to itself
    if (length < 150){
      length = 60
      flag = 1;
      angle = -135
    }

    // Create path from edge of state to another edge with a curve line, hard coded 50 radius
    // If not the same state, flag = 0 so (x2,y2) needs to be 180 degrees out of phase
    line.attr({
      d : `M  ${this.x1 + Snap.cos(angle-30)*50},
              ${this.y1 + Snap.sin(angle-30)*50}
           A  ${length},${length},0,${flag},1, 
              ${this.x2 + Snap.cos(angle+30+!flag*180)*50},
              ${this.y2 + Snap.sin(angle+30+!flag*180)*50}`
    })
  }

  this.update = function (){

    // Update line to follow rules
    if(this.curveFlag){
      this.curve();
    }else{
      this.straight();
    }

    //update text rotation.
    if(this.x2 - this.x1 < 0){
      linetxt.transform('r180');
    }else{
      linetxt.transform('r0');
    }
  }
  
  this.reset = function(){
    line.attr({
      d : `M ${this.oldx1},${this.oldy1} L${this.oldx2},${this.oldy2}`
    })
    linetxt.transform('r0');
    ghostSvg.remove()
  }

  /**
  * Movement control functions
  */
  this.dragArrow =  function (newX,newY){
    this.x2 = newX;
    this.y2 = newY;
    this.update();
  }

  this.dragState = function (newX, newY){
    this.x1 = newX;
    this.y1 = newY;
    this.update();
  }

  /**
  * Misc Functions
  */

  this.remove = function (){
    this.line.remove();
  }

  this.offsetLabel = function(n){
    linetxt.attr({
      dy:`-${n}em`
    })
    this.update()
  }

  this.animate = function(){
    line.animate({
      strokeWidth : 4
    },200,
    function(){
      line.animate({
        strokeWidth : 2
      },200)
    })
  }

  this.showGhost = function(){
    this.svg.add(ghostSvg);
  }
}