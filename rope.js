function Rope() {
  this.children = [];
  this.length = 0;
  this.mut_push.apply(this, arguments);
}
Rope.prototype.mut_push = function () {
  for (var i = 0, l = arguments.length; i < l; ++i) {
    this.children.push(arguments[i]);
    this.length += arguments[i].length;
  }
};
function inorder_traversal(s, fn) {
  if (s instanceof Rope) {
    for (var i = 0, l = s.children.length; i < l; ++i) {
      inorder_traversal(s.children[i], fn);
    }
  } else {
    fn(s);
  }
}
function short_leaf(s) {
  if (!(s instanceof String)
      && !(s instanceof Rope
        && s.children.length == 1
        && s.children[0] instanceof String))
    return false;

  return s.length < 10000;
}
Rope.prototype.toString = function () {
  var l = this.children.length;
  var res = new Array(l);
  for (var i = 0; i < l; ++i) {
    res[i] = this.children[i].toString();
  }
  return res.join('');
};
Rope.prototype.toString2 = function () {
  var r = [];
  inorder_traversal(this, function (s) {r.push(s);});
  return r.join('');
};
Rope.prototype.toString3 = function () {
  var r = '';
  inorder_traversal(this, function (s) {r += s;});
  return r;
};
Rope.prototype.charAt = function (pos) {
  for (var i = 0, l = this.children.length; i < l; ++i) {
    if (pos < this.children[i].length) {
      return this.children[i].charAt(pos);
    }
    pos -= this.children[i].length;
  }
  return "".charAt(0);
};
Rope.prototype.concat = function (str2) {
  if (str2.length == 0) return this;
  if (short_leaf(str2)) {
    if (short_leaf(this)) {
      return new Rope(this.toString()+str2.toString());
    }
    if (this.children.length == 2 && short_leaf(this.children[1])) {
      return new Rope(this.children[0], this.children[1].toString() + str2.toString());
    }
  }
  return new Rope(this, str2);
};
Rope.prototype.substring = function (pos1, pos2) {
  // argument sanitation
  if (arguments.length < 2)
    pos2 = this.length;
  if (!pos1 || pos1 < 0)
    pos1 = 0;

  // base case
  if (pos1 == 0 && pos2 >= this.length)
    return this;

  var res = new Rope();
  for (var i = 0,
           l = this.children.length,
           startpos = 0,
           endpos;
       i < l;
       startpos = endpos, ++i)
  {
    var child = this.children[i];
    endpos = startpos + child.length;
    if (endpos <= pos1) continue;
    if (pos2 <= startpos) break;
    var childfrom = Math.max(0, pos1-startidx),
        childto = Math.min(child.length, pos2-startidx);
    res.mut_push(child.substring(childfrom, childto));
  }
};
// vim:set ts=2 sw=2 sts=2 et:
