/**
 * Created by twagner on 5/01/16.
 */
"use strict";


function Service(db, constructor, idProperty) {
    this._db = db;
    this._constructor = constructor;
    this._idProperty = idProperty;
}

Service.prototype.add = function(o) {
    const self = this;
    const id = o[this._idProperty];
    console.log('Service#add: add object with id: ' + id);
    return this._db.put(id, o).then(function() {
        return o;
    });
};

Service.prototype.remove = function(o) {
    const id = o[this._idProperty];
    console.log('Service#remove: remove object with id: ' + id);
    return this._db.del(id);
};

Service.prototype.findById = function(id) {
    const self = this;
    console.log('Service#findById: find object with id: ' + id);
    return this._db.get(id).then(function(data) {
        return new self._constructor(data);
    });
};

module.exports = Service;