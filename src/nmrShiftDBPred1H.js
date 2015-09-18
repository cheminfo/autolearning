/**
 * Created by acastillo on 9/11/15.
 */
define(function () {

    var script = "SELECT AVG(chemicalShift) AS cs, STD(chemicalShift)  AS std, COUNT(chemicalShift) AS ncs, MIN(chemicalShift) as min, MAX(chemicalShift) as max FROM assignment where ";//hose5='dgH`EBYReZYiIjjjjj@OzP`NET'";
    var medianQ = "SELECT chemicalShift, fk_atomID FROM assignment where ";

    function query(atom, lvl, db, iteration, debug) {
        var atomHOSE = atom["hose" + lvl];
        var res = null;
        if (atomHOSE != "undefined" && atomHOSE != "null") {
            res = db.select(script +"batchID "+iteration+" AND BINARY hose" + lvl + "='" + atomHOSE + "'", {format: "json"});
        }
        if (res != null && res[0].cs) {
            var median = db.select(medianQ +"batchID "+iteration+" AND BINARY hose" + lvl + "='" + atomHOSE + "' ORDER BY chemicalShift", {format: "json"});
            if (median.length % 2 == 0) {
                res[0].median = (median[median.length / 2 - 1].chemicalShift
                    + median[median.length / 2].chemicalShift) / 2.0;
            }
            else {
                res[0].median = median[Math.floor(median.length / 2)].chemicalShift;
            }
            if (debug)
                res[0].molecules = median;
            res[0].level = lvl;
            return res;
        }
        else
            return null;
    }

    /**
     * @function nmrShiftDBPred1H(molfile)
     * This function predict shift for 1H-NMR, from a molfile by using the cheminfo reference data base.
     * @param    molfile:string    A molfile content
     * @returns    +Object an array of NMRSignal1D
     */
    function nmrShiftDBPred1H(molfile, options) {
        var db = null;
        var closeDB = true;

        options = options || {};
        if (options.db) {
            db = options.db;
            closeDB = false;
        }
        else
            db = new DB.MySQL("localhost", "mynmrshiftdb3", "nmrshiftdb", "xxswagxx");

        //console.log(db);
        options.debug = options.debug || false;
        var algorithm = options.algorithm || 0;

        var iteration = "> -1";
        if(typeof options.iteration ==="undefined")
            iteration = options.iteration;
        var mol = ACT.load(molfile);
        mol.expandHydrogens();
        var diaIDs = mol.getDiastereotopicAtomIDs("H");
        var infoCOSY = mol.getCouplings();
        //console.log(infoCOSY);

        var atoms = {};
        var atomNumbers = [];
        for (var j = 0; j < diaIDs.length; j++) {
            var hosesString = ACT.getHoseCodesFromDiaID(diaIDs[j].id, 5, {algorithm: algorithm});
            var atom = {
                diaIDs: [diaIDs[j].id + ""],
                nucleus: "1H",
                pattern: "s",
                observe: 400e6,
                units: "PPM",
                asymmetric: false,
                hose2: hosesString[1] + "",
                hose3: hosesString[2] + "",
                hose4: hosesString[3] + "",
                hose5: hosesString[4] + ""
            };
            for (var k = diaIDs[j].atoms.length - 1; k >= 0; k--) {
                atoms[diaIDs[j].atoms[k]] = JSON.parse(JSON.stringify(atom));
                atomNumbers.push(diaIDs[j].atoms[k]);
            }
        }
        //Now, we predict the chimical shift by using our copy of NMRShiftDB

        //var script2 = "select chemicalShift FROM assignment where ";//hose5='dgH`EBYReZYiIjjjjj@OzP`NET'";

        var toReturn = [];
        var median = [];
        for (var j = 0; j < atomNumbers.length; j++) {
            var atom = atoms[atomNumbers[j]];
            var level = 0;
            var res = query(atom, 5, db, iteration, options.debug);
            if (res === null) {
                res = query(atom, 4, db, iteration, options.debug);
                if (res === null) {
                    res = query(atom, 3, db, iteration, options.debug);
                    if (res === null) {
                        res = query(atom, 2, db, iteration, options.debug);
                        if (res === null) {
                            res = [{
                                cs: -9999999,
                                ncs: 0,
                                std: 0,
                                min: 0,
                                max: 0,
                                median: -9999999,
                                level: 0,
                                molecules: []
                            }];
                        }
                    }
                }
            }

            atom.level = res[0].level;
            atom.delta1 = res[0].median;
            atom.startX = atom.delta1 - res[0].std * 2;
            atom.stopX = atom.delta1 + res[0].std * 2;
            atom.avg = res[0].cs;
            atom.median = res[0].median;
            atom.molecules = res[0].molecules;
            atom.peaks = [{intensity: 1, x: res[0].median}];
            atom.assignment = "" + atomNumbers[j],
                atom.atomIDs = ["" + atomNumbers[j]],
                atom.ncs = res[0].ncs;
            atom.std = res[0].std;
            atom.min = res[0].min;
            atom.max = res[0].max;
            atom.nmrJs = [];

            //Add the predicted couplings
            //console.log(atomNumbers[j]+" "+infoCOSY[0].atom1);
            for (var i = infoCOSY.length - 1; i >= 0; i--) {
                if (infoCOSY[i].atom1 - 1 == atomNumbers[j] && infoCOSY[i].coupling > 2) {
                    atom.nmrJs.push({
                        "assignmentTo": infoCOSY[i].atom2 - 1 + "",
                        "coupling": infoCOSY[i].coupling,
                        "multiplicity": "d"
                    });
                }
            }

            toReturn.push(atom);
        }
        if (closeDB)
            db.close();
        return toReturn;
    }

    return nmrShiftDBPred1H;
});