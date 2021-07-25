#!/bin/bash

yarn add vuepress@next
echo 'node_modules' >> .gitignore
echo '.temp' >> .gitignore
echo '.cache' >> .gitignore
mkdir docs
echo '# Hello' > docs/README.md
