GITHUB PUSH INSTRUCTIONS

1. Extract this ZIP completely.
2. Open the extracted folder.
3. Double-click PUSH_TO_GITHUB.bat.
4. Paste your GitHub repository URL when asked.
5. Complete GitHub/browser authentication if Git asks.

MANUAL POWERSHELL METHOD

Open PowerShell in this exact folder and run:

git init
git add -A
git commit -m "Import frontend-only portfolio"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main

If 'origin already exists':
git remote set-url origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main

If the GitHub repository already contains a README/license and push is rejected:
git pull origin main --rebase --allow-unrelated-histories
git push -u origin main

GitHub no longer accepts account passwords for command-line Git pushes over HTTPS. Use the browser sign-in flow, Git Credential Manager, GitHub CLI, SSH, or a Personal Access Token when prompted.

The portfolio files themselves contain no file larger than GitHub's 100 MB individual-file limit.
