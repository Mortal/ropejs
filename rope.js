// An implementation of ropes in JavaScript.
// Due to Boehm, Atkinson and Plass (1995)
// "Ropes: an Alternative to Strings"

///////////////////////////////////////////////////////////////////////////////
// Fibonacci sequence helpers

var fib = (function () {
  var ns = [0, 1];
  return function (n) {
    while (n >= ns.length) ns.push(ns[ns.length-2] + ns[ns.length-1]);
    return ns[n];
  };
})();
var fibmax = 1476; // fib(fibmax) is finite, fib(fibmax+1) is infinite
function fibinv(len) {
  // Return n such that fib(n) is finite and fib(n) <= len < fib(n+1).
  var n = 0;
  while (n < fibmax-1) {
    if (len < fib(n+1))
      return n;
    ++n;
  }
  return n; // == fibmax
}

///////////////////////////////////////////////////////////////////////////////
// Internal rope nodes (concatenation nodes) and leaves

function Concat(left, right) {
  this.left = left;
  this.right = right;
  this.length = left.length + right.length;
  this.depth = 1 + Math.max(left.depth, right.depth);
}

function Leaf(s) {
  this.s = s;
  this.length = s.length;
  this.depth = 0;
}

function inorder_traversal(s, fn) {
  if (s instanceof Concat) {
    inorder_traversal(s.left, fn);
    inorder_traversal(s.right, fn);
  } else {
    fn(s);
  }
}

// "Short leaf" definition due to Boehm et al
function short_leaf(s) {
  return !(s instanceof Concat) && s.length < 1;
}

Leaf.prototype.balance = function () {
  return this;
};

Leaf.prototype.balanced = function () {
  return this.length >= fib(this.depth+2);
};

Concat.prototype.balanced = function () {
  return this.length >= fib(this.depth+2);
};

var balance_debug = true;
Concat.prototype.balance = function (force) {
  if (!force && this.balanced()) return this;
  var before = balance_debug ? this.toString() : '';
  var slots = [];
  var leastslot = fibmax+1;
  var greatestslot = -1;
  inorder_traversal(this, function (l) {
    var slot = fibinv(l.length);
    if (slot < leastslot) {
      slots[slot] = l;
    } else {
      var r = null;
      var level;
      for (level = 0; level < slot || r.length >= fib(level+1) || slots[level]; ++level) {
        if (slots[level]) {
          r = r ? slots[level].concat(r) : slots[level];
          slots[level] = null;
        }
        if (level == slot-1) {
          r = r ? r.concat(l) : l;
        }
      }
      slots[level] = r;
      slot = level;
    }
    leastslot = level;
    greatestslot = Math.max(greatestslot, slot);
  });
  var result;
  if (greatestslot < leastslot)
    result = new Leaf("");
  else {
    result = slots[greatestslot];
    for (var level = greatestslot-1; level >= leastslot; ++level) {
      if (slots[level]) {
        result = result.concat(slots[level]);
      }
    }
  }
  if (balance_debug) {
    var after = result.toString();
    if (before == after) console.log("Balance maintained toString() value");
    else console.error("Balance changed toString() value", [before, after]);
    if (this.balanced()) console.log("Rope is now balanced");
    else console.error("Balance failed to balance rope", [result.length, result.depth]);
  }
  return result;
};

// ----------------------------------------------------------------------------
// Convert to native JavaScript string
Leaf.prototype.toString = function () {
  return this.s;
};
Concat.prototype.toString = function () {
  return this.left.toString() + this.right.toString();
};

// ----------------------------------------------------------------------------
// The four rope operations.
// 1. Fetch ith character.
Leaf.prototype.charAt = function (pos) {
  return this.s.charAt(pos);
};
Concat.prototype.charAt = function (pos) {
  if (pos < this.left.length) return this.left.charAt(pos);
  return this.right.charAt(pos - this.left.length);
};

// 2. Concatenate two ropes.
Leaf.prototype.concat = function (str2) {
  if (this.length == 0) return str2;
  if (short_leaf(this) && short_leaf(str2)) {
    return new Leaf(this.toString() + str2.toString());
  }
  return new Concat(this, str2);
};
Concat.prototype.concat = function (str2) {
  if (short_leaf(str2) && short_leaf(this.right)) {
    return new Concat(this.left, new Leaf(this.right.toString() + str2.toString()));
  }
  return new Concat(this, str2);
};

// 3. Substring.
Leaf.prototype.substring = function (pos1, pos2) {
  return new Leaf(this.s.substring(pos1, pos2));
};
Concat.prototype.substring = function (pos1, pos2) {
  if (pos1 >= this.left.length) {
    return this.right.substring(pos1 - this.left.length, pos2 - this.left.length);
  }
  if (pos2 <= this.left.length) {
    return this.left.substring(pos1, pos2);
  }
  return new Concat(
      this.left.substring(pos1, this.left.length),
      this.right.substring(0, pos2 - this.left.length));
};

// 4. Iterate over each character. See inorder_traversal() above.

// ============================================================================
// Conversion to and from JSON
function BadJSON(msg, data) {this.msg = msg; this.data = data;}
BadJSON.prototype.toString = function () { return this.msg; };
function rope_from_json(data) {
  if ('string' == typeof data) return new Leaf(data);
  if (!data instanceof Array) throw new BadJSON("data neither Array nor String");
  if (data.length != 2) throw new BadJSON("data array has length "+data.length+", expected 2", data);
  return new Concat(rope_from_json(data[0]), rope_from_json(data[1]));
}
function rope_to_data(rope) {
  if (rope instanceof Leaf) return rope.s;
  if (rope instanceof Concat) return [rope_to_data(rope.left), rope_to_data(rope.right)];
  return rope;
}
function rope_to_json(rope) {
  return JSON.encode(rope_to_data(rope));
}
// vim:set ts=2 sw=2 sts=2 et:
