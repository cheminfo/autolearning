/**
 * Created by acastillo on 9/16/15.
 */
define(["./core/integration"],function (integration) {

    function load(path, datasetName, options) {
        var keepMolfile = false || options.keepMolfile;
        var keepMolecule = false || options.keepMolecule;
        var filter = {filter: ".mol"};
        if (typeof options.filter === "object") {
            filter = options.filter;
        }

        //var datasetName = "learningDataSet";
        //var path = "/Research/NMR/AutoAssign/data/"+datasetName;
        var molFiles = File.dir(path,filter);
        var max = 100;//molFiles.length;
        var result = [];//new Array(max);
        // we could now loop on the sdf to add the int index
        for (var i = 0; i < max; i++) {
            try {
                var sdfi = {dataset: datasetName, id: i + ""};
                var molfile = File.load(molFiles[i]);

                var molecule = ACT.load(molfile);
                molecule.expandHydrogens();

                if (keepMolfile) {
                    sdfi.molfile = molecule.toMolfile()+"";
                }
                if (keepMolecule) {
                    sdfi.molecule = molecule;
                }

                sdfi.diaID = molecule.toIDCode();
                var diaIDs = molecule.getDiastereotopicAtomIDs();

                //Simulate and process the 1H-NMR spectrum at 400MHz
                var jcampFile = molFiles[i].replace("mol_", "h1_").replace(".mol", ".jdx");
                var spectraData1H = SD.load(jcampFile);//

                var signals = spectraData1H.nmrPeakDetection({nStddev: 3, baselineRejoin: 5, compute: false});

                var h1PeakList = integration(signals, molecule.countAtom("H"));

                for (var j = 0; j < h1PeakList.length; j++) {
                    h1PeakList[j]._highlight = [-(j + 1)];
                }

                sdfi.spectra = {"h1PeakList":h1PeakList,"solvent":spectraData1H.getParamString(".SOLVENT NAME", "unknown")}

                sdfi.diaIDs = diaIDs;
                for (var j = 0; j < diaIDs.length; j++) {
                    sdfi.diaIDs[j].nbEquivalent = diaIDs[j].atoms.length;
                }

                sdfi.diaIDs.sort(function (a, b) {
                    if (a.element == b.element) {
                        return b.nbEquivalent - a.nbEquivalent;
                    }
                    return a.element < b.element ? 1 : -1;
                });
                result.push(sdfi);
            }
            catch (e) {
                console.log("Could not load the entry " + i + " " + e);
            }
        }
        return result;
    }

    return {"load":load};
});