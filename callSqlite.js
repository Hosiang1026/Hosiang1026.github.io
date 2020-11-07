
/**
 * File: callSqlite.js.
 * Author: W A P.
 * Email: 610585613@qq.com.
 * Datetime: 2018/07/24.
 */

/// Import SqliteDB.

var SqliteDB = require('./sqlite.js').SqliteDB;

var file = "blog.db";

var sqliteDB = new SqliteDB(file);

/// create table.
function createTables(tableName) {
    var createTableSql = "create table if not exists "+tableName+"(id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, url TEXT, desc BLOB, content BLOB, image BLOB, times TEXT);";
    sqliteDB.createTable(createTableSql);
}



/// insert data.

//var tileData = [[1, 10, 10], [1, 11, 11], [1, 10, 9], [1, 11, 9]];
//var insertDataSql = "insert into tiles(level, column, row) values(?, ?, ?)";
function insertDatas(insertDataSql,Data) {
    sqliteDB.insertData(insertDataSql, Data);
}

//batch insert data.
/*function batchInsertDatas(insertDataSql,arcList) {
    sqliteDB.serialize(function () {
        sqliteDB.run('BEGIN');
        let stmt = sqliteDB.prepare(insertDataSql);
        arcList.forEach(function(item,index){
            var htmlData = [[null, item.title, item.url, item.desc, '', item.times]];
            stmt.run(htmlData);
        }
        stmt.finalize();
        sqliteDB.run('COMMIT');
    });
}*/

/// query data.
function queryDatas(querySql) {
    //var querySql = 'select * from tiles where level = 1 and column >= 10 and column <= 11 and row >= 10 and row <=11';
    sqliteDB.queryData(querySql, dataDeal);
}

function dataDeal(objects){
    for(var i = 0; i < objects.length; ++i){
        console.log(objects[i]);
    }
}


/// update data.
function updateDatas(updateSql) {
    //var updateSql = 'update tiles set level = 2 where level = 1 and column = 10 and row = 10';
    sqliteDB.executeSql(updateSql);
}


// close sqliteDB
function closeDB() {
    sqliteDB.close();
}


// 删除数据
//var sql_del = db.prepare(`delete from user where username='buding'`)
//sql_del.run()

/// query data after update.
//querySql = "select * from tiles where level = 2";
//sqliteDB.queryData(querySql, dataDeal);

//sqliteDB.close();

module.exports = {
    createTables,
    insertDatas,
    queryDatas,
    updateDatas,
    closeDB
};



