function State(x, y, n){
  var finalState = 0;
  var initialState = 0;
  var transitionsOut = [];
  var transitionsIn = [];
  this.n = ""+n;

  /**
   * Construct SVG elements
   */
  // Final state outline
  var finalStateCir = canvas.circle(x,y,55).attr({
    fill: "#fff",
    stroke: "#000",
    strokeWidth: 1,
    cursor: 'pointer'
  });
  finalStateCir.remove()

  // Initial state triangle pointing in
  var initialStateTri = canvas.polygon(-50,0,-70,20,-70,-20).attr({ 
    fill: "#000"
  });
  initialStateTri.transform(`t${x},${y}`)
  initialStateTri.remove()

  // States Circle
  const cir = canvas.circle(x,y,50).attr({
    fill: "#FAFAFA",
    stroke: "#000",
    strokeWidth: 1,
    cursor: 'pointer'
  });

  // Text within the state
  var txt = canvas.text(50, 50, states.length+1).attr({
    "text-anchor": "middle",
    "dominant-baseline" : "middle",
    "font": "bold 30px sans-serif",
    x : x,
    y : y,
    cursor: 'pointer'
  })

  this.svg = canvas.group(cir,txt);
  this.svg.state = this;

  /**
   * Event listeners
   */
  this.svg.hover(function() {
    // on hover
    cir.animate({
      r: 55
    }, 200)
    finalStateCir.animate({
      r: 60
    }, 200)
  }, function(){
    // on unhover
    cir.animate({
      r: 50
    }, 200);
    finalStateCir.animate({
      r: 55
    }, 200);
  });

  /**
  * Drag controllers
  */
  var startcx;
  var startcy;
  var move = function (dx,dy,x,y){
    //find corrected coordinates
    var tdx, tdy;
    var clientX, clientY;
    var snapInvMatrix = this.transform().diffMatrix.invert();

    if( (typeof dx == 'object') && ( dx.type == 'touchmove') ){
      clientX = dx.changedTouches[0].clientX;
      clientY = dx.changedTouches[0].clientY;
      dx = clientX - this.data('ox');
      dy = clientY - this.data('oy');
    }

    snapInvMatrix.e = snapInvMatrix.f = 0;
    tdx = snapInvMatrix.x( dx,dy );
    tdy = snapInvMatrix.y( dx,dy );

    //transform center coordinates for the circles, text and initial State mark
    cir.attr({
      cx : tdx+startcx,
      cy : tdy+startcy
    })
    txt.attr({
      x : tdx+startcx,
      y : tdy+startcy
    })
    finalStateCir.attr({
      cx : tdx+startcx,
      cy : tdy+startcy
    })
    initialStateTri.transform(`t${tdx+startcx},${tdy+startcy}`)

    // For each transition out and in, transform the line
    for (var i = 0; i < transitionsOut.length; i++) {
      transitionsOut[i].dragState(tdx+startcx,tdy+startcy)
    }
    for (var i = 0; i < transitionsIn.length; i++) {
      transitionsIn[i].dragArrow(tdx+startcx,tdy+startcy)
    }
    
    
  }

  var touchtime = 0;
  var start = function(x,y){
    //get the point where clicked
    if( (typeof x == 'object') && ( x.type == 'touchstart') ) {
        x.preventDefault();
        this.data('ox', x.changedTouches[0].clientX );
        this.data('oy', x.changedTouches[0].clientY );  
    }
    startcx = this.getBBox().cx;
    startcy = this.getBBox().cy;

    if (touchtime == 0) {
      // set first click
      touchtime = new Date().getTime();
    } else {
      // compare first click to this click and see if they occurred within double click threshold
      if (((new Date().getTime()) - touchtime) < 800) {
        // double click occurred
        if(n != null){
          finalState = !finalState;
        }
        if(!finalState){
          finalStateCir.remove()
        }else{
          this.prepend(finalStateCir)
        }
        touchtime = 0;
      } else {
        // not a double click so set as a new first click
        touchtime = new Date().getTime();
      }
    }

  }

  this.undrag = function(){
    this.svg.undrag();
    this.svg.untouchstart();
    this.svg.untouchmove();
    this.svg.untouchend();
  }

  this.drag = function(){
    this.svg.drag(move, start);
    this.svg.touchstart(start);
    this.svg.touchmove(move);
  }

  /**
   * Transition getters + mutators
   */
 
  this.transitionsOutPush = function(transition){
    transitionsOut.push(transition)
  }

  this.transitionsInPush = function(transition){
    transitionsIn.push(transition)
  }

  this.transitionsOutDelete = function(transition){
    var i = transitionsOut.indexOf(transition)
    if(i >=0){
      transitionsOut.splice(i,1)
    }
  }

  this.transitionsInDelete = function(transition){
    var i = transitionsIn.indexOf(transition)
    if(i >=0){
      transitionsIn.splice(i,1)
    }
  }

  this.transitionsToState = function(state){
    var transitions = []
    for (var i = 0; i < transitionsOut.length; i++) {
      if(transitionsOut[i].newState() == state){
        transitions.push(transitionsOut[i]);
      }
    }
    return transitions;
  }

  this.getTransitions = function(){
    var object = {};
    for (var i = 0; i < transitionsOut.length; i++) {
      var read = transitionsOut[i].read
      object[read] = transitionsOut[i]
    }
    return object
  }
  this.getTransitionsOut = function(){
    return transitionsOut;
  }

  this.getTransitionsIn = function(){
    return transitionsIn;
  }

  /**
   * Misc functions
   */
  this.animate = function(){
    cir.animate({
      r:55
    },200,function(){cir.animate({
      r:50
    },200)})
  }
  this.reset = function(){
    cir.animate({
      fill: "#FAFAFA"
    },200)
  }
  
  this.clearTxt = function(){
    txt.remove()
  }
  this.setInitialState = function(){
    this.svg.prepend(initialStateTri)
    initialState = 1;

  }

  this.isFinalState = function(){
    return finalState;
  }
  this.isInitialState = function(){
    return initialState;
  }
  this.isSubroutine = function(){
    return 0;
  }

  /**
   * Export the transitions in the form
   * {State : {r : {w : _, m : _, n : _}}}
   */ 
  this.export = function(){
    var json = {[this.n] : {}}
    //assign 
    transitionsOut.forEach((value,index,array)=>{
      if(value.read != "*"){
        json[this.n] = Object.assign(value.export(), json[this.n]);
      }
    })

    // assign kleene catch all
    transitionsOut.forEach((value,index,array)=>{
      if(value.read == "*"){
        json[this.n] = Object.assign(value.export(), json[this.n]);
      }
    })
    return json;
  }
}
