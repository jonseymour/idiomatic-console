(function() {
     function capture(c)
     {
	 c = c || console;
         return {
             log: c.log,
             info: c.info,
             stdout: process.stdout,
             stderr: process.stderr
         };
     }

     function restore(save, c) {
	 c = c || console;
         c.log = save.log;
         c.info = save.info;
         process.stdout = save.stdout;
         process.stderr = save.stderr;
     }

     function checkProcess(state1, state2) {
         assert.strictEqual(state1.stdout, state2.stdout, "process.stdout");
         assert.strictEqual(state1.stderr, state2.stderr, "process.stderr");

     }

     function check(state1, state2) {
         assert.strictEqual(state1.log, state2.log, "console.log");
         assert.strictEqual(state1.info, state2.info, "console.info");
         checkProcess(state1, state2);
     }

     var
     assert=require("assert"),
     idiomatic=require("../lib/idiomatic-stdio"),
     calls=[];

     function wrap(func, c) {
         c = c || console;
         return function() {
             var save=capture(c);
             try {
                 c.log = function() { calls.push( { member: 'log', stdout: process.stdout } ); };
                 c.info = function() { calls.push( { member: 'info', stdout: process.stdout } ); };
                 func();
             } finally {
                 restore(save,c);
             }
         };
     };

    exports["with restores process.stdout"] = wrap(function() {
        original=capture();
        idiomatic.with(
            function() {
                console.log("inside with");
            });

        check(original, capture());
    });

     exports["api example"] = wrap(function() {

         original=capture();
         idiomatic.rebind();
         console.log("log while rebound");
         assert.strictEqual(original.stderr, calls.pop().stdout);
         console.info("info while rebound");
         assert.strictEqual(original.stderr, calls.pop().stdout);
         idiomatic.unbind();

         console.log("log while unbound");
         console.info("info while unbound");

         var api={
             foo: function() {
                 checkProcess(original, capture());
                 console.log("api.foo expects to console.log to write to stdout, so let it");
                 assert.strictEqual(original.stdout, calls.pop().stdout);
                 checkProcess(original, capture());
             }
         };

         idiomatic.with(function() {
                            console.log('with() can be used to rebind console.log() for the duration of a function call');
                            assert.strictEqual(original.stderr, calls.pop().stdout);
                            console.info('and console.info() too');
                            assert.strictEqual(original.stderr, calls.pop().stdout);
                        });

         check(original, capture());

         console.log("after with(), console.log() should write to stdout again");
         assert.strictEqual(original.stdout, calls.pop().stdout);

         check(original, capture());

         idiomatic.rebind();
         idiomatic.encapsulate(api, process.stdout).foo();
         idiomatic.unbind();

         console.log("after unbind");
         assert.strictEqual(original.stdout, calls.pop().stdout);

         check(original, capture());
     });
     exports["options"] =
	wrap(function() {
	     var
	     console=idiomatic.console.options({idiom: 'diagnostics'}),
	     original=capture(console);
	     console.log("idiomatic diagnostics call");
	     assert.strictEqual(original.stderr, calls.pop().stdout);
	 }, idiomatic.console);
})();
