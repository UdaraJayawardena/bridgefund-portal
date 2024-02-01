#!/usr/bin/env bash

echo "Running pre-commit hook"
./scripts/run-tests.bash

# $? stores exit value of the last command
if [ $? -ne 0 ]; then
 git reset
 echo "There are 3 possible options to fix when pre-commit hook is triggered"
 echo "1. Tests must pass before commit!"
 echo "2. Can not have High & Critical vulnerabilities before commit!"
 echo "3. Branch names in this project must adhere to this contract: (master, development, feature, stage, release, hotfix, bugfix). Your commit will be rejected. You should rename your branch to a valid name and try again."
 exit 1
fi

echo "Branch checking is done : valid"