SELECT DISTINCT entryTable._entryID, entryTable.catalogID FROM entry entryTable, users user, nmr, nmrLine nmrLine
WHERE user._userID=entryTable._userID and user.email like 'jo.milner@maybridge.com'
and entryTable.groupRead=true and nmrLine.delta1>0 and nmrLine._nmrID=nmr._nmrID and nmr._entryID=entryTable._entryID;

SELECT nmrLine.* FROM entry INNER JOIN nmr ON entry._entryID = nmr._entryID INNER JOIN nmrLine ON nmr._nmrID = nmrLine._nmrID WHERE entry._entryID = 154872;
