var console=require("idiomatic-console");
var imported=require("./imported.js");

console.rebind(console.DIAGNOSTICS).with(function() { imported.foo('log', 'stderr', "global console temporarily reassigned by with"); });
