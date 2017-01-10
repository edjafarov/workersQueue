# workersQueue
tasks queue for multiple workers

## howto

```javascript
let worker1 = function(task) {
  return new Promise((resolve, reject) {
    //do the heavy work in webworker/forked process
  })
};
let worker2 = function(task) {
  return new Promise((resolve, reject) {
    //do the heavy work in webworker/forked process
  })
};
let queue = new WorkersQueue([worker1, worker2]);

queue.addTask(task).then(function(result) {
  //get result
});
queue.addTask(task).then(function(result) {
 //get result
});
```

all tasks will be distributed between free workers, and stack up in the pending  queue

## API

###class:WorkersQueue - <queue>

#### queue.addTask(task) - Promise

Returns a promise that resolved as soon as task is done. If it fails - promise is rejected.

#### queue.pendingTasks - Array

The array of pending tasks, if workers are not handling the load.

#### queue.running - Array

The array of current workers statuses - `[false, true, false]` means that first and last workers are free.
