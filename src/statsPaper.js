/**
 * Created by acastillo on 9/11/15.
 */
define(["autoAssign","nmrShiftDBPred1H","save2db","cmp2asg","./preprocess/cheminfo","./preprocess/maybridge","./preprocess/reiner"],
    function(autoAssign,nmrShiftDBPred1H,save2db,cmp2asg, cheminfo, maybridge, reiner){
        var maxIterations =1;
        var testSet = File.loadJSON("/data/assigned298.json");
        var db = new DB.MySQL("localhost","mynmrshiftdb","nmrshiftdb","xxswagxx");
        var histParams = {from:0,to:1,nBins:100};
        var i, j, k;
        var MAXITER = 6, hoseLevels, error, data, sumHist;
        for(i=0;i<MAXITER;i++){
            hoseLevels = [];
            for(j=5;j>=2;j--){
                hoseLevels.push(j);
                error = cmp2asg(testSet,{
                    "db":db,
                    "dataset":testSet,
                    "iteration":"="+i,
                    "ignoreLabile":false,
                    "histParams":histParams,
                    "hoseLevels":hoseLevels});//{error:1,count:1};//comparePredictors({"db":db,"dataset":testSet,"iteration":"="+(iteration-1)});

                console.log("Error: "+error.error+" count: "+error.count+" min: "+error.min+" max: "+error.max);
                data = error.hist;
                sumHist=0
                for(k = 0; k < data.length; k ++){
                    sumHist+=data[k].y/error.count;
                    console.log(data[k].x + "," +  data[k].y + ","+data[k].y/error.count+ ","+sumHist);
                }
            }
        }

        //console.log(error.hist);
        console.log("Done");
    }
);


