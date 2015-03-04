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

Scenario.prototype.notEqualTo = function (resultExpected) {
  var that = this;
  that.log = ScenarioRunner.prototype.log;
  that.error = ScenarioRunner.prototype.error;

  if (that.expression !== resultExpected) {
    that.log('* '+that.testName);
  } else {
    that.error('* '+that.testName);
  }

  return that;
};

var ScenarioRunner = function () {
  this.listScenario = [];
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
  var scenario = new Scenario(nameScenario, scenario);
  this.listScenario.push(scenario);
};

ScenarioRunner.prototype.run = function (nameScenario) {
  var that = this;

  if (nameScenario === 'all') {
    this.listScenario.forEach(function(sc) {
      that.log('Scenario: ' + sc.nameScenario);
      sc.scenario(sc);
    });
  } else {
    this.listScenario.forEach(function(sc) {
      if (sc.nameScenario === nameScenario) {
        that.log('Scenario: ' + sc.nameScenario);
        sc.scenario(sc);
      }
    });
  }
};

var scRunner = new ScenarioRunner();