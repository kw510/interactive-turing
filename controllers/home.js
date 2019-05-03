const leveljson = require('../levels/level.json')
const Level = require('../models/Level');
/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  res.render('index', {
    title: 'Home'
  });
};

exports.levels = (req,res) => {
  //Can access db here
  Level.find({}, function(err, levels) {
    res.render('levelList', {
    title: 'Levels',
    levels : levels.reverse()
    });
  })
}

exports.getLevelCreator = (req,res) =>{
  res.render('levelCreator',{
    title : 'Level Creator',
    level : {}
  });
}
exports.getLevel = (req,res) =>{
  Level.findById(req.params.id, function (err, level) {
    console.log(level)
    res.render('level', {
      title: 'Home',
      level: level
    });
  } );
  
}

exports.postLevelCreator = (req,res,next) =>{
  const level = new Level({
    goal: req.body.goal,
    transitions: req.body.transitions,
    tests : req.body.tests,
    subroutines : req.body.subroutines
  });

  level.save((err) => {
    if (err) { return next(err); }
    console.log(level._id)
    res.send(level._id)
  });
}