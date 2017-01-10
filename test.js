const tap = require('tap');
const WorkersQueue = require('./index.js');
const sinon = require('sinon');

tap.test('if single worker - executes in a queue', (tap) => {
  let wrk1 = sinon.stub();
  wrk1.withArgs({mock:'mock1'}).returns(Promise.resolve({passed1:true}));
  wrk1.withArgs({mock:'mock2'}).returns(Promise.resolve({passed2:true}));
  queue = new WorkersQueue([wrk1]);

  queue.addTask({mock:'mock1'}).then(function(result) {
    tap.ok(wrk1.calledOnce, 'worker called once');
    tap.ok(result.passed1, 'proper result returned');
  });
  queue.addTask({mock:'mock2'}).then(function(result) {
    tap.ok(wrk1.calledTwice, 'worker called twice');
    tap.ok(result.passed2, 'proper result returned');
    tap.end();
  });
})

tap.test('two workers - distributes the queue', (tap) => {
  let wrk1 = sinon.stub();
  wrk1.withArgs({mock:'mock'}).returns(Promise.resolve({passed:true}));
  wrk1.withArgs({mock:'mock'}).returns(Promise.resolve({passed:true}));
  let wrk2 = sinon.stub();
  wrk2.withArgs({mock:'mock'}).returns(Promise.resolve({passed:true}));
  wrk2.withArgs({mock:'mock'}).returns(Promise.resolve({passed:true}));
  queue = new WorkersQueue([wrk1, wrk2]);
  queue.addTask({mock:'mock'});
  queue.addTask({mock:'mock'}).then(function() {
    tap.ok(wrk1.calledOnce, 'first worker called once');
    tap.ok(wrk2.calledOnce, 'second worker called once');
  });
  queue.addTask({mock:'mock'});
  queue.addTask({mock:'mock'}).then(function() {
    tap.ok(wrk1.calledTwice, 'first worker called twice');
    tap.ok(wrk2.calledTwice, 'second worker called twice');
    tap.end();
  });
})

tap.test('two workers - handle reject of a worker', (tap) => {
  let wrk1 = sinon.spy(function() {
    return Promise.reject({passed:true});
  });
  let wrk2 = sinon.spy(function() {
    return Promise.reject({passed:true});
  });
  queue = new WorkersQueue([wrk1, wrk2]);
  queue.addTask({mock:'mock'}).catch(function() {});
  queue.addTask({mock:'mock'}).catch(function() {
    tap.ok(wrk1.calledOnce);
    tap.ok(wrk2.calledOnce);
    tap.end();
  });
})
