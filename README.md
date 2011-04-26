NAME
====
idiomatic-console - provides a private, rebindable console API that enhances composability of node modules that need a custom console API.

SYNOPSIS
========
<pre>
// local rebinding
var 
  console=require("idiomatic-console").rebind("DIAGNOSTICS");

// global rebinding
var 
  console=require("idiomatic-console").rebind("DIAGNOSTICS").lock(); 

// rebinding globally for the duration of an immediate function call
var 
  console=require("idiomatic-console"),
  api=require("api"),
  diagnostics=console.rebind(console.DIAGNOSTICS);
  diagnostics.with(function() { api.foo(); } );

// enabling a module to redirect its own console.log output to a file
var 
  logfile=fs.open("some.log", "w"),
  console=require("idiomatic-console").rebind({ log: logfile  });

// globally redirecting console.log output to a file
var 
  logfile=fs.open("some.log", "w"),
  console=require("idiomatic-console").rebind({ log: logfile }).lock();

// rebinding globally while calling an specific api
var 
  console=require("idiommatic-console),
  api=console.rebind("DIAGNOSTICS").encapsulate(require("api"));
  api.foo();
</pre>

DESCRIPTION
===========
idiomatic-console is a module that provides a private, rebindable console API.

Rebinding allows a module &/or top-level script to:

* obtain a private console API such that its own calls to console can be redirected to streams other than the platform default streams (.rebind())
* temporarily rebind the output of the global console API for the duration of calls into another module (.encapsulate())
* temporarily rebind the output of the global console API for the duration of an immediate function call (.with())
* avoid, where possible, assignments to global variables like console.log, that might reduce composability of node modules

Where necessary, it is also possible to permanently rebind all output from calls to the global console API to arbitrary output streams (.lock()). 
However, authors are encouraged to perform such permanent, global rebinding only in top-level scripts and modules, otherwise composability of such modules
will be compromised. Note also that at most one module can permanently replace the global console object at any given time - any other module that attempts
to do so will receive an exception.

HOW IT WORKS
============
The object returned by require("idiomatic-console") is a proxy for the global console API. In addition to the functions exported
by the global console API, the console API provided by idiomatic-console provides five additional functions:

* rebind
* unbind
* lock
* with
* encapsulate

rebind( { log: stream, info: stream, error: stream: warn: stream } | bindings-name)
-------------------------------------------------------------------
Produces a new console API instance such that calls to the specified console API functions have their output redirected to the
specified streams.

This call does not change the current global console object. Calls to this object will temporarily replace process.stderr and process.stdout for the
duration of the calls to the console object but no longer.

The bindings can be specified as an object whose properties specify which streams are used for which console API method. ALternatively a bindings-name
can be specified which must be the name of a binding property on the console object itself. This allows this idiom:
<pre>
var console=require("idiomatic-console").rebind("DIAGNOSTICS");
</pre>
instead of the more cumbersome:
<pre>
var console=require("idiomatic-console");
console=console.rebind(console.DIAGNOSTICS);
</pre>

unbind()
--------
Returns the parent console of the receiver. Can be used to undo the effects of a previous rebind. For example:

<pre>
var console=require("idiomatic-console");
console=console.rebind(console.DIAGNOSTIC);
try {
  // do something while the local console is rebound.
} finally {
  console=console.unbind();
}
</pre>

lock()
-----
Permanently rebind the global console object to the receiver. At most one module can perform this operation. Any other
module that attempts to will receive an exception. The intent of this behaviour is to discourage use of this method
by anything other than the top level script or module.

The result of a successful call to lock() is an unlock() function which can be used to restore the previous global console object. 

<pre>
var unlock=console.lock();

...

unlock(); // release the lock on the global console object.
</pre>

with(func() {})
---------------
Temporarily resets the global console variable to the receiver, executes the function, 
then restores the previous global console object.

encapsulate(api)
----------------
Produces a new API object in which all the methods of the API are replaced with functions 
that:

* push the current global console object onto a stack
* replace the global console object with the receiver
* invoke the method on the encapsulated API
* pop the previously pushed console object from the stack
* replace the global console object with the popped console object

Note that the encapsulation performed by this function is reasonably simplistic - only the top-level methods
are encapsulated. The results of methods returned from the API will not be encapsulated unless they are identical
to the receiver. Currently, deferred closures that execute asynchronously with respect to an encapsulated
method call will not be encapsulated, although this may change in future.

DIAGNOSTICS
-----------
An object that contains bindings that ensure output of the console API is rebound to stderr.

DATA
----
An object that contains bindings that represent the node defaults.

MOTIVATION
==========
The decision of node.js to bind the output of console.log() and console.info() to process.stdout brings 3 different idioms into conflict. 
The idioms are briefly described and then sources of conflict are discussed.

1. unix stdout is reserved for data and stderr for diagnostics
2. on other JavaScript platforms, such as browsers, console.log() and console.info() are typically used for diagnostic output
3. node scripts and modules tend to use console.log() as a means of writing data to stdout.

The conflict primarily arises because any JavaScript code written according to idiom #2 will tend to polute process.stdout with diagnostic info and so intefere
with any module that is writing data to stdout, following either idiom#1 or idiom#3.

Attempts to fix this by globally redirecting the output of console.log() to process.stderr may interfere with modules that expect to use console.log() 
to write to process.stdout, as per idiom#3.

Discouraging module authors from using console.log() and console.info() for diagnostic purposes annoys authors who expect to be able to use the console
API in a manner more consistent with idiom#2.

The intention of this module, then, is to provide an alternative console API with sufficient flexibility to allow module authors some control over where 
their own diagnostic output goes and some control over where the diagnostic output of other modules goes. With this API, module authors that really want to
use idiom#2 can do so, without interfering with modules that want to use idioms#1 or #3. Module authors that need to isolate themselves from the 
authors that insist on following idiom#2 using the global console API can do so, as required. Use of a private console API helps isolate 
rebinding decisions made by one author from decisions made by other authors thereby helping to reduce the possibility of composability problems
that would otherwise arise between modules that assign to shared global variables such as console.log.

The module also provides module authors who are only interested in idiom#3 with a mechanism to allow them to easily redirect the output of
console.log() and console.info() to other places, either temporarily for the duration of the node process.

EXAMPLES
========

<dl>
<dt><a href="/jonseymour/idiomatic-console/blob/master/example/with.js">examples/with.js</a></dt>
<dd>demonstrates use of the with method</dd>
<dt><a href="/jonseymour/idiomatic-console/blob/master/example/lock.js">examples/lock.js</a></dt>
<dd>demonstrates use of the lock method</dd>
<dt><a href="/jonseymour/idiomatic-console/blob/master/example/encapsulate.js">examples/encapsulate.js</a></dt>
<dd>demonstrates use of the encapsulate method</dd>
</dl>

RECOMMENDATIONS
===============
This section documents some recommendations about how to do I/O and diagnostics in node modules or JavaScript
code intended to be used with node. Note that some of these recommendations specifically recommend
against using idiomatic-console if possible, in favour of simpler solutions

* avoid using idiom#2 with node modules
* if you do use idiom#2 with node modules, use a private console object that respects idiom#1 to implement it
* if you discover a node module that does use idiom#2 with the global console object, try to get that module fixed
* avoid trying to manage the console output of other modules if possible
* if you are forced to manage the console output of other modules, use the .with() or .encapsulate() provided by an idiomatic-console private console API.
* restrict use of the idomatic-console lock() method to top-level modules and scripts
* consider using process.stdout directly for data, instead of console.log().
* never use console.info() for data.

Ironically, idomatic-console works best in an eco-system in which most modules do not themselves use idiomatic-console. 
The reason is that global interception of console API calls becomes more difficult when each module is bound to its own private console API and
there are some uses cases for idiomatic-console where global interception is exactly what is needed. Future versions of idiomatic-console
may provide a solution for this dilemma.

REVISIONS
=========
<dl>
<dt>v0.0.8</dt>
<dd>Remove push() and pop() methods. Add lock() method. Ensure bindings are inherited from parent</dd>
<dt>v0.0.7</dt>
<dd>Fix errors in repository and home page names.</dd>
<dt>v0.0.6</dt>
<dd>Renamed from idomatic-stdio to idiomatic-console. Refactored to provided a rebindable console.</dd>
<dt>v0.0.5</dt>
<dd>added console.options() function to specify the idiom to be used</dd>
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
[http://github.com/jonseymour/idiomatic-console/](http://github.com/jonseymour/idiomatic-console/)

GIT
===
git@github.com:jonseymour/idiomatic-console.git

AUTHOR
======
Copyright(C) Jon Seymour 2011.