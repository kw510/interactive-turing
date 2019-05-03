/**
*
* Inputs types: transition table, state, state array, tape object
*/
function TuringMachine(program,initialState,finalStates,tape){

  var currentState = initialState;
  var transition;
  var interval;
  var history = [];

  this.step = function(){

    if(currentState.isSubroutine()){
      // Run the subroutine and save output
      var accepted = currentState.run(tape,200)
      var read = tape.read()
      // Save to history to enable reversal
      history.push(currentState)

      // Determine what state to go to next
      transition = program[currentState.n][read]

      // Check if there exists a klenne star if no transition can be found
      if(!transition && program[currentState.n]["*"]){
        transition = program[currentState.n]["*"]
      }

      // Ensure transistion exists before continuing
      if(transition){
        transition.animate()
        currentState = transition.newState()
        currentState.animate()
      }
      else{
        clearInterval(interval)
        return 0;
      }
    }
    else{
      // Read the tape and select corresponding transition
      var read = tape.read()
      transition = program[currentState.n][read]
      if(!transition){ // If no transition found, look for a kleene transition
        transition = program[currentState.n]["*"]
        if(transition){
          program[currentState.n]["*"].readHistory.push(read)
        }
      }
      
      // Check transition exists before starting the computation
      if(transition){

        //If the write is not a klenne star, perform the write to the tape
        if(transition.write != "*"){
          tape.write(transition.write)
        }
        transition.animate()

        
        // Move the tape head
        if(transition.moveValue > 0) tape.moveRight();
        if(transition.moveValue < 0) tape.moveLeft() 

        // Change state to the new state
        currentState.reset()
        currentState = transition.newState()
        currentState.animate()

        // Save to history to be abled to be reversed
        history.push(transition)
      }
      else{
        // Halt machine
        clearInterval(interval)

        // If on final state then accept, else reject
        if(finalStates.includes(currentState)){
          return 1;
        }
        else{
          return 0;
        }
      }
    }
  }
  this.run = function(){
    currentState = initialState;
    interval = setInterval(this.step,500)
  }
  this.skip = function(){
    currentState = initialState;
    var accept = -1;
    while(true){
      accept = this.step();
      if(accept>-1){
        break;
      }
    }
    return accept;
  }

  this.unskip = function(){
    interval = setInterval(this.unstep,0)
  }

  this.unstep = function(){
    console.log(history)
    transition = history.pop();
    if(transition == null){
      console.log("At initialState")
      clearInterval(interval)
      return 1;
    }else if(transition.isSubroutine()){
      transition.unrun(tape)
    }
    else
    {
      currentState = transition.oldState()
      currentState.animate()

      if(transition.moveValue<0){
        tape.moveRight();
      }else if(transition.moveValue>0){
        tape.moveLeft();
      }
      if(transition.read == "*"){
        tape.write(transition.readHistory.pop())
      }else{
        tape.write(transition.read)
      }

      
      transition.animate()
    }
  }
  this.verify = function(input,output,accept){
    tape = new Tape(input,false);
    var accepted = this.skip();
    var tmout = tape.getTape()
    var i;
    for(i = 0 ; i<output.length;i++){
      if(output[i] != tmout[i]){
        return 0
      }
    }

    if(accepted != accept){
      return 0;
    }

    return 1
  }
  this.export = function(){
    var json = {}
    for (var i = 0; i < states.length; i++) {
      json.program = Object.assign(states[i].export(),json.program)
    }
    for (var i = 0; i < subroutines.length; i++) {
      json.program = Object.assign(subroutines[i].export(),json.program)
    }
    json.program = JSON.stringify(json.program)
    json.initialState = initialState.n;
    json.finalStates = [];
    for (var i = 0; i < finalStates.length; i++) {
      json.finalStates.push(finalStates[i].n)
    }
    return json
  }
}