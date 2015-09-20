/**
 * Created by acastillo on 9/11/15.
 */
define(["autoAssign","nmrShiftDBPred1H","save2db","comparePredictors","./preprocess/cheminfo","./preprocess/maybridge","./preprocess/reiner"],
    function(autoAssign,nmrShiftDBPred1H,save2db,comparePredictors, cheminfo, maybridge, reiner){
        var maxIterations =40;
        var testSet = "/data/cobas";//"/Research/NMR/AutoAssign/data/cobasSimulated";

        var dataset1 = cheminfo.load("/data/cheminfo","cheminfo",{keepMolecule:true});
        //console.log("dataset1.length "+dataset1.length);
        //var dataset1 = cheminfo.load("/Research/NMR/AutoAssign/data/learningDataSet","learningDataSet",{});
        var dataset2 = maybridge.load("/Research/NMR/AutoAssign/data/maybridge","maybridge",{keepMolecule:true,keepMolfile:true});
        var dataset3 = reiner.load("/Research/NMR/AutoAssign/data/Reiner","reiner",{keepMolecule:true,keepMolfile:true});

        var datasets = [dataset1,dataset2,dataset3];
        var datasetSim = [];

        var db = new DB.MySQL("localhost","mynmrshiftdb3","nmrshiftdb","xxswagxx");

        db.delete2("assignment",{},{"all":true});
        db.delete2("spectrum",{},{"all":true});
        db.delete2("atom",{},{"all":true});
        db.delete2("molecule",{},{"all":true});
        db.delete2("chemical",{},{"all":true});

        var start,date, prevError=0, prevCont= 0,dataset,max,ds, i, j, k, l, m;
        var catalogID,datasetName, signals,diaIDsCH,diaID,solvent,nSignals,asgK,highlight;
        var result,assignment,annotations;
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

                            result =  autoAssign(dataset[i], {"db":db, debug:false, iteration:">-1"});

                            signals = dataset[i].spectra.h1PeakList;
                            diaIDsCH = dataset[i].diaIDsCH;
                            diaID = dataset[i].diaID;
                            solvent = dataset[i].spectra.solvent;

                            if(result[result.length-1].state!="completed"&&result[result.length-1].nSolutions>result.length){
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
                start = date.getTime()
                var error = comparePredictors(datasetSim,{"db":db,"dataset":testSet,"iteration":">-1"});//{error:1,count:1};//comparePredictors({"db":db,"dataset":testSet,"iteration":"="+(iteration-1)});
                date = new Date();
                console.log("Error: "+error.error+" count: "+error.count);
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


