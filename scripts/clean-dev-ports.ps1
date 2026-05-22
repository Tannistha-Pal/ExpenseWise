$ports = @(5173, 5174, 8000)
$currentPid = $PID
$pids = @()

foreach ($port in $ports) {
  $matches = netstat -ano | Select-String "LISTENING" | Select-String ":$port\s"
  foreach ($match in $matches) {
    $parts = ($match.Line -split "\s+") | Where-Object { $_ }
    if ($parts.Length -gt 0) {
      $processId = [int]$parts[$parts.Length - 1]
      if ($processId -ne 0 -and $processId -ne $currentPid) {
        $pids += $processId
      }
    }
  }
}

$pids | Sort-Object -Unique | ForEach-Object {
  try {
    Stop-Process -Id $_ -Force -ErrorAction Stop
    Write-Host "Stopped process $_ using an ExpenseWise dev port."
  } catch {
    Write-Host "Could not stop process ${_}: $($_.Exception.Message)"
  }
}
