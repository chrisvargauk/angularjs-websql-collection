/*
* Dependencies: angularjs, websql
*
* Reserved words and chars: '_' in keys,
* 'collectionType(@)', 'nameTable(@)', 'collectionType(@)' in values
*
* */

var Collection = function Collection(objOption) {
  var that = this,
      objOptionDefault = {
        type: undefined,      // What type of collection it is going to be, like 'people', 'car', etc
        filter: undefined,    // Add any SQL expression to filter what models will be loaded to your Collection when loaded from WebSQL, like 'id<5'
        default: undefined,   // Add a default model to create table structure in WebSQL
        callback: undefined,  // Pass a method to be called after the collection is loaded and ready to work with.
        idLink: -1,           // If the collection you would like to load is a sub collection, you can load the sub-collection by passing parent collections id.
        debug: false          // Developers only: set this to true if you would like to see details whats going on with the collection
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
  that.JSONstateInDb = [];
  that.ctrLoadingDims = 0;

  // Name of the collection is always required
  if (typeof that.nameCollection === 'undefined') {
    that.log('Default Model at Error: ',that.modelDefault);
    throw "Collection: collection type is required.";
  }

  // If new collection is gonna be added to database
  if (typeof that.modelDefault !== 'undefined') {
    that.checkDependencies();
    that.createCollectionTypeTable(function () {
      var listSqlCtreateTabelForCollDimens = that.analyseModelDefault(that.modelDefault);
      that.log('listSql', listSqlCtreateTabelForCollDimens);
      that.executeSqlQueryList(listSqlCtreateTabelForCollDimens, function () {
        that.log('Tabels Are Created for Collection. Load existing collection from webSQL if any.');
        that.addCollToCollectionTypeTable(that.nameCollection, that.modelDefault, function() {
          // Load existing collection from webSQL if any
          that.loadCollectionFromWebsqlWrapper(function () {
            if (typeof that.opt.callback === 'function') {
              that.opt.callback(that);
            }
          });
        });
      });
    });

  // if Collection will be loaded from WebSQL
  } else {
    that.loadDefaultModelFromWebsql(function () {
      // Load existing collection from webSQL if any
      that.loadCollectionFromWebsqlWrapper(function () {
        if (typeof that.opt.callback === 'function') {
          that.opt.callback(that);
        }
      });
    });
  }
};

Collection.prototype.loadDefaultModelFromWebsql = function (callback) {
  var that = this,
      sql = "SELECT * FROM collectionType WHERE nameCollection='"+that.nameCollection+"';";

  websql.run(sql, function(item) {
    that.modelDefault = JSON.parse(item.defaultModel);
    that.log('.loadDefaultModelFromWebsql(): modelDefault is loaded:', that.modelDefault);
  }, callback);
};

Collection.prototype.loadCollectionFromWebsqlWrapper = function (callback) {
  var that = this;

  if(that.opt.idLink === -1) {
    that.JSON = that.loadCollectionFromWebsql('c_'+that.nameCollection, that.opt.filter, function() {
      that.JSONstateInDb = that.copyJSON(that.JSON);
      if (typeof callback === "function") {
        callback();
      }
    });
  } else {
    that.JSON = that.loadCollectionFromWebsql('c_'+that.nameCollection, 'idLink='+that.opt.idLink, function() {
      that.JSONstateInDb = that.copyJSON(that.JSON);
      if (typeof callback === "function") {
        callback();
      }
    });
  }
};

Collection.prototype.loadCollectionFromWebsql = function (keyDimension, sqlFilter, callbackEnd) {
  var that = this,
      JSON,
      ctrLoadingDims = 0;

  JSON = recursiveLoader(keyDimension, sqlFilter, function () {
    callbackEnd();
  });

  function recursiveLoader(keyDimension, sqlFilter, callback) {
    var JSON = [];

    if (typeof sqlFilter === 'undefined') {
      var sql = 'SELECT * FROM "' + keyDimension + '";';
    } else {
      var sql = 'SELECT * FROM "' + keyDimension + '" WHERE ' + sqlFilter + ';';
    }

    websql.run(sql, function (item) {
      var currentDimension = {};
      that.log('.loadCollectionFromWebsql(): row item: ', item);

      Object.keys(item).forEach(function (key) {
        var value = item[key] + '';

        switch(value) {
          case 'true':
            value = true;
            break;

          case 'false':
            value = false;
            break;
        }

        // if value is pointing to another table
        if (value &&
            typeof value !== 'boolean' &&
            value.indexOf('nameTable(@)') !== -1
        ) {
          var nextDimAsArray;
          ctrLoadingDims++;
          nextDimAsArray = that.loadCollectionFromWebsql(value.split('(@)')[1], 'idLink=' + item.id, function () {
            currentDimension[key] = nextDimAsArray[0];
            ctrLoadingDims--;
            if (typeof callback === "function" && ctrLoadingDims === 0) {
              callback();
            }
          });
        // if value is pointing to another collection
        } else if ( value &&
                    typeof value !== 'boolean' &&
                    value.indexOf('collectionType(@)') !== -1
        ) {
          ctrLoadingDims++;
          currentDimension[key] = new Collection({
            type: (value.split('(@)')[1]),
            idLink: item.id,
            callback: function (JSON) {
              ctrLoadingDims--;
//            if (typeof that.opt.callback === "function" && that.ctrLoadingDims === 0) {
//              if (typeof callback === "function") {
//                callback();
//              }
//
//              that.opt.callback(that.JSON);
//            }
              if (typeof callback === "function" && ctrLoadingDims === 0) {
                callback();
              }
            },
            debug: that.opt.debug
          });
        // if it is an ordinary value
        } else {
          currentDimension[key] = value;
        }
      });

      JSON.push(currentDimension);
    }, function () {
  //    if (typeof that.opt.callback === "function" && that.ctrLoadingDims === 0) {
  //      if (typeof callback === "function") {
  //        callback();
  //      }
  //
  //      that.opt.callback(that.JSON);
  //    }
      if (typeof callback === "function" && ctrLoadingDims === 0) {
        callback();
      }
    });

    return JSON;
  }

  return JSON;
};

Collection.prototype.copyJSON = function (JSON) {
  var that = this,
      JSONCopy = [];

  var typeJSON = Object.prototype.toString.call(JSON);
  if (typeJSON !== '[object Array]') {
    that.log('JSON at Error: ', JSON);
    throw 'Collection.copyJSON(): JSON hast to be an array. Type of object provided: ' + typeJSON;
  }

  JSON.forEach(function (model) {
    var modelCopy = recursiveCrawler(model);
    JSONCopy.push(modelCopy);
  });

  function recursiveCrawler(JSONCurrnetDim) {
    var JSONCurrentDimCopy = {};
    Object.keys(JSONCurrnetDim).forEach(function (key) {
      var value = JSONCurrnetDim[key],
          type =  Object.prototype.toString.call(value);

      switch(type) {
        case '[object String]':
          JSONCurrentDimCopy[key] = value;
          break;
        case '[object Number]':
          JSONCurrentDimCopy[key] = value+'';
          break;
        case '[object Object]':
          // If value has opt prop that means it is a Collection
          if (!that.isUndefined(value.opt)) {
            // Link the sub collection to key, dont make a duplicate of that sub collection.
            // That collection will have its on copy of its JSON.
            JSONCurrentDimCopy[key] = value;
          } else {
            JSONCurrentDimCopy[key] = recursiveCrawler(value);
          }
          break;
        case '[object Array]':
          throw "Collection.copyJSON(): Array detected in JSON.";
          break;
        case '[object Boolean]':
          JSONCurrentDimCopy[key] = value;
          break;
      }
    });

    return JSONCurrentDimCopy;
  };

  that.log('.copyJSON(): ', JSONCopy);

  return JSONCopy;
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

Collection.prototype.createCollectionTypeTable = function (callback) {
  var sql = 'CREATE TABLE IF NOT EXISTS "collectionType" (id INTEGER PRIMARY KEY ASC, nameCollection TEXT, defaultModel TEXT);';
  websql.run(sql, undefined, callback);
};

Collection.prototype.analyseModelDefault = function (modelDefault, keyDimension, listSql) {
  var that = this;

  // Check whether undefined
  if (typeof modelDefault === 'undefined') {
    throw 'Collection: Default model is undefined.';
  }

  /*
  * type = string, number: error
  * type = obj: analyseObj
  * type = array: obj  -> recursion -> analyseObj
  * type = array: simple value -> recursion -> error
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
        if (value.indexOf('collectionType(@)') !== -1) {
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

Collection.prototype.addCollToCollectionTypeTable = function(nameCollection, modelDefault, callback) {
  var that = this;

  that.log('Add Collection to collectionType table if not in it yet.');

  var sqlSelect = "SELECT * FROM collectionType WHERE nameCollection='"+nameCollection+"';",
      sqlSaveModelDefault = "INSERT INTO 'collectionType' (nameCollection, defaultModel) VALUES ('"+nameCollection+"', '"+JSON.stringify(modelDefault)+"')";

  var ctrRow = 0;
  websql.run(sqlSelect, function() {
    ctrRow += 1;
  }, function () {
    // If collection is not added to collectionType table yet
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
      that.JSONstateInDb = that.copyJSON(that.JSON);
      callback(JSONtemp);
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

    Object.keys(modelDefaultTargetDim).forEach(function (key) {
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
        case '[object Boolean]':
          JSONCurrentDim[key] = value+'';
          listKey.push(key);
          listValue.push(value);
          break;
        case '[object Undefined]':
          value = modelDefaultTargetDim[key];
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

          // Revert boolean values from string
          Object.keys(JSONtemp).forEach(function (key) {
            var value = JSONtemp[key];

            if (value === 'false') {
              JSONtemp[key] = false;
            } else if (value === 'true') {
              JSONtemp[key] = true;
            }
          });
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

Collection.prototype.getById = function (id) {
  var that = this,
      modelReturn;

  if (that.isUndefined(id)) {
    throw "Collection.getById(): id is required.";
  }

  this.JSON.forEach(function (model) {
    if (model.id == id) {
      modelReturn = model;
    }
  });

  return modelReturn;
};

Collection.prototype.removeById = function (nameCollection, idToRemove, callbackEnd) {
  var that = this;

  that.log('.removeById(): Remove id:', idToRemove);

  var that = this;

  if (that.isUndefined(nameCollection)) {
    throw "Collection.removeById(): nameCollection is required.";
  }

  if (that.isUndefined(idToRemove)) {
    throw "Collection.removeById(): idToRemove is required.";
  }

  that.ifNOTInDB('c_'+nameCollection, "id='"+idToRemove+"'", function() {
    throw 'Collection.removeById: id "'+idToRemove+'" is NOT in Collection "'+nameCollection+'" table.';
  });

  that.ifInDB('c_'+nameCollection, "id='"+idToRemove+"'", function(ctr, listItem) {
    var item = listItem[0];

    that.log('.removeById(): item: ', item);

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

          that.log('.removeById(): '+nameCollection+'['+key+']: ', value);

          if (key === 'id') {
            idCurrent = value;
          }

          if (value.indexOf('nameTable(@)') !== -1) {
            var nameCollNext = value.split('(@)')[1];
            that.log('.removeById(): nameCollNext: ', nameCollNext);
            var sqlDeleteDim = "DELETE FROM " + nameCollNext + " WHERE idLink=" + idCurrent;
            listSql.push(sqlDeleteDim);
            ctrDimCrawler++;
            recursiveCrawler(nameCollNext, 'idLink='+idCurrent, function () {
              ctrDimCrawler--;
            });
          }

          if (value.indexOf('collectionType(@)') !== -1) {
            var nameCollNext = value.split('(@)')[1];
            that.log('.removeById(): nameCollNext: ', nameCollNext);
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
          that.log('.removeById(): Recursion end.');
          that.log('.removeById(): listSql: ', listSql);

          executeSqlList(listSql, callbackEnd);
        }
      });
    }

    function executeSqlList(listSql, callback) {
      that.executeSqlQueryList(listSql, function() {
        removeFromJSON();

        if (typeof callback === 'function') {
          callback();
        }
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

      that.log('.removeById(): model is removed from JSON as well.');
    }
  });
};

Collection.prototype.check = function (callbackEnd) {
  var that = this,
      listUpdate = [];

  var typeJSON = Object.prototype.toString.call(this.JSON);
  if (typeJSON !== '[object Array]') {
    that.log('JSON at Error: ', this.JSON);
    throw 'Collection.copyJSON(): JSON hast to be an array. Type of object provided: ' + typeJSON;
  }

  this.JSON.forEach(function (model, key) {
    var update = recursiveCrawler(model, that.JSONstateInDb[key], that.nameCollection);

    // If there was an update on the current model push it to the list
    if (update) {
      listUpdate.push(update);
    }
  });

  function recursiveCrawler(JSONCurrnetDim, JSONstateInDbCurrentDim, keyCurrentDim) {
    var sqlUpdateCurrentDim = "UPDATE c_" + keyCurrentDim + " SET ",
        needsToBeUpdated = false;


    Object.keys(JSONCurrnetDim).forEach(function (key) {
      var valueJSON = JSONCurrnetDim[key],
          valueJSONstateInDb = JSONstateInDbCurrentDim[key],
          type =  Object.prototype.toString.call(valueJSON);

      switch(type) {
        case '[object String]':
          if (valueJSON != valueJSONstateInDb &&
              key !== '$$hashKey') {
            if (needsToBeUpdated) {
              sqlUpdateCurrentDim += ", ";
            }
            needsToBeUpdated = true;
            sqlUpdateCurrentDim += key + "='" + valueJSON + "'";
          }
          break;
        case '[object Number]':
          if (valueJSON != valueJSONstateInDb) {
            if (needsToBeUpdated) {
              sqlUpdateCurrentDim += ", ";
            }
            needsToBeUpdated = true;
            sqlUpdateCurrentDim += key + "='" + valueJSON + "'";
          }
          break;
        case '[object Object]':
          // If value has opt prop that means it is a Collection
          if (!that.isUndefined(valueJSON.opt)) {

          } else {
            var update = recursiveCrawler(valueJSON, valueJSONstateInDb, keyCurrentDim + '_' + key);

            // If there was an update on the current model push it to the list
            if (update) {
              listUpdate.push(update);
            }
          }
          break;
        case '[object Array]':
          throw "Collection.copyJSON(): Array detected in JSON.";
          break;
        case '[object Boolean]':
          if (valueJSON != valueJSONstateInDb) {
            if (needsToBeUpdated) {
              sqlUpdateCurrentDim += ", ";
            }
            needsToBeUpdated = true;
            sqlUpdateCurrentDim += key + "='" + valueJSON + "'";
          }
          break;
      }
    });

    sqlUpdateCurrentDim += " WHERE id='" + JSONCurrnetDim.id + "';";

    if (needsToBeUpdated) {
      return sqlUpdateCurrentDim;
    } else {
      return false;
    }
  }

  that.log('.listUpdate(): ', listUpdate);

  that.runSqlUpdates(listUpdate, function () {
    that.JSONstateInDb = that.copyJSON(that.JSON);

    if (!that.isUndefined(callbackEnd)) {
      callbackEnd();
    }
  });

  return listUpdate;
};

Collection.prototype.runSqlUpdates = function(listUpdate, callbackEnd) {
  var that = this;

  that.executeSqlQueryList(listUpdate, callbackEnd);
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

  that.ifNOTInDB('collectionType', "nameCollection='"+nameCollection+"'", function() {
    throw 'Collection.emptyWebSQL: Collection "'+nameCollection+'" is NOT in collectionType table.';
  });

  that.ifInDB('collectionType', "nameCollection='"+nameCollection+"'", function(ctr, listItem) {
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

  that.ifNOTInDB('collectionType', "nameCollection='"+nameCollection+"'", function() {
    callback();
  });

  that.ifInDB('collectionType', "nameCollection='"+nameCollection+"'", function(ctr, listItem) {
    var item = listItem[0],
      defaultModel = JSON.parse(item.defaultModel);

    var ctrIter = 0;
    that.crawler(defaultModel, undefined, undefined, function (obj, keyDimension) {
      ctrIter++;
      websql.deleteTable('c_'+keyDimension, function () {
        websql.run("DELETE FROM 'collectionType' WHERE nameCollection='" + nameCollection + "';", undefined, function () {
          ctrIter--;
          if (ctrIter === 0 && typeof callback === 'function') {
            callback();
          }
        });
      });
    }, nameCollection);
  });
};

Collection.prototype.deleteAllCollInDB = function (callbackEnd) {
  var that = this,
      listCmd = new Collection.prototype.asyncRunner();

  websql.doesTableExist('collectionType', function(doesTableExist) {
    if (!doesTableExist) {
      callbackEnd();
      return;
    }

    websql.run("SELECT * FROM 'collectionType';", function (item) {
      listCmd.schedule(function(resolve) {
        Collection.prototype.deleteWebSQL(item.nameCollection,resolve);
      });
    }, function () {
      listCmd.done(deleteCollectionType);
      listCmd.run();
    });
  });

  function deleteCollectionType ( ) {
    websql.deleteTable('collectionType', callbackEnd);
  }
};

CollectionFactory = function() {
  this.listCollections = [];
};

CollectionFactory.prototype.get = function(name, opt) {
  var listName = Collection.prototype.pluck(this.listCollections, 'name'),
      indexCollection = listName.indexOf(name);

  // If Coll exists, return the existing instance, and call its callback again
  if (indexCollection !== -1) {
    var collection = this.listCollections[indexCollection].collection;

    // Call the callback
    if (opt && typeof opt.callback === 'function') {
      opt.callback(collection);
    }
    return collection;
  }

  // If Coll desnt exists, create new Coll instance and return that
  var collection = new Collection(opt);
  this.listCollections.push({
    name: name,
    collection: collection
  });

  return collection;
};

CollectionFactory.prototype.getDeferredFn = function(name, opt) {
  var that = this;

  return function($q) {
    var deferred = $q.defer();

    // overwrite opt.callback to call deferred.resolve
    opt.callback = function(collection) {
      deferred.resolve(collection);
    };

    that.get(name, opt);

    return deferred.promise;
  }
};

var collectionFactory = new CollectionFactory();

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

  websql.doesTableExist(nameTable, function(result) {
    if (!result) {
      callback();
      return;
    }

    that.ctrEntry(nameTable, sqlFilter, function(ctr, listItem) {
      if (ctr === 0) {
        callback();
      }
    });
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

  websql.doesTableExist(nameTable, function(result) {
    if (!result) {
      return;
    }

    that.ctrEntry(nameTable, sqlFilter, function(ctr, listItem) {
      if (ctr > 0) {
        callback(ctr, listItem);
      }
    });
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

Collection.prototype.executeSqlQueryList = function (listSql, callbackEnd) {
  var that = this,
      ctr = 0;

  if (that.isUndefined(listSql)) {
    throw "Collection.executeSqlQueryList(): listSql is required.";
  }

  listSql.forEach(function (sql) {
    websql.run(sql, undefined, function () {
      ctr += 1;
      if (ctr === listSql.length && typeof callbackEnd === "function") {
        callbackEnd();
      }
    });
  });

  // If there was no sql provided call the callback anyways
  if (listSql.length === 0 && typeof callbackEnd === "function") {
    callbackEnd();
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

Collection.export = function (callback) {
  var description = {
    collectionType: []
  };

  var listCmdSaveCollection = new Collection.prototype.asyncRunner();

  // List existing collections
  websql.run('SELECT * FROM collectionType', function(itemCollectionType) {
    // Make sure defaultModel is an object not a string
    var defaultModel;
    if (typeof itemCollectionType.defaultModel === 'string') {
      defaultModel = JSON.parse(itemCollectionType.defaultModel);
    } else {
      defaultModel = itemCollectionType.defaultModel;
    }

//    itemCollectionType.defaultModel = JSON.parse(itemCollectionType.defaultModel);
    description.collectionType.push(itemCollectionType);
    description['c_' + itemCollectionType.nameCollection] = {};

    // Save existing Collections
    listCmdSaveCollection.schedule(function(resolve) {
      var collection = new Collection({
        type: itemCollectionType.nameCollection,
        default: defaultModel,
        callback: function(collection) {
          var collectionFiltered = collection.JSON.filter(function(model) {
            return model.idLink == '-1';
          });

          description['c_' + itemCollectionType.nameCollection] = collectionFiltered;

          resolve();
        }
      });
    });

  }, saveExistingCollections);

  function saveExistingCollections() {
    listCmdSaveCollection.done(function() {
      var text;

      description = escapeCollection(description);
      text = JSON.stringify(description);

      if (typeof callback === 'function') {
        callback(text);
      }

      console.log("DataBase As Text: '"+ text + "'");
      console.log("DataBase As Obj: ", description);
    });

    listCmdSaveCollection.run();
  }

  function escapeCollection(obj) {
    Object.keys(obj).forEach(function(key) {
      var value = obj[key];

      if (key === 'defaultModel') {
        if (typeof value === 'string') {
          var defaultModelString = value;
        } else {
          var defaultModelString = JSON.stringify(value);
        }

        var defaultModelEscaped = escape(defaultModelString);

        obj[key] = defaultModelEscaped;
      } else if (typeof value === 'object') {
        escapeCollection(value);
      }
    });

    return obj;
  }
};

Collection.import = function (dbAsText, callbackEnd, update) {
  var listCollectionRestored = {};

  // If database doesnt have to deleted before importing all data
  if (update !== true) {
    Collection.prototype.deleteAllCollInDB(restoreAllCollection);
  } else {
    restoreAllCollection();
  }

  function restoreAllCollection() {
    var dbAsObj = parseAndUnescapeCollection(dbAsText),
        listCmdLoadCollection = new Collection.prototype.asyncRunner();

    dbAsObj.collectionType.forEach(function (collectionType) {
      listCmdLoadCollection.schedule(function(resolve) {
        // Make sure defaultModel is an object not a string
        var defaultModel;
        if (typeof collectionType.defaultModel === 'string') {
          defaultModel = JSON.parse(collectionType.defaultModel);
        } else {
          defaultModel = collectionType.defaultModel;
        }

        new Collection({
          type: collectionType.nameCollection,
          default: defaultModel,
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
    var dbAsObj = JSON.parse(dbAsText),
        listCmdAddModelToCollection = new Collection.prototype.asyncRunner();

    Object.keys(dbAsObj).forEach(function(key) {
      // filter off everything but collections
      if (key.indexOf('c_') === -1) {
        return;
      }

      var listModel = dbAsObj[key],
          nameCollection = key.replace('c_', '');

      loadCollection(listModel, nameCollection);

      function loadCollection(listModel, nameCollection, subCollection) {
        listModel.forEach(function (model) {
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
                    modelFiltered[keyModel] = loadCollection(model[keyModel].JSON, model[keyModel].nameCollection, model[keyModel]);
                  } else {
                    modelFiltered[keyModel] = filterModel(model[keyModel]);
                  }
                } else {
                  modelFiltered[keyModel] = model[keyModel];
                }
              });

              return modelFiltered;
            }

            // If Model goes into a sub Collection
            if (typeof subCollection !== 'undefined') {
              // Make sure defaultModel is an object not a string
              var defaultModel;
              if (typeof subCollection.defaultModel === 'string') {
                defaultModel = JSON.parse(subCollection.defaultModel);
              } else {
                defaultModel = subCollection.defaultModel;
              }

              // Create new Collection for representing the sub Collection
              new Collection({
                type: subCollection.nameCollection,
                default: defaultModel,
                idLink: subCollection.opt.idLink,
                callback: function (collection) {
                  // Add exported data back to the collection
                  collection.add(modelFiltered, resolve);
                }
              });
            } else {
              // Add exported data back to the collection
              listCollectionRestored[nameCollection].add(modelFiltered, resolve);
            }
          });
        });
      };
    });

    listCmdAddModelToCollection.done(callbackEnd);
    listCmdAddModelToCollection.run();
  }

  function parseAndUnescapeCollection(dbAsString) {
    var obj = JSON.parse(dbAsString);

    crawler(obj);

    function crawler(obj) {
      Object.keys(obj).forEach(function (key) {
        var value = obj[key];

        if (key === 'defaultModel') {
          var defaultModelUnescaped = unescape(value),
              defaultModelObj = JSON.parse(defaultModelUnescaped);

          obj[key] = defaultModelObj;
        } else if (typeof value === 'object') {
          crawler(value);
        }
      });
    };

    return obj;
  }
};

// todo:  Add link on model back to collection. Usecase: I can call check on model,
//        dont have to make sure I have a link to the collection on the model.
// todo:  Dev collectionInstance.getById(id) method
// todo:  filter inputs: ', ", etc..
// todo:  If you dont put [] where sub collection comes, you wont ba abel to add models to that sub collection later
// todo:  collectionInstance.removeById() requires type of collection, it shouldnt obviously
// todo:  implement model.remove()
// todo:  Merge collectionFactory.get method into Collection under Collection.extend method name.
// todo:  loadCollectionFromWebsql method could be wrong under certain circumstances, not sure.
//        The comments are there to give you a clue what could go wrong
// todo:  Extend "add" method to pass on models to sub collection, when a model is added to collection,
//        with other models in it that belongs to the sub collection. At the moment those models for
//        sub collection gets dropped. You need to connect to the sub collection to call add on it.
//        When it comes to loading data for sub collection from db, system will load that right now,
//        no need to work on that.




