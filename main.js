var app = angular.module('app', []);

// Done: break up the test to scenarios
// Done: Create 'car' and and 'kid' collection types, check for errors if not done yet
// Todo: link up other collections in collections. Pass along the id
// Todo: - add idCollectionLink to every single table
// Todo: collection.empty, collection.deleteTables, collection.update
// Todo: Sync JSON

app.controller('AppCtrl', function () {
  console.log('Controller loaded');

  /* collection: create multi-dim collection.
  *  Create table structure according to multi-dimensional obj structure.
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
      callback: callback,
      debug: true
    });

    function callback() {
      console.log('Done :)');
    }
  };
  var cleanUp =  function () {
    Collection.prototype.deleteWebSQL('people');
    websql.emptyTable('master');
  };

  /* collection: create multi-dim collection then add model
   *  Create table structure according to multi-dimensional obj structure,
   *  then add a model in it.
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
      window.peopel.add({
        name: 'John',
        age: 12,
        address: {
          line1: '93. Meridian place',
          line2: 'London',
          postCode: 'E14 9FF'
        }
      }, callback);
    }

    function callback () {
      console.log('hehe :)');
    }
  };
  var cleanUp =  function () {
    Collection.prototype.deleteWebSQL('people');
    websql.emptyTable('master');
  };

  /* collection: create multi-dim collection and check whether properties are loaded.
   *  Create table structure according to multi-dimensional obj structure.
   *  If there are properties saved to WebSQL than they will be loaded back for the collection.
   *
   *  Note: You need a model already being added to collection, otherwise there is nothing to add,
   *        run one of the scenarios that adds model to collection.
   * */
  var sc = function () {
    window.people = new Collection({
      type: 'people',
      filter: 'id < 4',
      callback: callback,
      debug: true
    });

    function callback() {
      console.log('Done :)');
      console.log('people.JSON:', people.JSON);
    }
  };
  var cleanUp =  function () {
    Collection.prototype.deleteWebSQL('people');
    websql.emptyTable('master');
  };

  /* collection: create multi-dim collection then add a list of models
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
      Collection.prototype.deleteWebSQL('kid');
      Collection.prototype.deleteWebSQL('people');
    }

//    cleanUp();
//    createCollectionKid();
    createCollectionPeople();

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
        },
        {
          name: 'James',
          age: '8'
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
      }, callbackEnd);
    }

    // todo: create a Collection instance programmatically to array but dont add the array just yet.

//    window.people = new Collection({
//      type: 'people',
//      default: {
//        name: 'John',
//        age: '12',
//        address: {
//          line1: '93. Meridian place',
//          line2: 'London',
//          postCode: 'E14 9FF'
//        },
//        listKid: 'collectionType_kid'
//      },
//      filter: 'id < 4',
//      callback: callback,
//      debug: true
//    });
//
    function callbackEnd() {
      console.log('Done :)');
    }
  }();
  var cleanUp =  function () {
//    Collection.prototype.deleteWebSQL('kid');
    Collection.prototype.deleteWebSQL('people');
    websql.emptyTable('master');
//    websql.deleteTable('c_kid');
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