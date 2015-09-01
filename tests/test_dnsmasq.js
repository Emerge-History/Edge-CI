var config = require("../configuration/config");
var conf_name = "dnsmasq";

var confs = config.read(conf_name);
console.log(confs);

console.log("Writing conf...");
config.write(conf_name, {}, function(){
    console.log("DONE");
});