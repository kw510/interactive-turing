function TapeCell(symbol,x){
  this.symbol = symbol;
  /**
  * SVG elements
  */
  var rect = tapeCanvas.rect(x*100, 0, 100, 100).attr({
    fill: "none",
    stroke: "#000",
    strokeWidth: 1
  });
  var txt = tapeCanvas.text(50+100*x,50,symbol).attr({
  "text-anchor": "middle",
  "dominant-baseline" : "middle",
  "font": "40px sans-serif"
  })
  if(symbol == ""){ 
    this.symbol = "B";
  }
  // Create svg group
  this.svg = tapeCanvas.group(rect,txt)

  /**
   * Misc functions
   */
  this.writeSymbol = function(symbol){
    txt.attr({
      text : symbol
    })

    if(symbol == ""){ 
      this.symbol = "B";
    }else{
      this.symbol = symbol;
    }
  }
}