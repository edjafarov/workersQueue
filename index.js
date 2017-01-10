const debug = require('debug')('wqueue:');

module.exports = class WorkersQueue {
  constructor(concurrentWorkers) {
    this.pendingTasks = [];
    this.concurrentWorkers = concurrentWorkers;
    this.running = Array.apply(null, {
      length: concurrentWorkers.length
    });

    debug(`initialize with ${this.concurrentWorkers.length} workers`);
  }
  addTask(task) {
    return new Promise((resolve, reject) => {
      debug('add task');
      const taskWrapper = {
        task,
        promise: {
          resolve,
          reject
        }
      };

      this.pendingTasks.push(taskWrapper);
      if (this.pendingTasks.length > 1) return;
      let freeWorkers = this.running.reduce((result, w, i) => {
        !w && result.push(i);
        return result;
      }, []);
      debug(`have ${freeWorkers.length} free workers`);
      if (freeWorkers.length) {
        let randomWorkerNumber = freeWorkers[Math.floor(Math.random() * freeWorkers.length)];
        this.runTaskInWorker(randomWorkerNumber);
      }
    });
  }
  runTaskInWorker(number) {
    debug(`run task from ${this.pendingTasks.length} in ${number} worker`);
    this.running[number] = true;
    const taskWrapper = this.pendingTasks.shift();

    Promise.resolve(taskWrapper.task)
      .then(this.concurrentWorkers[number])
      .then(this.resolveTask(taskWrapper)) //resolve task
      .then(() => { this.running[number] = false; }) //stop worker
      .then(() => {
        if (this.pendingTasks.length > 0) { //if more tasks in worker
          this.runTaskInWorker.call(this, number);
        }
      })
      .catch((e) => {
        this.running[number] = false;
        this.rejectTask(taskWrapper)(e);
      });
  }
  rejectTask(taskWrapper) {
    return (result) => {
      debug(`${JSON.stringify(taskWrapper)} task rejected`);
      taskWrapper.promise.reject(result);
      return result;
    };
  }
  resolveTask(taskWrapper) {
    return (result) => {
      debug('task executed');
      taskWrapper.promise.resolve(result);
      return result;
    };
  }
};
