var idiomatic=require("idiomatic-stdio");

console.log("by default, console.log() writes to process.stdout");
console.info("console.info() does too");

console.log('shortly, we will call require("idiomatic-stdio").rebind() to redirect console.log() output process.stderr');

idiomatic.rebind();
console.log('see mum, console.log() now writes to stderr');
console.info('and console.info() does too');
idiomatic.unbind();
console.log('but unbind() undoes the effect of rebind on console.log()');
console.info('and console.info() too');

var api={
    foo: function() {
	console.log("api.foo expects to console.log to write to stdout, so let it");
    }
};

idiomatic.with(function() {
    console.log('with() can be used to rebind console.log() for the duration of a function call');
    console.info('and console.info() too');
});

console.log("after with(), console.log() should write to stdout again");


idiomatic.rebind();
idiomatic.encapsulate(api, process.stdout).foo();
idiomatic.unbind();


