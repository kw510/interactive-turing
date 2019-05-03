
function Transition(x,y, read, write, move,n){
  var state = null;
  var newState = null;
  var transition = this;
  
  this.moveValue = 0;
  this.readHistory = []
  this.read = read;
  this.write = write
  this.move = move;

  if (this.move == "L"){
    this.moveValue = -1;
  }else if(this.move == "R"){
    this.moveValue = 1;
  }
  
  const arrow = new Arrow(x+20, y+50,x+125,y+50, `${read} : ${write} ${move}`)
  const rect = canvas.rect(x, y, 140, 70, 10).attr({
    fill: "#eaeaea",
    strokeWidth: 1,
    cursor: 'pointer',
    "opacity": 0.5
  });
  this.svg = canvas.group(rect,arrow.svg);
  const svg = this.svg

  this.svg.hover(function() {
    rect.animate({ // on hover
      "width": 150,
      "height": 80,
      "x":x-5,
      "y":y-5,
      "opacity": 1
    }, 200)
  }, function(){ // on unhover
    if(currentTransition != transition){
      rect.animate({
        "width" : 140,
        "height": 70,
        "x":x,
        "y":y,
        "opacity": 0.5
      }, 200);
    }
  });
  this.animateToNormal = function(){
    if(currentTransition != transition){
      rect.animate({
        "width" : 140,
        "height": 70,
        "x":x,
        "y":y,
        "opacity": 0.5
      }, 200);
    }
  }

  this.svg.mousedown(function (){
    currentTransition = transition;
    for (var i = 0; i < globalTransitions.length; i++) {
      for(var j = 0; j < globalTransitions[i].length;j++)
      globalTransitions[i][j].animateToNormal()
    }
    for (var i = 0; i < states.length; i++) {
      states[i].undrag();
      drag(states[i]);
    }
    for (var i = 0; i < subroutines.length; i++) {
      subroutines[i].undrag();
      drag(subroutines[i]);
    }
  })


  /**
  * Drag controllers.
  */
  var startcx;
  var startcy;
  var dragMove = function(dx,dy,x,y){
    var tdx, tdy;
    var clientX,clientY;
    var snapInvMatrix = this.transform().diffMatrix.invert();
    if( (typeof dx == 'object') && ( dx.type == 'touchmove') ){
      //x.preventDefault();
      clientX = dx.changedTouches[0].clientX;
      clientY = dx.changedTouches[0].clientY;
      dx = clientX - this.data('ox');
      dy = clientY - this.data('oy');
    }
      snapInvMatrix.e = snapInvMatrix.f = 0;
      tdx = snapInvMatrix.x( dx,dy );
      tdy = snapInvMatrix.y( dx,dy );
    arrow.dragArrow(startcx+tdx,startcy+tdy);
  }

  var dragStart = function(x,y){
    startcx = this.getBBox().cx;
    startcy = this.getBBox().cy;
    if( (typeof x == 'object') && ( x.type == 'touchstart') ) {
        x.preventDefault();
        this.data('ox', x.changedTouches[0].clientX );
        this.data('oy', x.changedTouches[0].clientY );  
    }
    arrow.dragState(startcx,startcy)
    arrow.dragArrow(startcx,startcy)
    if(n == 0){
      arrow.showGhost()
    }else{
      rect.remove();
    }
    
  }

  var dragEnd = function(e){
    //e.preventDefault();
    newState = null;
    for (var i = 0; i < states.length; i++) {
      var bbox = states[i].svg.getBBox()
      if(Snap.path.isPointInsideBBox(bbox,arrow.x2,arrow.y2)){
        arrow.dragArrow(bbox.cx,bbox.cy);
        newState = states[i];
      }

      states[i].transitionsOutDelete(transition)
      states[i].transitionsInDelete(transition)

      states[i].undrag()
      states[i].drag()
    }
    for (var i = 0; i < subroutines.length; i++) {
      var bbox = subroutines[i].svg.getBBox()
      if(Snap.path.isPointInsideBBox(bbox,arrow.x2,arrow.y2)){
        arrow.dragArrow(bbox.cx,bbox.cy);
        newState = subroutines[i];
        console.log("test")
      }

      subroutines[i].transitionsOutDelete(transition)
      subroutines[i].transitionsInDelete(transition)

      subroutines[i].undrag()
      subroutines[i].drag()
    }

    if(newState == null){
      arrow.reset()
      svg.prepend(rect)
    }else{
      var transitions = this.state.getTransitionsOut();
      var repeated = 0;
      for (var i = 0; i < transitions.length; i++) {
        if(transitions[i].read == transition.read){
          repeated = 1;
        }
      }
      if(repeated){
        arrow.reset()
        svg.prepend(rect)
      }else{
        newState.transitionsInPush(transition)
        this.state.transitionsOutPush(transition)

        var transitionsFromState = this.state.transitionsToState(newState);
        var transitionsFromNewState = newState.transitionsToState(this.state);

        var curve = 0;
        if(this.state == newState ||(transitionsFromState.length > 0 && transitionsFromNewState.length > 0)){
          curve = 1;
        }
        for (var i = 0; i < transitionsFromState.length; i++) {
          transitionsFromState[i].offsetArrowLabel(i+1)
          transitionsFromState[i].curveArrow(curve);
        }
        for (var i = 0; i < transitionsFromNewState.length; i++) {
          transitionsFromNewState[i].curveArrow(curve)
        }
        
        state = this.state
      }
      currentTransition = 0;
      transition.animateToNormal();
    }
  }

  var drag = function(state){
    state.svg.drag(dragMove,dragStart,dragEnd)
    state.svg.touchstart(dragStart);
    state.svg.touchmove(dragMove);
    state.svg.touchend(dragEnd);
  }

  /**
  * Event handlers
  */

  

  /**
  * Getters
  */

  this.dragArrow = function(newX,newY){
    arrow.dragArrow(newX,newY)
  }
  this.dragState = function(newX,newY){
    arrow.dragState(newX,newY)
  }
  this.export = function(){
    var movenumber=0;
    if(move =="R"){
      movenumber = 1;
    }else if(move == "L"){
      movenumber =-1;
    }else{
      movenumber = 0;
    }
    /*
    if (read == "*" && write != "*"){
      var json;
      inputAlphabet.forEach((value,key,set) => {
        var transition = { [value] : {w : write ,m : movenumber, n : newState.n}}
        json = Object.assign(transition,json)
      })
      json = Object.assign({ [blank] : {w : write ,m : movenumber, n : newState.n}},json)
      return json;
    } 
    else if(write == "*") {
      var json;
      inputAlphabet.forEach((value,key,set) => {
        console.log(value)
        var transition = { [value] : {w : value ,m : movenumber, n : newState.n}}
        json = Object.assign(transition,json)
      })
      json = Object.assign({ [blank] : {w : blank ,m : movenumber, n : newState.n}},json)
      return json;
    }*/
    
    if (newState){
      return {[read] : {w : write ,m : movenumber, n : newState.n}}
    }else{svg
      return 0;
    }
    
  }
  this.newState = function(){
    return newState;
  }
  this.oldState = function(){
    return state;
  }
  this.offsetArrowLabel = function(n){
    arrow.offsetLabel(n)
  }
  this.curveArrow = function(curveFlag){
    arrow.curveFlag = curveFlag;
    arrow.update();
  }
  this.animate = function(){
    arrow.animate()
  }
  this.isSubroutine = function(){
    return 0;
  }
}