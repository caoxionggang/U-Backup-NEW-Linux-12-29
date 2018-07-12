#!/usr/bin/expect

set timeout 1800
set localName [lindex $argv 0]

spawn mv -f ./transition/host/host_file $localName

expect eof
exit