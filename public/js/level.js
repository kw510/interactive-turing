var canvas = Snap(document.getElementById('canvasSVG'));
var tapeCanvas = Snap(document.getElementById('tapeSVG'));
var tapeobj
var states = [];
var subroutines = [];
var globalTransitions = [];
var tapeString = "010101"
var compiledtm;
var inputAlphabet;
var currentTransition;
var blank = "B";
var tests = []

function init(){
  tapeobj = new Tape(tapeString);
  for (var i = json.transitions.length - 1; i >= 0; i--) {
    var arrayOfTransitions = []
    for(var j = 0; j < json.transitions[i].quantity; j++){
      arrayOfTransitions.push(new Transition(1600 + 150*(i%2), 200 +((i+1)%2 + i)*45, json.transitions[i].read, json.transitions[i].write, json.transitions[i].move,j));
    }
    globalTransitions[i] = arrayOfTransitions;
  }
  for (var i = json.subroutines.length - 1; i >= 0; i--) {
    const fixsub = new Subroutine(50 + i*170, 50,0, json.subroutines[i].name,JSON.parse(json.subroutines[i].program),json.subroutines[i].initialState,json.subroutines[i].finalStates,tapeobj)
    fixsub.svg.node.onclick = function(){
      var subroutine = new Subroutine(500,500,subroutines.length,fixsub.name,fixsub.program,fixsub.initialState,fixsub.finalStates,tapeobj)
      subroutine.drag()
      subroutines.push(subroutine)
    }
  }
  for (var i = json.tests.length - 1; i >= 0; i--) {
    tests.push(json.tests[i]);
  }
  $('#goal').empty()
  $('#goal').append('<h3>'+json.goal+'</h3>')

  // Mobile
  $('#canvasSVG').on('touchmove', function(e){e.preventDefault()});
  

  var fixedState = new State(1700, 100);
  fixedState.clearTxt();
  var state = new State(100,440,states.length);
  state.setInitialState();
  state.drag();
  states.push(state);

  fixedState.svg.node.onclick = function () {
    var state = new State(1500,100,states.length);
    state.drag();
    states.push(state);
  };
  
}

function clearCanvas(){
  canvas.clear();
  tapeCanvas.clear()
  states = [];
  compiledtm = 0;
  init();
}

function step(){
  if(!compiledtm){
    compileTM()
  }
  compiledtm.step()
}

function reverseStep(){
  if(compiledtm){
    compiledtm.unstep()
  }
}

function playClicked(){
  if(compileTM()){
    compiledtm.run()
  } 
}

function submit(){
  compileTM()
  $('#alerts').empty()
  for (var i = 0; i < tests.length; i++) {
    if(!compiledtm.verify(tests[i].input,tests[i].output,tests[i].accepts)){
      $('#alerts').append(`<div class="alert alert-danger alert-dismissible fade show" role="alert">\
        <strong>Failed Test number ${i}!</strong>\
         Try input ${tests[i].input}\
        <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>`)
      return 0;
    }
  }
  $('#alerts').append(`<div class="alert alert-success alert-dismissible fade show" role="alert">\
        <strong>Passed all tests!</strong>\
        <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>`)
}
function compileTM(){
  $('#alerts').empty()
  var transitions = {}
  var finalStates = []
  var initialState = "";
  var run = 1;
  var finalTransWarning = []

  //create the transtion table
  for (var i = 0; i < states.length; i++) {
    //fetch the current states transtions
    transitions[states[i].n] = states[i].getTransitions();

    //find the inital and final states
    if(states[i].isFinalState()){
      finalStates.push(states[i])
      if(states[i].getTransitionsIn().length == 0){
        finalTransWarning.push(i+1)
      }
    }
    if(states[i].isInitialState()){
      initialState = states[i]
      if(states[i].getTransitionsOut().length == 0){
        $('#alerts').append(`<div class="alert alert-warning alert-dismissible fade show" role="alert">\
          <strong>Warning: No transitions from inital state ${i}!</strong>\
          <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>`)
      }
    }
  }

  //get subroutines states
  for (var i = 0; i < subroutines.length; i++) {
    transitions[subroutines[i].n] = subroutines[i].getTransitions();
  }

  // Display warnings
  if(finalTransWarning.length){
    if(finalStates.length == 1){
      $('#alerts').append(`<div class="alert alert-warning alert-dismissible fade show" role="alert">\
          <strong>Warning: No transitions to final state ${finalTransWarning.toString()}!</strong>\
          <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>`)
    }else if (finalStates.length == 2){
      $('#alerts').append(`<div class="alert alert-warning alert-dismissible fade show" role="alert">\
          <strong>Warning: No transitions to final states ${finalTransWarning.join(' and ')} !</strong>\
          <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>`)
    }else{
      $('#alerts').append(`<div class="alert alert-warning alert-dismissible fade show" role="alert">\
          <strong>Warning: No transitions to final states ${finalTransWarning.slice(0, finalTransWarning.length-1).join(', ')} and ${finalTransWarning[finalTransWarning.length-1]}!</strong>\
          <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>`)
    }
  }
  //console.log(transitions)
  // no final states
  if(finalStates.length == 0){
    $('#alerts').append('<div class="alert alert-danger alert-dismissible fade show" role="alert">\
      <strong>Error: no final states!</strong>\
       You should add one by double clicking a state!.\
      <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>')
  }
  if(run){
    compiledtm = new TuringMachine(transitions,initialState,finalStates,tapeobj)
    return compiledtm;
  }else{
    return 0;
  }
  
}

function tapeinput(){
  tapeString = document.getElementById("tapeinput").value;
  tapeCanvas.clear()
  tapeobj = new Tape(tapeString);
  compiledtm = 0;
}
function fastforward(){
  if(compiledtm){
    compiledtm.skip();
  }else if(compileTM()){
    compiledtm.skip()
  }
}
function reverseskip(){
  if(compiledtm){
    compiledtm.unskip();
  }else if(compileTM()){
    compiledtm.unskip()
  }
}
init();