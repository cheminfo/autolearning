/**
 * Created by acastillo on 9/14/15.
 */
define(["nmrShiftDBPred1H"],function (nmrShiftDBPred1H) {
    function compare(A, B) {
        var error = 0;
        var count = 0;
        var i,j;
        //console.log(A.length+" "+B.length);

        for (i = A.length-1; i >=0 ; i--) {
            for (j = B.length-1; j >=0; j--) {
                if (A[i].diaIDs[0] == B[j].diaIDs[0]) {
                    if(A[i].delta1!=-9999999&&B[j].delta1!=-9999999){
                        error += Math.abs(A[i].delta1 - B[j].delta1);
                        count++;
                    }
                    break;
                }
            }
        }
        if (count != 0)
            return {error:error / count,count:count};
        return {error:0,count:0};
    }


    function comparePredictors(dataSet, options) {
        //console.log(options);
        //var db = new DB.MySQL("localhost","mynmrshiftdb3","nmrshiftdb","xxswagxx");
        var other = "h1",db = options.db,folder = options.dataset, avgError = 0,count = 0;
        var spinus, molecule,diaIDs,h1pred,result;
        var molecules = File.dir(folder, {filter: ".mol"});//"/Research/NMR/AutoAssign/data/test"
        var firstTime = false;
        if(dataSet.length==0){
            firstTime=true;
        }
        for (var i = 0; i <molecules.length ; i++) {
            //console.log(firstTime+" "+dataSet.length);
            if(!firstTime){
                spinus = dataSet[i].spinus;
                molecule = dataSet[i].molecule;
            }
            else{
                molecule=ACT.load(File.load(molecules[i]));
                molecule.expandHydrogens();

                if (File.exists(molecules[i].replace(".mol", "." + other))) {
                    spinus = File.loadJSON(molecules[i].replace(".mol", "." + other));
                }
                else {
                    diaIDs=molecule.getDiastereotopicAtomIDs("H");
                    spinus = SD.spinusPred1H(molecule.toMolfile(),{"diaIDs":diaIDs});
                    console.log("Saving...");
                    File.save(molecules[i].replace(".mol", "." + other), JSON.stringify(spinus));
                }
                dataSet.push({spinus:spinus,molecule:molecule});
            }

            if(spinus.length>0){
                h1pred = nmrShiftDBPred1H(molecule, {db: db, debug:false, iteration:options.iteration},true);
                result = compare(h1pred, spinus);
                avgError+= result.error;
                count+=result.count;
            }

        }
        //db.close();
        return {error:avgError / molecules.length,count:count};
    }

    return comparePredictors;
});