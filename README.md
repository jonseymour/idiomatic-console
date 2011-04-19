NAME
====
idiomatic-stdio - wrapper functions for console.log() and console.info() that preserve long standing unix idioms with regard to the correct target for diagnostic output.

DESCRIPTION
===========
idiomatic-stdio provides a module that a top-level node.js module can use to explicitly enforce the idiom that diagnostic output is written to stderr.

<pre>
require("idiomatic-stdio").rebind();
</pre>

which rebinds the log and info functions of the console object with alternative implementations equivalent to below:

<pre>
console.log=(function(f) {
  var orig=console[f];
  return function() {
    try {
      var save=process.stdout;
      process.stdout=process.stderr;
      orig.apply(console, arguments);
    } finally {
      process.stdout=save;
    }
  };
})('log');
</pre>

The basic idea is to use the standard implementations of the functions, but to rebind process.stdout to process.stderr for the duration of the console call (but no longer).

OTHER EXAMPLES
==============

	require("idiomatic-stdio").rebind(process.stderr, console);

Same as rebind(), but with target stream and console explicitly supplied.

	require("idiomatic-stdio").unbind();

Undoes the effect of exactly one rebind call.

	require("idiomatic-stdio").with(function() { console.log("thunk!"); }, process.stderr);

Executes the function supplied as the first argument, while console.log and console.info are rebound to stderr.

	require("idiomatic-stdio").with(function() { console.log("thunk!"); }, process.stdout);

Executes the function supplied as the first argument, while console.log and console.info are rebound to stdout.

