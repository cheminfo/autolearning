/**
 * Created by acastillo on 9/11/15.
 */
define(function () {
    //There is any atom to add to the database?
    //options={diaID,diaIDs,catalogID,datasetName,solvent}
    function createPredictionTable(db, iteration) {
        var result = [[],[],[],[],[],[],[]];//Database ready for HOSE spheres up to 6 !!!!!!
        for(var level = 5;level>=2;level--){
            var hose = "hose"+level;
            var script = "SELECT hose, AVG(chemicalShift) as cs, std, min, max, ncs FROM (SELECT t1."+hose+" as hose, t1.chemicalShift, t2.std, t2.min, t2.max, t2.total_rows as ncs FROM ( SELECT "+hose+", @rownum:=IF(@s = "+hose+", @rownum + 1, 0) AS row_number, @s:=IF(@s = "+hose+", @s, "+hose+") AS sec, d.chemicalShift FROM assignment d,  (SELECT @rownum:=0, @s:=0) r WHERE d.batchID = "+iteration+" ORDER BY d."+hose+" , d.chemicalShift ) as t1 JOIN ( SELECT "+hose+", COUNT(*) as total_rows, STD(chemicalShift) as std, MIN(chemicalShift) as min, MAX(chemicalShift) as max FROM assignment d WHERE d.batchID = "+iteration+" GROUP BY "+hose+" ) as t2 ON t1."+hose+" = t2."+hose+" WHERE ABS((t1.row_number+0.5)-total_rows/2)<1) as t3 GROUP BY hose;"
            //console.log(script);
            var res = db.select(script, {format: "table"});
            var levelTable = {};
            for(var i=2;i<res.length;i++){
                levelTable[res[i][0]]={"cs":res[i][1],"std":res[i][2],"min":res[i][3],"max":res[i][4],"ncs":res[i][5]}
            }
            result[level]=levelTable;
        }
        return result;
    }

    return createPredictionTable;
});