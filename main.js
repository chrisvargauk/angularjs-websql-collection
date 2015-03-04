// Done: break up the test to scenarios
// Done: Create 'car' and and 'kid' collection types, check for errors if not done yet
// Done: link up other collections in collections. Pass along the id
// Done: - add idCollectionLink to every single table
// Done: collection.empty, collection.deleteTables, collection.update
// Done: Sync JSON
// Done: collectionInstance.removeById
// Todo: model.remove
// Todo: collectionInstance.update
// Todo: deleteTable: dont throw error if table doesnt exist

var app = angular.module('app', []);

app.controller('AppCtrl', function () {
  console.log('Controller loaded');

  /* collection: create multi-dim collection.
  *  Create table structure according to multi-dimensional obj structure.
  * */
  scRunner.add('create multi-dim collection', function (sc) {
    cleanUpBefore();

    function cleanUpBefore() {
      Collection.prototype.deleteWebSQL('people', function () {
        websql.deleteTable('master', creteCollectionPeople);
      });
    }

    function creteCollectionPeople() {
      window.cPeople = new Collection({
        type: 'people',
        default: {
          name: 'John',
          age: '12',
          address: {
            line1: '93. Meridian place',
            line2: 'London',
            postCode: 'E14 9FF'
          }
        },
        filter: 'id < 4',
        callback: runScenario,
        debug: false
      });
    }

    function runScenario() {
      websql.getListTable(function(listTable) {
//        scRunner.log('listTable:', listTable);

        sc.test('Table "c_people" was created.')
          .check(listTable.indexOf('c_people'))
          .notEqualTo(-1);

        sc.test('Table "c_people_address" was created.')
          .check(listTable.indexOf('c_people_address'))
          .notEqualTo(-1);

        sc.test('Table "master" was created.')
          .check(listTable.indexOf('master'))
          .notEqualTo(-1);

        cleanUpAfter();
      });
    }

    function cleanUpAfter() {
      Collection.prototype.deleteWebSQL('people', function () {
        websql.deleteTable('master', function () {
          sc.resolve();
        });
      });
    }
  });

  /* collection: create multi-dim collection then add model
   *  Create table structure according to multi-dimensional obj structure,
   *  then add a model in it.
   * */
  scRunner.add('create multi-dim collection then add model', function (sc) {
    cleanUpBefore();

    function cleanUpBefore() {
      Collection.prototype.deleteWebSQL('people', function () {
        websql.deleteTable('master', creteCollectionPeople);
      });
    }

    function creteCollectionPeople() {
      window.cPeople = new Collection({
        type: 'people',
        default: {
          name: 'John',
          age: '12',
          address: {
            line1: '93. Meridian place',
            line2: 'London',
            postCode: 'E14 9FF'
          }
        },
        filter: 'id < 4',
        callback: addModelToPeople,
        debug: false
      });
    }

    function addModelToPeople() {
      window.cPeople.add({
        name: 'John',
        age: 12,
        address: {
          line1: '93. Meridian place',
          line2: 'London',
          postCode: 'E14 9FF'
        }
      }, runScenario);
    }

    function runScenario () {
      sc.test('JSON is loaded properly - check window.cPeople.JSON[0].name')
        .check(window.cPeople.JSON[0].name)
        .equalTo("John");
      sc.test('JSON is loaded properly - check window.cPeople.JSON[0].address.line2')
        .check(window.cPeople.JSON[0].address.line2)
        .equalTo("London");
      sc.test('JSON is loaded properly - check idLink on main dimension, should be -1')
        .check(window.cPeople.JSON[0].idLink)
        .equalTo(-1);
      sc.test('JSON is loaded properly - check idLink main and sub dimensions. Sub idLink == main id.')
        .check(window.cPeople.JSON[0].address.idLink)
        .equalTo(window.cPeople.JSON[0].id);

      cleanUpAfter();
    }

    function cleanUpAfter() {
      Collection.prototype.deleteWebSQL('people', function () {
        websql.deleteTable('master', function () {
          sc.resolve();
        });
      });
    }
  });

  /* collection: load multi-dim collection from database.
   *  Create table structure according to multi-dimensional obj structure.
   *  If there are properties saved to WebSQL than they will be loaded back for the collection.
   *
   *  Note: You need a model already being added to collection, otherwise there is nothing to add,
   *        run one of the scenarios that adds model to collection.
   * */
  scRunner.add('load multi-dim collection from database', function (sc) {
    cleanUpBefore();

    function cleanUpBefore() {
      Collection.prototype.deleteWebSQL('people', function () {
        websql.deleteTable('master', creteCollectionPeople);
      });
    }

    function creteCollectionPeople() {
      window.cPeople = new Collection({
        type: 'people',
        default: {
          name: 'John',
          age: '12',
          address: {
            line1: '93. Meridian place',
            line2: 'London',
            postCode: 'E14 9FF'
          }
        },
        filter: 'id < 4',
        callback: addModelToPeople,
        debug: false
      });
    }

    function addModelToPeople() {
      window.cPeople.add({
        name: 'John',
        age: 12,
        address: {
          line1: '93. Meridian place',
          line2: 'London',
          postCode: 'E14 9FF'
        }
      }, creteCollectionPeopleNew);
    }

    function creteCollectionPeopleNew() {
      window.cPeopleNew = new Collection({
        type: 'people',
        filter: 'id < 4',
        callback: runScenario,
        debug: false
      });
    }

    function runScenario () {
      sc.test('JSON is loaded properly - check window.cPeopleNew.JSON[0].name')
        .check(window.cPeopleNew.JSON[0].name)
        .equalTo("John");
      sc.test('JSON is loaded properly - check window.cPeopleNew.JSON[0].address.line2')
        .check(window.cPeopleNew.JSON[0].address.line2)
        .equalTo("London");
      sc.test('JSON is loaded properly - check idLink on main dimension, should be -1')
        .check(window.cPeopleNew.JSON[0].idLink)
        .equalTo(-1);
      sc.test('JSON is loaded properly - check idLink main and sub dimensions. Sub idLink == main id.')
        .check(window.cPeopleNew.JSON[0].address.idLink)
        .equalTo(window.cPeopleNew.JSON[0].id);

      cleanUpAfter();
    }

    function cleanUpAfter() {
      Collection.prototype.deleteWebSQL('people', function () {
        websql.deleteTable('master', function () {
          sc.resolve();
        });
      });
    }
  });
  scRunner.run('all');

  /* collection: add List of Models: create multi-dim collection then add a list of models
   *  Create table structure according to multi-dimensional obj structure,
   *  then add a list of model at one.
   * */
  var sc = function () {
    window.people = new Collection({
      type: 'people',
      default: {
        name: 'John',
        age: '12',
        address: {
          line1: '93. Meridian place',
          line2: 'London',
          postCode: 'E14 9FF'
        }
      },
      filter: 'id < 4',
      callback: addModelToPeople,
      debug: true
    });

    function addModelToPeople() {
      var listModel = [
        {
          name: 'John',
          age: 12,
          address: {
            line1: '93. Meridian place',
            line2: 'London',
            postCode: 'E14 9FF'
          }
        },{
          name: 'Jane',
          age: 11,
          address: {
            line1: '72. Woodlane',
            line2: 'London',
            postCode: 'W9 9FF'
          }
        }
      ];

      window.people.addArray(listModel, callback);
    }

    function callback () {
      console.log('hehe :)');
    }
  };
  var cleanUp =  function () {
    Collection.prototype.deleteWebSQL('people');
    websql.emptyTable('master');
  };

  /* collection: create multi-dim collection with other collection in it.
   *  Create table structure according to multi-dimensional obj structure.
   * */
  var sc = function () {
    function cleanUp() {
      Collection.prototype.deleteWebSQL('kid', function () {
        Collection.prototype.deleteWebSQL('people', createCollectionKid());
      });
    }

    cleanUp();
//    createCollectionKid();
//    createCollectionKid();
//    createCollectionPeople();

    function createCollectionKid() {
      window.cKid = new Collection({
        type: 'kid',
        default: {
          name: 'Melissa',
          age: '6'
        },
        callback: addListToKid,
        debug: true
      });
    }

    function addListToKid() {
      window.cKid.addArray([
        {
          name: 'Melissa',
          age: '6'
        }
      ], createCollectionPeople);
    }

    function createCollectionPeople() {
      window.cPeople = new Collection({
        type: 'people',
        default: {
          name: 'John',
          age: '12',
          address: {
            line1: '93. Meridian place',
            line2: 'London',
            postCode: 'E14 9FF'
          },
          listKid: 'collectionType_kid'
        },
        callback: addModelToPeople,
//        callback: callbackEnd,
        debug: true
      });
    }

    function addModelToPeople() {
      window.cPeople.add({
        name: 'John',
        age: 12,
        address: {
          line1: '93. Meridian place',
          line2: 'London',
          postCode: 'E14 9FF'
        },
        listKid: [
          {
            name: 'Melissa',
            age: 6
          },
          {
            name: 'Jeff',
            age: 5
          }
        ]
      }, addToKidInCollPeople);
//      }, callbackEnd);
    }

    // todo: create a Collection instance programmatically to array but dont add the array just yet.

    function addToKidInCollPeople() {
      var size = cPeople.JSON.length;
      cPeople.JSON[size-1].listKid.addArray([
        {
          name: 'Steve',
          age: '6'
        },
        {
          name: 'Adam',
          age: '7'
        }
      ], callbackEnd);
    }

    function callbackEnd() {
      console.log('Done :)');

      console.log('cPeople.JSON: ', cPeople.JSON);
      var size = cPeople.JSON.length,
          optLast = cPeople.JSON[size-1].listKid.opt,
          optFirst = cPeople.JSON[0].listKid.opt;

      console.log('opt in Kid in first cPeople: ', optFirst);
      console.log('opt in Kid in last cPeople: ', optLast);
    }
  };
  var cleanUp =  function () {
//    Collection.prototype.deleteWebSQL('kid');
    Collection.prototype.deleteWebSQL('people');
    websql.emptyTable('master');
    websql.deleteTable('c_kid');
  };

  /* collection: remove model to collection
  * */
  var sc = function () {
    cleanUp();

    function cleanUp() {
      Collection.prototype.deleteWebSQL('kid', function () {
        Collection.prototype.deleteWebSQL('people', createCollectionKid());
      });
    }

    function createCollectionKid() {
      window.cKid = new Collection({
        type: 'kid',
        default: {
          name: 'Melissa',
          age: '6'
        },
        callback: addListToKid,
        debug: true
      });
    }

    function addListToKid() {
      window.cKid.addArray([
        {
          name: 'Melissa',
          age: '6'
        }
      ], createCollectionPeople);
    }

    function createCollectionPeople() {
      window.cPeople = new Collection({
        type: 'people',
        default: {
          name: 'John',
          age: '12',
          address: {
            line1: '93. Meridian place',
            line2: 'London',
            postCode: 'E14 9FF'
          },
          listKid: 'collectionType_kid'
        },
        callback: addModelToPeople,
//        callback: callbackEnd,
        debug: true
      });
    }

    function addModelToPeople() {
      window.cPeople.addArray([
        {
          name: 'John',
          age: 12,
          address: {
            line1: '93. Meridian place',
            line2: 'London',
            postCode: 'E14 9FF'
          },
          listKid: [
            {
              name: 'Melissa',
              age: 6
            },
            {
              name: 'Jeff',
              age: 5
            }
          ]
        },
        {
          name: 'Jane',
          age: 11,
          address: {
            line1: '72. Woodlane',
            line2: 'London',
            postCode: 'EW4 45'
          },
          listKid: [
            {
              name: 'Melissa',
              age: 6
            },
            {
              name: 'Jeff',
              age: 5
            }
          ]
        }
      ], addToKidInCollPeople);
//      }, callbackEnd);
    }

    // todo: create a Collection instance programmatically to array but dont add the array just yet.

    function addToKidInCollPeople() {
      var size = cPeople.JSON.length;
      cPeople.JSON[size-1].listKid.addArray([
        {
          name: 'Steve',
          age: '6'
        },
        {
          name: 'Adam',
          age: '7'
        }
      ], callbackEnd);
    }

    function callbackEnd() {
      console.log('Done :)');

      console.log('cPeople.JSON: ', cPeople.JSON);
      var size = cPeople.JSON.length,
        optLast = cPeople.JSON[size-1].listKid.opt,
        optFirst = cPeople.JSON[0].listKid.opt;

      console.log('opt in Kid in first cPeople: ', optFirst);
      console.log('opt in Kid in last cPeople: ', optLast);

      cPeople.removeById('people', 2, function () {
        console.log('All people related entries given by id in db should be deleted by now.');
      });
    }
  };
  var cleanUp =  function () {
    Collection.prototype.deleteWebSQL('kid', function () {
      Collection.prototype.deleteWebSQL('people', createCollectionKid());
    });
  };

  /* Collection: Update collection */
  var sc = function () {
    cleanUp();

    function cleanUp() {
      Collection.prototype.deleteWebSQL('people', function () {
        Collection.prototype.deleteWebSQL('kid', function () {
          websql.emptyTable('master', createCollectionKid);
        });
      });
    }

    function createCollectionKid() {
      window.cKid = new Collection({
        type: 'kid',
        default: {
          name: 'Melissa',
          age: '6'
        },
        callback: addListToKid,
        debug: true
      });
    }

    function addListToKid() {
      window.cKid.addArray([
        {
          name: 'Melissa',
          age: '6'
        }
      ], createCollectionPeople);
    }

    function createCollectionPeople() {
      window.cPeople = new Collection({
        type: 'people',
        default: {
          name: 'John',
          age: '12',
          address: {
            line1: '93. Meridian place',
            line2: 'London',
            postCode: 'E14 9FF'
          },
          listKid: 'collectionType_kid'
        },
        callback: addModelToPeople,
//        callback: callbackEnd,
        debug: true
      });
    }

    function addModelToPeople() {
      window.cPeople.addArray([
        {
          name: 'John',
          age: 12,
          address: {
            line1: '93. Meridian place',
            line2: 'London',
            postCode: 'E14 9FF'
          },
          listKid: [
            {
              name: 'Melissa',
              age: 6
            },
            {
              name: 'Jeff',
              age: 5
            }
          ]
        },
        {
          name: 'Jane',
          age: 11,
          address: {
            line1: '72. Woodlane',
            line2: 'London',
            postCode: 'EW4 45'
          },
          listKid: [
            {
              name: 'Melissa',
              age: 6
            },
            {
              name: 'Jeff',
              age: 5
            }
          ]
        }
      ], callbackEnd);
//      }, callbackEnd);
    }

    function callbackEnd() {
      console.log('End of all operation');
    }

    console.log('update');
  };



  /* ###############
  *  UTILITY METHODS
  *  ############### */

  /* Crawler */
  var sc = function () {
    var modelBlueprint = {
      name: 'John',
      age: 12,
      address: {
        line1: '93. Meridian place',
        line2: 'London',
        postCode: 'E14 9FF'
      },
      listCar: [{name: 'audi'}, {name: 'BMW'}, {name: 'Golf'}],
      listKid: [
        {
          name: 'Melissa',
          age: 6
        },
        {
          name: 'Jeff',
          age: 5
        }
      ]
    };

    Collection.prototype.crawler(modelBlueprint, function(value, key) {
      console.log('Iterator: ['+key+'] = ', value);
    }, function (value, key) {
      // Crawl deeper only if value is Object not Array
      return Object.prototype.toString.call(value) === '[Object Object]';
    });
  };

  /* AsyncRunner */
  var sc = function () {
    var runner = new Collection.prototype.asyncRunner();

    runner.done(function () {
      console.log('All commands are done :)');
    });

    runner.schedule(function (resolve) {
      setTimeout(function (){
        console.log('hehe');
        resolve();
      }, 1000);
    });

    runner.schedule(function (resolve) {
      setTimeout(function (){
        console.log('hihi');
        resolve();
      }, 1000);
    });

    runner.run();
  };

  /* AsyncRunner - 0 command still trigger callbackEdn */
  var sc = function () {
    var runner = new Collection.prototype.asyncRunner();

    runner.done(function () {
      console.log('All commands are done :)');
    });

    runner.run();
  };

  /* AsyncRunner - with options*/
  var sc = function () {
    var runner = new Collection.prototype.asyncRunner();

    runner.done(function () {
      console.log('All commands are done :)');
    });

    runner.schedule(
      function (resolve, opt) {
        setTimeout(function (){
          console.log('hehe - opt.a:', opt.a);
          resolve();
        }, 1000);
      },
      {
        a: 5
      });

    runner.schedule(function (resolve) {
      setTimeout(function (){
        console.log('hihi - no options');
        resolve();
      }, 1000);
    });

    runner.run();
  };

  /* AsyncRunner - AsyncRunner in AsyncRunner*/
  var sc = function () {
    var runner = new Collection.prototype.asyncRunner();

    runner.done(function () {
      console.log('All commands are done :)');
    });

    runner.schedule(function (resolve) {
      setTimeout(function (){
        console.log('hehe');

        var runnerSub = new Collection.prototype.asyncRunner();

        runnerSub.done(function () {
          console.log('All SUB commands are done :]');
          resolve();
        });

        runnerSub.schedule(function (resolve) {
          setTimeout(function (){
            console.log('haha');
            resolve();
          }, 1000);
        });

        runnerSub.run();
      }, 1000);
    });

    runner.schedule(function (resolve) {
      setTimeout(function (){
        console.log('hihi');
        resolve();
      }, 1000);
    });

    runner.run();
  };

//  createNewCollection();
//  createNewCollectionThenAdd();
//  createNewCollectionNoDefaultProvThenAdd();
//  createNewCollectionThenAddArray();
//  createNewCollectionLoadFromDB();
//  createNewCollWithOtherCollectionsInIt();
//  runCrawler();
//  emptyCollectionInstance();
//  emptyCollectionWithoutInstance();
//  deleteCollectionInstanceFromDB();
//  deleteCollectionWithoutInstanceFromDB();

  function createNewCollection() {
    var modelBlueprint = {
      name: 'John',
      age: 12,
      address: {
        line1: '93. Meridian place',
        line2: 'London',
        postCode: 'E14 9FF'
      },
      listCar: [{name: 'audi'}, {name: 'BMW'}, {name: 'Golf'}],
      listKid: [
        {
          name: 'Melissa',
          age: 6
        },
        {
          name: 'Jeff',
          age: 5
        }
      ]
    };

    window.peopel = new Collection({
      type: 'people',
      default: {
        name: 'John',
        age: '12',
        address: {
          line1: '93. Meridian place',
          line2: 'London',
          postCode: 'E14 9FF'
        },
        listCar: 'collectionType_car',
        listKid: 'collectionType_kid'
      },
      filter: 'id < 4',
      callback: callback,
      debug: true
    });

    function callback() {
      console.log('Done :)');
    }
  }

  function createNewCollectionThenAdd() {
    window.cKid = new Collection({
      type: 'kid',
      default: {
        name: 'Melissa',
        age: '6'
      },
      callback: loadCarCollection,
      debug: true
    });

    function loadCarCollection() {
      window.cCar = new Collection({
        type: 'car',
        default: {
          name: 'Audi'
        },
        callback: loadPeopleCollection,
        debug: true
      });
    }

    function loadPeopleCollection () {
      window.peopel = new Collection({
        type: 'people',
        default: {
          name: 'John',
          age: '12',
          address: {
            line1: '93. Meridian place',
            line2: 'London',
            postCode: 'E14 9FF'
          },
          listCar: 'collectionType_car',
          listKid: 'collectionType_kid'
        },
        filter: 'id < 4',
        callback: addModelToPeople,
        debug: true
      });
    }

    function addModelToPeople() {
      window.peopel.add({
        name: 'John',
        age: 12,
        address: {
          line1: '93. Meridian place',
          line2: 'London',
          postCode: 'E14 9FF'
        },
        listCar: [{name: 'audi'}, {name: 'BMW'}, {name: 'Golf'}],
        listKid: [
          {
            name: 'Melissa',
            age: 6
          },
          {
            name: 'Jeff',
            age: 5
          }
        ]
      }, addListCar);
    }

    function addListCar() {
      var size = window.peopel.JSON.length;
      window.peopel.JSON[(size-1)].listKid.addArray([
        {
          name: 'Melissa',
          age: 6
        },
        {
          name: 'Jeff',
          age: 5
        }
      ], callback);
    }

    function callback () {
      console.log('hehe :)');
    }
  }

  function createNewCollectionNoDefaultProvThenAdd() {
    window.peopel = new Collection({
      type: 'people',
      default: {
        name: 'John',
        age: '12',
        address: {
          line1: '93. Meridian place',
          line2: 'London',
          postCode: 'E14 9FF'
        },
        listCar: 'collectionType_car',
        listKid: 'collectionType_kid'
      },
      filter: 'id < 4',
      callback: addModelToPeople,
      debug: true
    });

    function addModelToPeople() {
      window.peopel.add({
        name: 'John',
        age: 12,
        address: {
          line1: '93. Meridian place',
          line2: 'London',
          postCode: 'E14 9FF'
        },
        listCar: [{name: 'audi'}, {name: 'BMW'}, {name: 'Golf'}],
        listKid: [
          {
            name: 'Melissa',
            age: 6
          },
          {
            name: 'Jeff',
            age: 5
          }
        ]
      }, callback);
    }

    function callback () {
      console.log('hehe :)');
    }
  }

  function createNewCollectionThenAddArray() {
    window.peopel = new Collection({
      type: 'people',
      default: {
        name: 'John',
        age: '12',
        address: {
          line1: '93. Meridian place',
          line2: 'London',
          postCode: 'E14 9FF'
        },
        listCar: 'collectionType_car',
        listKid: 'collectionType_kid'
      },
//      filter: 'id < 4',
      callback: addModelToPeople,
      debug: true
    });

    function addModelToPeople() {
      var listModel = [
        {
          name: 'John',
          age: 12,
          address: {
            line1: '93. Meridian place',
            line2: 'London',
            postCode: 'E14 9FF'
          },
          listCar: [{name: 'audi'}, {name: 'BMW'}, {name: 'Golf'}],
          listKid: [
            {
              name: 'Melissa',
              age: 6
            },
            {
              name: 'Jeff',
              age: 5
            }
          ]
        },{
          name: 'Jane',
          age: 11,
          address: {
            line1: '72. Woodlane',
            line2: 'London',
            postCode: 'W9 9FF'
          },
          listCar: [{name: 'audi'}, {name: 'BMW'}, {name: 'Golf'}],
          listKid: [
            {
              name: 'Melissa',
              age: 6
            },
            {
              name: 'Jeff',
              age: 5
            }
          ]
        }
      ];
      window.peopel.addArray(listModel, callback);
    }

    function callback () {
      console.log('hehe :) - all addition is done');
    }
  }

  function createNewCollectionLoadFromDB () {
    window.peopel = new Collection({
      type: 'people',
      debug: true,
      filter: 'id < 4',
      callback: function () {
        console.log('This should represent the whole JSON: ', window.peopel.JSON);
      }
    });
  }

  function createNewCollWithOtherCollectionsInIt () {
    window.cKid = new Collection({
      type: 'kid',
      default: {
        name: 'Melissa',
        age: '6'
      },
      debug: true
    });

    window.cCar = new Collection({
      type: 'car',
      default: {
        name: 'Audi'
      },
      debug: true
    });

    window.peopel = new Collection({
      type: 'people',
      default: {
        name: 'John',
        age: '12',
        address: {
          line1: '93. Meridian place',
          line2: 'London',
          postCode: 'E14 9FF'
        },
        listCar: 'collectionType_car',
        listKid: 'collectionType_kid'
      },
//      filter: 'id < 4',
      callback: addModelToPeople,
      debug: true
    });

    function addModelToPeople() {
      window.peopel.add({
        name: 'John',
        age: 12,
        address: {
          line1: '93. Meridian place',
          line2: 'London',
          postCode: 'E14 9FF'
        },
        listCar: [{name: 'audi'}, {name: 'BMW'}, {name: 'Golf'}],
        listKid: [
          {
            name: 'Melissa',
            age: 6
          },
          {
            name: 'Jeff',
            age: 5
          }
        ]
      }, callback);
    }

    function callback() {
      console.log('Done :)');
    }
  }

  function runCrawler () {
    var modelBlueprint = {
      name: 'John',
      age: 12,
      address: {
        line1: '93. Meridian place',
        line2: 'London',
        postCode: 'E14 9FF'
      },
      listCar: [{name: 'audi'}, {name: 'BMW'}, {name: 'Golf'}],
      listKid: [
        {
          name: 'Melissa',
          age: 6
        },
        {
          name: 'Jeff',
          age: 5
        }
      ]
    };

    Collection.prototype.crawler(modelBlueprint, function(value, key) {
      console.log('Iterator: ['+key+'] = ', value);
    }, function (value, key) {
      // Crawl deeper only if value is Object not Array
      return Object.prototype.toString.call(value) === '[Object Object]';
    });
  }

  function emptyCollectionInstance() {
    window.peopel = new Collection({
      type: 'people',
      debug: true,
      callback: function () {
        window.peopel.emptyWebSQL();
      }
    });
  }

  function emptyCollectionWithoutInstance() {
    Collection.prototype.emptyWebSQL('people');
  }

  function deleteCollectionInstanceFromDB() {
    window.peopel = new Collection({
      type: 'people',
      default: {
        name: 'John',
        age: '12',
        address: {
          line1: '93. Meridian place',
          line2: 'London',
          postCode: 'E14 9FF'
        },
        listCar: 'collectionType_car',
        listKid: 'collectionType_kid'
      },
      filter: 'id < 4',
      callback: callback,
      debug: true
    });

    // Delete it after 5s when it is ready
    function callback() {
      setTimeout(function (){
        window.peopel.deleteWebSQL();
      }, 5000);
    }
  }

  function deleteCollectionWithoutInstanceFromDB() {
    window.peopel = new Collection({
      type: 'people',
      default: {
        name: 'John',
        age: '12',
        address: {
          line1: '93. Meridian place',
          line2: 'London',
          postCode: 'E14 9FF'
        },
        listCar: 'collectionType_car',
        listKid: 'collectionType_kid'
      },
      filter: 'id < 4',
      callback: callback,
      debug: true
    });

    // Delete it after 5s when it is ready
    function callback() {
      setTimeout(function (){
        Collection.prototype.deleteWebSQL('people');
      }, 5000);
    }
  }
});