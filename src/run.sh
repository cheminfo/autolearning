#!/bin/bash
#java -cp ../interpreter/scripting.jar org.cheminfo.scripting.app.App ../test/test.js /usr/local/script/plugins/ ./
PLUGINS_FOLDER=$(pwd)"/../plugins/"
java -cp ../interpreter/scripting.jar org.cheminfo.scripting.app.App train.js $PLUGINS_FOLDER ./