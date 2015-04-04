#!/bin/bash

set -e

ROOT=`pwd`
SCRIPT=`pwd`/$0
FILENAME=`basename $SCRIPT`
PATHNAME=`dirname $SCRIPT`
CONQUERORROOT=$ROOT/$1
LICODEROOT=$ROOT/$2
BUILD_DIR=$LICODEROOT/build
CURRENT_DIR=`pwd`
LOGDIR="/var/log/conqueror"

export PATH=$PATH:/usr/local/sbin

if [ ! -d $LOGDIR ]; then
  echo "Creating log directory"
  mkdir -p $LOGDIR
fi

if ! pgrep -f mongo; then
  echo "Starting mongodb"
  sudo service mongodb start
fi

if ! pgrep -f rabbitmq; then
  echo "Starting rabbitmq"
  sudo echo
  sudo rabbitmq-server > $BUILD_DIR/rabbit.log &
fi

echo "Starting NuveAPI"
cd $LICODEROOT/nuve/nuveAPI
forever start -a -l $LOGDIR/nuve-forever.log -o $LOGDIR/nuve-output.log -e $LOGDIR/nuve-error.log nuve.js

echo "Waiting..."
sleep 5

echo "Starting ErizoController"
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$LICODEROOT/erizo/build/erizo:$LICODEROOT/erizo:$LICODEROOT/build/libdeps/build/lib
export ERIZO_HOME=$LICODEROOT/erizo/

echo "Starting ErizoAgent"
cd $LICODEROOT/erizo_controller/erizoController
forever start -a -l $LOGDIR/erizoController-forever.log -o $LOGDIR/erizoController-output.log -e $LOGDIR/erizoController-error.log erizoController.js

echo "Starting ErizoAgent"
cd $LICODEROOT/erizo_controller/erizoAgent
forever start -a -l $LOGDIR/erizoAgent-forever.log -o $LOGDIR/erizoAgent-output.log -e $LOGDIR/erizoAgent-error.log erizoAgent.js

echo "[Done] Starting Licode agents"

echo "Starting ConQueror"
cd $CONQUERORROOT
forever start -a -l $LOGDIR/conqueror-forever.log -o $LOGDIR/conqueror-output.log -e $LOGDIR/conqueror-error.log server.js

echo "[DONE] ConQueror started"
