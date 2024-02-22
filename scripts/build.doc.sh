# !/bin/bash

echo "$CF_PAGES_BRANCH"

if [ "$CF_PAGES_BRANCH" = "master" ]; then
  bun run build:docs:v4
elif [ "$CF_PAGES_BRANCH" = "v5" ]; then
  bun run build:docs:v5
elif [ "$CF_PAGES_BRANCH" = "arco" ]; then
  bun run build:docs:arco
else
  echo "nothing to build"
fi
