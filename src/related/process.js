/**
 * Created by acastillo on 9/23/15.
 */
function getDiaID(diaIDs,atomList,k){
    var i, j, k,atoms,count = 0;
    for(i=0;i<diaIDs.length;i++){
        atoms = diaIDs[i].atoms;
        for(j=0;j<atoms.length;j++){
            if(atoms[j]==atomList[k]){
                if(atoms.length>atomList.length)
                    console.log("Something suspicious "+JSON.stringify(atoms)+" "+JSON.stringify(atomList));
                return diaIDs[i].id;
            }
        }
    }
    return null;
}

var lines = File.parse("/data/assignment.txt",{"header":false,"delimiter":"\t"});
//var linesM = File.parse("/data/molecules.txt",{"header":false,"delimiter":"\t"});
var molecules = ACT.loadSDF("data/set2dcan.sdf",{keepMolfile:true});


var line,group=[],assignments=[], i, j, k, l, atoms, signal;
for(i=1;i<lines.length;i++){
    line = lines[i];
    if(line[0]=="_entryID"){
        assignments.push(group);
        group = new Array();
    }
    else{
        lines[i][3]=JSON.parse("["+lines[i][3]+"]");
        group.push(lines[i]);
    }
}
assignments.push(group);

/*var molecules = [];
for(i=0;i<linesM.length;i++){
    line = linesM[i];
    if(line[0]!="_entryID"){
        line[3]=line[3].replace(/\\n/g,"\n");
        molecules.push(line);
        File.save("/data/molfiles/"+line[0]+".mol",line[3]);
    }
}*/

if(molecules.length==assignments.length){
    console.log("Size OK: "+assignments.length);
    var result = new Array(assignments.length);
    for(i=0;i<assignments.length;i++){
        if(molecules[i].entryID==assignments[i][0][0]){
            //console.log(molecules[i].entryID+" "+assignments[i][0][0])
            var asg = assignments[i];
            var nmrSignals = [];

            var molecule = ACT.load(molecules[i].molfile);

            molecule.expandHydrogens();
            var diaIDs = molecule.getDiastereotopicAtomIDs("H");

            //Only 1H is taken into account.
            for(j=0;j<asg.length;j++){
                signal = asg[j];
                if(signal[4]=="1H"){
                    atoms = signal[3];
                    for(k=0;k<atoms.length;k++){
                        nmrSignals.push({"atomIDs":[atoms[k]],
                            "delta1":signal[5]*1,
                            "units":"PPM",
                            "diaIDs":[getDiaID(diaIDs,atoms,k)],
                            "pattern":signal[2],
                            "nucleus":"1H"});
                    }
                }
            }

            //Now, what to do with this assignment??
            result[i]={"diaID":molecule.toIDCode()+"","entryID":molecules[i].entryID,"assignment":nmrSignals,"molfile":(molecule.toMolfile()+"").replace(/\n/g,"\\n")};
        }
        else{
            console.log("Something wrong with the order: "+i);
        }
    }
    File.save("/data/assigned298.json",JSON.stringify(result));

}
else{
    console.log("Size does not math");
}

//Canonize the molecules and create the signals