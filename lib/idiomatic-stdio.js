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
	tmp=process.stdout;

      process.stdout=stream;
      frame.log.original.apply(aConsole, arguments);
    } finally {
      process.stdout=tmp;
    }
  };
  aConsole.log.frame = frame.info;

  aConsole.info = function() {
    try {
      var
	tmp=process.stdout;

      process.stdout=stream;
      frame.info.original.apply(aConsole, arguments);
    } finally {
      process.stdout=tmp;
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

exports.with = function(thunk, stream, console) {
  exports.rebind(stream, console);
  try {
    thunk();
  } finally {
    exports.unbind();
  }
};

