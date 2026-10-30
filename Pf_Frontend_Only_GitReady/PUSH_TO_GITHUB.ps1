$ErrorActionPreference = "Stop"
Write-Host "Yogendra Portfolio - GitHub Push Helper" -ForegroundColor Cyan

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Host "Git is not installed or not available in PATH." -ForegroundColor Red
  Write-Host "Install Git for Windows, reopen PowerShell, then run this script again."
  exit 1
}

$repo = Read-Host "Paste your GitHub repository URL (example: https://github.com/USERNAME/REPO.git)"
if ([string]::IsNullOrWhiteSpace($repo)) {
  Write-Host "Repository URL is required." -ForegroundColor Red
  exit 1
}

if (-not (Test-Path ".git")) {
  git init
}

git add -A
$status = git status --porcelain
if ($status) {
  git commit -m "Import frontend-only portfolio"
} else {
  Write-Host "No uncommitted changes found." -ForegroundColor Yellow
}

git branch -M main
$hasOrigin = git remote 2>$null | Select-String -Pattern '^origin$'
if ($hasOrigin) {
  git remote set-url origin $repo
} else {
  git remote add origin $repo
}

Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
try {
  git push -u origin main
} catch {
  Write-Host "Normal push failed. This usually means the remote repo already contains a README/license or has unrelated history." -ForegroundColor Yellow
  Write-Host "Run: git pull origin main --rebase --allow-unrelated-histories" -ForegroundColor Yellow
  Write-Host "Resolve any conflict, then run: git push -u origin main" -ForegroundColor Yellow
  throw
}

Write-Host "Push completed." -ForegroundColor Green
