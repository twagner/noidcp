var Repository = require('./lib/repository/memory'),
    User = require('./lib/model/user');


var repo = new Repository("dd");

console.log("Repository " + repo.type);
var u = new User();
u.id = 1;

repo.add(u);

