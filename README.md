# workersQueue
tasks queue for multiple workers

## howto

```
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
let queue = new WorkersQueue([wrk1]);

queue.addTask({mock:'mock1'}).then(function(result) {
  tap.ok(wrk1.calledOnce, 'worker called once');
  tap.ok(result.passed1, 'proper result returned');
});
queue.addTask({mock:'mock2'}).then(function(result) {
  tap.ok(wrk1.calledTwice, 'worker called twice');
  tap.ok(result.passed2, 'proper result returned');
  tap.end();
});
```
