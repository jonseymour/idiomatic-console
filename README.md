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
  console=require("idiomatic-console").rebind("DIAGNOSTICS").push(); 

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
  console=require("idiomatic-console").rebind({ log: logfile }).push();

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

Where necessary, it is also possible to permanently rebind all output from calls to the global console API to arbtirary output streams (.push()). 
However, authors are encouraged to perform such permanent, global rebinding only in top-level scripts and modules, otherwise composability of the module
will be compromised.

HOW IT WORKS
============
The object returned by require("idiomatic-console") is a proxy for the global console API. In addition to the functions exported
by the global console API, the console API provided by idiomatic-console provides five additional functions:

* rebind
* push
* pop
* with
* encapsulate

rebind( { log: stream, info: stream, error: stream: warn: stream })
-------------------------------------------------------------------
Produces a new console API instance such that calls to the specified console API functions have their output redirected to the
specified streams.

This call does not change the current console API. Calls to this object will temporarily replace process.stderr and process.stdout for the
duration of the calls to the console API but no longer.

push()
-----
Pushes the current value of the global console onto a stack, then sets the global console variable to refer to the receiver.

Unless this call is matched with a pop() this call will cause the identity of the global console API to be changed permanently.

In general, this call should only ever be called from top-level scripts and modules. Doing so from other modules will 
inhibit the composability of those modules. If you need to temporarily change the global console use either 
with() or encapsulate() according to the need.

pop()
-----
Pops the previous global console API from the stack and assigns it to the global console variable. 
This call must only be performed on the current global console variable.

with(func() {})
---------------
Temporarily resets the global console variable to the receiver, executes the function, 
then restores the original global console variable. Equivalent to:

<pre>
console.push();
try {
    func();
} finally {
    console.pop();
}
</pre>

encapsulate(api)
----------------
Produces a new API object in which all thet methods of the API are replaced with functions that do the equivalent of:

<pre>
console.push();
try {	 
    api.method.apply(api, arguments);
} finally {
    console.pop();
}
</pre>

Note that the encapsulation performed by this function is reasonably simplistic - only the top-level methods
are encapsulated. The results of methods returned from the API will not be encapsulated, nor will the 
any deferred closures that are scheduled to execute asychronously with respect to the encapsulated method calls.

MOTATIVATION
============
The decision of node.js to bind the output of console.log() and console.info() to process.stdout brings 3 different idioms into conflict. 
The idioms are explained and then sources of conflict are discussed.

1. unix stdout is reserved for data and stderr for diagnostics
2. on other JavaScript platforms, such as browsers console.log() and console.info() are typically used for diagnostic output
3. node programs tend to use console.log() when the intent is to write data to process.stdout

The conflict primarily arises because any JavaScript code written according to idiom #2 will tend to polute process.stdout with diagnostic info which will intefere
with any module that is writing data to stdout, following either idiom#1 or idiom#3.

Attempts to fix this by globally redirecting the output of console.log() to process.stdout may interfere with modules that use console.log() 
to write to process.stdout, as per idiom#3.

Discouraging module authors from using console.log() and console.info() for diagnostic info annoys authors who expect to be able to use the console
API in a manner more consistent with idiom#2.

The intention of this module, then, is to provide an alternative console API with sufficient flexibility to allow module authors some control over where 
their own diagnostic output goes and some control over where the diagnostic output of other modules goes. With this API, module authors that really want to
use idiom#2 can do so, without interfering with modules that want to use idioms#1 or #3. Module authors that need to isolate themselves from the 
authors that insist on following idiom#2 using the global console API can do so, as required. Use of a private console API helps isolate 
rebinding decisions made by one author from decisions made by other authors thereby helping to reduce the possibility of composability problems
that would otherwise arise between modules that assign to shared global variables such as console.log.

The module also provides module authors who are only interested in idiom#3 with a mechanism to allow them to easily redirect the output of
console.log() and console.info() to other places, either temporarily for the duration of the node process.

REVISIONS
=========
<dl>
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