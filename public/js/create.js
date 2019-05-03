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

var customtransitions = [];
var customsubroutines = [];
var tests = []

var preloadedSubroutines = [
    {
      "name" : "RHS",
      "program" : '{"0":{"0":{"w":"0","m":1,"n":"0"},"1":{"w":"1","m":1,"n":"0"},"B":{"w":"B","m":-1,"n":"1"}},"1":{}}',
      "initialState" : "0",
      "finalStates" : ["1"]
    },    
    {
      "name" : "LHS",
      "program" : '{"0":{"0" : {"w" :"0", "m" :-1, "n" : "0" },"1" : {"w" :"1", "m" :-1, "n" : "0" },"B" : {"w" :"B", "m" :1, "n" : "1" }},"1" : {}}',
      "initialState" : "0",
      "finalStates" : ["1"]
    },
    {
      "name":"INV",
      "program" : '{"0":{"0":{"w":"1","m":1,"n":"0"},"1":{"w":"0","m":1,"n":"0"},"B":{"w":"B","m":-1,"n":"1"}},"1":{"0":{"w":"0","m":-1,"n":"1"},"1":{"w":"1","m":-1,"n":"1"},"B":{"w":"B","m":1,"n":"2"}},"2":{}}',
      "initialState" : "0",
      "finalStates" : ["2"]
    },
    {
      "name":"INC",
      "program" : '{"0":{"*":{"w":"*","m":0,"n":"sr0"}},"1":{"0":{"w":"1","m":0,"n":"sr1"},"1":{"w":"0","m":-1,"n":"1"},"B":{"w":"1","m":0,"n":"sr1"}},"2":{},"sr1":{"*":{"w":"*","m":-1,"n":"sr1"},"B":{"w":"B","m":1,"n":"sr1_1"}},"sr1_1":{"*":{"w":"*","m":0,"n":"2"}},"sr0":{"*":{"w":"*","m":1,"n":"sr0"},"B":{"w":"B","m":-1,"n":"sr0_1"}},"sr0_1":{"*":{"w":"*","m":0,"n":"1"}}}',
      "initialState" : "0",
      "finalStates" : ["2"]
    }
  ]


function init(){
  
  for (var i = customtransitions.length - 1; i >= 0; i--) {
    var arrayOfTransitions = []
    for(var j = 0; j < customtransitions[i].quantity; j++){
      arrayOfTransitions.push(new Transition(1600 + 150*(i%2), 200 +((i+1)%2 + i)*45, customtransitions[i].read, customtransitions[i].write, customtransitions[i].move,j));
    }
    globalTransitions[i] = arrayOfTransitions;
  }
  for (var i = customsubroutines.length - 1; i >= 0; i--) {
    const fixsub = new Subroutine(50 + i*170, 50,0, customsubroutines[i].name,JSON.parse(customsubroutines[i].program),customsubroutines[i].initialState,customsubroutines[i].finalStates)
    fixsub.svg.node.onclick = function(){
      var subroutine = new Subroutine(500,500,subroutines.length,fixsub.name,fixsub.program,fixsub.initialState,fixsub.finalStates)
      subroutine.drag()
      subroutines.push(subroutine)
    }
  }

  tapeobj = new Tape(tapeString);
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
  // Mobile
  $('#canvasSVG').on('touchmove', function(e){e.preventDefault()});
}

function clearCanvas(){
  canvas.clear();
  tapeCanvas.clear()
  states = [];
  subroutines = [];
  globalTransitions = [];
  compiledtm = 0;
  init();
}

function step(){
  if(compiledtm){
    compiledtm.step();
  }else if(compileTM()){
    compiledtm.step()
  }
}

function reverseStep(){
  if(compiledtm){
    compiledtm.unstep();
  }else if(compileTM()){
    compiledtm.unstep()
  }
}

function playClicked(){
  compileTM()
  compiledtm.run()
}

function compileTM(){
  $('#alerts').empty()
  var transitions = {}
  var finalStates = []
  var initialState = "";
  var run = 1;
  var finalTransWarning = []
  for (var i = 0; i < states.length; i++) {
    transitions[states[i].n] = states[i].getTransitions();
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
          <strong>Warning: No transitions from inital state ${i}!\
          <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>`)
      }
    }
  }
  for (var i = 0; i < subroutines.length; i++) {
    transitions[subroutines[i].n] = subroutines[i].getTransitions();
  }
  if(finalTransWarning.length){
    if(finalStates.length == 1){
      $('#alerts').append(`<div class="alert alert-warning alert-dismissible fade show" role="alert">\
          <strong>Warning: No transitions to final state ${finalTransWarning.toString()}!\
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
  console.log(transitions)
  if(finalStates.length == 0){
    console.log("Error: No final states")
    run = 0;
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
$(document).ready(() => {
  init();
  $('#transition').click(() =>{

    if(customtransitions.length == 0){
      $('#transitionList').empty()
    }

    customtransitions.push({"read" : $('#read').val(), "write" : $('#write').val(), "move" : $('#move').val(), "quantity" : $('#number').val()})
    var arrayOfTransitions = []
    for(var j = 0; j < $('#number').val(); j++){
      arrayOfTransitions.push(new Transition(1600 + 150*(globalTransitions.length%2), 200 +((globalTransitions.length+1)%2 + globalTransitions.length)*45, $('#read').val(), $('#write').val(), $('#move').val(),j));
    }
    console.log(arrayOfTransitions)
    globalTransitions.push(arrayOfTransitions)
    

    $("#transitionList").append('<li class="list-group-item text-center">' +
                                    $("#number").val() + ' ×  If input is '+
                                    $("#read").val() + ', write ' + 
                                    $("#write").val() + ', then move ' + 
                                    $("#move").val() + 
                                  ' <button type="button" class="close transition pl-3">\
                                            <span aria-hidden="true">&times;</span>\
                                          </button></li>');
  })

  $('#test').click(() =>{
    if(tests.length == 0){
      $('#testList').empty()
    }

    tests.push({"input" : $('#input').val(), "output" : $('#output').val(), "accepts" : $('#accepted').prop('checked')});

    $("#testList").append('<li class="list-group-item text-center">' +
                                    $('#input').val() + "→" +
                                    $('#output').val() + ': ' + 
                                    $('#accepted').prop('checked') +
                                  ' <button type="button" class="close test pl-3">\
                                            <span aria-hidden="true">&times;</span>\
                                          </button></li>');

  });

  $('#subroutine').click(()=>{
    if(customsubroutines.length == 0){
      $('#subroutineList').empty()
    }

    var subroutine = preloadedSubroutines[$(select).val()]
    if(subroutine){
      $("#subroutineList").append('<li class="list-group-item text-center">' +
                                    subroutine.name + 
                                  ' <button type="button" class="close subroutine pl-3">\
                                            <span aria-hidden="true">&times;</span>\
                                          </button></li>');
      customsubroutines.push(subroutine)

      const fixsub = new Subroutine(50 + (customsubroutines.length-1)*170, 50,0, subroutine.name,JSON.parse(subroutine.program),subroutine.initialState,subroutine.finalStates)
      fixsub.svg.node.onclick = function(){
        var subroutine = new Subroutine(500,500,subroutines.length,fixsub.name,fixsub.program,fixsub.initialState,fixsub.finalStates)
        subroutine.drag()
        subroutines.push(subroutine)
      }
    }

    
  });

  $('#createSubroutine').click(()=>{
    compileTM();
    var tmObj = compiledtm.export()
    tmObj.name = $('#name').val();

    $('#select').append('<option value="'+ preloadedSubroutines.length +'">' +
                        $('#name').val() +
                        '</option>')
    preloadedSubroutines.push(tmObj);
    console.log(tmObj)
  })

  $('#submit').click(() =>{
    
    var json = {
    "goal": $('#goal').val(),
    "transitions": customtransitions,
    "tests": tests,
    "subroutines": customsubroutines
    }

    $.ajax({
      url: '/creator',
      type: 'POST',
      dataType: 'json',
      data: json,
    })
    .done(function(id) {
      console.log(id);
      $( location ).attr("href", 'levels/'+id);
    })
    .fail(function() {
      console.log("error");
    })
    .always(function() {
      console.log("complete");
    });
    
    return json;
  })

  //remove transiton
  $(document).on('click', '.transition.close', function() {
    var item = $(this).parent()
    var index = item.parent().children().index(item)
    
    for(var j = 0; j < customtransitions[index].quantity; j++){
      globalTransitions[index][j].svg.remove()
      globalTransitions[index][j] = null
    }

    globalTransitions.splice(index,1)
    customtransitions.splice(index,1);

    //redraw transions
    for (var i = index; i < globalTransitions.length; i++) {

      for(var j = 0; j < customtransitions[i].quantity; j++){
        globalTransitions[i][j].svg.remove()
        globalTransitions[i][j] = new Transition(1600 + 150*(i%2), 200 +((i+1)%2 + i)*45, customtransitions[i].read, customtransitions[i].write, customtransitions[i].move,j)
      }
    }
    
    if(customtransitions.length == 0){
      item.parent().append('<li class="list-group-item text-center" id="transitionListPlaceholder">No Transitions</li>')
    }
    $(item).remove()

  });


  //remove test
  $(document).on('click', '.test.close', function() {
    var item = $(this).parent()
    var index = $('#testList').children().index(item)
    tests.splice(index,1);
    if(tests.length == 0){
      item.parent().append('<li class="list-group-item text-center" id="testListPlaceholder">No Tests</li>')
    }
    $(item).remove()
  });

  //remove subroutine
  $(document).on('click', '.subroutine.close', function() {
    var item = $(this).parent()
    var index = $('#subroutineList').children().index(item)
    customsubroutines.splice(index,1);
    if(customsubroutines.length == 0){
      item.parent().append('<li class="list-group-item text-center" id="subroutineListPlaceholder" >No Subroutines</li>')
    }
    $(item).remove()
  });
});