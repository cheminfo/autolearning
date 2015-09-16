/**
 * Created by acastillo on 9/14/15.
 */

function compare(A,B){
    var error = 0;
    var count =0;
    for(var i=0;i< A.length;i++){
        for(var j=0;j< B.length;j++){
            if(A[i].diaIDs[0]==B[j].diaIDs[0]){
                error+=Math.abs(A[i].delta1-B[j].delta1);
                count++;
                break;
            }
        }
    }
    if(count!=0)
        return error/count;
    return 0;
}


function comparePredictors(options){
    var other = "h1";
    var db = options.db;
    var folder = options.dataset;
    var avgError = 0;
    var molecules =  File.dir(folder,{filter:".mol"});//"/Research/NMR/AutoAssign/data/test"
    for(var i=0;i<molecules.length;i++){
        var molecule = File.load(molecules[i]);
        var spinus = null;
        if(File.exists(molecules[i].replace(".mol","."+other))){
            spinus = File.loadJSON(molecules[i].replace(".mol","."+other));
        }
        else{
            spinus = SD.spinusPred1H(molecule);
            console.log("Saving...");
            File.save(molecules[i].replace(".mol","."+other),JSON.stringify(spinus));
        }
        var h1pred = nmrShiftDBPred1H(molecule,{db:db});

        avgError+= compare(h1pred,spinus);
    }
    return avgError/molecules.length;
}