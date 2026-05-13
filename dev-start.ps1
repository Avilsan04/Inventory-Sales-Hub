Write-Host "Starting Docker..." -ForegroundColor Cyan
docker compose up -d
if ($LASTEXITCODE -ne 0) { Write-Host "Docker failed. Is Docker Desktop running?" -ForegroundColor Red; exit 1 }

Write-Host "Waiting for PostgreSQL..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

Write-Host "Starting backend..." -ForegroundColor Cyan
$backendCmd = @"
`$env:DB_URL = 'jdbc:postgresql://localhost:5432/inventory_db'
`$env:JWT_SECRET = 'inventory-sales-hub-secret-key-32chars!!'
cd '$PSScriptRoot\backend-service'
.\gradlew.bat bootRun
"@
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd

Write-Host "Starting frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend-web'; npm run dev"

Write-Host "Done. Backend: http://localhost:8080 | Frontend: http://localhost:5173" -ForegroundColor Green
