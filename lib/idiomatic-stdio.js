(function() {

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
	platform: c[member].platform ? c[member].platform : c[member],
        parent: c[member]
    };

    function rebound() {
	try {
	    var save=process.stdout;

	    process.stdout=stream;
	    frame.platform.apply(c, arguments);
	} finally {
	    process.stdout=save;
	}
    }

    rebound.frame = frame;

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

    if (c[member].frame) {
	c[member] = c[member].frame.parent;
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

if (console) {
    exports.console = {};
    for (p in console) {
	exports.console[p]=console[p];
    }
    rebind(process.stderr, exports.console);
}

function encapsulate(api, stream, c) {
    if (!process) {
	return api;
    }
    stream = stream || process.stderr;
    c = c || console;

    function constructor() {
    }

    constructor.prototype = api.prototype;

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
	} else {
            if (encapsulated[p] !== api[p]) {
		encapsulated[p] = api[p];
	    }
	}
    }
    return encapsulated;
}

exports.unbind = unbind;
exports.rebind = rebind;
exports.with = _with;
exports.encapsulate = encapsulate;

})();