
#!/bin/bash
#java -cp ../interpreter/scripting.jar org.cheminfo.scripting.app.App ../test/test.js /usr/local/script/plugins/ ./
#java -Xmx10000m -cp ../interpreter/scripting.jar org.cheminfo.scripting.app.App compileSDF.js $PLUGINS_FOLDER ./
PLUGINS_FOLDER=$(pwd)"/../plugins/"
java -Xmx10000m -cp ../interpreter/scripting.jar org.cheminfo.scripting.app.App test.js $PLUGINS_FOLDER ./
