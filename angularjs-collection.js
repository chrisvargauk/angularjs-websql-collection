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
        idLink: -1,
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
  that.ctrLoadingDims = 0;

  // Name of the collection is always required
  if (typeof that.nameCollection === 'undefined') {
    that.log('Default Model at Error: ',that.modelDefault);
    throw "Collection: collection type is required.";
  }

  // If new collection is gonna be added to database
  if (typeof that.modelDefault !== 'undefined') {
    that.checkDependencies();
    that.createMasterTable(function () {
      var listSqlCtreateTabelForCollDimens = that.analyseModelDefault(that.modelDefault);
      that.log('listSql', listSqlCtreateTabelForCollDimens);
      that.executeSqlQueryList(listSqlCtreateTabelForCollDimens, function () {
        that.log('Tabels Are Created for Collection. Load existing collection from webSQL if any.');
        that.addCollToMasterTable(that.nameCollection, that.modelDefault, function() {
          // Load existing collection from webSQL if any
          if(that.opt.idLink === -1) {
            that.JSON = that.loadCollectionFromWebsql('c_'+that.nameCollection, that.opt.filter);
          } else {
            that.JSON = that.loadCollectionFromWebsql('c_'+that.nameCollection, 'idLink='+that.opt.idLink);
          }
        });
      });
    });
  } else {
    //todo: check if the collection exist in db

    that.loadDefaultModelFromWebsql(function () {
      if(that.opt.idLink === -1) {
        that.JSON = that.loadCollectionFromWebsql('c_'+that.nameCollection, that.opt.filter);
      } else {
        that.JSON = that.loadCollectionFromWebsql('c_'+that.nameCollection, 'idLink='+that.opt.idLink);
      }
    });

//    that.JSON = that.loadCollectionFromWebsql('c_'+that.nameCollection, that.opt.filter);
  }
};

Collection.prototype.loadDefaultModelFromWebsql = function (callback) {
  var that = this,
      sql = "SELECT * FROM master WHERE nameCollection='"+that.nameCollection+"';";

  websql.run(sql, function(item) {
    that.modelDefault = JSON.parse(item.defaultModel);
    that.log('.loadDefaultModelFromWebsql(): modelDefault is loaded:', that.modelDefault);
  }, callback);
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
    that.log('.loadCollectionFromWebsql(): row item: ', item);

    Object.keys(item).forEach(function(key){
      var value = item[key]+'';

      // if value is pointing to another table
      if (value && value.indexOf('nameTable(@)') !== -1) {
        var nextDimAsArray;
        that.ctrLoadingDims++;
        nextDimAsArray = that.loadCollectionFromWebsql(value.split('(@)')[1], 'id='+item.id, function () {
          currentDimension[key] = nextDimAsArray[0];
          that.ctrLoadingDims--;
        });
      } else if (value && value.indexOf('collectionType(@)') !== -1) {
        that.ctrLoadingDims++;
        currentDimension[key] = new Collection({
          type: (value.split('(@)')[1]),
          idLink: item.id,
          callback: function (JSON) {
            that.ctrLoadingDims--;
            if (typeof that.opt.callback === "function" && that.ctrLoadingDims === 0) {
              that.opt.callback(that.JSON);
            }
          },
          debug: that.opt.debug
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

    if (typeof that.opt.callback === "function" && that.ctrLoadingDims === 0) {
      that.opt.callback(that.JSON);
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
  var sql = 'CREATE TABLE IF NOT EXISTS "master" (id INTEGER PRIMARY KEY ASC, nameCollection TEXT, defaultModel TEXT);';
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

  // check whether current dimension is an object
  if (Object.prototype.toString.call(modelDefault) !== '[object Object]') {
    throw 'Collection: Dimension "'+keyDimension+'" is not an object. It is '+Object.prototype.toString.call(modelDefault)+', value: '+modelDefault;
  }

  var keyDimension = keyDimension || that.nameCollection,
      sqlCreateTable = 'CREATE TABLE IF NOT EXISTS "c_' + keyDimension + '" (id INTEGER PRIMARY KEY ASC, idLink INTEGER',
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

Collection.prototype.addCollToMasterTable = function(nameCollection, modelDefault, callback) {
  var that = this;

  that.log('Add Collection to Master table if not in it yet.');

  var sqlSelect = "SELECT * FROM master WHERE nameCollection='"+nameCollection+"';",
      sqlSaveModelDefault = "INSERT INTO 'master' (nameCollection, defaultModel) VALUES ('"+nameCollection+"', '"+JSON.stringify(modelDefault)+"')";

  var ctrRow = 0;
  websql.run(sqlSelect, function() {
    ctrRow += 1;
  }, function () {
    // If collection is not added to Master table yet
    if (!ctrRow) {
      websql.run(sqlSaveModelDefault, undefined, callback);
    } else {
      if(that.isUndefined()) {
        callback();
      }
    }
  });
};

Collection.prototype.add = function (model, callback) {
  var that = this,
      keyDimension = that.nameCollection,
      JSONtemp = {},
      idLink = that.opt.idLink;

  var runner = new that.asyncRunner();

  window.runner = runner;

  runner.done(function () {
    that.log('temp/add: Collections dimensions(key-value pairs) are inserted into relevant tables.');

    that.JSON.push(JSONtemp);
    if (typeof callback === "function") {
      callback();
    }
  });

  checkRecursively(model, that.modelDefault, keyDimension, {JSONCurrentDim: JSONtemp});
  that.log('temp/add: runner.listCmd', runner.listCmd);

  runner.listCmd.reverse();
  runner.run();

  function checkRecursively(modelTargetDim, modelDefaultTargetDim, keyDimension, linkToPrevDimJSONKey) {
    var JSONCurrentDim = {};

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
          JSONCurrentDim[key] = 'loading..';
          checkRecursively(value, modelDefaultTargetDim[key], keyDimension+'_'+key, {
            JSONCurrentDim: JSONCurrentDim,
            key: key
          });
          listKey.push(key);
          listValue.push('nameTable(@)c_'+keyDimension+'_'+key);
          break;
        case '[object Array]':
          JSONCurrentDim[key] = modelDefaultTargetDim[key].split('_').join('(@)');
          listKey.push(key);
          listValue.push(modelDefaultTargetDim[key].split('_').join('(@)'));
          break;
        case '[object Number]':
          JSONCurrentDim[key] = value+'';
          listKey.push(key);
          listValue.push(value+'');
          break;
        case '[object String]':
          JSONCurrentDim[key] = value+'';
          listKey.push(key);
          listValue.push(value);
          break;
      }

    });
    sqlInsert += ' (idLink, ' + listKey.join(',') + ') VALUES (@replaceMe@, "' + listValue.join('","') + '");';
    that.log('temp/add: sqlInsert', sqlInsert);

    runner.schedule(function (resolve) {
      var callback = function (results) {
        idLink = results.insertId;

        // Add current dim obj to source in prev dim obj
        var key = linkToPrevDimJSONKey.key,
          JSONPrevDim = linkToPrevDimJSONKey.JSONCurrentDim;

        // if key is not defined than that is root
        if (!that.isUndefined(key)) {
          JSONCurrentDim.id = results.insertId;
          JSONPrevDim[key] = JSONCurrentDim;
        } else {
          JSONCurrentDim.id = results.insertId;
          JSONtemp = JSONCurrentDim;
        }

        var runnerSubColl = new that.asyncRunner();

        runnerSubColl.done(function () {
          resolve();
        });

        //Turn marks to collections on current dimension
        Object.keys(JSONCurrentDim).forEach(function (key) {
          var value = JSONCurrentDim[key]+'';

          if(value.indexOf('collectionType(@)') !== -1) {
            var nameCollection = value.split('(@)')[1];

            runnerSubColl.schedule(function(resolveSubColl){
              JSONCurrentDim[key] = new Collection({
                type: nameCollection,
                debug: that.opt.debug,
                idLink: idLink,
                callback: function() {
                  resolveSubColl();
                }
              });
            });
          }
        });

        runnerSubColl.run();
      };

      JSONCurrentDim.idLink = idLink;
      sqlInsert = sqlInsert.replace('@replaceMe@', idLink);

      websql.run(sqlInsert, undefined, callback);
    });
  }

  function compareObj(model, modelDefault) {
    if (that.isUndefined(model)) {
      console.log('modelDefault at Error: ', modelDefault);
      throw 'Collection.add(): model cant be undefined';
    }

    if (that.isUndefined(modelDefault)) {
      console.log('Model at Error: ', model);
      throw 'Collection.add(): modelDefault cant be undefined';
    }

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

Collection.prototype.addArray = function (listModel, callback) {
  var that = this;

  if (Object.prototype.toString.call(listModel) !== '[object Array]') {
    throw 'Collection.addArray(): listModel is not an Array.';
  }

  var listCmdAddModel = [];
  listModel.forEach(function (model) {
    listCmdAddModel.push({
      status: 'scheduled',
      model: model
    });
  });

  loopListCmd(listCmdAddModel);

  function loopListCmd(listCmdAddModel) {
    for (index in listCmdAddModel) {
      var cmd = listCmdAddModel[index];
      if (cmd.status === 'scheduled') {
        cmd.status = 'inProgress';
        that.add(cmd.model, function () {
          cmd.status = 'added';
          var listStatus = that.pluck(listCmdAddModel, 'status');

          if (that.ctrItem(listStatus, 'added') !== listCmdAddModel.length) {
            loopListCmd(listCmdAddModel);
          } else {
            if (!that.isUndefined(callback)) {
              callback();
            }
          }
        });
        break;
      }
    }
  }
};

Collection.prototype.removeById = function (nameCollection, idToRemove, callbackEnd) {
  console.log('Collection.removeById(): Remove id:', idToRemove);

  var that = this;

  if (that.isUndefined(nameCollection)) {
    throw "Collection.removeById(): nameCollection is required.";
  }

  if (that.isUndefined(idToRemove)) {
    throw "Collection.removeById(): removeById is required.";
  }

  that.ifNOTInDB('c_'+nameCollection, "id='"+idToRemove+"'", function() {
    throw 'Collection.removeById: id "'+idToRemove+'" is NOT in Collection "'+nameCollection+'" table.';
  });

  that.ifInDB('c_'+nameCollection, "id='"+idToRemove+"'", function(ctr, listItem) {
    var item = listItem[0];

    console.log('Collection.removeById(): item: ', item);

    var listSql = [],
        ctrDimCrawler = 0;
    var sqlDeleteDim = "DELETE FROM c_" + nameCollection + " WHERE id=" + idToRemove;
    listSql.push(sqlDeleteDim);

    recursiveCrawler('c_'+nameCollection, 'id='+idToRemove, function() {

    });

    function recursiveCrawler(nameCollection, filter, callback) {
      var sql = "SELECT * FROM '"+nameCollection+"' WHERE "+filter;

      websql.run(sql, function (item) {
        var idCurrent

        Object.keys(item).forEach(function (key) {
          var value = item[key]+'';

          console.log('Collection.removeById(): '+nameCollection+'['+key+']: ', value);

          if (key === 'id') {
            idCurrent = value;
          }

          if (value.indexOf('nameTable(@)') !== -1) {
            var nameCollNext = value.split('(@)')[1];
            console.log('Collection.removeById(): nameCollNext: ', nameCollNext);
            var sqlDeleteDim = "DELETE FROM " + nameCollNext + " WHERE idLink=" + idCurrent;
            listSql.push(sqlDeleteDim);
            ctrDimCrawler++;
            recursiveCrawler(nameCollNext, 'idLink='+idCurrent, function () {
              ctrDimCrawler--;
            });
          }

          if (value.indexOf('collectionType(@)') !== -1) {
            var nameCollNext = value.split('(@)')[1];
            console.log('Collection.removeById(): nameCollNext: ', nameCollNext);
            var sqlDeleteDim = "DELETE FROM c_" + nameCollNext + " WHERE idLink=" + idCurrent;
            listSql.push(sqlDeleteDim);
            ctrDimCrawler++;
            recursiveCrawler('c_'+nameCollNext, 'idLink='+idCurrent, function () {
              ctrDimCrawler--;
            });
          }
        });
      }, function () {
        if (typeof callback === 'function') {
          callback();
        }

        if (ctrDimCrawler === 0) {
          console.log('Collection.removeById(): Recursion end.');
          console.log('Collection.removeById(): listSql: ', listSql);

          executeSqlList(listSql, callbackEnd);
        }
      });
    }

    function executeSqlList(listSql, callback) {
      that.executeSqlQueryList(listSql, function() {
        removeFromJSON();
        callback();
      });
    }

    function removeFromJSON () {
      var indexModelToRemove = -1;
      for (var index in that.JSON) {
        var model = that.JSON[index];
        if (model.id == idToRemove) {
          indexModelToRemove = parseInt(index);
        }
      }

      if (indexModelToRemove !== -1) {
        that.JSON.splice(indexModelToRemove, 1);
      }

      console.log('Collection.removeById(): model is removed from JSON as well.');
    }
  });
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

// Empty All related tables to given collection in WebSQL.
Collection.prototype.emptyWebSQL = function (nameCollection, callback) {
  var that = this;

  nameCollection = nameCollection || that.nameCollection;

  if (that.isUndefined(nameCollection)) {
    throw "Collection.emptyWebSQL(): nameCollection is required.";
  }

  that.ifNOTInDB('master', "nameCollection='"+nameCollection+"'", function() {
    throw 'Collection.emptyWebSQL: Collection "'+nameCollection+'" is NOT in master table.';
  });

  that.ifInDB('master', "nameCollection='"+nameCollection+"'", function(ctr, listItem) {
    var item = listItem[0],
        defaultModel = JSON.parse(item.defaultModel);

    console.log('defaultModel: ', defaultModel);

    var ctrIter = 0;
    that.crawler(defaultModel, undefined, undefined, function (obj, keyDimension) {
      console.log('Iterator : ['+keyDimension+'] ', obj);
      ctrIter++;
      websql.emptyTable('c_'+keyDimension, function () {
        ctrIter--;
        if (ctrIter === 0 && typeof callback === 'function') {
          callback();
        }
      });
    }, nameCollection);
  });
};

// Delete All related tables to given collection in WebSQL.
Collection.prototype.deleteWebSQL = function (nameCollection, callback) {
  var that = this;

  nameCollection = nameCollection || that.nameCollection;

  if (that.isUndefined(nameCollection)) {
    throw "Collection.deleteWebSQL(): nameCollection is required.";
  }

  that.ifNOTInDB('master', "nameCollection='"+nameCollection+"'", function() {
//    throw 'Collection.deleteWebSQL: Collection "'+nameCollection+'" is NOT in master table.';
    callback();
  });

  that.ifInDB('master', "nameCollection='"+nameCollection+"'", function(ctr, listItem) {
    var item = listItem[0],
      defaultModel = JSON.parse(item.defaultModel);

    console.log('defaultModel: ', defaultModel);

    var ctrIter = 0;
    that.crawler(defaultModel, undefined, undefined, function (obj, keyDimension) {
      ctrIter++;
      websql.deleteTable('c_'+keyDimension, function () {
        websql.run("DELETE FROM 'master' WHERE nameCollection='" + nameCollection + "';", undefined, function () {
          ctrIter--;
          if (ctrIter === 0 && typeof callback === 'function') {
            callback();
          }
        });
      });
    }, nameCollection);
  });
};

// Util Methods

Collection.prototype.isUndefined = function (item) {
  return typeof item === 'undefined';
};

Collection.prototype.ifNOTInDB = function (nameTable, sqlFilter, callback) {
  var that = this;

  if (that.isUndefined(nameTable)) {
    throw "Collection.ifInDB(): nameTable is required.";
  }

  if (that.isUndefined(callback)) {
    throw "Collection.ifInDB(): callback is required.";
  }

  that.ctrEntry(nameTable, sqlFilter, function(ctr, listItem) {
    if (ctr === 0) {
      callback();
    }
  });
};

Collection.prototype.ifInDB = function (nameTable, sqlFilter, callback) {
  var that = this;

  if (that.isUndefined(nameTable)) {
    throw "Collection.ifInDB(): nameTable is required.";
  }

  if (that.isUndefined(callback)) {
    throw "Collection.ifInDB(): callback is required.";
  }

  that.ctrEntry(nameTable, sqlFilter, function(ctr, listItem) {
    if (ctr > 0) {
      callback(ctr, listItem);
    }
  });
};

Collection.prototype.ctrEntry = function (nameTable, sqlFilter, callback) {
  var that = this;

  if (that.isUndefined(nameTable)) {
    throw "Collection.ctrEntry(): nameTable is required.";
  }

  if (that.isUndefined(callback)) {
    throw "Collection.ctrEntry(): callback is required.";
  }

  var sqlSelect = "SELECT * FROM '"+nameTable+"'";

  if(!that.isUndefined(sqlFilter)) {
    sqlSelect += " WHERE "+sqlFilter+";";
  }

  var ctrRow = 0,
      listItem = [];
  websql.run(sqlSelect, function(item) {
    ctrRow += 1;
    listItem.push(item);
  }, function () {
    callback(ctrRow, listItem);
  });
};

/* Description: It crawls through a multi-dim obj and runs the callback on every key-value pair.
 * If you pass a filter, it will run the filter on every key-value pair and caries on
 * only if the filter returns true.
 * */
Collection.prototype.crawler = function (obj, iterator, filter, iteratorDimEnd, keyDimension) {
  var that = this;

  Object.keys(obj).forEach(function (key) {
    var value = obj[key];

    if (!that.isUndefined(iterator)) {
      iterator(value, key, keyDimension+'_'+key);
    }

    if (typeof value === 'object') {
      if(that.isUndefined(filter)) {
        that.crawler(value, iterator, filter, iteratorDimEnd, keyDimension+'_'+key);
      } else {
        if (filter(value, key)) {
          that.crawler(value, iterator, filter, iteratorDimEnd, keyDimension+'_'+key);
        }
      }
    }
  });

  if (!that.isUndefined(iteratorDimEnd)) {
    iteratorDimEnd(obj, keyDimension);
  }
};

Collection.prototype.executeSqlQueryList = function (listSql, callback) {
  var that = this,
      ctr = 0;

  if (that.isUndefined(listSql)) {
    throw "Collection.executeSqlQueryList(): listSql is required.";
  }

  listSql.forEach(function (sql) {
    websql.run(sql, undefined, function () {
      ctr += 1;
      if (ctr === listSql.length && typeof callback === "function") {
        callback();
      }
    });
  });

  // If there was no sql provided call the callback anyways
  if (listSql.legth === 0 && typeof callback === "function") {
    callback();
  }
};

Collection.prototype.executeCommandList = function (listCmd, callback) {
  var that = this,
      ctrIterCallback = 0;

  if (that.isUndefined(listCmd)) {
    throw "Collection.executeCommandList(): listSql is required.";
  }

  listCmd.forEach(function (cmd) {
    websql.run(cmd.sql, undefined, function (results) {
      if (!that.isUndefined(cmd.callback)) {
        cmd.callback(results);
      }

      ctrIterCallback++;
      if (ctrIterCallback === listCmd.length && typeof callback === "function") {
        callback(results);
      }
    });
  });

  // If there was no command provided call the callback anyways
  if (listCmd.length === 0 && typeof callback === "function") {
    callback();
  }
};

Collection.prototype.pluck = function (list, key) {
  return list.map(function (element) {
    return element[key];
  });
};

Collection.prototype.ctrItem = function (list, item) {
  return list.filter(function (element) {
    return element === item;
  }).length;
};

/* Description: run async methods synchronously
 *  runnerInstance.schedule(cmd): pass methods to run them later
 *  runnerInstance.done(callback): pass a method to run after all other methods have run.
 *  runnerInstance.run(): start running methods
 *
 *  Note: all methods will run one after another, there is no overlap between two methods
 * */

Collection.prototype.asyncRunner = function (callback) {
  this.callbackEnd = callback;
  this.listCmd = [];
  this.cmdRunning;
};

Collection.prototype.asyncRunner.prototype.schedule = function (cmd, opt) {
  this.listCmd.push({
    cmd: cmd,
    opt: opt,
    status: 'scheduled'
  });
};

Collection.prototype.asyncRunner.prototype.run = function () {
  var that = this;
  that.listResult = [];

  var resolve = function resolve() {
    if (that.listCmd.length === 0) {
      that.callbackEnd(that.listResult);
    }

    // Set status = 'done' to prev cmd if any
    if (typeof that.cmdRunning !== 'undefined') {
      that.cmdRunning.status = 'done';
    }

    // if all cmd are done than call callbackEnd if not carry on with cmd list
    var listStatus = Collection.prototype.pluck(that.listCmd, 'status'),
        ctrDone = Collection.prototype.ctrItem(listStatus, 'done');
    if (  that.listCmd.length !== 0 &&
          ctrDone === that.listCmd.length &&
          typeof that.callbackEnd === 'function'
    ) {
      that.callbackEnd(that.listResult);
    } else {
      for (var index in that.listCmd) {
        var element = that.listCmd[index];

        if (element.status === 'scheduled') {
          element.status === 'running';
          that.cmdRunning = element;
          var result = element.cmd(resolve, element.opt);
          that.listResult.push(result);
          break;
        }
      }
    }
  };

  resolve();
};

// This is the same as passing the callback at object creation
Collection.prototype.asyncRunner.prototype.done = function (callback) {
  this.callbackEnd = callback;
};

