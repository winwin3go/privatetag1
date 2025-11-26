. "$PSScriptRoot/common.ps1"

$repoRoot = Get-RepoRoot
$featureId = Read-Host "Feature ID (e.g., 003)"
if (-not $featureId) { Write-Error "Feature ID required."; exit 1 }
$slug = Read-Host "Feature slug (kebab-case)"
if (-not $slug) { Write-Error "Slug required."; exit 1 }

$folder = Join-Path $repoRoot "specs/$($featureId)-$slug"
Ensure-Directory $folder
Ensure-Directory (Join-Path $folder "checklists")

$specPath = Join-Path $folder "spec.md"
$planPath = Join-Path $folder "plan.md"
$tasksPath = Join-Path $folder "tasks.md"
$checklistPath = Join-Path $folder "checklists/requirements.md"

if (-not (Test-Path $specPath)) {
@"
# $featureId $slug Spec

## Summary

## Motivation

## Requirements

## Acceptance Criteria

## References

"@ | Out-File -FilePath $specPath -Encoding UTF8
}

foreach ($file in @($planPath, $tasksPath, $checklistPath)) {
  if (-not (Test-Path $file)) {
    New-Item -ItemType File -Path $file | Out-Null
  }
}

Write-Info "Created/updated $folder"
Write-Host "Next steps:"
Write-Host "- Use /speckit.specify to fill $specPath"
Write-Host "- Branch suggestion: feature/$($featureId)-$slug"
