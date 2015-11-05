
#!/bin/bash
#java -cp ../interpreter/scripting.jar org.cheminfo.scripting.app.App ../test/test.js /usr/local/script/plugins/ ./
PLUGINS_FOLDER=$(pwd)"/../plugins/"
java -Xmx10000m -cp ../interpreter/scripting.jar org.cheminfo.scripting.app.App createPredictionTable.js $PLUGINS_FOLDER ./
