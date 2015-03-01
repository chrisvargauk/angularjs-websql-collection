var app = angular.module('app', []);

// Done: break up the test to scenarios
// Todo: Create 'car' and and 'kid' collection types, check for errors if not done yet
// Todo: link up other collections in collections. Pass along the id
// Todo: collection.empty, collection.deleteTables, collection.update
// Todo: Sync JSON

app.controller('AppCtrl', function () {
  console.log('Controller loaded');

//  createNewCollection();
//  createNewCollectionThenAdd();
//  createNewCollectionLoadFromDB();
  createNewCollWithOtherCollectionsInIt();
//  runCrawler();

  function createNewCollection() {
    var modelBlueprint = {
      name: 'John',
      age: 12,
      address: {
        line1: '93. Meridian place',
        line2: 'London',
        postCode: 'E14 9FF'
      },
      listCar: ['audi', 'BMW', 'Golf'],
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
      callback: getModelFromPeople,
      debug: true
    });
  }

  function createNewCollectionThenAdd() {
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
      callback: getModelFromPeople,
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
        listCar: ['audi', 'BMW', 'Golf'],
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
    window.kid = new Collection({
      type: 'kid',
      default: {
        name: 'Melissa',
        age: '6'
      },
      debug: true
    });

//    var modelBlueprint = {
//      name: 'John',
//      age: 12,
//      address: {
//        line1: '93. Meridian place',
//        line2: 'London',
//        postCode: 'E14 9FF'
//      },
//      listCar: ['audi', 'BMW', 'Golf'],
//      listKid: [
//        {
//          name: 'Melissa',
//          age: 6
//        },
//        {
//          name: 'Jeff',
//          age: 5
//        }
//      ]
//    };
//
//    window.peopel = new Collection({
//      type: 'people',
//      default: {
//        name: 'John',
//        age: '12',
//        address: {
//          line1: '93. Meridian place',
//          line2: 'London',
//          postCode: 'E14 9FF'
//        },
//        listCar: 'collectionType_car',
//        listKid: 'collectionType_kid'
//      },
//      filter: 'id < 4',
//      callback: getModelFromPeople,
//      debug: true
//    });
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
      listCar: ['audi', 'BMW', 'Golf'],
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
});