USE mynmrshiftdb3;

SELECT hose5, AVG(chemicalShift), std, min, max, total_rows as ncs FROM (SELECT t1.hose5, t1.chemicalShift, t2.std, t2.min, t2.max, t2.total_rows FROM (
   SELECT hose5, @rownum:=IF(@s = hose5, @rownum + 1, 0) AS row_number,
   @s:=IF(@s = hose5, @s, hose5) AS sec, d.chemicalShift
  FROM assignment d,  (SELECT @rownum:=0, @s:=0) r
  WHERE d.batchID = 5
  ORDER BY d.hose5 , d.chemicalShift
) as t1 JOIN (
  SELECT hose5, COUNT(*) as total_rows, STD(chemicalShift) as std, MIN(chemicalShift) as min, MAX(chemicalShift) as max
  FROM assignment d
  WHERE d.batchID = 5
  GROUP BY hose5
) as t2
ON t1.hose5 = t2.hose5
WHERE ABS((t1.row_number+0.5)-total_rows/2)<1) as t3 GROUP BY hose5;

SELECT hose4, AVG(chemicalShift), std, min, max, total_rows as ncs FROM (SELECT t1.hose4, t1.chemicalShift, t2.std, t2.min, t2.max, t2.total_rows FROM (
   SELECT hose4, @rownum:=IF(@s = hose4, @rownum + 1, 0) AS row_number,
   @s:=IF(@s = hose4, @s, hose4) AS sec, d.chemicalShift
  FROM assignment d,  (SELECT @rownum:=0, @s:=0) r
  WHERE d.batchID = 5
  ORDER BY d.hose4 , d.chemicalShift
) as t1 JOIN (
  SELECT hose4, COUNT(*) as total_rows, STD(chemicalShift) as std, MIN(chemicalShift) as min, MAX(chemicalShift) as max
  FROM assignment d
  WHERE d.batchID = 5
  GROUP BY hose4
) as t2
ON t1.hose4 = t2.hose4
WHERE ABS((t1.row_number+0.5)-total_rows/2)<1) as t3 GROUP BY hose4;


SELECT hose3, AVG(chemicalShift), std, min, max, total_rows as ncs FROM (SELECT t1.hose3, t1.chemicalShift, t2.std, t2.min, t2.max, t2.total_rows FROM (
   SELECT hose3, @rownum:=IF(@s = hose3, @rownum + 1, 0) AS row_number,
   @s:=IF(@s = hose3, @s, hose3) AS sec, d.chemicalShift
  FROM assignment d,  (SELECT @rownum:=0, @s:=0) r
  WHERE d.batchID = 5
  ORDER BY d.hose3 , d.chemicalShift
) as t1 JOIN (
  SELECT hose3, COUNT(*) as total_rows, STD(chemicalShift) as std, MIN(chemicalShift) as min, MAX(chemicalShift) as max
  FROM assignment d
  WHERE d.batchID = 5
  GROUP BY hose3
) as t2
ON t1.hose3 = t2.hose3
WHERE ABS((t1.row_number+0.5)-total_rows/2)<1) as t3 GROUP BY hose3;

SELECT hose2, AVG(chemicalShift), std, min, max, total_rows as ncs FROM (SELECT t1.hose2, t1.chemicalShift, t2.std, t2.min, t2.max, t2.total_rows FROM (
   SELECT hose2, @rownum:=IF(@s = hose2, @rownum + 1, 0) AS row_number,
   @s:=IF(@s = hose2, @s, hose2) AS sec, d.chemicalShift
  FROM assignment d,  (SELECT @rownum:=0, @s:=0) r
  WHERE d.batchID = 5
  ORDER BY d.hose2 , d.chemicalShift
) as t1 JOIN (
  SELECT hose2, COUNT(*) as total_rows, STD(chemicalShift) as std, MIN(chemicalShift) as min, MAX(chemicalShift) as max
  FROM assignment d
  WHERE d.batchID = 5
  GROUP BY hose2
) as t2
ON t1.hose2 = t2.hose2
WHERE ABS((t1.row_number+0.5)-total_rows/2)<1) as t3 GROUP BY hose2;