/**
 * Created by acastillo on 9/11/15.
 */
define(["database","./core/autoAssign","./core/nmrShiftDBPred1H","./core/save2db","core/stats","./preprocess/cheminfo","./preprocess/maybridge","./preprocess/reiner"],
    function(connection,autoAssign,nmrShiftDBPred1H,save2db, stats, cheminfo, maybridge, reiner) {

        var maxIterations = 6; // Set the number of interations for training
        var ignoreLabile = true;//Set the use of labile protons during training

        var testSet = File.loadJSON("/data/assigned298.json");//File.parse("/data/nmrsignal298.json");//"/Research/NMR/AutoAssign/data/cobasSimulated";

        var dataset1 = cheminfo.load("/data/cheminfo443", "cheminfo", {keepMolecule: true});
        //console.log("dataset1.length "+dataset1.length);
        //var dataset1 = cheminfo.load("/Research/NMR/AutoAssign/data/learningDataSet","learningDataSet",{});
        var dataset2 = maybridge.load("/data/maybridge", "maybridge", {keepMolecule: true, keepMolfile: true});
        var dataset3 = reiner.load("/data/Reiner", "reiner", {keepMolecule: true, keepMolfile: true});

        var datasets = [dataset1, dataset2, dataset3];
        //var datasetSim = File.parse(testSet);

        var db = new DB.MySQL(connection.host, connection.database, connection.user, connection.password);

        db.delete2("assignment", {}, {"all": true});
        db.delete2("spectrum", {}, {"all": true});
        db.delete2("atom", {}, {"all": true});
        db.delete2("molecule", {}, {"all": true});
        db.delete2("chemical", {}, {"all": true});

        var start, date, prevError = 0, prevCont = 0, dataset, max, ds, i, j, k, l, m;
        var catalogID, datasetName, signals, diaIDsCH, diaID, solvent, nSignals, asgK, highlight;
        var result, assignment, annotations;
        console.log("Cheminfo All: "+dataset1.length);
        console.log("MayBridge All: "+dataset2.length);
        //Remove the overlap molecules from train and test
        var removed = 0;
        for (i = 0; i < testSet.length; i++) {
            for(ds = 0;ds<datasets.length;ds++){
                dataset = datasets[ds];
                for (j=dataset.length-1;j>=0; j--){
                    if(testSet[i].diaID == dataset[j].diaID){
                        dataset.splice(j,1);
                        removed++;
                        break;
                    }
                }
            }
        }
        console.log("Cheminfo Final: "+dataset1.length);
        console.log("MayBridge Final: "+dataset2.length);
        console.log("Overlaped molecules: "+removed+".  They was removed from training datasets");

        try{
            //Run the learning process. After each iteration the system has seen every single molecule once
            //We have to use another stop criteria like convergence
            var iteration= 0,convergence=false;
            while(iteration<maxIterations&&!convergence){

                date = new Date();
                start = date.getTime();
                var count = 0;
                for(ds = 0;ds<datasets.length;ds++){
                    dataset = datasets[ds];
                    max = dataset.length;
                    // we could now loop on the sdf to add the int index
                    for (i=0; i<max; i++) {
                        try{
                            catalogID = dataset[i].id;
                            datasetName = dataset[i].dataset;

                            result =  autoAssign(dataset[i], {
                                "db":db,
                                "debug":false,
                                "ignoreLabile":ignoreLabile,
                                "iteration":"="+(iteration-1),
                                "hoseLevels":[5,4]
                            });//"IN ("+(iteration-1)+","+iteration+")"});

                            signals = dataset[i].spectra.h1PeakList;
                            diaIDsCH = dataset[i].diaIDsCH;
                            diaID = dataset[i].diaID;
                            solvent = dataset[i].spectra.solvent;

                            if(result[result.length-1].state!="completed"||result[result.length-1].nSolutions>result.length){
                                console.log("Too much solutions");
                                continue;
                            }
                            //console.log("Result "+result.length);
                            //Get the unique assigments in the assignment variable.
                            assignment=null;
                            if(result.length>1){
                                assignment = result[0].assignment;
                                nSignals = assignment.length;

                                for(k=1;k<result.length-1;k++){
                                    asgK = result[k].assignment;
                                    for(j=0;j<nSignals;j++){
                                        for(m=0;m<assignment[j].length;m++){
                                            if(m<=asgK[j].length){
                                                if(assignment[j][m]!=asgK[j][m])
                                                    assignment[j][m]=-1;
                                            }
                                        }
                                    }
                                }
                            }
                            result = null;

                            if(assignment&&assignment.length>0){
                                annotations=new Array();
                                for(j=0;j<signals.length;j++){
                                    //To put the diaIDs
                                    if(assignment[j]){
                                        highlight=new Array();
                                        for(l=assignment[j].length-1;l>=0;l--){
                                            if(assignment[j][l]!=-1){
                                                highlight.push(diaIDsCH[assignment[j][l]].id);
                                            }
                                        }
                                        if(highlight.length>0){
                                            annotations.push({
                                                integralData:signals[j].integralData,
                                                atomIDs:assignment[j],
                                                diaIDs:highlight,
                                                startX:signals[j].startX,
                                                stopX:signals[j].stopX
                                            });
                                        }
                                    }
                                }
                                assignment=null;
                                count+=save2db(annotations, db, {
                                    diaID:diaID,
                                    diaIDs:diaIDsCH,
                                    catalogID:catalogID,
                                    datasetName:datasetName,
                                    solvent:solvent,
                                    iteration:iteration});
                                annotations = null;
                            }
                        }
                        catch(e){
                            console.log("Error in training. dataset: "+ds+" Iteration: "+iteration+" step: "+i +" "+e);
                        }
                    }
                }
                date = new Date();
                //Evalueate the error
                console.log("Iteration "+iteration);
                console.log("Time "+(date.getTime()-start));
                console.log("New entries in the db: "+count);
                start = date.getTime();
                //var error = comparePredictors(datasetSim,{"db":db,"dataset":testSet,"iteration":"="+iteration});
                var histParams = {from:0,to:1,nBins:30};
                var error = stats.cmp2asg(testSet,{
                    "db":db,
                    "dataset":testSet,
                    "iteration":"="+iteration,
                    "ignoreLabile":ignoreLabile,
                    "histParams":histParams,
                    "hoseLevels":[5,4,3,2]});//{error:1,count:1};//comparePredictors({"db":db,"dataset":testSet,"iteration":"="+(iteration-1)});
                date = new Date();
                console.log("Error: "+error.error+" count: "+error.count+" min: "+error.min+" max: "+error.max);
                var data = error.hist;
                var sumHist=0
                for(var i = 0; i < data.length; i ++){
                    sumHist+=data[i].y/error.count;
                    console.log(data[i].x + "," +  data[i].y + ","+data[i].y/error.count+ ","+sumHist);
                }
                console.log("Time comparing "+(date.getTime()-start));

                if(prevCont == count&&prevError<=error){
                    //convergence = true;
                }
                prevCont = count;
                prevError = error;

                iteration++;
            }
            console.log("Done");
            //db.close();

        }
        catch(e){
            console.log("Fail "+e);
            db.close();
        }

    }


);


