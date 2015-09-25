/**
 * Created by acastillo on 9/11/15.
 */
define(["autoAssign","nmrShiftDBPred1H","save2db","comparePredictors","./preprocess/cheminfo","./preprocess/maybridge","./preprocess/reiner"],
    function(autoAssign,nmrShiftDBPred1H,save2db,comparePredictors, cheminfo, maybridge, reiner){
        var maxIterations =1;
        var testSet = "/data/cobas";//"/Research/NMR/AutoAssign/data/cobasSimulated";
        var datasetSim = [];
        var db = new DB.MySQL("localhost","mynmrshiftdb3","nmrshiftdb","xxswagxx");
        var error = comparePredictors(datasetSim,{"db":db,"dataset":testSet,"iteration":">0"});//{error:1,count:1};//comparePredictors({"db":db,"dataset":testSet,"iteration":"="+(iteration-1)});

        console.log("Error "+JSON.stringify(error));
        console.log("Done");
    }
);


