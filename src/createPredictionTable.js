/**
 * Created by acastillo on 11/5/15.
 * Create prediction table for interation 7
 */
define(["database","./core/createPredictionTable"],function(connection, createPredictionTable) {
        var db = new DB.MySQL(connection.host, connection.database, connection.user, connection.password);
        var result = createPredictionTable(db, 9);
        File.save("/h1_database.json",JSON.stringify(result));
        db.close();
    }
);
