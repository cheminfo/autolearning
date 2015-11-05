/**
 * Created by acastillo on 9/11/15.
 */
define(["./core/autoAssign","./core/nmrShiftDBPred1H","./core/save2db","core/stats","./preprocess/cheminfo","./preprocess/maybridge","./preprocess/reiner"],
    function(autoAssign,nmrShiftDBPred1H,save2db,stats, cheminfo, maybridge, reiner){
        var testSet = File.loadJSON("/data/assigned298.json");
        var db = new DB.MySQL("localhost","mynmrshiftdb","nmrshiftdb","xxswagxx");
        var histParams = {from:0,to:1,nBins:100};

        var MAXITER = 6, hoseLevels, error, data, sumHist,i, j, k, y,x=null;
        var result = [];
        var hoseResult = [];
        for(i=0;i<MAXITER;i++){
            console.log("Iteration: "+i);
            hoseResult.push({"iteration": i, values: stats.hoseStats(testSet,{
                "db":db,
                "dataset":testSet,
                "iteration":"="+i,
                "ignoreLabile":true,
                "hoseLevels":[5,4,3,2]
            })});
            hoseLevels = [];
            /*for(j=5;j>=2;j--){
                console.log("Level: "+j);
                hoseLevels.push(j);
                error = stats.cmp2asg(testSet,{
                    "db":db,
                    "dataset":testSet,
                    "iteration":"="+i,
                    "ignoreLabile":false,
                    "histParams":histParams,
                    "hoseLevels":hoseLevels
                });

                //console.log("Error: "+error.error+" count: "+error.count+" min: "+error.min+" max: "+error.max);
                data = error.hist;
                sumHist=0
                y = new Array(data.length);
                for(k = 0; k < data.length; k ++){
                    y[k]=data[k].y;
                }
                if(x==null){
                    x = new Array(data.length);
                    for(k = 0; k < data.length; k ++){
                        x[k]=data[k].x;
                    }
                }
                result.push({"x":x,
                    "y": y,
                    "sumY": error.count,
                    "min": error.min,
                    "max": error.max,
                    "iteration": i,
                    "hoseLevels": hoseLevels.join(",")
                });
            }*/
        }
        File.save("/all_predictions_match_nolabile.json",JSON.stringify({"hoseCounts":hoseResult,"errors":result}));
    }
);


