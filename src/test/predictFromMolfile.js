/**
 * Created by acastillo on 11/6/15.
 */
define(["../core/fastNmrShiftDBPred1H"],function (nmrShiftDBPred1H) {
    var molecule = File.load("/test/mol_0.mol");
    var db = File.loadJSON("/h1_database.json");
    var h1pred = nmrShiftDBPred1H(molecule, {
        "db": db,
        "debug":false,
        "ignoreLabile":false,
        "getCouplings":true,
        "hoseLevels":[5,4,3,2]//HOSE sizes to consider in the query
    });
    console.log("Each group of magnetically equivalent atoms share the same atomID");
    console.log(h1pred);
});