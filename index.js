var bergson = require("bergson");
var fluid = require("infusion");

fluid.defaults("fluid.modelChangeScheduler", {
    gradeNames: ["fluid.modelComponent"],
    model: {
        queue: [],
        currentItem: null
    },
    listeners: {
        "{scheduler}.clock.events.onTick": {
            namespace: "processQueue",
            funcName: "{that}.processQueue",
            arguments: "{that}.model.queue"
        }
    },
    modelListeners: {
        queue: {
            funcName: "fluid.modelChangeScheduler.manageScheduler",
            args: ["{that}.model.queue", "{scheduler}"]
        },
        currentItem: {
            funcName: "fluid.modelChangeScheduler.processCurrentItem",
            args: ["{that}", "{that}.model.currentItem"]
        }
    },
    invokers: {
        "processQueue": {
            funcName: "fluid.modelChangeScheduler.processQueue",
            args: ["{that}", "{that}.model.queue", "{that}.model.currentItem"]
        }
    },
    components: {
        scheduler: {
            type: "berg.scheduler",
            options: {
                components: {
                    clock: {
                        type: "berg.clock.setInterval"
                    }
                }
            }
        }
    }
});

fluid.modelChangeScheduler.processQueue = function (modelChangeScheduler, queue, currentItem) {
    // Move first item from queue into current item
    if(!currentItem) {
        var newQueue = fluid.copy(queue);
        var newCurrentItem = newQueue.shift();
        modelChangeScheduler.applier.change("currentItem", newCurrentItem);
        modelChangeScheduler.applier.change("queue", newQueue);
    } else {
        // Current item has not completed processing, do nothing
    }
};

fluid.modelChangeScheduler.manageScheduler = function (queue, scheduler) {
    console.log("QUEUE LENGTH: " + queue.length)
    if(queue.length > 0) {
        scheduler.start();
    } else {
        scheduler.stop();
    }
};

fluid.modelChangeScheduler.processCurrentItem = function (modelChangeScheduler, currentItem) {
    if(currentItem){
        console.log("CURRENT ITEM: " + currentItem);
        modelChangeScheduler.scheduler.schedule({
            type: "once",
            time: currentItem,
            callback: function (now) {
                console.log("Deleting currentItem after " + currentItem + " seconds.");
                modelChangeScheduler.applier.change("currentItem", null, "DELETE");
            }
        });
    }
};

var modelChangeScheduler = fluid.modelChangeScheduler();

modelChangeScheduler.applier.change("queue", [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
