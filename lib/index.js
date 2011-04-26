var 
     SELECTORS = {
	 log: process._console_selector ? process._console_selector : 'stdout',
	 info: process._console_selector ? process._console_selector : 'stdout',
	 warn: 'stderr',
	 error: 'stderr'
     },
     DIAGNOSTICS = {
	    log: process.stderr,
	    info: process.stderr
     },
     DATA = {
	    log: process.stdout,
	    info: process.stdout
     },
     UNLOCKER = null,
     STACK = [ console ];

function interceptor(member, binding)
{
    return function() {
	var save = process[SELECTORS[member]];
	process[SELECTORS[member]] = binding;
	try {
	    return STACK[0][member].apply(STACK[0], arguments);
	} finally {
	    process[SELECTORS[member]] = save;
	}
    };
}

function curryreceiver(receiver, m) {
    return function() {
	return receiver[m].apply(receiver, arguments);
    };
}

function impl(bindings)
{
    var m,b;
    this._api = {
	with: this.wrapper('with'),
	encapsulate: this.wrapper('encapsulate'),
	lock: this.wrapper('lock'),
	rebind: this.wrapper('rebind'),
	unbind: this.wrapper('unbind'),
	DIAGNOSTICS: DIAGNOSTICS,
	DATA: DATA
    };
    for (m in STACK[0]) {
	if (STACK[0][m] instanceof Function) {
	    this._api[m] = curryreceiver(this, m);
	} 
    }
    for (b in bindings) {
	this._api[b] = interceptor(b, bindings[b]);
    }
    this.bindings = bindings;
    return this;
}

impl.prototype = console;

impl.prototype.wrapper = function(method)
{
    var self = this;
    return function() {
	var obj = self[method].apply(self, arguments);
	return obj && obj.api ? obj.api() : obj;
    };
};

impl.prototype.with = function (func) {
    this.push();
    try {
	return func();
    } finally {
	this.pop();
    }
};

impl.prototype.encapsulate = function (api) {

    var self=this;

    function constructor() { }

    constructor.prototype = api;

    var encapsulated = new constructor();

    for (p in api) {
	if (api[p] instanceof Function) {
	    encapsulated[p] = function() {
		var args = arguments;
		var target = this === encapsulated ? api : this;
		return impl.prototype.with.call(
		    self,
                    function() {
			var result = api[p].apply(target, args);
			return result === api ? encapsulated : result;
		    }
                );
	    };
	}
    }
    return encapsulated;
};


impl.prototype.rebind = function(bindings) {
    var 
    self = this,
    merge = {},
    rebound;

    bindings = typeof bindings == 'string' ? this._api[bindings] : bindings;

    for (b in this.bindings) {
	merge[b] = this.bindings[b];
    }

    for (b in bindings) {
	merge[b] = bindings[b];
    }

    rebound = new impl(merge);

    rebound.unbind = function() {
	return self;
    };

    return rebound;
};


impl.prototype.api = function()
{
    return this._api;
};

impl.prototype.push = function() {
    STACK.push(console);
    console = this.api();
    return this;
};

impl.prototype.pop = function()
{
    if (this.api() !== console) {
	throw new Error("pop applied to wrong element");
    }
    if (STACK.length == 1) {
	throw new Error("too many pops");
    }
    console=STACK.pop();
};

impl.prototype.lock = function()
{
    var self = this;

    if (UNLOCKER) {
	throw new Error("already locked");
    }

    var unlocker = function() {
	if (unlocker === UNLOCKER) {
	    UNLOCKER = null;
	    self.pop();
	} else {
	    throw new Error("already unlocked");
	}
    };
    UNLOCKER = unlocker;
    this.push();
    return unlocker;
};

module.exports = new impl({}).api();
