function test(a, ...rest) {
    return {
        a: a,
        rest: rest
    };
}

function test2(a=100) { return  a;}

var argTest = { test: test, test2:test2};

module.exports = argTest;
