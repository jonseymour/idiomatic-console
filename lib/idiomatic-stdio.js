exports.rebind=function(console)
{
  console.log=(function() {
    var orig=console.log;
      return function() {

	try {
	  var tmp=process.stdout;
	  process.stdout=process.stderr;
	  orig.apply(console, arguments);
	} finally {

	  process.stdout=tmp;
	}
      };
    })();

  console.info=(function() {
    var
      orig=console.info;
      return function() {
	try {
	  var tmp=process.stdout;
	  process.stdout=process.stderr;
	  orig.apply(console, arguments);
	} finally {
	  process.stdout=tmp;
	}
      };
    })();
};


