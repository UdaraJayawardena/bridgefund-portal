echo "Running vulnerability check"
echo "............................" 
npm install --production
OUT=$(npm audit --production --json)

HIGH=$(echo "$OUT" | grep high | tail -1 | awk '{print $2}' | tr -d ,)

CRITICAL=$(echo "$OUT" | grep \"critical\": | tail -1 | awk '{print $2}')

if [[ 0 -lt $HIGH ]]; then
  printf "\t\033[41mAlert! High vulnerable : $HIGH\033[0m"
  echo ""
  exit 1
else
  printf "\t\033[32mNo High vulnerable\033[0m"
  echo ""
fi

if [[ 0 -lt $CRITICAL ]]; then
  printf "\t\033[41mAlert! Critical vulnerable : $CRITICAL\033[0m"
  echo ""
  exit 1
else
  printf "\t\033[32mNo Critical vulnerable\033[0m"
  echo ""
fi