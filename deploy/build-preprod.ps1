# Build website + admin for Prodexo preprod (/fi2t/)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

Write-Host "=== FI2T preprod build (/fi2t/) ===" -ForegroundColor Cyan

# Website
Write-Host "`n[website]" -ForegroundColor Yellow
Push-Location (Join-Path $root "website")
Copy-Item (Join-Path $root "deploy\env.website.preprod.example") ".env.production" -Force
$env:VITE_BASE = "/fi2t/"
npm run build
if ($LASTEXITCODE -ne 0) { Pop-Location; exit 1 }
Pop-Location

# Admin
Write-Host "`n[frontend]" -ForegroundColor Yellow
Push-Location (Join-Path $root "frontend")
Copy-Item (Join-Path $root "deploy\env.frontend.preprod.example") ".env.production" -Force
$env:VITE_BASE = "/fi2t/admin/"
npm run build
if ($LASTEXITCODE -ne 0) { Pop-Location; exit 1 }
Pop-Location

Write-Host "`nDone. Upload via SFTP:" -ForegroundColor Green
Write-Host "  backend/  frontend/ (+ dist)  website/ (+ dist)"
Write-Host "  Then notify Nidhal for composer + migrate."
Write-Host "  See deploy/PREPROD-PRODEXO.md"
