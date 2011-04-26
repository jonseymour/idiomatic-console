exports.foo=function(descriptor, expected, message) {
    console[descriptor](JSON.stringify({ expectedDescriptor: descriptor, expectedStream: expected, message: message}));
};
