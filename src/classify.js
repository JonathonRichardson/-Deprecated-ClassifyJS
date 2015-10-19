var ko;
try {
    ko = require('knockout');
}
catch(error) {
    // Do nothing.
}

Classify.newClass = function(config) {
    var newObject = function(constructorConfig) {
        var self = this;

        // First, call the parent constructor, if one exists.
        if (('parent' in this) && ('_innerConstructor' in this.parent)) {
            this.parent._innerConstructor.call(this, constructorConfig);
        }

        // Now, call the passed in constructor for this object
        if ('_innerConstructor' in this) {
            this._innerConstructor.call(this, constructorConfig);
        }

        // Only support computed methods if knockout has been loaded
        if (!_.isUndefined(ko) && !_.isUndefined(self._ko_computeds) && _.isArray(self._ko_computeds)) {
            $.each(self._ko_computeds, function (key, value) {
                var functionToWrap;
                var subscription;

                if (_.isFunction(value)) {
                    functionToWrap = value;
                }
                else if (_.keys(value).length > 0) {
                    if ('function' in value) {
                        functionToWrap = value.function;
                    }
                    if ('subscription' in value) {
                        subscription = value.subscription;
                    }
                }
                else {
                    return;
                }

                var wrappedMethod = function () {
                    var returnVal;
                    try {
                        returnVal = functionToWrap.call(self, arguments);
                    }
                    catch (err) {
                        return undefined;
                    }
                    return returnVal;
                };
                self[key] = ko.computed(wrappedMethod, self);

                if (_.isFunction(subscription)) {
                    self[key].subscribe(function() {
                        subscription.apply(self, arguments);
                    });
                }
            });
        }
    };

    // Apply the parent
    if ('parent' in config) {
        newObject.prototype = Object.create(config.parent.prototype);
        newObject.prototype.parent = Object.create(config.parent.prototype);
    }

    // Define the constructor
    newObject.prototype.constructor = newObject;
    if (typeof config.constructor === 'function') {
        newObject.prototype._innerConstructor = config.constructor;
    }

    // Handle computed methods, including merging with parent computed methods.
    var computeds = {};
    if ('computeds' in config) {
        computeds = config.computeds;
    }
    if (('parent' in newObject.prototype) && ( '_ko_computeds' in newObject.prototype.parent )) {
        computeds = _.extend(newObject.prototype.parent._ko_computeds, computeds);
    }
    newObject.prototype._ko_computeds = computeds;

    // Give the prototype a method to add methods and add it to the new object directly, so that it
    // can be accessed later in this function.
    newObject.addMethod = function(name, method) {
        this.prototype[name] = method;
    };
    newObject.prototype.addMethod = newObject.addMethod;

    // Add all of the configured methods to the object prototype.
    if ('methods' in config) {
        $.each(config.methods, function(key, value) {
            newObject.addMethod(key, value);
        });
    }

    return newObject;
};

Classify.IInterfacify = Classify.newClass({
    constructor: function(config) {
        //TODO: Implement a requirement property for the config object, to allow
        //      Interfaces to specify methods or properties that they need.
    },
    methods: {
        applyTo: function(thingToInterfacify) {
            var self = this;

            /* Apply all the properties of this interface to the new object */
            $.each(_.keys(self), function(index, property) {
                //  TODO:  Add error checking/warning to see if we're clobbering anything on the object
                if ( (!property.match(/^_/)) && (property !== 'applyTo') ) {
                    thingToInterfacify.prototype[property] = self[property];
                }
            });
        }
    }
});

Classify.Version = '{{VERSION}}';
