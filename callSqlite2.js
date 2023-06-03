/**
 * File: callSqlite.js.
 * Author: W A P.
 * Email: 610585613@qq.com.
 * Datetime: 2018/07/24.
 */



/// Import SqliteDB.

var SqliteDB = require('./sqlite.js').SqliteDB;



var file = "Gis1.db";

var sqliteDB = new SqliteDB(file);



/// create table.

var createTileTableSql = "create table if not exists tiles(level INTEGER, column INTEGER, row INTEGER, content BLOB);";

var createLabelTableSql = "create table if not exists labels(level INTEGER, longitude REAL, latitude REAL, content BLOB);";

sqliteDB.createTable(createTileTableSql);

sqliteDB.createTable(createLabelTableSql);



/// insert data.

var tileData = [[1, 10, 10], [1, 11, 11], [1, 10, 9], [1, 11, 9]];

var insertTileSql = "insert into tiles(level, column, row) values(?, ?, ?)";

sqliteDB.insertData(insertTileSql, tileData);



/// query data.

var querySql = 'select * from tiles where level = 1 and column >= 10 and column <= 11 and row >= 10 and row <=11';

sqliteDB.queryData(querySql, dataDeal);



/// update data.

var updateSql = 'update tiles set level = 2 where level = 1 and column = 10 and row = 10';

sqliteDB.executeSql(updateSql);



/// query data after update.

querySql = "select * from tiles where level = 2";

sqliteDB.queryData(querySql, dataDeal);



sqliteDB.close();



function dataDeal(objects){

    for(var i = 0; i < objects.length; ++i){

        console.log(objects[i]);

    }

}