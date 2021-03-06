# autolearning


Try Ask Ernö in our [visualizer] (http://www.cheminfo.org/flavor/askerno/index.html) (It could take a while the first time.)

##Installation

###Pre-requisites
  1. Install mysql on your host.
  2. java 1.7 or latter. 
  
### Steps
  3. Change to the project folder 
  
    ``` cd autolearning  ```

  4. Download [the maybridge dataset](http://script.epfl.ch/script/HD/Load/1ZGgqjWVbr?filename=test%40patiny.com%2FResearch%2FNMR%2FAutoAssign%2Fdata%2Fmaybridge%2Fjcamp.bz2) and [cheminfo443 dataset] (http://script.epfl.ch/script/HD/Load/f40zy9WWyj?filename=test%40patiny.com%2FResearch%2FNMR%2FAutoAssign%2Fdata%2FlearningDataSet.zip)
  
```curl http://script.epfl.ch/script/HD/Load/1ZGgqjWVbr?filename=test%40patiny.com%2FResearch%2FNMR%2FAutoAssign%2Fdata%2Fmaybridge%2Fjcamp.bz2 > src/data/maybridge/jcamp.bz2; bzip2 -d src/data/maybridge/jcamp.bz2 ;./src/data/maybridge/split.sh  ./src/data/maybridge/jcamp```

```curl http://script.epfl.ch/script/HD/Load/WA8LUhjzYi?filename=test%40patiny.com%2FResearch%2FNMR%2FAutoAssign%2Fdata%2Fcheminfo443.zip > src/data/cheminfo443.zip ; src/data/cheminfo443.zip -d src/data/```

The .bz2 of the maybridge dataset contains a tab separated file, which includes the maybridge catalogID, the molfile and the jcamp-dx of the corresponding spectrum for each molecule in the dataset.

The .zip of the cheminfo443 dataset contains the molfiles and jcamp-dx  for each of the molecules in the dataset as separate files.
  
  5. Modify src/schemas/nmrshiftdb.sql if you want to change the database name or password:
  
  ```
  CREATE USER 'nmrshiftdb'@'localhost' IDENTIFIED BY 'my_secret';
  CREATE DATABASE mynmrshiftdb1;

  GRANT ALL PRIVILEGES ON mynmrshiftdb1.* TO 'nmrshiftdb'@'localhost';
  FLUSH PRIVILEGES;

  USE mynmrshiftdb1;
  ```
  
  6. Create the database to store your chemical shifts assignments
  
    ```mysql -u root < src/schemas/nmrshiftdb.sql ```

  7. Change to src folfer
  
    ```cd src ```

  8. Modify the database.js information to fit your database connection(Not needed if you did not change anything in step 2)
  9. Start the train process
  
    ``` ./train.sh ```

  10. Congratulations! You have a database that can be used to make new 1H-chemical shifts predictions. 
  11. You may be intersted in creating a condensed table from the database to simplify and speedup the prediction by running    `createPredictionTable.sh`. An example of how to use this table for predictions of 1H-NMR chemical shifts can be found in src/test
  
  ```
  define(["../core/fastNmrShiftDBPred1H"],function (nmrShiftDBPred1H) {
    var molecule = File.load("/test/mol_0.mol");
    var db = File.loadJSON("/h1_database.json");//Our condensed table for off-line predictions
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
  ```
