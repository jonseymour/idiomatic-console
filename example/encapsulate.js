var console=require("idiomatic-console");
var imported=console.rebind(console.DIAGNOSTICS).encapsulate(require("./imported.js"));

imported.foo("log", "stderr", "encapsulated");