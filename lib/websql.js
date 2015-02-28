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

          iterator( results.rows.item(i), results.rows.length, i);
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

  var deleteTable = function (table) {
    run('DROP TABLE ' + table);
  };

  var emptyTable = function (tableName) {
    run("DELETE FROM " + tableName);
  };

  var deleteEntry = function (tableName, entryName) {
    run("DELETE FROM " + tableName + ' WHERE id=' + entryName);
  };

  createDatabase();

  return {
    run: run,
    deleteTable: deleteTable,
    deleteEntry: deleteEntry,
    emptyTable: emptyTable
  };
}());