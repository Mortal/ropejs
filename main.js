var t = require('./test.js'), r = require('./rope.js');
var n = new Date().getTime() % 1000000000;
while (true) {
  ++n;
  var s = n+'';
  console.log("Rope:  ",t.stresstime(r.Leaf, s, 5000));
  console.log("String:",t.stresstime(String, s, 5000));
}
// vim:set ts=2 sw=2 sts=2 et:
