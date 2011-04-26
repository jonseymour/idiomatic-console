NAME
====
idiomatic-console - provides replacements for the global console object that support different diagnostic idioms.

SYNOPSIS
========
	// local rebinding
	var console=require("idiomatic-console").rebind("DIAGNOSTICS");

	// global rebinding
	var console=require("idiomatic-console").rebind("DIAGNOSTICS").push(); 

	// rebinding globally while calling an api
	var console=require("idiommatic-console),
	    api=console.rebind("DIAGNOSTICS").encapsulate(require("api"));

        // rebinding globally for the duration of an immediate function call
	var console=require("idiomatic-console"),
	    api=require("api"),
	    diagnostics=console.rebind(console.DIAGNOSTICS);
	    diagnostics.with(function() { api.foo(); } );

        // enabling a module to redirect its own console.log output to a file
        var logfile=fs.open("some.log", "w"),
            console.require("idiomatic-console").rebind({ log: logfile  });

	// globally redirecting console.log output to a file
        var logfile=fs.open("some.log", "w"),
	    console.require("idiomatic-console").rebind({ log: logfile }).push();


DESCRIPTION
===========
idiomatic-console is a module that provides an rebindable console API.

Rebinding allows a module &/or top-level script to:

* obtain private console API such that its own calls to console can be redirected to streams other than the platform default streams (.rebind())
* rebind the output of the console API for the duration of calls into another module (.encapsulate())
* rebind the output of the console API for the duration of an immediate function call (.with())
* globally rebind all calls to the console API to streams of the script's choosing (.push())
* avoid, where possible, assignments to global variables like console.log, that might reduce composability of node modules

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
authors that insist on following idiom#2 using the global console API can do so, as required. Use of the private console API helps isolate 
rebinding decisions made by one author from decisions made by other authors.

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