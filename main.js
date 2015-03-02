var app = angular.module('app', []);

// Done: break up the test to scenarios
// Done: Create 'car' and and 'kid' collection types, check for errors if not done yet
// Todo: link up other collections in collections. Pass along the id
// Todo: collection.empty, collection.deleteTables, collection.update
// Todo: Sync JSON

app.controller('AppCtrl', function () {
  console.log('Controller loaded');

//  createNewCollection();
  createNewCollectionThenAdd();
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
      }, callback);
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