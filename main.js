var app = angular.module('app', []);

app.controller('AppCtrl', function () {
  console.log('Controller loaded');


  /* collection: create multi-dim collection.
  *  Create table structure according to multi-dimensional obj structure.
  * */
  scRunner.add('Create multi-dim collection', function (sc) {
    cleanUpBefore();

    function cleanUpBefore() {
      Collection.prototype.deleteWebSQL('people', function () {
        websql.deleteTable('collectionType', creteCollectionPeople);
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

        sc.test('Table "collectionType" was created.')
          .check(listTable.indexOf('collectionType'))
          .notEqualTo(-1);

        cleanUpAfter();
      });
    }

    function cleanUpAfter() {
      Collection.prototype.deleteWebSQL('people', function () {
        websql.deleteTable('collectionType', function () {
          sc.resolve();
        });
      });
    }
  });


  /* collection: create multi-dim collection then add model
   *  Create table structure according to multi-dimensional obj structure,
   *  then add a model in it.
   * */
  scRunner.add('Create multi-dim collection then add model', function (sc) {
    cleanUpBefore();

    function cleanUpBefore() {
      Collection.prototype.deleteWebSQL('people', function () {
        websql.deleteTable('collectionType', creteCollectionPeople);
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

    function runScenario (model) {
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
      sc.test('Model should be passed into callback when model added, and id from db is already set on it.')
        .check(model.id)
        .equalTo(1);

      cleanUpAfter();
    }

    function cleanUpAfter() {
      Collection.prototype.deleteWebSQL('people', function () {
        websql.deleteTable('collectionType', function () {
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
  scRunner.add('Load multi-dim collection from database', function (sc) {
    cleanUpBefore();

    function cleanUpBefore() {
      Collection.prototype.deleteWebSQL('people', function () {
        websql.deleteTable('collectionType', creteCollectionPeople);
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
        websql.deleteTable('collectionType', function () {
          sc.resolve();
        });
      });
    }
  });


  /* collection: add List of Models to Collection
   *  Create multi-dim collection then add a list of models.
   *  Create table structure according to multi-dimensional obj structure,
   *  then add a list of model at one.
   * */
  scRunner.add('Add List of Models to Collection', function (sc) {
    cleanUpBefore();

    function cleanUpBefore() {
      Collection.prototype.deleteWebSQL('people', function () {
        websql.deleteTable('collectionType', creteCollectionPeople);
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

      window.cPeople.addArray(listModel, runScenario);
    }

    function runScenario () {
      sc.test('1st Model\'s JSON is loaded properly in Collection - check window.cPeople.JSON[0].name')
        .check(window.cPeople.JSON[0].name)
        .equalTo("John");
      sc.test('2nd Model\'s JSON is loaded properly in Collection - check window.cPeople.JSON[1].name')
        .check(window.cPeople.JSON[1].name)
        .equalTo("Jane");

      cleanUpAfter();
    }

    function cleanUpAfter() {
      Collection.prototype.deleteWebSQL('people', function () {
        websql.deleteTable('collectionType', function () {
          sc.resolve();
        });
      });
    }
  });


  /* collection: create multi-dim collection with other collection in it.
   *  Create table structure according to multi-dimensional obj structure.
   *  Note: At addition, in the obj you pass in,
   *        models in sub collection wont be added to created sub collection.
   * */
  scRunner.add('create multi-dim collection with another collection in it', function (sc) {
    cleanUpBefore();

    function cleanUpBefore() {
      websql.deleteTable('c_kid', function () {
        websql.deleteTable('c_people', function () {
          websql.deleteTable('c_people_address', function () {
            websql.deleteTable('collectionType', createCollectionKid);
          });
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
        debug: false
      });
    }

    function addListToKid() {
      window.cKid.addArray([
        {
          name: 'Melissa',
          age: '6'
        }
      ], creteCollectionPeople);
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
          },
          listKid: 'collectionType_kid'
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
      }, runScenario);
    }

    function runScenario () {
      sc.test('Check whether sub collection was created - check cPeople.JSON[0].listKid.nameCollection')
        .check(cPeople.JSON[0].listKid.nameCollection)
        .equalTo("kid");

      sc.test('Created sub collection should be empty - cPeople.JSON[0].listKid.JSON.length')
        .check(cPeople.JSON[0].listKid.JSON.length)
        .equalTo(0);

      cleanUpAfter();
    }

    function cleanUpAfter() {
      Collection.prototype.deleteWebSQL('kid', function () {
        Collection.prototype.deleteWebSQL('people', function () {
          websql.deleteTable('collectionType', function () {
            sc.resolve();
          });
        });
      });
    }
  });


  /* collection: remove model from collection
   * */
  scRunner.add('Remove Model from Collection', function (sc) {
    cleanUp();

    function cleanUp() {
      Collection.prototype.deleteWebSQL('kid', function () {
        Collection.prototype.deleteWebSQL('people', function () {
          websql.deleteTable('collectionType', createCollectionKid);
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
        callback: addModelToKid,
        debug: false
      });
    }

    function addModelToKid() {
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
        callback: addListModelToPeople,
        debug: false
      });
    }

    function addListModelToPeople() {
      window.cPeople.addArray([
        {
          name: 'John',
          age: 12,
          address: {
            line1: '93. Meridian place',
            line2: 'London',
            postCode: 'E14 9FF'
          },
          listKid: []
        },
        {
          name: 'Jane',
          age: 11,
          address: {
            line1: '72. Woodlane',
            line2: 'London',
            postCode: 'EW4 45'
          },
          listKid: []
        }
      ], addListKidInCollPeopleToKidSubColl);
    }

    function addListKidInCollPeopleToKidSubColl() {
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
      ], removeCollection);
    }

    function removeCollection() {
      cPeople.removeById('people', 2, runScenario);
    }

    function runScenario () {
      sc.test('There should be only one model left in Collection - cPeople.JSON.length')
        .check(cPeople.JSON.length)
        .equalTo(1);

      sc.test('The remaining Models "id" should be 1, Model with "id" 2 was deleted - cPeople.JSON[0].id')
        .check(cPeople.JSON[0].id)
        .equalTo(1);

      checkEntryOfDeletedModel();

      function checkEntryOfDeletedModel() {
        var sqlSelectPeople = "SELECT * FROM c_people",
          listId = [];
        websql.run(sqlSelectPeople, function(item) {
          listId.push(item.id);
        },function() {
          sc.test('The deleted model should be removed from db - listId.indexOf(2)')
            .check(listId.indexOf(2))
            .equalTo(-1);

          checkEntryOfRemainingModel();
        });
      }

      function checkEntryOfRemainingModel() {
        var sqlSelectPeople = "SELECT * FROM c_people",
          listId = [];
        websql.run(sqlSelectPeople, function(item) {
          listId.push(item.id);
        },function() {
          sc.test('The remaining model should be in db - listId.indexOf(1)')
            .check(listId.indexOf(1))
            .notEqualTo(-1);

          checkEntryOfDeletedModelsAddressDim();
        });
      }

      function checkEntryOfDeletedModelsAddressDim() {
        var sqlSelectPeopleAddress = "SELECT * FROM c_people_address",
            listIdLink = [];

        websql.run(sqlSelectPeopleAddress, function(item) {
          listIdLink.push(item.id);
        },function() {
          sc.test('The deleted model\'s address dimension should be removed from db - listIdLink.indexOf(2)')
            .check(listIdLink.indexOf(2))
            .equalTo(-1);

          checkEntryOfRemainingdModelsAddressDim();
        });
      }

      function checkEntryOfRemainingdModelsAddressDim() {
        var sqlSelectPeopleAddress = "SELECT * FROM c_people_address",
          listIdLink = [];

        websql.run(sqlSelectPeopleAddress, function(item) {
          listIdLink.push(item.id);
        },function() {
          sc.test('The remaining model\'s address dimension should be in db - listIdLink.indexOf(1)')
            .check(listIdLink.indexOf(1))
            .notEqualTo(-1);

          checkEntryOfDeletedModelInSubCollection();
        });
      }

      function checkEntryOfDeletedModelInSubCollection() {
        var sqlSelectPeople = "SELECT * FROM c_kid",
          listIdLink = [];
        websql.run(sqlSelectPeople, function(item) {
          listIdLink.push(item.id);
        },function() {
          sc.test('The deleted model in sub Collection should be removed from db - listIdLink.indexOf(2)')
            .check(listIdLink.indexOf(2))
            .equalTo(-1);

          checkEntryOfRemainingModelInSubCollection();
        });
      }

      function checkEntryOfRemainingModelInSubCollection() {
        var sqlSelectPeople = "SELECT * FROM c_kid",
          listIdLink = [];
        websql.run(sqlSelectPeople, function(item) {
          listIdLink.push(item.id);
        },function() {
          sc.test('The remaining model in sub Collection should be in db - listIdLink.indexOf(1)')
            .check(listIdLink.indexOf(1))
            .notEqualTo(-1);

          cleanUpAfter();
        });
      }

    }

    function cleanUpAfter() {
      Collection.prototype.deleteWebSQL('kid', function () {
        Collection.prototype.deleteWebSQL('people', function () {
          websql.deleteTable('collectionType', function () {
            sc.resolve();
          });
        });
      });
    }
  });

  /* collection: get model from collection by WebSQL id */
  scRunner.add('Get model from collection by WebSQL id', function (sc) {
    cleanUp();

    function cleanUp() {
      Collection.prototype.deleteWebSQL('kid', function () {
        websql.deleteTable('collectionType', createCollectionKid);
      });
    }

    function createCollectionKid() {
      window.cKid = new Collection({
        type: 'kid',
        default: {
          name: 'Melissa',
          age: '6'
        },
        callback: addModelToKid,
        debug: false
      });
    }

    function addModelToKid() {
      window.cKid.addArray([
        {
          name: 'Melissa',
          age: '6'
        },
        {
          name: 'Steve',
          age: '8'
        }
      ], runScenario);
    }

    function runScenario () {
      sc.test('Get mdoel by valid id.')
        .check(window.cKid.getById(2).name)
        .equalTo('Steve');

      sc.test('Get mdoel by invalid id.')
        .check(typeof window.cKid.getById(3))
        .equalTo('undefined');

      cleanUpAfter();
    }

    function cleanUpAfter() {
      Collection.prototype.deleteWebSQL('kid', function () {
        sc.resolve();
      });
    }

  });


  /* Collection: Update collection */
  scRunner.add('Update collection', function (sc) {
    cleanUp();

    function cleanUp() {
      Collection.prototype.deleteWebSQL('kid', function () {
        Collection.prototype.deleteWebSQL('people', function () {
          websql.deleteTable('collectionType', createCollectionKid);
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
        debug: false
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
        debug: false
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
          listKid: []
        },
        {
          name: 'Jane',
          age: 11,
          address: {
            line1: '72. Woodlane',
            line2: 'London',
            postCode: 'EW4 45'
          },
          listKid: []
        }
      ], addModelToSubCollection);

    }

    function addModelToSubCollection() {
      cPeople.JSON[0].listKid.add({
        name: 'Adam',
        age: '9'
      }, checkJSONstateInDb);
    }

    function checkJSONstateInDb() {
      sc.log('  Check Datebase State JSON before Delete: ');

      // Structure of db representation "JSONstateInDb" should be the same as JSON after loading Collection
      sc.test('Number of Models in JSONstateInDb should be the same as num of Models in JSON - cPeople.JSONstateInDb.length')
        .check(cPeople.JSONstateInDb.length)
        .equalTo(cPeople.JSON.length);

      sc.test('"id"s in JSONstateInDb should be the same as "id"s in JSON - cPeople.JSONstateInDb[0].id')
        .check(cPeople.JSONstateInDb[0].id)
        .equalTo(cPeople.JSON[0].id);

      sc.test('"address" key-value pair in JSONstateInDb should be the same as address key-value pair in JSON - cPeople.JSONstateInDb[0].address.id')
        .check(cPeople.JSONstateInDb[0].address.id)
        .equalTo(cPeople.JSON[0].address.id);

      sc.test('"listKid" Collection in JSONstateInDb should be the same as lisKid Collection in JSON - cPeople.JSONstateInDb[0].listKid.nameCollection')
        .check(cPeople.JSONstateInDb[0].listKid.nameCollection)
        .equalTo(cPeople.JSON[0].listKid.nameCollection);

      updateModelOnFirstDim();
    }

    function updateModelOnFirstDim() {
      cPeople.JSON[0].name = "Adam";
      window.cPeople.check(checkDatebaseStateJSON);

      function checkDatebaseStateJSON() {
        sc.log('  Single-dim - Database State JSON after Delete:');

        sc.test('In the 1st. model\'s Datebase State JSON, "name" key-value pair should be updated.')
          .check(cPeople.JSONstateInDb[0].name)
          .equalTo('Adam');

        sc.test('In the 2nd. model\'s Datebase State JSON, "name" key-value pair should NOT be updated.')
          .check(cPeople.JSONstateInDb[1].name)
          .equalTo('Jane');

        checkDb();
      }

      function checkDb() {
        sc.log('  Single-dim - Datebase after Delete: ');

        websql.run('SELECT name FROM c_people where id=1;', function(item) {
          sc.test('In DB, the entry that represents 1st. Model\'s 1st. dim, the field "name" should be updated.')
            .check(item.name)
            .equalTo('Adam');
        }, function() {
          websql.run('SELECT name FROM c_people where id=2;', function(item) {
            sc.test('In DB, the entry that represents 2st. Model\'s 1st. dim, the field "name" should NOT be updated.')
              .check(item.name)
              .equalTo('Jane');
          }, updateModelOnSecondDim);
        });
      }

//      cleanUpAfter();
    }

    function updateModelOnSecondDim() {
      cPeople.JSON[0].address.line2 = "Brighton";
      window.cPeople.check(checkDatebaseStateJSON);

      function checkDatebaseStateJSON() {
        sc.log('  Multi-dim - Database State JSON after Delete:');

        sc.test('In the 1st. model\'s Datebase State JSON, "address.line2" key-value pair should be updated.')
          .check(cPeople.JSON[0].address.line2)
          .equalTo('Brighton');

        sc.test('In the 2nd. model\'s Datebase State JSON, "address.line2" key-value pair should NOT be updated.')
          .check(cPeople.JSON[1].address.line2)
          .equalTo('London');

        checkDb();
      }

      function checkDb() {
        sc.log('  Multi-dim - Datebase after Delete: ');

        websql.run('SELECT line2 FROM c_people_address where idLink=1;', function(item) {
          sc.test('In DB, the entry that represents 1st. Model\'s 2st. dim, the field "line2" should be updated.')
            .check(item.line2)
            .equalTo('Brighton');
        }, function() {
          websql.run('SELECT line2 FROM c_people_address where idLink=2;', function(item) {
            sc.test('In DB, the entry that represents 2st. Model\'s 2st. dim, the field "line2" should NOT be updated.')
              .check(item.line2)
              .equalTo('London');
          }, updateModelInSubCollection);
        });
      }
    }

    function updateModelInSubCollection() {
      cPeople.JSON[0].listKid.JSON[0].name = 'Jane';
      cPeople.JSON[0].listKid.check(checkDb);

      function checkDb() {
        sc.log('  Sub Collection - Single-dim - Datebase after Delete: ');

        websql.run('SELECT name FROM c_kid where id=2;', function(item) {
          sc.test('In DB, the entry that represents sub collection\'s 1st. Model\'s 1st. dim, the field "name" should be updated.')
            .check(item.name)
            .equalTo('Jane');
        }, function() {
          websql.run('SELECT name FROM c_kid where id=1;', function(item) {
            sc.test('In DB, the entry that represents sub collection\'s 2st. Model\'s 1st. dim, the field "name" should NOT be updated.')
              .check(item.name)
              .equalTo('Melissa');
          });

          cleanUpAfter();
        });
      }
    }

    function cleanUpAfter() {
      Collection.prototype.deleteWebSQL('kid', function () {
        Collection.prototype.deleteWebSQL('people', function () {
          websql.deleteTable('collectionType', function () {
            sc.resolve();
          });
        });
      });
    }
  });

  scRunner.add('CollectionFactory', function (sc) {
    sc.log('  Get instance');

    cleanUp();

    function cleanUp() {
      Collection.prototype.deleteWebSQL('kid', function () {
        websql.deleteTable('collectionType', createNewCollectionKid);
      });
    }

    function createNewCollectionKid() {
      collectionFactory.get('my1stColl', {
        type: 'kid',
        default: {
          name: 'Melissa',
          age: '6'
        },
        callback: function(collection) {
          window.cKidNew = collection;
          window.cKidNew.testProp = 'test';
          createExistingCollectionKid();
        },
        debug: false
      });
    }

    function createExistingCollectionKid() {
      collectionFactory.get('my1stColl', {
        type: 'kid',
        default: {
          name: 'Melissa',
          age: '6'
        },
        callback: function (collection) {
          window.cKidExisting = collection;
            checkCollection();
        },
        debug: false
      });
    }

    function checkCollection() {
      sc.test('Callback passed into get method should receive collection instance when new collection is created.')
        .check(typeof window.cKidNew.opt)
        .equalTo("object");

      sc.test('Callback passed into get method should receive collection instance when existing collection is created.')
        .check(typeof window.cKidExisting.opt)
        .equalTo("object");

      sc.test('Factory should return new instance if instance doesn\'t exist with under name.')
        .check(typeof window.cKidNew.opt)
        .equalTo("object");

      sc.test('Factory should return existing instance if instance already exist with under name.')
        .check(window.cKidExisting.testProp)
        .equalTo("test");

      createDeferredOfExinsingColl();
    }

    function createDeferredOfExinsingColl() {
      sc.log('  getDeferredFn');

      window.deferredFn = collectionFactory.getDeferredFn('my1stColl', {
        type: 'kid',
        default: {
          name: 'Melissa',
          age: '6'
        },
        callback: function (collection) {
          //..
        },
        debug: false
      });

      checkDeferredFunction();
    }

    function checkDeferredFunction() {
      sc.test('collectionFactory.getDeferredFn method should return with function.')
        .check(typeof window.deferredFn)
        .equalTo("function");

      checkDeferredFunctionsPromise();
    }

    function checkDeferredFunctionsPromise() {
      var $qDummy = {
        defer: function (){
          return {
            promise: {},
            resolve: function () {

            }
          }
        }
      };

      var promise = window.deferredFn($qDummy);

      sc.test('collectionFactory.getDeferredFn method should return with function and that should return a promise.')
        .check(typeof promise)
        .equalTo("object");

      cleanUpAfter();
    }

    function cleanUpAfter() {
      Collection.prototype.deleteWebSQL('kid', function () {
        Collection.prototype.deleteWebSQL('people', function () {
          websql.deleteTable('collectionType', function () {
            sc.resolve();
          });
        });
      });
    }
  });

  scRunner.add('Manage Boolean values', function (sc) {
    cleanUp();

    function cleanUp() {
      Collection.prototype.deleteWebSQL('kid', function () {
        websql.deleteTable('collectionType', createNewCollectionKid);
      });
    }

    function createNewCollectionKid() {
      window.cKid = new Collection({
        type: 'kid',
        default: {
          name: 'Melissa',
          age: '6',
          isFemale: false
        },
        callback: function(collection) {
          window.cKid = collection;
          addListModelToCollectionKid();
        },
        debug: false
      });
    }

    function addListModelToCollectionKid() {
      window.cKid.addArray([
        {
          name: 'Melissa',
          age: '6',
          isFemale: true
        },
        {
          name: 'Adam',
          age: '7',
          isFemale: false
        },
        {
          name: 'Steve',
          age: '7'
        }
      ], checkCollectionInDB);
    }

    function checkCollectionInDB() {
      websql.run('SELECT isFemale FROM c_kid WHERE id=1;', function(item) {
        sc.test('Boolean value should be saved as string. Check true.')
          .check(typeof item.isFemale)
          .equalTo('string');
      }, function() {
        websql.run('SELECT isFemale FROM c_kid WHERE id=2;', function(item) {
          sc.test('Boolean value should be saved as string. Check false.')
            .check(typeof item.isFemale)
            .equalTo('string');
        }, function () {
          websql.run('SELECT isFemale FROM c_kid WHERE id=3;', function(item) {
            sc.test('If undefined, default value should be saved.')
              .check(item.isFemale)
              .equalTo('false');
          }, ReloadCollectionFromDB);
        });
      });
    }

    function ReloadCollectionFromDB() {
      window.cKidReloaded = new Collection({
        type: 'kid',
        default: {
          name: 'Melissa',
          age: '6',
          isFemale: 'true'
        },
        callback: function(collection) {
          window.cKid = collection;
          checkReloadedCollection();
        },
        debug: false
      });
    }

    function checkReloadedCollection() {
      sc.test('Boolean value should be loaded back as boolean from string type in DB. Check true. Check true.')
        .check(typeof window.cKidReloaded.JSON[0].isFemale)
        .equalTo('boolean');

      sc.test('Boolean value should be loaded back as boolean from string type in DB. Check true. Check false.')
        .check(typeof window.cKidReloaded.JSON[1].isFemale)
        .equalTo('boolean');

      updateModelInCollection();
    }

    function updateModelInCollection() {
      window.cKid.JSON[0].isFemale = false;
      window.cKid.check();

      checkUpdateInDB();
    }

    function checkUpdateInDB() {
      websql.run('SELECT isFemale FROM c_kid WHERE id=1;', function(item) {
        sc.test('Boolean value should be updated in DB. Check true to false.')
          .check(item.isFemale)
          .equalTo('false');
      }, cleanUpAfter);
    }

    function cleanUpAfter() {
      Collection.prototype.deleteWebSQL('kid', function () {
        websql.deleteTable('collectionType', function () {
          sc.resolve();
        });
      });
    }
  });

  var webSQLAsText;

  scRunner.add('Export WebSQL to Text', function (sc) {
    cleanUpBefore();

    function cleanUpBefore() {
      websql.deleteTable('c_kid', function () {
        websql.deleteTable('c_people', function () {
          websql.deleteTable('c_people_address', function () {
            websql.deleteTable('collectionType', createCollectionKid);
          });
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
        debug: false
      });
    }

    function addListToKid() {
      window.cKid.addArray([
        {
          name: 'Jane',
          age: '6'
        },
        {
          name: 'Tom',
          age: '5'
        }
      ], creteCollectionPeople);
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
          },
          listKid: 'collectionType_kid'
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
        },
        listKid: []
      }, addListToKidInPeopleCollection);
    }

    function addListToKidInPeopleCollection() {
      window.cPeople.JSON[0].listKid.addArray([
        {
          name: 'Melissa',
          age: '6'
        },
        {
          name: 'Adam',
          age: '5'
        }
      ], exportCollections);
    }

    function exportCollections() {
      Collection.export(function(dbAsText) {
        webSQLAsText = dbAsText;
        checkResult(dbAsText);
      });
    }

    function checkResult(dbAsText) {
      var dbAsObj = JSON.parse(dbAsText);

      sc.test('collectionType should have "kid" Collection listed.')
        .check(dbAsObj.collectionType[0].nameCollection)
        .equalTo('kid');

      sc.test('collectionType should have "people" Collection listed.')
        .check(dbAsObj.collectionType[1].nameCollection)
        .equalTo('people');

      var listIdLink = Collection.prototype.pluck(dbAsObj['c_kid'], 'idLink');

      sc.test('Models that are in Sub Collections should be filtered off.')
        .check(listIdLink.join(''))
        .equalTo('-1-1');

      sc.test('Sub Collections should be saved in main Collection.')
        .check(dbAsObj['c_people'][0].listKid.nameCollection)
        .equalTo('kid');

      cleanUpAfter();
    }

    function cleanUpAfter() {
      websql.deleteTable('c_kid', function () {
        websql.deleteTable('c_people', function () {
          websql.deleteTable('c_people_address', function () {
            websql.deleteTable('collectionType', function() {
              sc.resolve();
            });
          });
        });
      });
    }
  });

  scRunner.add('Import WebSQL from Text', function (sc) {
    var listCollectionRestored = {};
    cleanUpBefore();

    function cleanUpBefore() {
      websql.deleteTable('c_kid', function () {
        websql.deleteTable('c_people', function () {
          websql.deleteTable('c_people_address', function () {
            websql.deleteTable('collectionType', restoreAllCollection);
          });
        });
      });
    }

    function restoreAllCollection() {
      var webSQLAsObj = JSON.parse(webSQLAsText),
          listCmdLoadCollection = new Collection.prototype.asyncRunner();

      webSQLAsObj.collectionType.forEach(function (collectionType) {
        listCmdLoadCollection.schedule(function(resolve) {
          new Collection({
            type: collectionType.nameCollection,
            default: collectionType.defaultModel,
            callback: function (collection) {
              listCollectionRestored[collectionType.nameCollection] = collection;
              resolve();
            }
          });
        });
      });

      listCmdLoadCollection.done(restoreModelsInCollections);
      listCmdLoadCollection.run();
    }

    function restoreModelsInCollections() {
      var webSQLAsObj = JSON.parse(webSQLAsText),
          listCmdAddModelToCollection = new Collection.prototype.asyncRunner();

      console.log('webSQLAsObj', webSQLAsObj);

      Object.keys(webSQLAsObj).forEach(function(key) {
        // filter off everything but collections
        if (key.indexOf('c_') === -1) {
          return;
        }

        var collection = webSQLAsObj[key],
            nameCollection = key.replace('c_', '');

        loadCollection(collection, nameCollection);

        function loadCollection(collection, nameCollection) {
          collection.forEach(function (model) {
            listCmdAddModelToCollection.schedule(function (resolve) {
              var modelFiltered = filterModel(model);

              // Filter off 'id' and 'idLink' properties
              function filterModel(model) {
                var modelFiltered = {};
                Object.keys(model).forEach(function (keyModel) {
                  if (keyModel === 'id' ||
                    keyModel === 'idLink'
                    ) {
                    return;
                  }

                  // if property is an object
                  if (typeof model[keyModel] === 'object') {
                    // if Object is another Collection
                    if (typeof model[keyModel].nameCollection !== 'undefined') {
                      modelFiltered[keyModel] = loadCollection(model[keyModel].JSON, model[keyModel].nameCollection);
                    } else {
                      modelFiltered[keyModel] = filterModel(model[keyModel]);
                    }
                  } else {
                    modelFiltered[keyModel] = model[keyModel];
                  }
                });

                return modelFiltered;
              }

              listCollectionRestored[nameCollection].add(modelFiltered, resolve);
            });
          });
        };

        listCmdAddModelToCollection.run();
      });
    }
  });

  scRunner.run('Export WebSQL to Text');

  setTimeout(function () {
    scRunner.run('Import WebSQL from Text');
  }, 1000);


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