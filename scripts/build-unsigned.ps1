param (
	[string]$browser
)

$currPwd = Get-Location

if (!(Test-Path -path "../dist"))
{
	$null = mkdir "../dist"
}

if (Test-Path -path "../dist/resting.xpi")
{
	$null = Remove-Item "../dist/resting.xpi"
}

if (Test-Path -path "../dist/resting-unsigned.xpi")
{
	$null = Remove-Item "../dist/resting-unsigned.xpi"
}

cd ..
#build-vuecomp
& "$PSScriptRoot\build-vue-comp.ps1"
echo "vue components built"

if (!(Test-Path -path "dist/tmp"))
{
	$null = mkdir "dist/tmp"
}

if ($browser -eq "chrome")
{
	cp addon/chrome/* dist/tmp
	echo "copy chrome manifest"
} else
{
	cp addon/firefox/* dist/tmp
	echo "copy firefox manifest"
}

cd src
try
{
	Copy-Item "./" -destination "../dist/tmp" -recurse -erroraction SilentlyContinue
	echo "created tmp folder"
	echo "copy src in tmp folder"
} catch
{
	echo "error copying src folder"
	exit -1
}

try
{
	(Get-Content "../dist/tmp/manifest.json" -erroraction stop) -replace "^}", ',"applications": {"gecko": {"id": "resting@owlcode.eu"}}}' | 
		Set-Content "../dist/tmp/manifest.json" -erroraction stop
	echo "editing manifest.json"
} catch
{
	echo "error editing manifest"
	exit -1
}

cd "../dist/tmp"
$getPwd = Get-Location
echo "move to folder $getPwd"

Compress-Archive -path * -destinationpath "../resting-unsigned.xpi"

cd "../.."
try
{
	Compress-Archive -path "./README.md","./LICENSE" -update -destinationpath "./dist/resting-unsigned.xpi" -erroraction stop
	echo "creating xpi file"
} catch
{
	echo "error creating xpi file"
}

try
{
	Remove-Item ".\dist\tmp\" -recurse -erroraction stop
	echo "delete tmp folder"
} catch
{
	echo "error deleting tmp folder"
}

cd $currPwd

echo "Done"
