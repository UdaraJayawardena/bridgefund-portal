# #!/usr/bin/env bash

# # if any command inside script returns error, exit and return that error 
# #set -e

# # magic line to ensure that we're always inside the root of our application,
# # no matter from which directory we'll run script
# # thanks to it we can just enter `./scripts/run-tests.bash`
# #cd "${0%/*}/.."

# echo "Running tests"
# echo "............................" 
# npm install --production
# OUT=$(npm audit --production --json --registry https://registry.npmjs.org/)

# HIGH=$(echo "$OUT" | grep high | tail -1 | awk '{print $2}' | tr -d ,)

# CRITICAL=$(echo "$OUT" | grep \"critical\": | tail -1 | awk '{print $2}')

# if [[ 0 -lt $HIGH ]]; then
# 	printf "\t\033[41mAlert! High vulnerable : $HIGH\033[0m"
# 	echo ""
# 	exit 1
# else
#   printf "\t\033[32mNo High vulnerable\033[0m"
# 	echo ""
# fi

# if [[ 0 -lt $CRITICAL ]]; then
#   printf "\t\033[41mAlert! Critical vulnerable : $CRITICAL\033[0m"
# 	echo ""
# 	exit 1
# else
#   printf "\t\033[32mNo Critical vulnerable\033[0m"
#   echo ""
# fi

# #Git hooks to enforce branch naming policy

# echo "Git hooks to enforce branch naming policy checker is running"

# local_branch="$(git rev-parse --abbrev-ref HEAD)"
# main_branches_regex="^(development|stage|master)$"
# valid_branch_regex="^(bugfix|release|hotfix|feature)\/[A-Za-z0-9._-]+$"

# condition=false
# if [[ $local_branch =~ $main_branches_regex ]]; then 
#     printf "\t\033[32mBranch checking is done : valid\033[0m"
# 	echo ""
#     condition=true
# fi

# if [[ $condition == false ]]; then
#     if [[ ! $local_branch =~ $valid_branch_regex ]]; then 
# 		printf "\t\033[41mBranch names in this project must adhere to this contract: (master, development, feature, stage, release, hotfix, bugfix) and use only these latters (A-Za-z0-9._-) create branch name,or else Your commit will be rejected.try again\033[0m"
# 		echo ""
# 		exit 1 
#     fi 
# fi

# #ES-lint validation

# STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep ".jsx\{0,1\}$")
# ESLINT="$(git rev-parse --show-toplevel)/node_modules/.bin/eslint"

# if [[ "$STAGED_FILES" = "" ]]; then
#   exit 0
# fi

# PASS=true

# printf "\nValidating Javascript:\n"

# # Check for eslint
# if [[ ! -x "$ESLINT" ]]; then
#   printf "\t\033[41mPlease install ESlint\033[0m (npm i --save-dev eslint)"
#   exit 1
# fi

# for FILE in $STAGED_FILES
# do
#   "$ESLINT" "$FILE"

#   if [[ "$?" == 0 ]]; then
#     printf "\t\033[32mESLint Passed: $FILE\033[0m"
#   else
#     printf "\t\033[41mESLint Failed: $FILE\033[0m"
#     PASS=false
#   fi
# done

# printf "\nJavascript validation completed!\n"

# if ! $PASS; then
#   printf "\033[41mCOMMIT FAILED:\033[0m Your commit contains files that should pass ESLint but do not. Please fix the ESLint errors and try again.\n"
#   exit 1
# else
#   printf "\033[42mCOMMIT SUCCEEDED\033[0m\n"
# fi

