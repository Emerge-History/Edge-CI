var fs = require("fs");
var path = require("path");
var fsextra = require("fs-extra");

var root_path = process.env.ROOT_PATH || path.join(__dirname, "..");
var mapping = require(path.join(root_path, "configuration/mapping.json"));
var config_dir = path.join(root_path, "configuration/bases");
var new_line = "\n";

function __base_file_by_conf_name(conf_name) {
    if(!mapping.hasOwnProperty(conf_name)) {
        throw new Error("Unsupported config type: " + conf_name);
    }
    return path.join(config_dir, mapping[conf_name].base);
}
function __to_file_by_conf_name(conf_name) {
    if(!mapping.hasOwnProperty(conf_name)) {
        throw new Error("Unsupported config type: " + conf_name);
    }
    return mapping[conf_name].to;
}
function __conf_from_file(conf_name) {
    return fs.readFileSync(__base_file_by_conf_name(conf_name)).toString();
}
function __parse_rows(conf_name) {
    var conf = __conf_from_file(conf_name);
    var rows = conf.trim(new_line).split(new_line);
    var splitter = mapping[conf_name].splitter;
    var confs = {};
    for(var i in rows) {
        var parts = rows[i].split(splitter);
        confs[parts[0]] = confs[parts[0]] || [];
        confs[parts[0]].push(parts.length > 1 ? parts[1] : parts[0]);
    }
    return confs;
}

function from_base(conf_name){
    return __parse_rows(conf_name);
}

/**
 * @param conf_name
 * @param configs : Array : { k: [v, v, v] }
 */
function write_to(conf_name, configs, cb) {
    var rows = [];
    var splitter = mapping[conf_name].splitter;
    var confs = __parse_rows(conf_name);
    for(var k in confs) {
        for(var i = 0, len = confs[k].length; i < len; i++) {
            rows.push(k + splitter + confs[k][i]);
        }
    }
    for(var k in configs) {
        if(!confs.hasOwnProperty(k)) {//overwrite was disabled
            for(var i = 0, len = configs[k].length; i < len; i++) {
                rows.push(k + splitter + configs[k][i]);
            }
        }
    }
    var file_path = __to_file_by_conf_name(conf_name);
    var dir = path.dirname(file_path);
    if(!fs.existsSync(dir))
        fsextra.mkdirsSync(dir);
    cb = cb || function(){};
    fs.writeFile(file_path, rows.join(new_line), cb);
}

module.exports.read = from_base;
module.exports.write = write_to;