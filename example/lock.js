var 
console=require("idiomatic-console").rebind("DIAGNOSTICS");
imported=require("./imported.js");

var unlock = console.lock();
try {
    imported.foo("log", "stderr", "after lock");
} finally {
    unlock();
}

imported.foo("log", "stdout", "after unlock");


