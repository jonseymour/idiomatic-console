NAME
====
idiomatic-stdio - wrapper functions for console.log() and console.info() that preserve long standing unix idioms with regard to the correct target for diagnostic output.

DESCRIPTION
===========
idiomatic-stdio provides a module that a top-level node.js module can use to explicitly enforce the idiom that diagnostic output is written to stderr. 

            require("idiomatic-stdio").rebind();

which rebinds the log and info functions of the supplied console object to alternative implementations equivalent to below:

   	    console.log=(function() {
               var orig=console.log;
               return function() {
                 try {
                   var tmp=process.stdout;
                   process.stdout=process.stderr;
                   orig.apply(console, arguments);
                 } finally {
                   process.stdout=tmp;
                 }
               };
             })();

             console.info=(function() {
               var orig=console.info;
               return function() {
                 try {
                   var tmp=process.stdout;
                   process.stdout=process.stderr;
                   orig.apply(console, arguments);
                 } finally {
                   process.stdout=tmp;
                 }
               };
             })()

OTHER EXAMPLES
==============

	require("idiomatic-stdio").rebind(process.stderr, console);  

Same as rebind(), but with target stream and console explicitly supplied.

	require("idiomatic-stdio").unbind();                 

Undoes the effect of exactly one rebind call.

	require("idiomatic-stdio").with(function() { console.log("thunk!"); }, process.stderr); 

Executes the thunk supplied as the first argument, while console.log and console.info are rebound to stderr.

	require("idiomatic-stdio").with(function() { console.log("thunk!"); }, process.stdout); 

Executes the thunk supplied as the first argument, while console.log and console.info are rebound to stdout.

