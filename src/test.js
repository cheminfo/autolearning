/**
 * Created by acastillo on 9/11/15.
 */
define(["database","./core/autoAssign","./core/nmrShiftDBPred1H","./core/save2db","core/stats","./preprocess/cheminfo","./preprocess/maybridge","./preprocess/reiner"],
    function(connection,autoAssign,nmrShiftDBPred1H,save2db,stats, cheminfo, maybridge, reiner){
        var maxIterations =1;
        var testSet = File.loadJSON("/data/assigned298.json");
        var db = new DB.MySQL(connection.host, connection.database, connection.user, connection.password);

        var histParams = {from:0,to:1,nBins:100};
        var error = stats.cmp2asg(testSet,{
            "db":db,
            "dataset":testSet,
            "iteration":"=5",
            "ignoreLabile":false,
            "histParams":histParams,
            "hoseLevels":[5,4]});//{error:1,count:1};//comparePredictors({"db":db,"dataset":testSet,"iteration":"="+(iteration-1)});
        date = new Date();
        console.log("Error: "+error.error+" count: "+error.count+" min: "+error.min+" max: "+error.max);
        var data = error.hist;
        var sumHist=0
        for(var i = 0; i < data.length; i ++){
            sumHist+=data[i].y/error.count;
            console.log(data[i].x + "," +  data[i].y + ","+data[i].y/error.count+ ","+sumHist);
        }
        //console.log(error.hist);
        console.log("Done");
    }
);


