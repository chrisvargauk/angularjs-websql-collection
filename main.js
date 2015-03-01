var app = angular.module('app', []);

app.controller('AppCtrl', function () {
  console.log('Controller loaded');

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

  window.peopel = new Collection('people', {
    name: 'John',
    age: '12',
    address: {
      line1: '93. Meridian place',
      line2: 'London',
      postCode: 'E14 9FF'
    },
    listCar: 'collectionType_car',
    listKid: 'collectionType_kid'
  }, {
    debug: true
  }, addModelToPeople);

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
    }, getModelFromPeople);
  }

  function getModelFromPeople () {
    console.log('hehe :)');

//    window.peopel.getById(1);
//    window.peopel.getByQuery();
  }

//  window.listMonth = new Collection('month', 'July', {debug: true});
});