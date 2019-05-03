/**
* x,y : Int, inital coors
* name : String, To write on node
* program : Object, {state : {read : { w : a, m : b, n : c}}}
* initialState : String, of the inital state
* finalStates : [String], of final states
* tape : Tape Object
*/
function Subroutine(x,y,n,name,program,initialState,finalStates,tape) {
  this.name = name
  this.program = program
  this.initialState = initialState
  this.finalStates = finalStates
  
  var currentState = initialState;
  var transition;

  var transitionsOut = [];
  var transitionsIn = [];
  this.i = n;
  this.n = "sr"+n;
  var history = [];
  //setup
  const rhombus = canvas.rect(0,0,100,100).attr({
    fill: "#FAFAFA",
    stroke: "#000",
    strokeWidth: 1,
    cursor: 'pointer'
  }).transform(`t${x},${y} r45`)

  var txt = canvas.text(50, 50, name).attr({
    "text-anchor": "middle",
    "dominant-baseline" : "middle",
    "font": "bold 30px sans-serif",
    x : x+50,
    y : y+50,
    cursor: 'pointer'
  })
  this.svg = canvas.group(rhombus,txt);
  this.svg.state = this;

  this.svg.hover(function() {
    rhombus.animate({ // on hover
      "width": 110,
      "height": 110,
      "x":-5,
      "y":-5
    }, 200)
  }, function(){ // on unhover
    rhombus.animate({
      "width" : 100,
      "height": 100,
      "x":0,
      "y":0
    }, 200);
  });

  this.animate = function(){
    rhombus.animate({ // on hover
      "width": 110,
      "height": 110,
      "x":-5,
      "y":-5
    }, 200, function(){rhombus.animate({
      "width" : 100,
      "height": 100,
      "x":0,
      "y":0
      }, 200);
    });
  }
  this.step = function(){}

  this.run = function(tape,speed) {
    var currentState = initialState
    while(true){

      //read
      var currentStateTransitions = program[currentState];
      var read = tape.read()

      transition = currentStateTransitions[read]

      //If kleene star exists
      if(!transition && currentStateTransitions["*"]){
        transition = currentStateTransitions["*"]
      }

      //check transition exists
      if (transition) {

        if(transition.w != "*"){
          // Write the new symbol where the head is on the tape.
          tape.write(transition.w)
        }

        // Move the tape head
        if(transition.m>0){
          tape.moveRight();
        }else if(transition.m<0){
          tape.moveLeft();
        }

        currentState = transition.n
        history.push({read : read, transition : transition});

      }else{
        if(finalStates.includes(currentState)){
          console.log("halted on final state")
          return 1;
        }
        else{
          console.log("halted on non-final state")
          return 0;
        }
      }
    }
  }
  this.unrun = function(offsetInput,tapeArrayInput,headInput){
    offset = offsetInput;
    tapeArray = tapeArrayInput;
    head = headInput;

    while(true){
      var action = history.pop()
      if (action == null){
        return 1;
      }
      var transition = action.transition

      head -= transition.m

      if(transition.m<0){
        tapeobj.moveRight();
      }else if(transition.m>0){
        tapeobj.moveLeft();
      }
      tapeArray[head] = action.read
      tapeobj.changeSymbolAt(head+offset,action.read)
    }
    this.animate();
  }

  var startcx;
  var startcy;
  /**
  * State drag controlers
  */
  
  var move = function (dx,dy,x,y){
    //find canvas coors
    var tdx, tdy;
    var clientX,clientY;
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

    

    rhombus.transform(`t${tdx+startcx-50},${tdy+startcy-50} r45`);
    
    rhombus.attr({
      cx : tdx+startcx,
      cy : tdy+startcy
    })
    //text
    txt.attr({
      x : tdx+startcx,
      y : tdy+startcy
    })

    //transitionsOut
    for (var i = 0; i < transitionsOut.length; i++) {
      transitionsOut[i].dragState(tdx+startcx,tdy+startcy)
    }
    //transitionsIn
    for (var i = 0; i < transitionsIn.length; i++) {
      transitionsIn[i].dragArrow(tdx+startcx,tdy+startcy)
    }
  }

  var start = function(x,y){
    startcx = this.getBBox().cx;
    startcy = this.getBBox().cy;
    if( (typeof x == 'object') && ( x.type == 'touchstart') ) {
      x.preventDefault();
      this.data('ox', x.changedTouches[0].clientX );
      this.data('oy', x.changedTouches[0].clientY );  
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
  this.isSubroutine = function(){
    return 1;
  }
  this.getOffset = function(){
    return offset;
  }
  this.getHead = function(){
    return head
  }
  this.getTapeArray = function(){
    return tapeArray
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
  this.getTransitionsOut = function(){
    return transitionsOut;
  }
  this.getTransitionsIn = function(){
    return transitionsIn;
  }

  this.transitionsOutPush = function(transition){
    transitionsOut.push(transition)
  }
  this.transitionsInPush = function(transition){
    transitionsIn.push(transition)
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
    var r = {};
    //{state : { read : {w : write, m : move, n : newState},
    //           read : {w : write, m : move, n : newState}}}

    // for each tape alphabet??
    for (var i = 0; i < transitionsOut.length; i++) {
      var read = transitionsOut[i].read
      r[read] = transitionsOut[i]
    }
    return r
  }
  this.export = function(){
    // copy program
    var programCopy = JSON.parse(JSON.stringify(program))

    // for each state
    Object.entries(programCopy).forEach(
      ([state, read]) => {

        // for each transition, convert nextState to form sr+n_n
        Object.entries(programCopy[state]).forEach(
          ([read, transition]) => {
            if(transition["n"] != initialState){
              programCopy[state][read]["n"] = this.n + "_"+ programCopy[state][read]["n"]
            }else{
              programCopy[state][read]["n"] = this.n;
            }
          }
        );


        if(state != initialState){
          if(finalStates.includes(state)){ // just final state

            // assign transtions to final states
            for (var i = 0; i < transitionsOut.length; i++) {
              var transition = transitionsOut[i].export()
              read = Object.assign(transition,read)
            }

            programCopy[this.n+"_"+state] = read
            delete programCopy[state]
          }
          else{ // everything else but the inital state
            programCopy[this.n+"_"+state] = read
            delete programCopy[state]
          }
        }else if(finalStates.includes(state)){ //inital ++ finalstate
          // assign transtions to final states
          // BUG : if final state contains the same transtion as the exiting transtion from
          //       subroutine, this will create a logical error in the export of subroutine
          for (var i = 0; i < transitionsOut.length; i++) {
            var transition = transitionsOut[i].export()
            read = Object.assign(transition,read)
          }
          
          programCopy[this.n] = read
          delete programCopy[state]
        }
        else{ //just inital state
          programCopy[this.n] = read
          delete programCopy[state]
        }
      }
    );

    return programCopy;
  }
}
