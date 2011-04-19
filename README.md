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

MOTIVATION
==========
The closest thing that node.js has to an idiomatic way to generate output is to use console.log(); most examples in the node.js API document use console.log() for this purpose, only a few use process.stdout.write(msg+'\\n');. Ryan Dahl's Google talk about node.js uses console.log() for his hello world examples. In node.js, console.log() is bound to process.stdout.

The motivation for this choice seems clear - console.log() is well established, in browser JavaScript, as the way to generate text output. At first blush, the decisions by node.js to a) use console.log() as the idiomatic way to generate output and b) to bind console.log() to process.stdout seem reasonable since people new to node.js will expect console.log() to be used to generate text based output. 

When implementing daemons, there is not a huge problem with this choice since the only outputs daemons generate is diagnostic output and no-one really cares whether this output is generated on stderr or stdout.

The problem is, node.js isn't just a daemon implementation language - it is quite useful as a command-line scripting language. The problem is, the decision to bind console.log() to stdout is a particularly unfortunate choice. The reasons this are so are a little subtle, but it comes down to a clash of idioms between the worlds of JavaScript and command-line unix.

In command-line unix it is a long established and well-established practice to reserve stdout for data or other structured output and to reserve stderr for diagnostics and other unstructured output. Composibility of unix pipeline stages fundamentally relies on this clean separation between data and side-band info since we want to be able to connect the stdout of one pipeline stage to the stdin of another pipeline stage without having to insert an intermediate filter to remove, in a post-hoc fashion, diagnostic output from the data stream.

In browser JavaScript, console.log() is most often used to write not data, but diagnostic information. And here is where the problems begin. Anyone who writes a commonjs module might reasonably expect to use console.log() to write diagnostic information. However, if such a module is used by a node.js pipeline stage, the output of that stage will be polluted with that diagnostic output.

And herein lies the crux of the problem: the decision to bind console.log() and console.info() to process.stdout means that commonjs modules written in idiomatic JavaScript will prevent idiomatic composition of unix pipeline stages implemented with node.js programs that happen to call modules that sometimes, under some circumstances, generate diagnostic outputs with either console.log() or console.info().

In my view, node.js should be binding console.log() and console.info() to stderr by default. If the breaks to backward compatibility are judged to be too severe, then there should be a command line option that enables such behaviour with a switch. That way, people who care about preserving idiomatic unix pipeline composibility can.

Ryan's response to this issue thus far is: don't do that. Meaning, don't call modules that use console.log() or console.info() for diagnostic outputs and don't generate any diagnostic outputs with console.log() or console.info(). What this means in practice is that if you have any dependencies you must audit those dependencies on a regular basis and plead with the authors of such modules not to use the commonjs console API in the manner intended by the original creators of that API; that is: for diagnostic output. 

However, that is Ryan's response, so this is the workaround. 

