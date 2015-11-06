#!/bin/bash
#You must be in the folder containing this script!!!!!!
PLUGINS_FOLDER=$(pwd)"/../../plugins/"
java -Xmx10000m -cp ../../interpreter/scripting.jar org.cheminfo.scripting.app.App predictFromMolfile.js $PLUGINS_FOLDER ../
