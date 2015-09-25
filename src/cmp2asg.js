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


    function cmp2asg(dataSet, options) {
        //console.log(options);
        //var db = new DB.MySQL("localhost","mynmrshiftdb3","nmrshiftdb","xxswagxx");
        var molecule,h1pred,result,avgError=0,count=0;
        var db = options.db;
        for(var i = 0; i <dataSet.length ; i++) {
            if(!dataSet[i].molecule){
                molecule = ACT.load(dataSet[i].molfile.replace(/\\n/g,"\n"));
                molecule.expandHydrogens();
                dataSet[i].molecule = molecule;

            }
            else{
                molecule = dataSet[i].molecule;
            }

            h1pred = nmrShiftDBPred1H(molecule, {db: db, debug:false, iteration:options.iteration},true);
            //console.log(dataSet[i].assignment);
            //console.log(h1pred);
            result = compare(h1pred, dataSet[i].assignment);
            //console.log(result);
            avgError+= result.error;
            count+=result.count;

        }
        //db.close();
        return {error:avgError / dataSet.length,count:count};
    }

    return cmp2asg;
});
