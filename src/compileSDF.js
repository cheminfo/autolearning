/**
 * Created by acastillo on 1/25/16.
 */
define(["./preprocess/cheminfo","./preprocess/maybridge","./preprocess/reiner"],
    function(cheminfo, maybridge, reiner) {

        var testSet = File.loadJSON("/data/assigned298.json");

        var dataset1 = cheminfo.load("/data/cheminfo443", "cheminfo", {keepMolecule: true, keepMolfile: true});
        var dataset2 = maybridge.load("/data/maybridge", "maybridge", {keepMolecule: true, keepMolfile: true});
        var dataset3 = reiner.load("/data/Reiner", "reiner", {keepMolecule: true, keepMolfile: true});

        var datasets = [dataset1, dataset2, dataset3];

        var dataset, ds, i, j, m;
        console.log("Cheminfo All: "+dataset1.length);
        console.log("MayBridge All: "+dataset2.length);
        //Remove the overlap molecules from train and test
        var removed = 0;
        for (i = 0; i < testSet.length; i++) {
            for(ds = 0;ds<datasets.length;ds++){
                dataset = datasets[ds];
                for (j=dataset.length-1;j>=0; j--){
                    if(testSet[i].diaID == dataset[j].diaID){
                        dataset.splice(j,1);
                        removed++;
                        break;
                    }
                }
            }
        }
        var trainMolecules = [];
        var countH = 0;
        for(ds = 0;ds<datasets.length;ds++){
            dataset = datasets[ds];
            for (j=0;j<dataset.length; j++){
                trainMolecules.push(dataset[j].molfile);
            }
        }
        File.save("/trainSet.sdf",trainMolecules.join("\n$$$$\n")+"\n$$$$\n");
        var testMolecules = [];
        for (i = 0; i < 10; i++) {
            testMolecules.push(testSet[i].molfile.replace(/\\n/g,"\n"));
            var molecule = ACT.load(testMolecules[i]);
            molecule.expandHydrogens();
            countH+=molecule.countAtom("H");
            /*var diaIDs = molecule.getDiastereotopicAtomIDs("H");
            for (j = diaIDs.length-1; j >=0; j--) {
                hosesString = ACT.getHoseCodesFromDiaID(diaIDs[j].id, 6, {algorithm: 0});
                console.log(hosesString);
            }*/
        }

        File.save("/testSet.sdf",testMolecules.join("\n$$$$\n")+"\n$$$$\n");

        console.log("Cheminfo Final: "+dataset1.length);
        console.log("MayBridge Final: "+dataset2.length);
        console.log("Overlaped molecules: "+removed+".  They was removed from training datasets");
        console.log("Number of protons in test set: "+countH);
    }
);


