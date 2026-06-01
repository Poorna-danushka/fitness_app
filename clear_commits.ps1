# Remove existing .git repository to clear all history
if (Test-Path ".git") {
    cmd /c rmdir /s /q .git
    Write-Host "Removed local git history."
}

# Clean up the dummy CHANGELOG file we created earlier
if (Test-Path "CHANGELOG.md") {
    Remove-Item "CHANGELOG.md"
}

if (Test-Path ".commit_history_dummy") {
    Remove-Item ".commit_history_dummy"
}

git init
Write-Host "Initialized fresh Git repository."

# Add existing project files and make a single clean commit
git add .
git commit -m "Initial commit"

# Set up branch and remote
git branch -M main
git remote add origin "https://github.com/Poorna-danushka/fitness_app.git"

Write-Host "Force pushing a single fresh commit to GitHub to overwrite the history..."
git push -u origin main --force
Write-Host "Successfully removed the commit history and pushed the single fresh commit!"
