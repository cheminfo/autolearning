/**
 * Created by acastillo on 9/14/15.
 */
define(["nmrShiftDBPred1H","ext-lib/histogram"],function (nmrShiftDBPred1H, histogram) {
    function compare(A, B, hist) {
        var error = 0, count = 0, max=0, min=9999999, tmp = 0;
        var i,j;
        //console.log(A.length+" "+B.length);

        for (i = A.length-1; i >=0 ; i--) {
            for (j = B.length-1; j >=0; j--) {
                if (A[i].diaIDs[0] == B[j].diaIDs[0]) {
                    if(A[i].delta1!=-9999999&&B[j].delta1!=-9999999){
                        tmp = Math.abs(A[i].delta1 - B[j].delta1);
                        hist.push(tmp);
                        error += tmp;
                        count++;
                        if(tmp > max)
                            max = tmp;
                        if(tmp < min)
                            min < tmp;
                    }
                    break;
                }
            }
        }

        if (count != 0)
            return {error: error / count, count: count, min: min, max: max};
        return {error:0,count:0,min:0,max:0};
    }


    function cmp2asg(dataSet, options) {
        //console.log(options);
        //var db = new DB.MySQL("localhost","mynmrshiftdb3","nmrshiftdb","xxswagxx");
        var molecule,h1pred,result,avgError=0,count= 0,min=9999999,max=0;
        var db = options.db;
        var hist = [];

        for(var i = 0; i <dataSet.length ; i++) {
            if(!dataSet[i].molecule){
                molecule = ACT.load(dataSet[i].molfile.replace(/\\n/g,"\n"));
                molecule.expandHydrogens();
                dataSet[i].molecule = molecule;

            }
            else{
                molecule = dataSet[i].molecule;
            }

            h1pred = nmrShiftDBPred1H(molecule, {
                "db": db,
                "debug":false,
                "iteration":options.iteration,
                "ignoreLabile":options.ignoreLabile,
                "hoseLevels":options.hoseLevels
            });


            //console.log(dataSet[i].assignment);
            //console.log(h1pred);
            result = compare(h1pred, dataSet[i].assignment,hist);
            //console.log(result);
            avgError+= result.error;
            count+=result.count;
            if(result.min<min)
                min = result.min;
            if(result.max>max)
                max = result.max;

        }
        //db.close();
        var histParams = options.histParams || {from:0,to:1,nBins:100};
        return {error:avgError / dataSet.length, count:count, min:min, max:max, hist: histogram({
            data : hist,
            bins : linspace(histParams.from,histParams.to,histParams.nBins)
        })};
    }

    function linspace(a,b,n) {
        if(typeof n === "undefined") n = Math.max(Math.round(b-a)+1,1);
        if(n<2) { return n===1?[a]:[]; }
        var i,ret = Array(n);
        n--;
        for(i=n;i>=0;i--) { ret[i] = (i*b+(n-i)*a)/n; }
        return ret;
    }

    return cmp2asg;
});
