DROP TABLE IF EXISTS chemical;

CREATE TABLE chemical(
	_chemicalID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	repository VARCHAR(128),
	fk_userID INT
);

DROP TABLE IF EXISTS molecule;

CREATE TABLE molecule(
	_moleculeID VARCHAR(128) NOT NULL PRIMARY KEY,
	fk_chemicalID INT,
	file VARCHAR(256),
	FOREIGN KEY (fk_chemicalID)
    	REFERENCES chemical(_chemicalID)
);

DROP TABLE IF EXISTS spectrum;

CREATE TABLE spectrum(
	_spectrumID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	type VARCHAR(64) NOT NULL,
	solvent VARCHAR(64),
	nuc1 VARCHAR(16),
	nuc2 VARCHAR(16),
	file VARCHAR(256),
	fk_chemicalID INT,
	FOREIGN KEY (fk_chemicalID)
    	REFERENCES chemical(_chemicalID)
);

DROP TABLE IF EXISTS atom;

CREATE TABLE atom(
	_atomID VARCHAR(128) NOT NULL PRIMARY KEY,
	symbol VARCHAR(16) NOT NULL,
	canonical_number INT NOT NULL,
	hose2 VARCHAR(128),
	hose3 VARCHAR(128),
	hose4 VARCHAR(128),
	hose5 VARCHAR(128),
	fk_moleculeID VARCHAR(128),
	FOREIGN KEY (fk_moleculeID)
    	REFERENCES molecule(_moleculeID)
);

DROP TABLE IF EXISTS assignment;

CREATE TABLE assignment(
	_assignmentID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	repository VARCHAR(128),
	batchID INT,
	chemicalShift FLOAT(8,4),
	multiplicity VARCHAR(16),
	integration FLOAT(8,4),
	fk_atomID VARCHAR(128),
	fk_spectrumID INT,
	atom_symbol VARCHAR(16) NOT NULL,
	hose2 VARCHAR(128),
	hose3 VARCHAR(128),
	hose4 VARCHAR(128),
	hose5 VARCHAR(128),
	FOREIGN KEY (fk_atomID)
    	REFERENCES atom(_atomID),
	FOREIGN KEY (fk_spectrumID)
    	REFERENCES spectrum(_spectrumID)
);

CREATE INDEX hose2_index ON atom (hose2(16));
CREATE INDEX hose3_index ON atom (hose3(16));
CREATE INDEX hose4_index ON atom (hose4(16));
CREATE INDEX hose5_index ON atom (hose5(16));
CREATE INDEX xhose2_index ON assignment (hose2(16));
CREATE INDEX xhose3_index ON assignment (hose3(16));
CREATE INDEX xhose4_index ON assignment (hose4(16));
CREATE INDEX xhose5_index ON assignment (hose5(16));
CREATE INDEX chemicalShift_index ON assignment (chemicalShift);
