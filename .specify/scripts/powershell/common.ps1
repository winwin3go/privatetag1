param()

function Get-RepoRoot {
  $script:RepoRoot = (Resolve-Path -Path "$PSScriptRoot\..\..").Path
  return $script:RepoRoot
}

function Write-Info {
  param([string]$Message)
  Write-Host "[SpecKit] $Message" -ForegroundColor Cyan
}

function Ensure-Directory {
  param([string]$Path)
  if (-not (Test-Path -LiteralPath $Path)) {
    New-Item -ItemType Directory -Path $Path | Out-Null
  }
}
