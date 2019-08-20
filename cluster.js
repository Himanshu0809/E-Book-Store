var cluster = require("cluster");

if (cluster.isMaster) {
    //count the number of CPU machines
    var cpuCount = require("os").cpus().length;

    //create a worker for each cpu
    for (var i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }

    //listen for dying workers
    cluster.on("exit", function () {
        cluster.fork();
    });
} else {
    require("./app");
}