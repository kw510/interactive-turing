"use strict";

function Arrow(x1, y1, x2, y2, txt) {
  this.x1 = x1;
  this.x2 = x2;
  this.y1 = y1;
  this.y2 = y2; //save initial points

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

  var marker = canvas.polyline("0,10 5,0 10,10").attr({
    fill: "#000"
  }).transform('r90').marker(0, 0, 10, 10, 9, 5);
  var line = canvas.path("M ".concat(x1, ",").concat(y1, " L").concat(x2, ",").concat(y2)).attr({
    stroke: "#000",
    strokeWidth: 2,
    markerEnd: marker,
    fill: "none",
    cursor: 'pointer'
  });
  var linetxt = canvas.text(0, 0, txt).attr({
    textpath: line,
    "text-anchor": "middle",
    "font": "25px sans-serif",
    "dominant-baseline": "middle",
    dy: "-1em",
    cursor: 'pointer'
  });
  linetxt.textPath.attr({
    startOffset: '50%'
  }); // Create a SVG group for the arrow

  this.svg = canvas.group(line, linetxt); // Triangle to put at the end of the ghost line

  var ghostmarker = canvas.polyline("0,10 5,0 10,10").attr({
    fill: "#999"
  }).transform('r90').marker(0, 0, 10, 10, 9, 5);
  var ghostline = canvas.path("M ".concat(this.oldx1, ",").concat(this.oldy1, " L").concat(this.oldx2, ",").concat(this.oldy2)).attr({
    stroke: "#999",
    strokeWidth: 2,
    markerEnd: ghostmarker,
    fill: "none",
    cursor: 'pointer'
  });
  var ghostlinetxt = canvas.text(0, 0, txt).attr({
    textpath: ghostline,
    "text-anchor": "middle",
    "font": "25px sans-serif",
    "dominant-baseline": "middle",
    dy: "-1em",
    fill: "#999",
    cursor: 'pointer'
  });
  ghostlinetxt.textPath.attr({
    startOffset: '50%'
  });
  ghostSvg = canvas.group(ghostline, ghostlinetxt);
  ghostSvg.remove();
  /**
   * Line control functions
   */

  this.straight = function () {
    // get angle between -180 and 180 from the x axis
    var angle = Snap.angle(this.x1, this.y1, this.x2, this.y2) - 180; //Create path from the edge of a state to the edge of another state, hard coded 50 radius

    line.attr({
      // (x1,y1) uses the angle normally as it is exiting there
      // (x2,y2) adds 180 to the angle, as incoming angle is 180 degrees out of phase.
      d: "M  ".concat(this.x1 + Snap.cos(angle) * 50, ",\n              ").concat(this.y1 + Snap.sin(angle) * 50, " \n           L  ").concat(this.x2 + Snap.cos(angle + 180) * 50, ",\n              ").concat(this.y2 + Snap.sin(angle + 180) * 50)
    });
  };

  this.curve = function () {
    var flag = 0; //calculate length and angle between the states

    var length = Snap.len(this.x1, this.y1, this.x2, this.y2);
    var angle = Snap.angle(this.x1, this.y1, this.x2, this.y2) - 180; //if the length is less than this distance, then draw it to itself

    if (length < 150) {
      length = 60;
      flag = 1;
      angle = -135;
    } // Create path from edge of state to another edge with a curve line, hard coded 50 radius
    // If not the same state, flag = 0 so (x2,y2) needs to be 180 degrees out of phase


    line.attr({
      d: "M  ".concat(this.x1 + Snap.cos(angle - 30) * 50, ",\n              ").concat(this.y1 + Snap.sin(angle - 30) * 50, "\n           A  ").concat(length, ",").concat(length, ",0,").concat(flag, ",1, \n              ").concat(this.x2 + Snap.cos(angle + 30 + !flag * 180) * 50, ",\n              ").concat(this.y2 + Snap.sin(angle + 30 + !flag * 180) * 50)
    });
  };

  this.update = function () {
    // Update line to follow rules
    if (this.curveFlag) {
      this.curve();
    } else {
      this.straight();
    } //update text rotation.


    if (this.x2 - this.x1 < 0) {
      linetxt.transform('r180');
    } else {
      linetxt.transform('r0');
    }
  };

  this.reset = function () {
    line.attr({
      d: "M ".concat(this.oldx1, ",").concat(this.oldy1, " L").concat(this.oldx2, ",").concat(this.oldy2)
    });
    linetxt.transform('r0');
    ghostSvg.remove();
  };
  /**
  * Movement control functions
  */


  this.dragArrow = function (newX, newY) {
    this.x2 = newX;
    this.y2 = newY;
    this.update();
  };

  this.dragState = function (newX, newY) {
    this.x1 = newX;
    this.y1 = newY;
    this.update();
  };
  /**
  * Misc Functions
  */


  this.remove = function () {
    this.line.remove();
  };

  this.offsetLabel = function (n) {
    linetxt.attr({
      dy: "-".concat(n, "em")
    });
    this.update();
  };

  this.animate = function () {
    line.animate({
      strokeWidth: 4
    }, 200, function () {
      line.animate({
        strokeWidth: 2
      }, 200);
    });
  };

  this.showGhost = function () {
    this.svg.add(ghostSvg);
  };
}
"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function State(x, y, n) {
  var finalState = 0;
  var initialState = 0;
  var transitionsOut = [];
  var transitionsIn = [];
  this.n = "" + n;
  /**
   * Construct SVG elements
   */
  // Final state outline

  var finalStateCir = canvas.circle(x, y, 55).attr({
    fill: "#fff",
    stroke: "#000",
    strokeWidth: 1,
    cursor: 'pointer'
  });
  finalStateCir.remove(); // Initial state triangle pointing in

  var initialStateTri = canvas.polygon(-50, 0, -70, 20, -70, -20).attr({
    fill: "#000"
  });
  initialStateTri.transform("t".concat(x, ",").concat(y));
  initialStateTri.remove(); // States Circle

  var cir = canvas.circle(x, y, 50).attr({
    fill: "#FAFAFA",
    stroke: "#000",
    strokeWidth: 1,
    cursor: 'pointer'
  }); // Text within the state

  var txt = canvas.text(50, 50, states.length + 1).attr({
    "text-anchor": "middle",
    "dominant-baseline": "middle",
    "font": "bold 30px sans-serif",
    x: x,
    y: y,
    cursor: 'pointer'
  });
  this.svg = canvas.group(cir, txt);
  this.svg.state = this;
  /**
   * Event listeners
   */

  this.svg.hover(function () {
    // on hover
    cir.animate({
      r: 55
    }, 200);
    finalStateCir.animate({
      r: 60
    }, 200);
  }, function () {
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

  var move = function move(dx, dy, x, y) {
    //find corrected coordinates
    var tdx, tdy;
    var clientX, clientY;
    var snapInvMatrix = this.transform().diffMatrix.invert();

    if (_typeof(dx) == 'object' && dx.type == 'touchmove') {
      clientX = dx.changedTouches[0].clientX;
      clientY = dx.changedTouches[0].clientY;
      dx = clientX - this.data('ox');
      dy = clientY - this.data('oy');
    }

    snapInvMatrix.e = snapInvMatrix.f = 0;
    tdx = snapInvMatrix.x(dx, dy);
    tdy = snapInvMatrix.y(dx, dy); //transform center coordinates for the circles, text and initial State mark

    cir.attr({
      cx: tdx + startcx,
      cy: tdy + startcy
    });
    txt.attr({
      x: tdx + startcx,
      y: tdy + startcy
    });
    finalStateCir.attr({
      cx: tdx + startcx,
      cy: tdy + startcy
    });
    initialStateTri.transform("t".concat(tdx + startcx, ",").concat(tdy + startcy)); // For each transition out and in, transform the line

    for (var i = 0; i < transitionsOut.length; i++) {
      transitionsOut[i].dragState(tdx + startcx, tdy + startcy);
    }

    for (var i = 0; i < transitionsIn.length; i++) {
      transitionsIn[i].dragArrow(tdx + startcx, tdy + startcy);
    }
  };

  var touchtime = 0;

  var start = function start(x, y) {
    //get the point where clicked
    if (_typeof(x) == 'object' && x.type == 'touchstart') {
      x.preventDefault();
      this.data('ox', x.changedTouches[0].clientX);
      this.data('oy', x.changedTouches[0].clientY);
    }

    startcx = this.getBBox().cx;
    startcy = this.getBBox().cy;

    if (touchtime == 0) {
      // set first click
      touchtime = new Date().getTime();
    } else {
      // compare first click to this click and see if they occurred within double click threshold
      if (new Date().getTime() - touchtime < 800) {
        // double click occurred
        if (n != null) {
          finalState = !finalState;
        }

        if (!finalState) {
          finalStateCir.remove();
        } else {
          this.prepend(finalStateCir);
        }

        touchtime = 0;
      } else {
        // not a double click so set as a new first click
        touchtime = new Date().getTime();
      }
    }
  };

  this.undrag = function () {
    this.svg.undrag();
    this.svg.untouchstart();
    this.svg.untouchmove();
    this.svg.untouchend();
  };

  this.drag = function () {
    this.svg.drag(move, start);
    this.svg.touchstart(start);
    this.svg.touchmove(move);
  };
  /**
   * Transition getters + mutators
   */


  this.transitionsOutPush = function (transition) {
    transitionsOut.push(transition);
  };

  this.transitionsInPush = function (transition) {
    transitionsIn.push(transition);
  };

  this.transitionsOutDelete = function (transition) {
    var i = transitionsOut.indexOf(transition);

    if (i >= 0) {
      transitionsOut.splice(i, 1);
    }
  };

  this.transitionsInDelete = function (transition) {
    var i = transitionsIn.indexOf(transition);

    if (i >= 0) {
      transitionsIn.splice(i, 1);
    }
  };

  this.transitionsToState = function (state) {
    var transitions = [];

    for (var i = 0; i < transitionsOut.length; i++) {
      if (transitionsOut[i].newState() == state) {
        transitions.push(transitionsOut[i]);
      }
    }

    return transitions;
  };

  this.getTransitions = function () {
    var object = {};

    for (var i = 0; i < transitionsOut.length; i++) {
      var read = transitionsOut[i].read;
      object[read] = transitionsOut[i];
    }

    return object;
  };

  this.getTransitionsOut = function () {
    return transitionsOut;
  };

  this.getTransitionsIn = function () {
    return transitionsIn;
  };
  /**
   * Misc functions
   */


  this.animate = function () {
    cir.animate({
      r: 55
    }, 200, function () {
      cir.animate({
        r: 50
      }, 200);
    });
  };

  this.reset = function () {
    cir.animate({
      fill: "#FAFAFA"
    }, 200);
  };

  this.clearTxt = function () {
    txt.remove();
  };

  this.setInitialState = function () {
    this.svg.prepend(initialStateTri);
    initialState = 1;
  };

  this.isFinalState = function () {
    return finalState;
  };

  this.isInitialState = function () {
    return initialState;
  };

  this.isSubroutine = function () {
    return 0;
  };
  /**
   * Export the transitions in the form
   * {State : {r : {w : _, m : _, n : _}}}
   */


  this.export = function () {
    var _this = this;

    var json = _defineProperty({}, this.n, {}); //assign 


    transitionsOut.forEach(function (value, index, array) {
      if (value.read != "*") {
        json[_this.n] = Object.assign(value.export(), json[_this.n]);
      }
    }); // assign kleene catch all

    transitionsOut.forEach(function (value, index, array) {
      if (value.read == "*") {
        json[_this.n] = Object.assign(value.export(), json[_this.n]);
      }
    });
    return json;
  };
}
"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/**
* x,y : Int, inital coors
* name : String, To write on node
* program : Object, {state : {read : { w : a, m : b, n : c}}}
* initialState : String, of the inital state
* finalStates : [String], of final states
* tape : Tape Object
*/
function Subroutine(x, y, n, name, program, initialState, finalStates, tape) {
  this.name = name;
  this.program = program;
  this.initialState = initialState;
  this.finalStates = finalStates;
  var currentState = initialState;
  var transition;
  var transitionsOut = [];
  var transitionsIn = [];
  this.i = n;
  this.n = "sr" + n;
  var history = []; //setup

  var rhombus = canvas.rect(0, 0, 100, 100).attr({
    fill: "#FAFAFA",
    stroke: "#000",
    strokeWidth: 1,
    cursor: 'pointer'
  }).transform("t".concat(x, ",").concat(y, " r45"));
  var txt = canvas.text(50, 50, name).attr({
    "text-anchor": "middle",
    "dominant-baseline": "middle",
    "font": "bold 30px sans-serif",
    x: x + 50,
    y: y + 50,
    cursor: 'pointer'
  });
  this.svg = canvas.group(rhombus, txt);
  this.svg.state = this;
  this.svg.hover(function () {
    rhombus.animate({
      // on hover
      "width": 110,
      "height": 110,
      "x": -5,
      "y": -5
    }, 200);
  }, function () {
    // on unhover
    rhombus.animate({
      "width": 100,
      "height": 100,
      "x": 0,
      "y": 0
    }, 200);
  });

  this.animate = function () {
    rhombus.animate({
      // on hover
      "width": 110,
      "height": 110,
      "x": -5,
      "y": -5
    }, 200, function () {
      rhombus.animate({
        "width": 100,
        "height": 100,
        "x": 0,
        "y": 0
      }, 200);
    });
  };

  this.step = function () {};

  this.run = function (tape, speed) {
    var currentState = initialState;

    while (true) {
      //read
      var currentStateTransitions = program[currentState];
      var read = tape.read();
      transition = currentStateTransitions[read]; //If kleene star exists

      if (!transition && currentStateTransitions["*"]) {
        transition = currentStateTransitions["*"];
      } //check transition exists


      if (transition) {
        if (transition.w != "*") {
          // Write the new symbol where the head is on the tape.
          tape.write(transition.w);
        } // Move the tape head


        if (transition.m > 0) {
          tape.moveRight();
        } else if (transition.m < 0) {
          tape.moveLeft();
        }

        currentState = transition.n;
        history.push({
          read: read,
          transition: transition
        });
      } else {
        if (finalStates.includes(currentState)) {
          console.log("halted on final state");
          return 1;
        } else {
          console.log("halted on non-final state");
          return 0;
        }
      }
    }
  };

  this.unrun = function (offsetInput, tapeArrayInput, headInput) {
    offset = offsetInput;
    tapeArray = tapeArrayInput;
    head = headInput;

    while (true) {
      var action = history.pop();

      if (action == null) {
        return 1;
      }

      var transition = action.transition;
      head -= transition.m;

      if (transition.m < 0) {
        tapeobj.moveRight();
      } else if (transition.m > 0) {
        tapeobj.moveLeft();
      }

      tapeArray[head] = action.read;
      tapeobj.changeSymbolAt(head + offset, action.read);
    }

    this.animate();
  };

  var startcx;
  var startcy;
  /**
  * State drag controlers
  */

  var move = function move(dx, dy, x, y) {
    //find canvas coors
    var tdx, tdy;
    var clientX, clientY;
    var snapInvMatrix = this.transform().diffMatrix.invert();

    if (_typeof(dx) == 'object' && dx.type == 'touchmove') {
      clientX = dx.changedTouches[0].clientX;
      clientY = dx.changedTouches[0].clientY;
      dx = clientX - this.data('ox');
      dy = clientY - this.data('oy');
    }

    snapInvMatrix.e = snapInvMatrix.f = 0;
    tdx = snapInvMatrix.x(dx, dy);
    tdy = snapInvMatrix.y(dx, dy);
    rhombus.transform("t".concat(tdx + startcx - 50, ",").concat(tdy + startcy - 50, " r45"));
    rhombus.attr({
      cx: tdx + startcx,
      cy: tdy + startcy
    }); //text

    txt.attr({
      x: tdx + startcx,
      y: tdy + startcy
    }); //transitionsOut

    for (var i = 0; i < transitionsOut.length; i++) {
      transitionsOut[i].dragState(tdx + startcx, tdy + startcy);
    } //transitionsIn


    for (var i = 0; i < transitionsIn.length; i++) {
      transitionsIn[i].dragArrow(tdx + startcx, tdy + startcy);
    }
  };

  var start = function start(x, y) {
    startcx = this.getBBox().cx;
    startcy = this.getBBox().cy;

    if (_typeof(x) == 'object' && x.type == 'touchstart') {
      x.preventDefault();
      this.data('ox', x.changedTouches[0].clientX);
      this.data('oy', x.changedTouches[0].clientY);
    }
  };

  this.undrag = function () {
    this.svg.undrag();
    this.svg.untouchstart();
    this.svg.untouchmove();
    this.svg.untouchend();
  };

  this.drag = function () {
    this.svg.drag(move, start);
    this.svg.touchstart(start);
    this.svg.touchmove(move);
  };

  this.isSubroutine = function () {
    return 1;
  };

  this.getOffset = function () {
    return offset;
  };

  this.getHead = function () {
    return head;
  };

  this.getTapeArray = function () {
    return tapeArray;
  };

  this.transitionsOutDelete = function (transition) {
    var i = transitionsOut.indexOf(transition);

    if (i >= 0) {
      transitionsOut.splice(i, 1);
    }
  };

  this.transitionsInDelete = function (transition) {
    var i = transitionsIn.indexOf(transition);

    if (i >= 0) {
      transitionsIn.splice(i, 1);
    }
  };

  this.getTransitionsOut = function () {
    return transitionsOut;
  };

  this.getTransitionsIn = function () {
    return transitionsIn;
  };

  this.transitionsOutPush = function (transition) {
    transitionsOut.push(transition);
  };

  this.transitionsInPush = function (transition) {
    transitionsIn.push(transition);
  };

  this.transitionsToState = function (state) {
    var transitions = [];

    for (var i = 0; i < transitionsOut.length; i++) {
      if (transitionsOut[i].newState() == state) {
        transitions.push(transitionsOut[i]);
      }
    }

    return transitions;
  };

  this.getTransitions = function () {
    var r = {}; //{state : { read : {w : write, m : move, n : newState},
    //           read : {w : write, m : move, n : newState}}}
    // for each tape alphabet??

    for (var i = 0; i < transitionsOut.length; i++) {
      var read = transitionsOut[i].read;
      r[read] = transitionsOut[i];
    }

    return r;
  };

  this.export = function () {
    var _this = this;

    // copy program
    var programCopy = JSON.parse(JSON.stringify(program)); // for each state

    Object.entries(programCopy).forEach(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          state = _ref2[0],
          read = _ref2[1];

      // for each transition, convert nextState to form sr+n_n
      Object.entries(programCopy[state]).forEach(function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2),
            read = _ref4[0],
            transition = _ref4[1];

        if (transition["n"] != initialState) {
          programCopy[state][read]["n"] = _this.n + "_" + programCopy[state][read]["n"];
        } else {
          programCopy[state][read]["n"] = _this.n;
        }
      });

      if (state != initialState) {
        if (finalStates.includes(state)) {
          // just final state
          // assign transtions to final states
          for (var i = 0; i < transitionsOut.length; i++) {
            var transition = transitionsOut[i].export();
            read = Object.assign(transition, read);
          }

          programCopy[_this.n + "_" + state] = read;
          delete programCopy[state];
        } else {
          // everything else but the inital state
          programCopy[_this.n + "_" + state] = read;
          delete programCopy[state];
        }
      } else if (finalStates.includes(state)) {
        //inital ++ finalstate
        // assign transtions to final states
        // BUG : if final state contains the same transtion as the exiting transtion from
        //       subroutine, this will create a logical error in the export of subroutine
        for (var i = 0; i < transitionsOut.length; i++) {
          var transition = transitionsOut[i].export();
          read = Object.assign(transition, read);
        }

        programCopy[_this.n] = read;
        delete programCopy[state];
      } else {
        //just inital state
        programCopy[_this.n] = read;
        delete programCopy[state];
      }
    });
    return programCopy;
  };
}
"use strict";

/*
*
* Input: initial tape input
*/
function Tape(string, show) {
  if (show == null) {
    show = true;
  }

  var tapeCells = [];
  var head = 0;
  var min = 9;
  var splitter = new GraphemeSplitter();
  var tapeArray = splitter.splitGraphemes(string); // set global

  inputAlphabet = new Set(tapeArray); // generate blank tapecells up untill head pos

  for (var i = 0; i < min; i++) {
    tapeCells.push(new TapeCell("", i));
    tapeArray.unshift(blank);
  } // Write the string to the tape


  for (var i = min; i < tapeArray.length; i++) {
    tapeCells.push(new TapeCell(tapeArray[i], i));
  } // Fill up the rest of the space with tapecells


  for (var i = tapeArray.length; i < 19; i++) {
    tapeCells.push(new TapeCell("", i));
    tapeArray.push(blank);
  }

  var max = tapeCells.length;
  var tapeSVG = tapeCanvas.group(); // render the tape cells

  for (var i = 0; i < 19; i++) {
    tapeSVG.add(tapeCells[i].svg);
  }

  if (!show) tapeSVG.remove();
  /**
  * Movement Functions
  */
  // Move head left

  this.moveLeft = function () {
    head -= 1; // Add tapecell to start of tape when needed

    if (head + min < 9) {
      min++;
      tapeCells.unshift(new TapeCell("", head));
      tapeArray.unshift(blank);
      tapeSVG.add(tapeCells[0].svg);
    } //render tape cell offscreen, before the animation


    tapeSVG.add(tapeCells[head + min - 9].svg); //remove the tape cell that is not showing before the animation
    //check if it exists first

    if (tapeCells[head + min + 11]) {
      tapeCells[head + min + 11].svg.remove();
    } // animate


    tapeSVG.animate({
      transform: "t".concat(-head * 100)
    }, 200);
  }; // Move head right


  this.moveRight = function () {
    head += 1; // When this happens, the tape must extend from the right hand side

    if (max - head == 18) {
      tapeCells.push(new TapeCell("", max));
      max++;
      tapeArray.push(blank);
      tapeSVG.add(tapeCells[tapeCells.length - 1].svg);
    } //render the tapecell offscreen, before the animation


    tapeSVG.add(tapeCells[head + min + 9].svg); //remove the tape cell that is not showing before the animation

    if (tapeCells[head + min - 11]) {
      tapeCells[head + min - 11].svg.remove();
    } //animate


    tapeSVG.animate({
      transform: "t".concat(-head * 100)
    }, 200);
  };
  /**
  * Misc Functions
  */


  this.read = function () {
    return tapeCells[head + min].symbol;
  };

  this.write = function (symbol) {
    tapeCells[head + min].writeSymbol(symbol);
    tapeArray[head + min] = symbol;
  };

  this.getTape = function () {
    for (var i = 0; i < tapeArray.length; i++) {
      if (tapeArray[i] != "B") {
        return tapeArray.slice(i);
      }
    }
  };

  this.getMin = function () {
    return min;
  };
}
"use strict";

function TapeCell(symbol, x) {
  this.symbol = symbol;
  /**
  * SVG elements
  */

  var rect = tapeCanvas.rect(x * 100, 0, 100, 100).attr({
    fill: "none",
    stroke: "#000",
    strokeWidth: 1
  });
  var txt = tapeCanvas.text(50 + 100 * x, 50, symbol).attr({
    "text-anchor": "middle",
    "dominant-baseline": "middle",
    "font": "40px sans-serif"
  });

  if (symbol == "") {
    this.symbol = "B";
  } // Create svg group


  this.svg = tapeCanvas.group(rect, txt);
  /**
   * Misc functions
   */

  this.writeSymbol = function (symbol) {
    txt.attr({
      text: symbol
    });

    if (symbol == "") {
      this.symbol = "B";
    } else {
      this.symbol = symbol;
    }
  };
}
"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function Transition(x, y, read, write, move, n) {
  var state = null;
  var newState = null;
  var transition = this;
  this.moveValue = 0;
  this.readHistory = [];
  this.read = read;
  this.write = write;
  this.move = move;

  if (this.move == "L") {
    this.moveValue = -1;
  } else if (this.move == "R") {
    this.moveValue = 1;
  }

  var arrow = new Arrow(x + 20, y + 50, x + 125, y + 50, "".concat(read, " : ").concat(write, " ").concat(move));
  var rect = canvas.rect(x, y, 140, 70, 10).attr({
    fill: "#eaeaea",
    strokeWidth: 1,
    cursor: 'pointer',
    "opacity": 0.5
  });
  this.svg = canvas.group(rect, arrow.svg);
  var svg = this.svg;
  this.svg.hover(function () {
    rect.animate({
      // on hover
      "width": 150,
      "height": 80,
      "x": x - 5,
      "y": y - 5,
      "opacity": 1
    }, 200);
  }, function () {
    // on unhover
    if (currentTransition != transition) {
      rect.animate({
        "width": 140,
        "height": 70,
        "x": x,
        "y": y,
        "opacity": 0.5
      }, 200);
    }
  });

  this.animateToNormal = function () {
    if (currentTransition != transition) {
      rect.animate({
        "width": 140,
        "height": 70,
        "x": x,
        "y": y,
        "opacity": 0.5
      }, 200);
    }
  };

  this.svg.mousedown(function () {
    currentTransition = transition;

    for (var i = 0; i < globalTransitions.length; i++) {
      for (var j = 0; j < globalTransitions[i].length; j++) {
        globalTransitions[i][j].animateToNormal();
      }
    }

    for (var i = 0; i < states.length; i++) {
      states[i].undrag();
      drag(states[i]);
    }

    for (var i = 0; i < subroutines.length; i++) {
      subroutines[i].undrag();
      drag(subroutines[i]);
    }
  });
  /**
  * Drag controllers.
  */

  var startcx;
  var startcy;

  var dragMove = function dragMove(dx, dy, x, y) {
    var tdx, tdy;
    var clientX, clientY;
    var snapInvMatrix = this.transform().diffMatrix.invert();

    if (_typeof(dx) == 'object' && dx.type == 'touchmove') {
      //x.preventDefault();
      clientX = dx.changedTouches[0].clientX;
      clientY = dx.changedTouches[0].clientY;
      dx = clientX - this.data('ox');
      dy = clientY - this.data('oy');
    }

    snapInvMatrix.e = snapInvMatrix.f = 0;
    tdx = snapInvMatrix.x(dx, dy);
    tdy = snapInvMatrix.y(dx, dy);
    arrow.dragArrow(startcx + tdx, startcy + tdy);
  };

  var dragStart = function dragStart(x, y) {
    startcx = this.getBBox().cx;
    startcy = this.getBBox().cy;

    if (_typeof(x) == 'object' && x.type == 'touchstart') {
      x.preventDefault();
      this.data('ox', x.changedTouches[0].clientX);
      this.data('oy', x.changedTouches[0].clientY);
    }

    arrow.dragState(startcx, startcy);
    arrow.dragArrow(startcx, startcy);

    if (n == 0) {
      arrow.showGhost();
    } else {
      rect.remove();
    }
  };

  var dragEnd = function dragEnd(e) {
    //e.preventDefault();
    newState = null;

    for (var i = 0; i < states.length; i++) {
      var bbox = states[i].svg.getBBox();

      if (Snap.path.isPointInsideBBox(bbox, arrow.x2, arrow.y2)) {
        arrow.dragArrow(bbox.cx, bbox.cy);
        newState = states[i];
      }

      states[i].transitionsOutDelete(transition);
      states[i].transitionsInDelete(transition);
      states[i].undrag();
      states[i].drag();
    }

    for (var i = 0; i < subroutines.length; i++) {
      var bbox = subroutines[i].svg.getBBox();

      if (Snap.path.isPointInsideBBox(bbox, arrow.x2, arrow.y2)) {
        arrow.dragArrow(bbox.cx, bbox.cy);
        newState = subroutines[i];
        console.log("test");
      }

      subroutines[i].transitionsOutDelete(transition);
      subroutines[i].transitionsInDelete(transition);
      subroutines[i].undrag();
      subroutines[i].drag();
    }

    if (newState == null) {
      arrow.reset();
      svg.prepend(rect);
    } else {
      var transitions = this.state.getTransitionsOut();
      var repeated = 0;

      for (var i = 0; i < transitions.length; i++) {
        if (transitions[i].read == transition.read) {
          repeated = 1;
        }
      }

      if (repeated) {
        arrow.reset();
        svg.prepend(rect);
      } else {
        newState.transitionsInPush(transition);
        this.state.transitionsOutPush(transition);
        var transitionsFromState = this.state.transitionsToState(newState);
        var transitionsFromNewState = newState.transitionsToState(this.state);
        var curve = 0;

        if (this.state == newState || transitionsFromState.length > 0 && transitionsFromNewState.length > 0) {
          curve = 1;
        }

        for (var i = 0; i < transitionsFromState.length; i++) {
          transitionsFromState[i].offsetArrowLabel(i + 1);
          transitionsFromState[i].curveArrow(curve);
        }

        for (var i = 0; i < transitionsFromNewState.length; i++) {
          transitionsFromNewState[i].curveArrow(curve);
        }

        state = this.state;
      }

      currentTransition = 0;
      transition.animateToNormal();
    }
  };

  var drag = function drag(state) {
    state.svg.drag(dragMove, dragStart, dragEnd);
    state.svg.touchstart(dragStart);
    state.svg.touchmove(dragMove);
    state.svg.touchend(dragEnd);
  };
  /**
  * Event handlers
  */

  /**
  * Getters
  */


  this.dragArrow = function (newX, newY) {
    arrow.dragArrow(newX, newY);
  };

  this.dragState = function (newX, newY) {
    arrow.dragState(newX, newY);
  };

  this.export = function () {
    var movenumber = 0;

    if (move == "R") {
      movenumber = 1;
    } else if (move == "L") {
      movenumber = -1;
    } else {
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


    if (newState) {
      return _defineProperty({}, read, {
        w: write,
        m: movenumber,
        n: newState.n
      });
    } else {
      svg;
      return 0;
    }
  };

  this.newState = function () {
    return newState;
  };

  this.oldState = function () {
    return state;
  };

  this.offsetArrowLabel = function (n) {
    arrow.offsetLabel(n);
  };

  this.curveArrow = function (curveFlag) {
    arrow.curveFlag = curveFlag;
    arrow.update();
  };

  this.animate = function () {
    arrow.animate();
  };

  this.isSubroutine = function () {
    return 0;
  };
}
"use strict";

/**
*
* Inputs types: transition table, state, state array, tape object
*/
function TuringMachine(program, initialState, finalStates, tape) {
  var currentState = initialState;
  var transition;
  var interval;
  var history = [];

  this.step = function () {
    if (currentState.isSubroutine()) {
      // Run the subroutine and save output
      var accepted = currentState.run(tape, 200);
      var read = tape.read(); // Save to history to enable reversal

      history.push(currentState); // Determine what state to go to next

      transition = program[currentState.n][read]; // Check if there exists a klenne star if no transition can be found

      if (!transition && program[currentState.n]["*"]) {
        transition = program[currentState.n]["*"];
      } // Ensure transistion exists before continuing


      if (transition) {
        transition.animate();
        currentState = transition.newState();
        currentState.animate();
      } else {
        clearInterval(interval);
        return 0;
      }
    } else {
      // Read the tape and select corresponding transition
      var read = tape.read();
      transition = program[currentState.n][read];

      if (!transition) {
        // If no transition found, look for a kleene transition
        transition = program[currentState.n]["*"];

        if (transition) {
          program[currentState.n]["*"].readHistory.push(read);
        }
      } // Check transition exists before starting the computation


      if (transition) {
        //If the write is not a klenne star, perform the write to the tape
        if (transition.write != "*") {
          tape.write(transition.write);
        }

        transition.animate(); // Move the tape head

        if (transition.moveValue > 0) tape.moveRight();
        if (transition.moveValue < 0) tape.moveLeft(); // Change state to the new state

        currentState.reset();
        currentState = transition.newState();
        currentState.animate(); // Save to history to be abled to be reversed

        history.push(transition);
      } else {
        // Halt machine
        clearInterval(interval); // If on final state then accept, else reject

        if (finalStates.includes(currentState)) {
          return 1;
        } else {
          return 0;
        }
      }
    }
  };

  this.run = function () {
    currentState = initialState;
    interval = setInterval(this.step, 500);
  };

  this.skip = function () {
    currentState = initialState;
    var accept = -1;

    while (true) {
      accept = this.step();

      if (accept > -1) {
        break;
      }
    }

    return accept;
  };

  this.unskip = function () {
    interval = setInterval(this.unstep, 0);
  };

  this.unstep = function () {
    console.log(history);
    transition = history.pop();

    if (transition == null) {
      console.log("At initialState");
      clearInterval(interval);
      return 1;
    } else if (transition.isSubroutine()) {
      transition.unrun(tape);
    } else {
      currentState = transition.oldState();
      currentState.animate();

      if (transition.moveValue < 0) {
        tape.moveRight();
      } else if (transition.moveValue > 0) {
        tape.moveLeft();
      }

      if (transition.read == "*") {
        tape.write(transition.readHistory.pop());
      } else {
        tape.write(transition.read);
      }

      transition.animate();
    }
  };

  this.verify = function (input, output, accept) {
    tape = new Tape(input, false);
    var accepted = this.skip();
    var tmout = tape.getTape();
    var i;

    for (i = 0; i < output.length; i++) {
      if (output[i] != tmout[i]) {
        return 0;
      }
    }

    if (accepted != accept) {
      return 0;
    }

    return 1;
  };

  this.export = function () {
    var json = {};

    for (var i = 0; i < states.length; i++) {
      json.program = Object.assign(states[i].export(), json.program);
    }

    for (var i = 0; i < subroutines.length; i++) {
      json.program = Object.assign(subroutines[i].export(), json.program);
    }

    json.program = JSON.stringify(json.program);
    json.initialState = initialState.n;
    json.finalStates = [];

    for (var i = 0; i < finalStates.length; i++) {
      json.finalStates.push(finalStates[i].n);
    }

    return json;
  };
}
