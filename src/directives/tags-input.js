(function() {
'use strict';
var KEYS = {
    backspace: 8,
    tab: 9,
    enter: 13,
    escape: 27,
    space: 32,
    up: 38,
    down: 40,
    left: 37,
    right: 39,
    delete: 46,
    comma: 188
};

var MAX_SAFE_INTEGER = 9007199254740991;
var SUPPORTED_INPUT_TYPES = ['text', 'email', 'url'];
angular.module('ui.tags', [])
//global configuration settings & initialize options from HTML attributes
.provider('tagsInputConfig', function() {
    var globalDefaults = {},
        interpolationStatus = {},
        autosizeThreshold = 3;

    this.setDefaults = function(directive, defaults) {
        globalDefaults[directive] = defaults;
        return this;
    };
    this.setActiveInterpolation = function(directive, options) {
        interpolationStatus[directive] = options;
        return this;
    };
    this.$get = ["$interpolate", function($interpolate) {
    var converters = {};
    converters[String] = function(value) { return value; };
    converters[Number] = function(value) { return parseInt(value, 10); };
    converters[Boolean] = function(value) { return value.toLowerCase() === 'true'; };
    converters[RegExp] = function(value) { return new RegExp(value); };

    return {
        load: function(directive, scope, attrs, options) {
            var defaultValidator = function() { return true; };

            scope.options = {};

            angular.forEach(options, function(value, key) {
                var type, localDefault, validator, converter, getDefault, updateValue;

                type = value[0];
                localDefault = value[1];
                validator = value[2] || defaultValidator;
                converter = converters[type];

                getDefault = function() {
                    var globalValue = globalDefaults[directive] && globalDefaults[directive][key];
                    return angular.isDefined(globalValue) ? globalValue : localDefault;
                };

                updateValue = function(value) {
                    scope.options[key] = value && validator(value) ? converter(value) : getDefault();
                };

                if (interpolationStatus[directive] && interpolationStatus[directive][key]) {
                    attrs.$observe(key, function(value) {
                        updateValue(value);
                        scope.events.trigger('option-change', { name: key, newValue: value });
                    });
                }
                else {
                    updateValue(attrs[key] && $interpolate(attrs[key])(scope.$parent));
                }
            });
         }
        };
    }];
});
}());