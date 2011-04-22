(function() {

// process._console_selector is defined if --console-to-stderr has been
// specified on node command line

var SELECTOR=process._console_selector || 'stdout';

function bind_member(member, stream, c) {
    c = c || console;
    stream = stream || process.stderr;

    if (!member) {
	throw new Error('member argument must be specified');
    }

    if (!c) {
	return;
    }

    if (!(c[member] instanceof Function)) {
	throw new Error('console['+member+'] must be a function');
    }

    var frame={
	platform: c[member]._frame ? c[member]._frame.platform : c[member],
        parent: c[member]
    };

    function rebound() {
	try {
	    var save=process[SELECTOR];

	    process[SELECTOR]=stream;
	    frame.platform.apply(c, arguments);
	} finally {
	    process[SELECTOR]=save;
	}
    }

    rebound._frame = frame;

    c[member] = rebound;
};

function rebind(stream, c)
{
    if (!process) {
	return; // rebinding not possible without a process object
    }
    c = c || console;
    bind_member('log', stream, c);
    bind_member('info', stream, c);
};

function unbind_member(member, c)
{
    c = c || console;

    if (!c || !member || ! c[member]) {
	return;
    }

    if (c[member]._frame) {
	c[member] = c[member]._frame.parent;
    }
}

function unbind(c)
{
    if (!process) {
	return; // rebinding not possible without a process object
    }
    unbind_member('log', c);
    unbind_member('info', c);
};

function _with(func, stream, console) {
    rebind(stream, console);
    try {
	return func();
    } finally {
	unbind(console);
    }
};

function encapsulate(api, stream, c) {
    if (!process) {
	return api;
    }
    stream = stream || process.stderr;
    c = c || console;

    function constructor() {
    }

    constructor.prototype = api;

    var encapsulated = new constructor();
    for (p in api) {
	if (api[p] instanceof Function) {
	    encapsulated[p] = function() {
		var target = this === encapsulated ? api : this;
		return _with(
                    function() {
			return api[p].apply(target, arguments);
		    },
		    stream,
		    c
                );
	    };
	}
    }
    return encapsulated;
}

if (console) {
    exports.console = {};
    for (p in console) {
	exports.console[p]=console[p];
    }
    rebind(process.stderr, exports.console);
}

exports.unbind = unbind;
exports.rebind = rebind;
exports.with = _with;
exports.encapsulate = encapsulate;

})();