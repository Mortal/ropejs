var t = require('./test.js'), r = require('./rope.js');
var n = new Date().getTime() % 1000000000;
while (true) {
  ++n;
  var s = n+'';
  console.log("String:",t.stresstime(String, s, 10));
  console.log("Rope:  ",t.stresstime(r.Leaf, s, 10), r.get_balance_counter());
  r.reset_balance_counter();
}
// vim:set ts=2 sw=2 sts=2 et:
