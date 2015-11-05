# autolearning

“Ask Ernö”: A self-learning tool for assignment and prediction of Nuclear Magnetic Resonance spectra

Web page: [http://visualizer.epfl.ch/tiny/xUpdmNQwUDkB7Ef4W5Kd]

##Installation

###Pre-requisites
  1. Install mysql on your host.
  2. java 1.7 or latter. 
  
### Steps
  3. Change to the project folder 
    ``` cd autolearning  ```
  4. Download [the maybridge.json dataset] (http://script.epfl.ch/script/HD/Load/1ZGgqjWVbr?filename=test%40patiny.com%2FResearch%2FNMR%2FAutoAssign%2Fdata%2Fmaybridge%2Fjcamp.bz2) and [cheminfo 443 dataset] (http://script.epfl.ch/script/HD/Load/f40zy9WWyj?filename=test%40patiny.com%2FResearch%2FNMR%2FAutoAssign%2Fdata%2FlearningDataSet.zip)
  5. Uncompress maybridge dataset in src/data/maybrige and cheminfo in src/data/cheminfo443
  6. Split the jcamp.txt to avoid memory problems
  
    ```cd src/data/maybridge ; ./split.sh jcamp.txt```

  7. Modify src/schemas/nmrshiftdb.sql if you want to change the database name or password:
  
  ```
  CREATE USER 'nmrshiftdb'@'localhost' IDENTIFIED BY 'my_secret';
  CREATE DATABASE mynmrshiftdb1;

  GRANT ALL PRIVILEGES ON mynmrshiftdb1.* TO 'nmrshiftdb'@'localhost';
  FLUSH PRIVILEGES;

  USE mynmrshiftdb1;
  ```
  
  8. Create your database to store your chemical shifts assignments
  
    ```mysql -u root < src/schemas/nmrshiftdb.sql ```

  9. Change to src folfer
  
    ```cd src ```

  10. Modify the database.js information to fit your database connection(Not needed if you did not change anything in step 2)
  11. Start the train process
  
    ``` ./train.sh ```

  12. Congratulations! You have a database that can be used to make new 1H-chemical shifts predictions. You may be intersted in creating a condensed table from the database to simplyfy and speedup the prediction by running createPredictionTable.sh. An example of how to use this table for predictions can be found here: [Ask Ernö] (http://visualizer.epfl.ch/tiny/Tkc7OhSOLeCujPPoPiXb)
