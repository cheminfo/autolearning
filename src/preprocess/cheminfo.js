/**
 * Created by acastillo on 9/16/15.
 */

function load(path,datasetName,options){
    var keepMolfile = false||options.keepMolfile;
    var keepMolecule = false||options.keepMolecule;
    var filter = {filter:".mol"};
    if(typeof options.filter === "object"){
        filter = options.filter;
    }

    //var datasetName = "learningDataSet";
    //var path = "/Research/NMR/AutoAssign/data/"+datasetName;
    var molFiles = File.dir(path,filter);
    var max = molFiles.length;
    var result = [];//new Array(max);
    // we could now loop on the sdf to add the int index
    for (var i=0; i<max; i++) {
        try{
            var sdfi={dataset:datasetName,id:i+""};
            var molfile = File.load(molFiles[i]);

            var molecule=ACT.load(molfile);
            molecule.expandHydrogens();

            if(keepMolfile){
                sdfi.molfile=molfile;
            }
            if(keepMolecule){
                sdfi.molecule = molecule;
            }

            sdfi.diaID = molecule.toIDCode();
            var diaIDs=molecule.getDiastereotopicAtomIDs();

            //Simulate and process the 1H-NMR spectrum at 400MHz
            var jcampFile = molFiles[i].replace("mol_","h1_").replace(".mol",".jdx");
            var spectraData1H = SD.load(jcampFile);//

            var signals = spectraData1H.nmrPeakDetection({nStddev:3,baselineRejoin:5,compute:false});
            sdfi.solvent = spectraData1H.getParamString(".SOLVENT NAME", "unknown");
            //console.log(molecule.countAtom("H"));
            sdfi.h1PeakList = integration(signals, molecule.countAtom("H"));

            for(var j=0;j< sdfi.signals.length;j++){
                sdfi.signals[j]._highlight=[-(j+1)];
            }

            sdfi.diaIDs=diaIDs;
            for (var j=0; j<diaIDs.length; j++) {
                sdfi.diaIDs[j].nbEquivalent=diaIDs[j].atoms.length;
            }

            sdfi.diaIDs.sort(function(a,b) {
                if (a.element==b.element) {
                    return b.nbEquivalent-a.nbEquivalent;
                }
                return a.element<b.element?1:-1;
            });
            result.push(sdfi);
        }
        catch(e){
            console.log("Could not load the entry "+p+" "+i+" "+e);
        }
    }
    return result;
}


function integration(signals, sum){
    var integral = 0;
    var signals2 = signals;
    for(var j=0;j<signals.length;j++){
        integral+=signals2[j].integralData.value;
    }
    //Ajusting the integral and reduce the lenght of the numbers
    for(var j=0;j<signals.length;j++){
        signals2[j].integralData.value=Math.round(signals2[j].integralData.value*sum/integral);
    }

    signals2.sort(function(a,b){
        return a.integralData.value<b.integralData.value?1:-1;
    });

    var j = signals.length-1;
    while(signals2[j].integralData.value<0.5&&j>=0){
        signals2.splice(j,1);
        j--;
    }

    return signals2;
}