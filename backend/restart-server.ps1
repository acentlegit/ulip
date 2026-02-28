# PowerShell script to restart the backend server
Write-Host "Stopping existing Node processes on port 5000..."

$processes = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

foreach ($pid in $processes) {
    try {
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Write-Host "Stopped process $pid"
    } catch {
        Write-Host "Could not stop process $pid"
    }
}

Start-Sleep -Seconds 2

Write-Host "Starting backend server..."
Set-Location $PSScriptRoot
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
