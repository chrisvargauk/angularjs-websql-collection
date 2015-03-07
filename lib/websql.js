var websql = (function () {
  var db;

  var createDatabase = function () {
    db = openDatabase('websqlDatabase2', '1.0', 'app database', 2 * 1024 * 1024);
  };

  var run = function (query, iterator, callbackDone) {
    db.transaction(function (tx) {
      var successHandler = function (tx, results) {
        var len = results.rows.length, i;
        for (i = 0; i < len; i++) {
          if (typeof iterator == 'undefined')
            break;

          iterator( results.rows.item(i), results.rows.length, i, results);
        }

        if (i === len && typeof callbackDone !== 'undefined')
          callbackDone(results);
      };

      var errorHandler = function (transaction, error) {
        console.error('WebSQL Error: ' + error.message + ' in "' + query + '".');
      };

      tx.executeSql(query, [], successHandler, errorHandler);
    });
  };

  var deleteTable = function (table, callbackEnd) {
    websql.doesTableExist(table, function(result) {
      if (!result) {
        if (typeof callbackEnd === 'function') {
          callbackEnd();
        }

        return;
      }

      run('DROP TABLE ' + table, undefined, callbackEnd);
    });
  };

  var emptyTable = function (tableName, callback) {
    run("DELETE FROM " + tableName, undefined, callback);
  };

  var deleteEntry = function (tableName, entryName, callback) {
    run("DELETE FROM " + tableName + ' WHERE id=' + entryName, undefined, callback);
  };

  var getListTable = function (callback) {
    var listTable = [];
    websql.run("SELECT tbl_name, sql from sqlite_master WHERE type = 'table'", function (item) {
      listTable.push(item.tbl_name);
    }, function () {
      callback(listTable);
    });
  };

  var doesTableExist = function (nameTable, callback) {
    var listTable = [];
    websql.run("SELECT tbl_name, sql from sqlite_master WHERE type = 'table'", function (item) {
      listTable.push(item.tbl_name);
    }, function () {
      var result = listTable.indexOf(nameTable) !== -1;
      callback(result);
    });
  };

  createDatabase();

  return {
    run: run,
    deleteTable: deleteTable,
    deleteEntry: deleteEntry,
    emptyTable: emptyTable,
    getListTable: getListTable,
    doesTableExist: doesTableExist
  };
}());