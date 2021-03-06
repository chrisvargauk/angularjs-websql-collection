var Scenario = function (nameScenario, scenario) {
  this.nameScenario = nameScenario;
  this.scenario = scenario;
};

Scenario.prototype.test = function (testName) {
  var that = this;

  that.testName = testName;
  return that;
};

Scenario.prototype.check = function (expression) {
  var that = this;

  that.expression = expression;
  return that;
};

Scenario.prototype.equalTo = function (resultExpected) {
  var that = this;
  that.log = ScenarioRunner.prototype.log;
  that.error = ScenarioRunner.prototype.error;

  if (that.expression == resultExpected) {
    that.log('* '+that.testName);
  } else {
    that.error('* '+that.testName + ' (expected: "'+resultExpected+'", received: "'+that.expression+'")');
  }

  return that;
};

Scenario.prototype.notEqualTo = function (resultExpected) {
  var that = this;
  that.log = ScenarioRunner.prototype.log;
  that.error = ScenarioRunner.prototype.error;

  if (that.expression != resultExpected) {
    that.log('* '+that.testName);
  } else {
    that.error('* '+that.testName);
  }

  return that;
};

Scenario.prototype.log = function (msg, obj) {
  ScenarioRunner.prototype.log(msg, obj);
};

Scenario.prototype.error = function (msg, obj) {
  ScenarioRunner.prototype.error(msg, obj);
};

var ScenarioRunner = function () {
  this.listScenario = [];
  // todo: asyncRunner is part of Collection, therefore scenarioRunner depends on Collection. Make asyncRunner stand lone.
  this.asyncRunner = new Collection.prototype.asyncRunner();
};

ScenarioRunner.prototype.log = function (msg, obj) {
  var that = this;

  if (typeof obj === 'undefined') {
    console.log('[:: ScenarioRunner: ' + msg);
  } else {
    console.log('[:: ScenarioRunner: ' + msg, obj);
  }
};

ScenarioRunner.prototype.error = function (msg, obj) {
  var that = this;

  if (typeof obj === 'undefined') {
    console.error('[:: ScenarioRunner: ' + msg);
  } else {
    console.error('[:: ScenarioRunner: ' + msg, obj)
  }
};

ScenarioRunner.prototype.add = function (nameScenario, scenario) {
  var that  = this;

  var scenarioObj = new Scenario(nameScenario, scenario);
  scenarioObj.resolve = function () {};
  this.listScenario.push(scenarioObj);

  this.asyncRunner.schedule(function(resolve) {
    var sc = new Scenario(nameScenario, scenario);
    that.log('> Scenario: ' + sc.nameScenario);
    sc.resolve = resolve;
    sc.scenario(sc);
  });
};

ScenarioRunner.prototype.run = function (nameScenario) {
  var that = this;

  if (nameScenario === 'all') {
    this.asyncRunner.run();
  } else {
    // todo: add functionality to asyncRunner to run a single method instead of all, then remove this solution
    this.listScenario.forEach(function(sc) {
      if (sc.nameScenario === nameScenario) {
        that.log('Scenario: ' + sc.nameScenario);
        sc.scenario(sc);
      }
    });
  }
};

var scRunner = new ScenarioRunner();