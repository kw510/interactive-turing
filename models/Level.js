const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema({
  "goal": String,
  "transitions":[{"read" : String,"write": String,"move" : String, "quantity" : Number}],
  "tests":[{"input" :String, "output": String, "accepts" : Boolean }],
  "subroutines":[{
    "name" : String,
    "program" : String,
    "initialState" : String,
    "finalStates" : [String]
  }]
}, {minimize: false,
    timestamps: true});

const Level = mongoose.model('Level', levelSchema);
module.exports = Level;