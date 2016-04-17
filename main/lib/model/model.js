
"use strict";

function Model() {

}

Model.prototype.init = function(data) {
    if (data) {
        for (let attr in data) {
            if (this.hasOwnProperty(attr)) {
                this[attr] = data[attr];
            }
        }
    }    
};

module.exports = Model;