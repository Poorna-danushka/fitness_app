# Remove existing local git history
if (Test-Path ".git") {
    cmd /c rmdir /s /q .git
    Write-Host "Removed local git history."
}

# Initialize fresh Git repository
git init
Write-Host "Initialized fresh Git repository."

# Create a completely empty initial commit
git commit --allow-empty -m "Initial commit"

# Set up branch and remote
git branch -M main
git remote add origin "https://github.com/Poorna-danushka/fitness_app.git"

Write-Host "Force pushing empty commit to GitHub to wipe repository clean..."
git push -u origin main --force
Write-Host "Successfully removed all files from Git and pushed an empty state to GitHub!"
