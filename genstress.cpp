#include <random>
#include <iostream>
#include <algorithm>

using namespace std;

size_t length;

void begin_work() {
	cout << "  }\n  function work() {\n"
		 << "    while (r.length < " << length << ") r = r.concat(r);\n"
		 << "    if (r.length > " << length << ") r = r.substring(0, " << length << ");\n";
}

int main() {
	length = 50;
	size_t lines = 1000;
	const size_t minSize = 500000;
	bool initialized = length >= minSize;
	cout << "function Stress(Impl, seed, n) {\n"
		 << "  var r = new Impl(seed);\n"
		 << "  while (r.length < " << length << ") r = r.concat(r);\n"
		 << "  if (r.length > " << length << ") r = r.substring(0, " << length << ");\n"
		 << "  var hc = 0;\n" 
		 << "  function init() {\n";
	if (initialized) begin_work();
	mt19937 rng;
	while (lines) {
		size_t idx, idx1, idx2, len;
		switch (rng() & 3) {
			case 0:
				if (!initialized) break;
				idx = rng() % length;
				cout << "    hc = hc ^ r.charCodeAt(" << idx << ");\n";
				--lines;
				break;
			case 1:
			case 2:
				idx1 = rng() % (length-2);
				len = 1 + rng() % min(static_cast<size_t>(initialized ? 1000 : minSize), length-idx1-1);
				idx2 = idx1 + len;
				length += idx2-idx1;
				cout << "    r = r.concat(r.substring(" << idx1 << ", " << idx2 << "));\n";// console.assert(r.length == " << length << ", \"length after concat \"+r.length+\" " << length << "\");\n";
				--lines;
				if (!initialized && length >= minSize) {
					initialized = true;
					begin_work();
				}
				break;
			case 3:
				if (length < minSize+3) break;
				idx1 = rng() % (length-minSize-2);
				len = minSize + rng() % (length-idx1-minSize);
				idx2 = idx1 + len;
				length = idx2-idx1;
				cout << "    r = r.substring(" << idx1 << ", " << idx2 << ");\n";// console.assert(r.length == " << length << ", \"length after substring \"+r.length+\" " << length << "\");\n";
				--lines;
				break;
		}
	}
	cout << "  }\n"
		 << "  init();\n"
		 << "  while (n && n--) work();\n"
		 << "  return hc;\n"
		 << "}\n";
	return 0;
}
// vim:set sw=4 ts=4 sts=4 noet:
