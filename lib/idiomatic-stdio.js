var
  stack = [];

exports.rebind = function(stream, aConsole)
{

  aConsole = aConsole || console;

  var frame = {
    log: {
      previous: aConsole.log,
      original: aConsole.log.frame ? aConsole.log.frame.original : aConsole.log
    },
    info: {
      previous: aConsole.info,
      original: aConsole.info.frame ? aConsole.info.frame.original : aConsole.info
    }
  };

  aConsole.log = function() {
    try {
      var
	save=process.stdout;

      process.stdout=stream;
      frame.log.original.apply(aConsole, arguments);
    } finally {
      process.stdout=save;
    }
  };
  aConsole.log.frame = frame.log;

  aConsole.info = function() {
    try {
      var
	save=process.stdout;

      process.stdout=stream;
      frame.info.original.apply(aConsole, arguments);
    } finally {
      process.stdout=save;
    }
  };
  aConsole.info.frame = frame.info;

};

exports.unbind = function(aConsole)
{
  aConsole = aConsole || console;
  if (aConsole.log.frame) {
    aConsole.log = aConsole.log.frame.previous;
  }
  if (aConsole.info.frame) {
    aConsole.info = aConsole.info.frame.previous;
  }
};

exports.with = function(func, stream, console) {
  exports.rebind(stream, console);
  try {
    func();
  } finally {
    exports.unbind();
  }
};

