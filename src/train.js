/**
 * Created by acastillo on 9/11/15.
 */
define(["autoAssign","nmrShiftDBPred1H","save2db","comparePredictors","./preprocess/cheminfo","./preprocess/maybridge","./preprocess/reiner"],
    function(autoAssign,nmrShiftDBPred1H,save2db,comparePredictors, cheminfo, maybridge, reiner){
        var maxIterations = 3;
        var testSet = "/data/cheminfo";//"/Research/NMR/AutoAssign/data/cobasSimulated";

        var dataset1 = cheminfo.load("/data/cheminfo","cheminfo",{keepMolecule:true});
        //console.log("dataset1.length "+dataset1.length);
        //var dataset1 = cheminfo.load("/Research/NMR/AutoAssign/data/learningDataSet","learningDataSet",{});
        var dataset2 = maybridge.load("/Research/NMR/AutoAssign/data/maybridge","maybridge",{keepMolecule:true});
        var dataset3 = reiner.load("/Research/NMR/AutoAssign/data/Reiner","reiner",{keepMolecule:true});

        var datasets = [dataset1,dataset2,dataset3];

        var db = new DB.MySQL("localhost","mynmrshiftdb3","nmrshiftdb","xxswagxx");

        try{
            //Run the learning process. After each iteration the system has seen every single molecule once
            //We have to use another stop criteria like convergence
            for(var iteration=0;iteration<maxIterations;iteration++){
                var count = 0;
                for(var ds = 0;ds<datasets.length;ds++){
                    var dataset = datasets[ds];
                    var max = dataset.length;
                    // we could now loop on the sdf to add the int index
                    for (var i=0; i<max; i++) {
                        try{
                            var catalogID = dataset[i].id;
                            var datasetName = dataset[i].dataset;

                            var result = autoAssign(dataset[i], {"db":db, debug:false, iteration:iteration-1});

                            var signals = dataset[i].spectra.h1PeakList;
                            var diaIDsCH = dataset[i].diaIDsCH;
                            var diaID = dataset[i].diaID;
                            var solvent = dataset[i].spectra.solvent;

                            if(result[result.length-1].state!="completed"&&result[result.length-1].nSolutions>result.length){
                                console.log("Too much solutions");
                                continue;
                            }
                            //Get the unique assigments in the assignment variable.
                            var assignment=null;
                            if(result.length>1){
                                assignment = result[0].assignment;
                                var nSignals = assignment.length;

                                for(var k=1;k<result.length-1;k++){
                                    var asgK = result[k].assignment;
                                    for(var j=0;j<nSignals;j++){
                                        for(var m=0;m<assignment[j].length;m++){
                                            if(m<=asgK[j].length){
                                                if(assignment[j][m]!=asgK[j][m])
                                                    assignment[j][m]=-1;
                                            }
                                        }
                                    }
                                }
                            }

                            var annotations=[];
                            if(assignment&&assignment.length>0){
                                for(var j=0;j<signals.length;j++){
                                    var highlight=[];
                                    //To put the diaIDs
                                    if(assignment[j]){
                                        for(var l=assignment[j].length-1;l>=0;l--){
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

                                count+=save2db(annotations, db, {
                                    diaID:diaID,
                                    diaIDs:diaIDsCH,
                                    catalogID:catalogID,
                                    datasetName:datasetName,
                                    solvent:solvent,
                                    iteration:iteration});
                            }
                        }
                        catch(e){
                            console.log("Error in training. dataset: "+ds+" Iteration: "+iteration+" step: "+i +" "+e);
                        }
                    }
                }
                //Evalueate the error
                console.log("Iteration "+iteration);
                console.log("New entries in the db: "+count);
                var error = comparePredictors({"db":db,"dataset":testSet,"iteration":iteration-1});
                console.log("Error: "+error.error+" count: "+error.count);
            }
            console.log("Done");
            db.close();

        }
        catch(e){
            console.log("Fail "+e);
            db.close();
        }
    }
);


