NAME
====
idiomatic-stdio - a wrapper for node.js that preserves long standing unix idioms with regard to the correct target for diagnostic output.

DESCRIPTION
===========
idiomatic-stdio provides a module that a top-level node.js module can use to explicitly enforce the idiom that diagnostic output
is written to stderr. 

            require("idiomatic-stdio").rebind(console);

which would rebind the log and info functions of the supplied console object to alternative implementations below:

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
