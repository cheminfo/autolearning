/**
 * Created by acastillo on 9/11/15.
 */
define(function () {

    /**
     * @function nmrShiftDBPred1H(molfile)
     * This function predict shift for 1H-NMR, from a molfile by using the cheminfo reference data base.
     * @param    molfile:string    A molfile content
     * @returns    +Object an array of NMRSignal1D
     */
    function nmrShiftDBPred1H(molfile, options) {
        var db = null;

        var options = options || {};
        if (options.db) {
            db = options.db;
        }
        else {
            db = File.loadJSON("../h1_database.json");
        }


        //console.log(db);

        options.debug = options.debug || false;
        var algorithm = options.algorithm || 0;
        var levels = options.hoseLevels || [5,4,3,2];
        var couplings = options.getCouplings || false;
        levels.sort(function(a, b) {
            return b - a;
        });

        var iteration = "> -1";
        //console.log(options);
        if (typeof options.iteration === "string") {
            iteration = options.iteration;

        }
        //console.log("iteration "+iteration);
        var mol = molfile;
        if(typeof molfile==="string"){
            mol = ACT.load(molfile);
            mol.expandHydrogens();
        }
        var diaIDs = mol.getDiastereotopicAtomIDs("H");

        var infoCOSY = [];//mol.getCouplings();
        if(couplings){
            infoCOSY = mol.getCouplings();
        }
        //console.log(infoCOSY);

        var atoms = {},atom;
        var atomNumbers = [],hosesString;
        var i, k,j;
        for (j = diaIDs.length-1; j >=0; j--) {
            hosesString = ACT.getHoseCodesFromDiaID(diaIDs[j].id, 5, {algorithm: algorithm});
            atom = {
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
            for (k = diaIDs[j].atoms.length - 1; k >= 0; k--) {
                atoms[diaIDs[j].atoms[k]] = JSON.parse(JSON.stringify(atom));
                atomNumbers.push(diaIDs[j].atoms[k]);
            }
        }
        //Now, we predict the chimical shift by using our copy of NMRShiftDB

        //var script2 = "select chemicalShift FROM assignment where ";//hose5='dgH`EBYReZYiIjjjjj@OzP`NET'";

        var toReturn = new Array(atomNumbers.length);
        //var median = [];
        for (j = 0; j < atomNumbers.length; j++) {
            atom = atoms[atomNumbers[j]];
            //var level = 0;
            var res=null;
            k=0;
            //A really simple query
            while(res==null&&k<levels.length){
                res = db[levels[k]][atom["hose"+levels[k]]];
                k++;
            }
            if (res === null) {
                res = {
                    cs: -9999999,
                    ncs: 0,
                    std: 0,
                    min: 0,
                    max: 0
                };
            }

            atom.level = levels[k-1];
            atom.delta1 = res.cs;
            atom.startX = atom.delta1 - res.std * 2;
            atom.stopX = atom.delta1 + res.std * 2;
            atom.peaks = [{intensity: 1, x: res.cs}];
            atom.assignment = "" + atomNumbers[j];
            atom.atomIDs = ["" + atomNumbers[j]];
            atom.ncs = res.ncs;
            atom.std = res.std;
            atom.min = res.min;
            atom.max = res.max;
            atom.nmrJs = [];

            //Add the predicted couplings
            //console.log(atomNumbers[j]+" "+infoCOSY[0].atom1);
            for (i = infoCOSY.length - 1; i >= 0; i--) {
                if (infoCOSY[i].atom1 - 1 == atomNumbers[j] && infoCOSY[i].coupling > 2) {
                    atom.nmrJs.push({
                        "assignmentTo": infoCOSY[i].atom2 - 1 + "",
                        "coupling": infoCOSY[i].coupling,
                        "multiplicity": "d"
                    });
                }
            }

            toReturn[j]=atom;
        }

        if(options.ignoreLabile){
            var linksOH = mol.getPaths(1,1,"H","O",false);
            var linksNH = mol.getPaths(1,1,"H","N",false);
            //console.log(h1pred.length);
            for(j=toReturn.length-1;j>=0;j--){
                for(var k=0;k<linksOH.length;k++){
                    if(toReturn[j].diaIDs[0]==linksOH[k].diaID1){
                        toReturn.splice(j,1);
                        break;
                    }
                }
            }
            //console.log(h1pred.length);
            for(j=toReturn.length-1;j>=0;j--){
                for(var k=0;k<linksNH.length;k++){
                    if(toReturn[j].diaIDs[0]==linksNH[k].diaID1){
                        toReturn.splice(j,1);
                        break;
                    }
                }
            }
        }

        return toReturn;
    }

    return nmrShiftDBPred1H;
});