rm -rf .git
git init
git checkout -b main
git add .
git commit -m 'tardis'
git remote add origin git@github.com-holychikenz:holychikenz/LootFilterData.git
git push -u --force origin main
