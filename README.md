NAME
====
idiomatic-stdio - wrapper functions for console.log() and console.info() that enable node.js to be used concurrently with standard JavaScript and command-line unix idioms.

DESCRIPTION
===========
idiomatic-stdio provides a module that a top-level node.js module can use to explicitly enforce the command-line unix idiom that diagnostic output is written to stderr.

The purpose of this module is to cope with a long standing design decision in node.js which sees the output of calls to the commonjs console.log() and console.info() API functions being directed to process.stdout, rather than process.stderr which would be more consistent with standard unix practice.

As it stands now, the commonjs module author is forced to make a choice between support for the command-line unix idiom or support for the JavaScript diagnostic text output idiom. This module allows both idioms to co-exist by rebinding the output of console.log() and console.info() to process.stderr.

Currently, this requires the top-level node.js module to be aware of this issue and to include this
module as a dependency. Future versions of this package may provide other means to enable the co-existence.

Co-existence is enabled with a statement of this kind:

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

The bindings remain in place until the end of the process or until the programmer calls:

    require("idiomatic-stdio").unbind();

Multiple calls to rebind are possible and each should have the expected effect. In particular, the console call will eventually be handled by the platforms implementation of console.log/info() but process.stdout be substituted according to the dictates of the most recent call to rebind.

Calls to unbind may not have the expected effect unless they are executed in the reverse order to the corresponding rebind() calls.

The basic idea is to use the platform-provided implementations of the functions, but to rebind process.stdout to process.stderr for the duration of the console call (but no longer).

Support is also offered for temporarily rebinding the target of console.log() and console.info() for the duration
of a single function call.

    require("idiomatic-stdio").with(function() {
        console.log("hello world - stderr version!");
    });

Module authors who would like to use console.log() and console.info() in the manner intended by the designers of the console API can do by defining a local variable, console, as follows:

    var console=require("idiomatic-stdio").console;

This will only affect the module's own calls to the console API. Calls to other modules that use console.log() or console.info() will be unaffected.

Of course, there are many node.js APIs that use console.log() with the expectation that it is bound to process.stdout. We can support these APIs by encapsulating them with a proxy that restores the expected behaviour. For example:

<pre>
var
    idiomaticStdIO=require('idiomatic-stdio"),
    api=idiomaticStdIO.encapsulate(require('api-with-nodejs-output-idiom'), process.stdout); // preserve node.js quirks

    idiomaticStdIO.rebind(); // rebind console.log() for everything else

    api.foobar(); // within this call, calls to console.log(), console.info() go to stdout, as expected
</pre>

This approach can also be used to deal with an API that uses console.log() and console.info() for diagnostic purposes without affecting the output bindings for other modules:

    var api=require('idiomatic-stdio").encapsulate(require('api-with-commonjs-diagnostic-idiom'), process.stderr);
    api.foobar(); // calls to console.log(), console.info() go to stderr.


EXAMPLES
========
A selection of other examples is presented here.

	require("idiomatic-stdio").rebind(process.stderr, console);

Same as rebind(), but with target stream and console explicitly supplied.
<hr/>

	require("idiomatic-stdio").unbind();
Undoes the effect of exactly one rebind call.
<hr/>

	require("idiomatic-stdio").with(function() { console.log("thunk!"); }, process.stderr);
Executes the function supplied as the first argument, while console.log and console.info are rebound to stderr.
<hr/>

	require("idiomatic-stdio").with(function() { console.log("thunk!"); }, process.stdout);
Executes the function supplied as the first argument, while console.log and console.info are rebound to stdout.
<hr/>

An executable example is provided in example/example.js. To run:
<pre>
npm install idiomatic-stdio
npm explore idiomatic-stdio
node example/example.js
exit # to return to where you were
</pre>

MOTIVATION
==========
The closest thing that node.js has to an idiomatic way to generate output is to use console.log(); most examples in the node.js API document use console.log() for this purpose, only a few use process.stdout.write(msg+'\\n');. Ryan Dahl's Google talk about node.js uses console.log() for his hello world examples.

In node.js, console.log() is bound to process.stdout. The motivation for this choice seems clear - console.log() is well established, in browser JavaScript, as the way to generate text output. At first blush, the decisions by node.js to a) use console.log() as the idiomatic way to generate output and b) to bind console.log() to process.stdout seem reasonable since people new to node.js will expect console.log() to be used to generate text based output.

When implementing daemons, there is not a huge problem with this choice since the only outputs daemons generate is diagnostic output and no-one really cares whether this output is generated on stderr or stdout.

However, node.js isn't just a daemon implementation language - it is very useful as a command-line scripting language. As such, the decision, implicit or otherwise, to bind console.log() to stdout is a particularly unfortunate one. The reasons this are so are a little subtle, but it comes down to a clash of idioms between the worlds of command-line unix and JavaScript.

In command-line unix it is a long and well established practice to reserve stdout for data or other structured output and to reserve stderr for diagnostics and other unstructured output. Composability of unix pipeline stages fundamentally relies on this clean separation between data and side-band info since we want to be able to connect the stdout of one pipeline stage to the stdin of another pipeline stage without having to insert an intermediate filter to remove, in a post-hoc fashion, diagnostic output from the data stream of the first stage.

In browser JavaScript, console.log() is most often used to write not data, but diagnostic information. And here is where the clash arises - anyone who writes a commonjs module might reasonably expect to use console.log() and console.info() to write diagnostic information. However, if such a module is used by a node.js pipeline stage, the output of that stage will be polluted with that diagnostic output.

This, then, is the crux of the problem: the decision to bind console.log() and console.info() to process.stdout means that commonjs modules written in idiomatic JavaScript will prevent idiomatic composition of unix pipeline stages implemented with node.js programs that happen to call modules that sometimes, under some circumstances, generate diagnostic outputs with either console.log() or console.info().

In my view, node.js should be binding console.log() and console.info() to stderr by default. If the breaks to backward compatibility that such a change would cause are judged to be too severe, then there should be a command line option that enables such behaviour with a switch. Such a change would allow node.js to seamlessly support both the common JavaScript idiom and the standard command-line unix idiom.

Ryan's response to this issue thus far is: don't do that. Meaning, don't use console.log() or console.info() for the
purposes envisioned by the designers of that API and don't call any modules that do. What this means in practice is that if you have any dependencies on modules that do use the commonjs console API in the manner intended by its designers you must plead with the authors of such modules to desist or find suitable alternatives.

Or, use the solution provided here. For as long as it works.

COMPATIBILITY
=============
idiomatic-stdio has been tested with node.js, v0.4.6.

It relies on several assumptions. If any of these assumptions are violated by future versions of node.js, unexpected outcomes may result. The assumptions are:

* console.log() and console.info() use write their output to the effective process.stdout stream at the point of the call.
* no asynchronous activity in the process derefrences process.stdout during a call to console.log() or console.info()
* console.log, console.info and process.stdout may be freely re-assigned

ALTERNATIVES
============
A [patch](https://github.com/jonseymour/node/tree/console-to-stderr-switch) is available for node itself which
adds a --console-to-stderr switch that forces console.log() to write to process[process.\_console\_selector], where
process.\_console\_selector is initialized to 'stderr'. Unfortunately, Ryan either [does not understand or does not
care about](https://github.com/joyent/node/pull/963#issuecomment-1041568) this issue, so it won't be integrated into the node mainline.

REVISIONS
=========
<dl>
<dt>v0.0.4</dt>
<dd>co-existence with --console-to-stderr patch</dd>
<dt>v0.0.3</dt>
<dd>include information about --console-to-stderr patch</dd>
<dt>v0.0.2</dt>
<dd>fixed issue with nested binds. added a unit test.</dd>
<dt>v0.0.1</dt>
<dd>refactored, added .console object with a tweaked console implementation for local use</dd>
<dt>v0.0.0</dt>
<dd>initial version</dd>
</dl>

WEB
===
[http://github.com/jonseymour/node-idiomatic-stdio/](http://github.com/jonseymour/node-idiomatic-stdio/)

GIT
===
git@github.com:jonseymour/node-idiomatic-stdio.git

AUTHOR
======
Copyright(C) Jon Seymour 2011.