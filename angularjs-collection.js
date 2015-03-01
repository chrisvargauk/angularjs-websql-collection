/*
* Dependencies: angularjs, websql
* Syntax: var collectionInstance = new Collection(collectionName, defaultModel, Options);
* Options: {
*   debug: true/false
* }
*
* Reserved words and chars: '_' in keys,
* 'collectionType_', 'nameTable(@)', 'collectionType(@)' in values
*
* */

//var Collection = function Collection(nameCollection, modelDefault, objOption, callback) {
var Collection = function Collection(objOption) {
  var that = this,
      objOptionDefault = {
        type: undefined,
        filter: undefined,
        default: undefined,
        callback: undefined,
        debug: false
      };

  // Read Options
  that.opt = {};
  Object.keys(objOptionDefault).forEach(function (key) {
    var value = objOption[key],
        valueDefault = objOptionDefault[key];

    that.opt[key] = value || valueDefault;
  });

  that.nameCollection = that.opt.type;
  that.modelDefault = that.opt.default;
  that.callback = that.opt.callback;
  that.JSON = [];

  // Name of the collection is always required
  if (typeof that.nameCollection === 'undefined') {
    throw "Collection: collection type is required."
  }

  // If new collection is gonna be added to database
  if (typeof that.modelDefault !== 'undefined') {
    that.checkDependencies();
    that.createMasterTable(function () {
      var listSqlCtreateTabelForCollDimens = that.analyseModelDefault(that.modelDefault);
      that.log('listSql', listSqlCtreateTabelForCollDimens);
      that.executeSqlQueryList(listSqlCtreateTabelForCollDimens, function () {
        that.log('Tabels Are Created for Collection');
        if (typeof that.callback === 'function') {
          that.callback();
        }
      });
    });
  } else {
    that.JSON = that.loadCollectionFromWebsql('c_'+that.nameCollection, that.opt.filter);
  }
};

Collection.prototype.loadCollectionFromWebsql = function (keyDimension, sqlFilter, callback) {
  var that = this,
      JSON = [];

  if (typeof sqlFilter === 'undefined') {
    var sql = 'SELECT * FROM "'+keyDimension+'";';
  } else {
    var sql = 'SELECT * FROM "'+keyDimension+'" WHERE '+sqlFilter+';';
  }

  websql.run(sql, function (item) {
    var currentDimension = {};
    that.log('item: ', item);

    Object.keys(item).forEach(function(key){
      var value = item[key]+'';

      // if value is pointing to another table
      if (value && value.indexOf('nameTable(@)') !== -1) {
        var nextDimAsArray;
        nextDimAsArray = that.loadCollectionFromWebsql(value.split('(@)')[1], 'id='+item.id, function () {
          currentDimension[key] = nextDimAsArray[0];
        });
      } else {
        currentDimension[key] = value;
      }
    });

    JSON.push(currentDimension);
  }, function () {
    if (typeof callback === "function") {
      callback();
    }
  });

  return JSON;
};

Collection.prototype.checkDependencies = function () {
  // check for Angular
  if (typeof angular === 'undefined') {
    throw 'Collection: AngularJS is not initialised yet.';
    return false;
  }

  // check for WebSQL
  if (typeof websql === 'undefined') {
    throw 'Collection: WebSQL is not initialised yet.';
    return false;
  }
};

Collection.prototype.createMasterTable = function (callback) {
  var sql = 'CREATE TABLE IF NOT EXISTS "master" (id INTEGER PRIMARY KEY ASC, tableName TEXT, columns TEXT);';
  websql.run(sql, undefined, callback);
};

Collection.prototype.analyseModelDefault = function (modelDefault, keyDimension, listSql) {
  var that = this;

//  that.log('Start analysing Default Model.');

  // Check whether undefined
  if (typeof modelDefault === 'undefined') {
    throw 'Collection: Default model is undefined.';
  }

  // string, number, object, array

  /*
  * string, number: error
  * obj: analyseObj
  * array: obj  -> recursion -> analyseObj
  * array: simple value -> recursion -> error
  * */

  // check whether current dimension is undefined
  if (typeof modelDefault === 'undefined') {
    throw 'Collection: Default model is undefined.';
  }

  // check whether current dimension is not an object
  if (Object.prototype.toString.call(modelDefault) !== '[object Object]') {
    throw 'Collection: Dimension "'+keyDimension+'" is not an object. It is '+Object.prototype.toString.call(modelDefault)+', value: '+modelDefault;
  }

  var keyDimension = keyDimension || that.nameCollection,
      sqlCreateTable = 'CREATE TABLE IF NOT EXISTS "c_' + keyDimension + '" (id INTEGER PRIMARY KEY ASC',
      listSql = listSql || [];

  // Check key value pairs on current dimension
  Object.keys(modelDefault).forEach(function (key) {
    var value = modelDefault[key],
        type = Object.prototype.toString.call(value);

    that.log(keyDimension + '.' + key + ' - ' + value + ' (' + type + ')');

    switch (type) {
      case '[object Object]':
        // Check new dimension recursively
        that.analyseModelDefault(value, keyDimension+'_'+key, listSql);
        break;
      case '[object Array]':
        throw "collection: default Model can NOT contain Array. At Key: "+keyDimension+'_'+key;
        break;
      case '[object Number]':
        throw "collection: default Model can NOT contain Number type, use String type to represent numbers - only in default Model. At Key: "+keyDimension+'_'+key;
        break;
      case '[object String]':
        if (value.indexOf('collectionType_') !== -1) {
          that.log('New Collection is registered at '+keyDimension+'_'+key);
        }
        break;
    }

    sqlCreateTable += ', '+key+' TEXT';
  });

  sqlCreateTable += ');';
  that.log('sqlCreateTable: ' + sqlCreateTable);
  listSql.push(sqlCreateTable);

  return listSql;
};

Collection.prototype.executeSqlQueryList = function (listSql, callback) {
  var ctr = 0;

  listSql.forEach(function (sql) {
    websql.run(sql, undefined, function () {
      ctr += 1;
      if (ctr === listSql.length && typeof callback === "function") {
        callback();
      }
    });
  });
};

Collection.prototype.add = function (model, callback) {
  var that = this,
      keyDimension = that.nameCollection,
      listSql = [];

  // Start checking model on root dimension
  var listSqlInsertAllDimension = checkRecursively(model, that.modelDefault, keyDimension);
  that.log('temp/add: listSql', listSqlInsertAllDimension);

  // Add all dimentions of Collection to Tables
  that.executeSqlQueryList(listSqlInsertAllDimension, function () {
    that.log('temp/add: Collections dimensions(key-value pairs) are inserted into relevant tables.');

    if (typeof callback === "function") {
      callback();
    }
  });

  function checkRecursively(modelTargetDim, modelDefaultTargetDim, keyDimension) {
    // check whether current dimension is undefined
    if (typeof modelTargetDim === 'undefined') {
      throw 'Collection.add: modelTargetDim is undefined.';
    }

    // check whether current dimension is not an object
    if (Object.prototype.toString.call(modelTargetDim) !== '[object Object]') {
      throw 'Collection.add: Dimension "' + keyDimension + '" is not an object. It is ' + Object.prototype.toString.call(modelTargetDim) + ', value: ' + modelTargetDim;
    }

    // Check integrity before taking any action on database or JSON
    compareObj(modelTargetDim, modelDefaultTargetDim);

    // Add key value pairs by dimensions/tables
    var sqlInsert = 'INSERT INTO "c_' + keyDimension + '"',
      listKey = [],
      listValue = [];

    Object.keys(modelTargetDim).forEach(function (key) {
      var value = modelTargetDim[key],
        type = Object.prototype.toString.call(value);

      that.log('temp/add: ' + key + ' - ' + value + ' (' + type + ')');

      switch (type) {
        case '[object Object]':
          checkRecursively(value, modelDefaultTargetDim[key], keyDimension+'_'+key);
          listKey.push(key);
          listValue.push('nameTable(@)c_'+keyDimension+'_'+key);
          break;
        case '[object Array]':
          listKey.push(key);
          listValue.push(modelDefaultTargetDim[key].split('_').join('(@)'));
          break;
        case '[object Number]':
          listKey.push(key);
          listValue.push(value + '');
          break;
        case '[object String]':
          listKey.push(key);
          listValue.push(value);
          break;
      }

    });
    sqlInsert += ' (' + listKey.join(',') + ') VALUES ("' + listValue.join('","') + '");';
    that.log('temp/add: sqlInsert', sqlInsert);
    listSql.push(sqlInsert);

    return listSql;
  }

  // call callback when done

  function compareObj(model, modelDefault) {
    var listKeyModel = Object.keys(model),
        listKeyModelDefault = Object.keys(modelDefault);

    var listKeyModelDiff = listKeyModel.filter(function (key) {
      return listKeyModelDefault.indexOf(key) === -1;
    });

    if (listKeyModelDiff.length > 0) {
      throw 'Collection.add: Model to be added is inconsistent with default Model. New key(s) found: ' + listKeyModelDiff.join(',');
    }
  }
};

Collection.prototype.getById = function (id) {

};

Collection.prototype.getByQuery = function (sql) {

};

Collection.prototype.log = function (msg, obj) {
  var that = this;

  if (that.opt.debug) {
    if (typeof obj === 'undefined') {
      console.log('Collection: ' + msg);
    } else {
      console.log('Collection: ' + msg, obj);
    }
  }
};