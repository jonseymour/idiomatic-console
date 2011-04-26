var 
console=require("idiomatic-console").rebind("DIAGNOSTICS").push();
imported=require("./imported.js");

imported.foo("log", "stderr", "after push");


