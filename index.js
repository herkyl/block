var tape = require('tape');
var assert = require('assert');
var chalk = require('chalk');

function repeatString(string, num) {
  return new Array(num + 1).join(string);
}

function Block(description, bodyFn) {
  if (!(this instanceof Block)) {
    return new Block(description, bodyFn);
  }
  this.description = description;
  this.beforeArray = [];
  this.beforeEachArray = [];
  this.actionArray = [];
  this.depth = 0;
  bodyFn.call(this);
}

Block.prototype.before = function (fn) {
  this.beforeArray.push(fn);
};

Block.prototype.beforeEach = function (fn) {
  this.beforeEachArray.push(fn);
};

Block.prototype.block = function (description, bodyFn) {
  var block = new Block(description, bodyFn);
  block.depth = this.depth + 1;
  this.actionArray.push(block);
};

Block.prototype.it = function (description, fn) {
  this.actionArray.push({
    description: description,
    fn: fn
  });
};

Block.prototype.crawl = function () {
  var fp = Function.prototype
    , self = this;
  this.beforeArray.forEach(fp.call, fp.call);
  this.actionArray.forEach(function (action) {
    self.beforeEachArray.forEach(fp.call, fp.call);
    console.log(repeatString(self.depth, '   '), action.description);
    if (action instanceof Block) {
      action.crawl();
    } else {
      if (false && tape) {
        tape.call(tape, action.description, action.fn);
      } else {
        try {
          action.fn.call(self);
        } catch (error) {

          if (error.name === 'AssertionError') {
            console.log(chalk.red(error.message, '(Expected', error.expected, 'actual', error.actual + ')'));
          } else {
            console.log(chalk.red(error.message));
          }
        }
      }
    }
  });
};

var block = Block;

block('Main block', function () {

  this.before(function () {
    console.log('Main block Before');
  });

  this.beforeEach(function () {
    console.log('Main block Before each');
  });

  this.block('A block', function () {
    this.before(function () {
      console.log('A block Before');
    });

    this.beforeEach(function () {
      console.log('A block Before each');
    });

    this.it('Some test 1', function () {
      assert(1, 1);
    });

    this.it('Some test 2', function () {
      assert.equal(1, 2, 'Foobar?');
    });
  });

/*  block('B block', function () {
    before(function () {
      console.log('B block Before');
    });

    beforeEach(function () {
      console.log('B block Before each');
    });

    it(function () {
      console.log('B block it 1');
    });

    it(function () {
      console.log('B block it 2');
    });
  });
*/
}).crawl();
