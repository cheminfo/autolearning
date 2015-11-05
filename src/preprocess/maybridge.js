/**
 * Created by acastillo on 9/16/15.
 */
define(["./core/integration"],function (integration) {
    function load(path, datasetName, options) {
        var keepMolfile = false || options.keepMolfile;
        var keepMolecule = false || options.keepMolecule;
        var filter = {filter: "jcamp_"};
        if (typeof options.filter === "object") {
            filter = options.filter;
        }

        var parts = File.dir(path, filter);
        var result = [];
        for (var p = 0; p < parts.length; p++) {
            var molFiles = File.parse(parts[p], {header: true, delimiter: "\t"});
            var max = molFiles.length;
            // we could now loop on the sdf to add the int index
            for (var i = 0; i < max; i++) {
                try {
                    var sdfi = {dataset: datasetName, id: p + "_" + i + "_" + molFiles[i].catalogID};
                    var molfile = molFiles[i].value.replace(/\\n/g, "\n");

                    var molecule = ACT.load(molfile);
                    molecule.expandHydrogens();

                    if (keepMolfile) {
                        sdfi.molfile = molecule.toMolfile();
                    }

                    if (keepMolecule) {
                        sdfi.molecule = molecule;
                    }

                    sdfi.diaID = molecule.toIDCode();
                    var diaIDs = molecule.getDiastereotopicAtomIDs();

                    //Simulate and process the 1H-NMR spectrum at 400MHz
                    var spectraData1H = SD.load(molFiles[i].jcamp.replace(/\\n/g, "\n"));

                    var signals = spectraData1H.nmrPeakDetection({nStddev: 3, baselineRejoin: 5, compute: false});

                    var h1PeakList = integration(signals, molecule.countAtom("H"));

                    for (var j = h1PeakList.length-1;j>=0; j--) {
                        h1PeakList[j]._highlight = [-(j + 1)];
                        if(h1PeakList[j].delta1<0||h1PeakList[j].delta1>16){
                            h1PeakList.splice(j,1);
                        }
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
                    console.log("Could not load the entry " + p + " " + i + " " + e);
                }
            }
        }
        return result;
    }

    return {"load":load};
});