var idiomatic=require("idiomatic-stdio");

console.log("stdout: by default, console.log() writes to process.stdout");
console.info("stdout: console.info() does too");

console.log('stdout: shortly, we will call require("idiomatic-stdio").rebind() to redirect console.log() output process.stderr');

idiomatic.rebind();
console.log('stderr: see mum, console.log() now writes to stderr');
console.info('stderr: and console.info() does too');
idiomatic.unbind();
console.log('stdout: but unbind() undoes the effect of rebind on console.log()');
console.info('stdout: and console.info() too');

var api={
    foo: function() {
	console.log("stdout: api.foo expects to console.log to write to stdout, so let it");
    }
};

idiomatic.with(function() {
    console.log('stderr: with() can be used to rebind console.log() for the duration of a function call');
    console.info('stderr: and console.info() too');
});

console.log("stdout: after with(), console.log() should write to stdout again");


idiomatic.rebind();
idiomatic.encapsulate(api, process.stdout).foo();
idiomatic.unbind();


idiomatic
    .console
    .options({ idiom: 'diagnostics' })
    .log('stderr: this is an example of a suggested idiom for specfifying how the API is to be used');
