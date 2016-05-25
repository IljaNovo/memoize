import { memoize } from "memoize";

chai.config.includeStack = true;

let expect = chai.expect;

describe("Memoized function", function () {

	function abs() {
		let xs = [...arguments];
		let power = xs.map(x => x * x).reduce((sum, x) => sum + x);
		return Math.round(Math.sqrt(power));
	}

	function grep(pattern, ...items) {
		if (!(pattern instanceof RegExp)) {  // Special case
			return undefined;
		}
		return items.map(String).filter(pattern.test.bind(pattern));
	}

	var absSpy, grepSpy;
	var memoizedAbs, memoizedGrep;

	beforeEach(function () {
		absSpy = chai.spy(abs);
		memoizedAbs = memoize(absSpy);
		grepSpy = chai.spy(grep);
		memoizedGrep = memoize(grepSpy);
	});

	it("should not be equal to the original function", function () {
		expect(memoize(abs)).to.not.equal(abs);
	});

	it("should delegate calls to target function", function () {
		expect(memoizedAbs(0, 1)).to.equal(1);
		expect(memoizedAbs(3, 4)).to.equal(5);
		expect(memoizedGrep(/\d+/, "abc", "123", "def")).to.deep.equal(["123"]);
	});

	it("should return correct values in case of the consequent calls with identical arguments", function () {
		for (var i = 0; i < 2; i++) {
			expect(memoizedAbs(3, 4)).to.equal(5);
		}
	});

	it("should cache undefined result as legal (non empty) value", function () {
		expect(memoizedGrep()).to.equal(undefined);
		expect(memoizedGrep()).to.equal(undefined);
		expect(grepSpy).to.have.been.called.once();
	});

	it("should cache results of the consequent calls with identical arguments", function () {
		const ARGS0 = [3, 5];
		memoizedAbs(...ARGS0); // first call
		expect(absSpy).to.have.been.called.with(...ARGS0);
		absSpy.reset();
		memoizedAbs(...ARGS0); // second call
		expect(absSpy).to.not.have.been.called();
	});

	it("should use all arguments to compute cache key", function () {
		memoizedAbs(1, 2, 3, 4, 5);
		memoizedAbs(1, 2, 3, 4);
		expect(absSpy).to.have.been.called.twice();
	});

	it("should use complicated enough key generator to distinguish different types", function () {
		expect(memoizedGrep(/\d+/, "1", 2, "true")).to.deep.equal(["1", "2"]);
		expect(memoizedGrep(/\d+/, 1, "2", true)).to.deep.equal(["1", "2"]);
		expect(grepSpy).to.have.been.called.twice();
	});

	it("should use complicated enough key generator to preserve argument's order", function () {
		var memoAbsSpy = chai.spy(memoizedAbs);
		expect(memoAbsSpy(4, 3)).to.equal(5);
		expect(memoAbsSpy(3, 4)).to.equal(5);
		expect(memoAbsSpy).to.have.been.called.twice();
	});
});
