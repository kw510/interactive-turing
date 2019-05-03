/*
*
* Input: initial tape input
*/
function Tape(string,show){
  if(show==null){
    show = true;
  }
  var tapeCells = [];
  var head = 0;
  var min = 9;
  var splitter = new GraphemeSplitter();
  var tapeArray = splitter.splitGraphemes(string);
  
  // set global
  inputAlphabet = new Set(tapeArray)

  // generate blank tapecells up untill head pos
  for (var i = 0; i < min; i++) {
    tapeCells.push(new TapeCell("",i))
    tapeArray.unshift(blank)
  }

  // Write the string to the tape
  for (var i = min; i < tapeArray.length; i++) {
    tapeCells.push(new TapeCell(tapeArray[i],i))
  }

  // Fill up the rest of the space with tapecells
  for (var i = tapeArray.length; i<19; i++){
    tapeCells.push(new TapeCell("",i))
    tapeArray.push(blank)
  }
  
  var max = tapeCells.length;
  var tapeSVG = tapeCanvas.group()

  // render the tape cells
  for(var i=0;i < 19; i++){
    tapeSVG.add(tapeCells[i].svg)
  }
  if(!show)tapeSVG.remove()

  
  /**
  * Movement Functions
  */

  // Move head left
  this.moveLeft = function(){
    head-=1
    
    // Add tapecell to start of tape when needed
    if(head+min < 9){
      min++;
      tapeCells.unshift(new TapeCell("",head))
      tapeArray.unshift(blank)
      tapeSVG.add(tapeCells[0].svg);
    }

    //render tape cell offscreen, before the animation
    tapeSVG.add(tapeCells[(head+min - 9)].svg)

    //remove the tape cell that is not showing before the animation
    //check if it exists first
    if (tapeCells[(head+min + 11)]) {
      tapeCells[(head+min + 11)].svg.remove()
    }

    // animate
    tapeSVG.animate({
      transform:`t${(-head)*100}`
    },200)
  }

  // Move head right
  this.moveRight = function(){
    head+=1
    
    // When this happens, the tape must extend from the right hand side
    if(max-head == 18){
      
      tapeCells.push(new TapeCell("",max))
      max++;

      tapeArray.push(blank)
      tapeSVG.add(tapeCells[tapeCells.length-1].svg);
    }

    //render the tapecell offscreen, before the animation
    tapeSVG.add(tapeCells[(head+min+9)].svg)

    //remove the tape cell that is not showing before the animation
    if(tapeCells[(head+min - 11)]){
      tapeCells[(head+min - 11)].svg.remove()
    }


    //animate
    tapeSVG.animate({
      transform:`t${(-head)*100}`
    },200)
  }

  /**
  * Misc Functions
  */
  this.read = function(){
    return tapeCells[head+min].symbol
  }
  this.write = function(symbol){
    tapeCells[head+min].writeSymbol(symbol)
    tapeArray[head+min] = symbol
  }
  this.getTape =function(){
    for (var i = 0; i < tapeArray.length; i++) {
      if(tapeArray[i] != "B"){
         return tapeArray.slice(i)
      }
    }
  }
  this.getMin = function(){
    return min;
  }
}