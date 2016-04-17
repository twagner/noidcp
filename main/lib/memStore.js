"use strict";

const _ = require('underscore'),
    Q = require('q');

function MemoryStore (keyTest, data) {
    this.store = data || [];
    // a function
    this.keyTest = keyTest;

}

MemoryStore.prototype.add = function(o) {
    var self = this;
    return Q.fcall(
        function() {
            self.store.push(o);
            return o;
        }
    );
};

MemoryStore.prototype.get = function(id) {
    var self = this;
    return Q.fcall(
        function() {
            return _.find(self.store, function(o) {
                if (self.keyTest(o, id)) {
                    return o;
                }
            });
        }
    );
};

module.exports = MemoryStore;
