/**
 * Created by acastillo on 9/11/15.
 */
File.eval('../functions_exp.js');
File.eval('/Research/Firmenich/JMEFilter/Conversion/Master.js');
File.eval('/Research/NMR/AutoAssign/Learning/predict1H.js');
var datasetName = "learningDataSet";
var iteration = 1;
var molFiles = File.dir("/Research/NMR/AutoAssign/data/"+datasetName,{filter:".mol"});
var sdf = [];
var max = molFiles.length;
var countUnique = 0, countOk= 0, countFail=0, countAtoms = 0;
var db = new DB.MySQL("localhost","mynmrshiftdb2","nmrshiftdb","xxswagxx");
var qresult = null;
var toView = true;
try{
    // we could now loop on the sdf to add the int index
    for (var i=0; i<max; i++) {
        if(i==225||i==226||i==228||i==405)
            continue;

        var result = autoAssign(dataset[i].molfile, dataset[i].spectra, {db:db, debug:false});
        var signals = dataset[i].spectra.h1PeakList;

        if(result[result.length-1].state!="completed"&&result[result.length-1].nSolutions>result.length){
            console.log("Too much solutions");
            continue;
        }
        //Get the unique assigments in the assignment variable.
        var assignment=null;
        if(result.length>1){
            assignment = result[0].assignment;
            var nSignals = assignment.length;

            for(var k=1;k<result.length-1;k++){
                var asgK = result[k].assignment;
                for(var j=0;j<nSignals;j++){
                    for(var m=0;m<assignment[j].length;m++){
                        if(m<=asgK[j].length){
                            if(assignment[j][m]!=asgK[j][m])
                                assignment[j][m]=-1;
                        }
                    }
                }
            }
        }

        var tmp = sdfi.signals;
        var ids = assignment;
        var thisAsg1H=new Array(tmp.length);
        var names1H = [];
        //var namesDiaIDs = [];
        var annotations=[];
        var ok = false;
        //console.log("Assignment done "+ids);
        if(ids&&ids.length>0){
            for(var j=0;j<tmp.length;j++){
                var highlight=[];
                //To put the diaIDs
                ok=false;
                if(ids[j]){
                    ok=true;
                    for(var l=ids[j].length-1;l>=0;l--){
                        if(ids[j][l]!=-1){
                            //sdfi.signals.assignment.push(diaIDsCH[ids[j][l]].id);
                            highlight.push(diaIDsCH[ids[j][l]].id);

                            var atoms = diaIDsCH[ids[j][l]].atoms;
                            for(var iAtom=atoms.length;iAtom>=0;iAtom--){
                                names1H[atoms[iAtom]]=tmp[j].delta1.toFixed(2);
                                //namesDiaIDs[atoms[iAtom]]=lookup([diaIDsCH[ids[j][l]].id],diaIDsCH);
                            }
                        }
                    }
                    thisAsg1H[j]={integralData:tmp[j].integralData,atomIDs:ids[j],diaIDs:highlight,startX:tmp[j].startX,stopX:tmp[j].stopX};
                }
            }
            if(ok){
                annotations=addAnnotations(thisAsg1H,0,sdfi.diaIDs);
                for(var j=0;j<annotations.length;j++){
                    if(annotations[j]._highlight.length==0){
                        annotations.splice(j,1);
                        j--;
                        //console.log(annotations[j]._highlight[0]+" "+annotations[j].info.stopX+"-"+annotations[j].info.startX);
                    }
                }
            }
            if(toView){
                sdfi.annotations=annotations;
                for(var j=0;j<names1H.length;j++){
                    if(names1H[j]==undefined)
                        names1H[j]="";
                }
                //allAssignments[k].names1H=names1H;
                sdfi.jmeCS={type:"jme", value:CI.jmeConverter.toJme(fullMolecule,names1H)};
                sdfi.jmeCS._highlight=sdfi.molfile._highlight;
                sdfi.jmeCS._atoms=sdfi.molfile._atoms;
                sdf.push(sdfi);
            }
            save2db();
        }
    }
    jexport("sdf",sdf);
    console.log("Done");
    db.close();

}
catch(e){
    console.log("Fail "+e);
    db.close();
}
