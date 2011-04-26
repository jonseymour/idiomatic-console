var 
     SELECTORS = {
	 log: process._console_selector ? process._console_selector : 'stdout',
	 info: process._console_selector ? process._console_selector : 'stdout',
	 warn: 'stderr',
	 error: 'stderr'
     },
     STACK = [ console ];

function interceptor(member, binding)
{
    return function() {
	var save = process[SELECTORS[member]];
	process[SELECTORS[member]] = binding;
	try {
	    STACK[0][member].apply(STACK[0], arguments);
	} finally {
	    process[SELECTORS[member]] = save;
	}
    };
}

function API(bindings, parent) {
    for (s in SELECTORS) {
	this[s] = parent ? parent[s] : STACK[0][s];
    }
    for (b in bindings) {
	this[b] = interceptor(b, bindings[b]);
    }
    return this;  
};

API.prototype = console;

API.prototype.with = function (func) {
    this.push();
    try {
	return func();
    } finally {
	this.pop();
    }
};

API.prototype.encapsulate = function (api) {
    if (!process) {
	return api;
    }
    
    var self=this;

    function constructor() { }

    constructor.prototype = api;

    var encapsulated = new constructor();
    for (p in api) {
	if (api[p] instanceof Function) {
	    encapsulated[p] = function() {
		var args = arguments;
		var target = this === encapsulated ? api : this;
		return API.prototype.with.call(
		    self,
                    function() {
			return api[p].apply(target, args);
		    }
                );
	    };
	}
    }
    return encapsulated;
};


API.prototype.rebind = function(bindings) {
    var 
    self = this,
    api;

    bindings = bindings instanceof String ? this[bindings] : bindings;
    api = new API(bindings, this);

    api.unbind = function() {
	return self;
    };

    return api;
};

API.prototype.push = function() {
    STACK.push(console);
    console = this;
    return this;
};

API.prototype.pop = function()
{
    if (this !== console) {
	throw new Error("pop applied to wrong element");
    }
    if (STACK.length == 1) {
	throw new Error("too many pops");
    }
    console=STACK.pop();
};

API.prototype.DIAGNOSTICS = {
    log: process.stderr,
    info: process.stderr
};

API.prototype.DATA = {
    log: process.stdout,
    info: process.stdout
};

module.exports = new API({}, STACK[0]);
