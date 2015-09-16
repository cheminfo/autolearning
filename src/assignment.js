/**
 * Created by acastillo on 9/11/15.
 */

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

function autoAssign(entry, options){
    if(spectra.h1PeakList){
        return assignmentFromPeakPicking(entry, options);
    }
    else{
        return assignmentFromRaw(entry, options);
    }
}

function assignmentFromRaw(entry, options){

    var molfile = entry.molfile;
    var spectra = entry.spectra;

    var molecule=ACT.load(molfile);

    molecule.expandHydrogens();

    entry.molecule = molecule;
    entry.diaIDs = molecule.getDiastereotopicAtomIDs();

    //Simulate and process the 1H-NMR spectrum at 400MHz
    var jcampFile = molFiles[i].replace("mol_","h1_").replace(".mol",".jdx");
    var spectraData1H = SD.load(spectra.h1);//


    var signals = spectraData1H.nmrPeakDetection({nStddev:3,baselineRejoin:5,compute:false});
    spectra.solvent = spectraData1H.getParamString(".SOLVENT NAME", "unknown");
    entry.diaID = molecule.toIDCode();

    signals = integration(signals, molecule.countAtom("H"));

    for(var j=0;j< signals.length;j++){
        signals[j]._highlight=[-(j+1)];
    }
    spectra.h1PeakList = signals;

    return assignmentFromPeakPicking(entry,options);
}

function assignmentFromPeakPicking(entry, options){
    var molecule,diaIDs;
    if(!entry.molecule){
        molecule=ACT.load(molfile);
        molecule.expandHydrogens();
        diaIDs=molecule.getDiastereotopicAtomIDs();

        for (var j=0; j<diaIDs.length; j++) {
            diaIDs[j].nbEquivalent=diaIDs[j].atoms.length;
        }

        diaIDs.sort(function(a,b) {
            if (a.element==b.element) {
                return b.nbEquivalent-a.nbEquivalent;
            }
            return a.element<b.element?1:-1;
        });
        entry.molecule=molecule;
        entry.diaIDs = diaIDs;
        entry.diaID = molecule.toIDCode();
    }
    else{
        molecule = entry.molecule;
        diaIDs = entry.diaIDs;
    }

    //H1 prediction
    var h1pred = nmrShiftDBPred1H(molecule.toMolfile(),{db:options.db,debug:options.debug});
    if(h1pred.length==0)
        return null;

    var index=0;
    var diaIDsCH = [];
    //h1pred = simulation1H.getAssignmentFromSimulation();
    for (var j=0; j<diaIDs.length; j++) {
        if('CH'.indexOf(diaIDs[j].element)>=0){
            diaIDsCH[index]=diaIDs[j];
            if(diaIDsCH[index].element=="H"){
                var tmpDiaID = JSON.stringify(diaIDsCH[index].id);
                diaIDsCH[index].delta1=-9999999;
                diaIDsCH[index].error=9999999;
                var indexSignal = 0;
                while(diaIDsCH[index].delta1==-9999999&&indexSignal<h1pred.length){
                    var tmpSignal1H = JSON.stringify(h1pred[indexSignal]);
                    if(tmpSignal1H.indexOf(tmpDiaID)>=0){
                        diaIDsCH[index].delta1=h1pred[indexSignal].delta1;
                        if(h1pred[indexSignal].std==0||h1pred[indexSignal].ncs==0){
                            diaIDsCH[index].error=20;
                        }
                        else{
                            diaIDsCH[index].error=(2*h1pred[indexSignal].std+10/Math.sqrt(h1pred[indexSignal].ncs));
                        }
                    }
                    indexSignal++;
                }
            }
            index++;
        }
    }
    try{
        return SD.autoAssignment(diaIDsCH, spectra.h1PeakList, null, null, null, null, 1 ,3000,0,0,-1);
    }
    catch(e){
        console.log("Could not assign this molecule.");
        return null;
    }
}