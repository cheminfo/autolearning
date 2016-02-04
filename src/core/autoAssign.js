/**
 * Created by acastillo on 9/11/15.
 */
define(["fastNmrShiftDBPred1H","integration"],function (nmrShiftDBPred1H, integration) {

        function autoAssign(entry, options){
            if(entry.spectra.h1PeakList){
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


            var signals = spectraData1H.nmrPeakDetection({nStddev:3, baselineRejoin:5, compute:false});
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

            var molecule,diaIDs,molfile;

            var spectra = entry.spectra;
            if(!entry.molecule){
                molecule=ACT.load(entry.molfile);
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
            var h1pred = nmrShiftDBPred1H(molecule, options);

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
                                diaIDsCH[index].error = getError(h1pred[indexSignal],options);
                                /*console.log(h1pred[indexSignal]);
                                if(h1pred[indexSignal].std==0||h1pred[indexSignal].ncs==0){
                                    diaIDsCH[index].error=20;
                                }
                                else{
                                    diaIDsCH[index].error=4*h1pred[indexSignal].std;//(3*h1pred[indexSignal].std+10/Math.sqrt(h1pred[indexSignal].ncs));
                                }
                                console.log("Error "+diaIDsCH[index].error);*/
                            }
                            indexSignal++;
                        }
                    }
                    index++;
                }
            }
            entry.diaIDsCH = diaIDsCH;
            try{
                return SD.autoAssignment(diaIDsCH, spectra.h1PeakList, null, null, null, null, 1 ,3000,0,0,-1);
            }
            catch(e){
                console.log("Could not assign this molecule.");
                return null;
            }
        }

        function  getError(prediction, param){
            //Never use predictions with less than 3 votes
            if(prediction.std==0||prediction.ncs<3){
               return 20;
            }
            else{
                //factor is between 1 and +inf
                //console.log(prediction.ncs+" "+(param.iteration+1)+" "+param.learningRatio);
                var factor = 3*prediction.std/
                    (Math.pow(prediction.ncs,(param.iteration+1)*param.learningRatio));//(param.iteration+1)*param.learningRatio*h1pred[indexSignal].ncs;
                return 3*prediction.std+factor;
            }
            return 20;
        }

        return autoAssign;
    }
);