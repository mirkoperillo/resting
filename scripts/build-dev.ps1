param(
	[string]$browser
)

$currPwd = Get-Location

Set-Location $currPwd
Write-Output "Moved to scripts dir"

if ($browser -eq "chrome")
{
	Write-Output "Build chrome extension"
} else
{
	Write-Output "Build firefox extension"
}


if (Test-Path -path "../build")
{
	$null = Remove-Item "../build" -recurse -erroraction stop
	Write-Output "Removed build dir"
}

mkdir ../build
Write-Output "Created build dir"

Copy-Item "../src/*" -destination "../build" -recurse -erroraction stop
Write-Output "Copied Sources"

Set-Location ..
#build-vuecomp
& "$PSScriptRoot\build-vue-comp.ps1"
Write-Output "Built vue components"

Set-Location scripts
if ($browser -eq "chrome")
{
	Copy-Item "../addon/chrome/*" -destination "../build" -recurse -erroraction stop
} else
{
	Copy-Item "../addon/firefox/*" -destination "../build" -recurse -erroraction stop
}
Write-Output "Copied webextension files"

Write-Output "Done!"
