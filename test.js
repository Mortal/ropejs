function fib_generic(n, fib0, fib1, op) {
  if (n <= 0) return fib0;
  if (n == 1) return fib1;
  var a = fib0, p = fib1, r;
  for (var i = 2; i <= n; ++i) {
    r = op(a, p);
    a = p;
    p = r;
  }
  return r;
}
function fib(n) {
  return fib_generic(n, 0, 1, function (a, b) { return a + b; });
}
function fib_string(RopeImpl, seed, n) {
  var s = String.fromCharCode(32 + seed % 90);
  return fib_generic(n, new RopeImpl(''), new RopeImpl(s), function (a, b) { return a.concat(b); });
}
function pow_generic(n, pow0, op) {
  if (n <= 0) return pow0;
  var r = pow0;
  for (var i = 0; i < n; ++i) {
    r = op(r);
  }
  return r;
}
function pow(n) {
  return pow_generic(n, 1, function (n) { return n * n; });
}
function pow_string(RopeImpl, seed, n) {
  var s = String.fromCharCode(32 + seed % 90);
  return pow_generic(n, new RopeImpl(s), function (s) { return s.concat(s); });
}
function UnitTest(fn) {
  this.fn = fn;
}
function SpeedTest(fn) {
  this.fn = fn;
}
// vim:set ts=2 sw=2 sts=2 et:
