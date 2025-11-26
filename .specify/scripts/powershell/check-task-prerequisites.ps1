. "$PSScriptRoot/common.ps1"
$tools = @(
  @{ Name = "node"; Command = "node -v" },
  @{ Name = "pnpm"; Command = "pnpm -v" },
  @{ Name = "wrangler"; Command = "wrangler -V" }
)

$missing = @()
foreach ($tool in $tools) {
  try {
    Write-Info "Checking $($tool.Name)..."
    Invoke-Expression $tool.Command | Out-Null
  } catch {
    $missing += $tool.Name
  }
}

if ($missing.Count -gt 0) {
  Write-Host "Missing tools: $($missing -join ', ')" -ForegroundColor Red
  Write-Host "Install them before running /speckit.* workflows." -ForegroundColor Yellow
  exit 1
}

Write-Host "All prerequisites found." -ForegroundColor Green
