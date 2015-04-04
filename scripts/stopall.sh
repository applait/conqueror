#!/bin/bash

forever stopall
pkill -KILL node

service mongodb stop
rabbitmqctl stop

echo "[DONE]"
