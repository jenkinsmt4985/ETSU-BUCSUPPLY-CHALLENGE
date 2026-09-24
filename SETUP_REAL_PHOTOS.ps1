$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$photoDir = Join-Path $root "assets\photos"
New-Item -ItemType Directory -Force -Path $photoDir | Out-Null

Write-Host ""
Write-Host "BucSupply V7.1 - Installing real supply-chain photographs..." -ForegroundColor Cyan
Write-Host "Sources are verified CC0/public-domain photographs from Wikimedia Commons."

$dest = Join-Path $photoDir "port.jpg"
$primary = "https://commons.wikimedia.org/wiki/Special:Redirect/file/Shipping_containers_in_a_port_%28Unsplash%29.jpg?width=1400"
$fallback = "https://upload.wikimedia.org/wikipedia/commons/c/c5/Shipping_containers_in_a_port_%28Unsplash%29.jpg"
Write-Host "Downloading port.jpg..."
try {
    Invoke-WebRequest -Uri $primary -OutFile $dest -MaximumRedirection 8 -UseBasicParsing
} catch {
    Write-Host "  Resized image failed; trying original..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $fallback -OutFile $dest -MaximumRedirection 8 -UseBasicParsing
}
if ((Get-Item $dest).Length -lt 10000) { throw "Downloaded file is unexpectedly small: $dest" }

$dest = Join-Path $photoDir "warehouse.jpg"
$primary = "https://commons.wikimedia.org/wiki/Special:Redirect/file/Warehouse_goods.jpg?width=1400"
$fallback = "https://upload.wikimedia.org/wikipedia/commons/c/c7/Warehouse_goods.jpg"
Write-Host "Downloading warehouse.jpg..."
try {
    Invoke-WebRequest -Uri $primary -OutFile $dest -MaximumRedirection 8 -UseBasicParsing
} catch {
    Write-Host "  Resized image failed; trying original..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $fallback -OutFile $dest -MaximumRedirection 8 -UseBasicParsing
}
if ((Get-Item $dest).Length -lt 10000) { throw "Downloaded file is unexpectedly small: $dest" }

$dest = Join-Path $photoDir "warehouse_worker.jpg"
$primary = "https://commons.wikimedia.org/wiki/Special:Redirect/file/Someone_in_the_goods_warehouse.jpg?width=1200"
$fallback = "https://upload.wikimedia.org/wikipedia/commons/4/4e/Someone_in_the_goods_warehouse.jpg"
Write-Host "Downloading warehouse_worker.jpg..."
try {
    Invoke-WebRequest -Uri $primary -OutFile $dest -MaximumRedirection 8 -UseBasicParsing
} catch {
    Write-Host "  Resized image failed; trying original..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $fallback -OutFile $dest -MaximumRedirection 8 -UseBasicParsing
}
if ((Get-Item $dest).Length -lt 10000) { throw "Downloaded file is unexpectedly small: $dest" }

$dest = Join-Path $photoDir "loading_dock.jpg"
$primary = "https://commons.wikimedia.org/wiki/Special:Redirect/file/Warehouse_in_New_Jersey_where_trucks_deliver_granite_slabs.jpg?width=1200"
$fallback = "https://upload.wikimedia.org/wikipedia/commons/c/c7/Warehouse_in_New_Jersey_where_trucks_deliver_granite_slabs.jpg"
Write-Host "Downloading loading_dock.jpg..."
try {
    Invoke-WebRequest -Uri $primary -OutFile $dest -MaximumRedirection 8 -UseBasicParsing
} catch {
    Write-Host "  Resized image failed; trying original..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $fallback -OutFile $dest -MaximumRedirection 8 -UseBasicParsing
}
if ((Get-Item $dest).Length -lt 10000) { throw "Downloaded file is unexpectedly small: $dest" }

$dest = Join-Path $photoDir "factory.png"
$primary = "https://commons.wikimedia.org/wiki/Special:Redirect/file/Assembly_line_at_Orbbec%27s_Intelligent_Manufacturing_Base.png?width=1400"
$fallback = "https://upload.wikimedia.org/wikipedia/commons/9/9c/Assembly_line_at_Orbbec%27s_Intelligent_Manufacturing_Base.png"
Write-Host "Downloading factory.png..."
try {
    Invoke-WebRequest -Uri $primary -OutFile $dest -MaximumRedirection 8 -UseBasicParsing
} catch {
    Write-Host "  Resized image failed; trying original..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $fallback -OutFile $dest -MaximumRedirection 8 -UseBasicParsing
}
if ((Get-Item $dest).Length -lt 10000) { throw "Downloaded file is unexpectedly small: $dest" }

$dest = Join-Path $photoDir "truck.jpg"
$primary = "https://commons.wikimedia.org/wiki/Special:Redirect/file/Delivery_truck_at_sunrise_%28Unsplash%29.jpg?width=1400"
$fallback = "https://upload.wikimedia.org/wikipedia/commons/e/e6/Delivery_truck_at_sunrise_%28Unsplash%29.jpg"
Write-Host "Downloading truck.jpg..."
try {
    Invoke-WebRequest -Uri $primary -OutFile $dest -MaximumRedirection 8 -UseBasicParsing
} catch {
    Write-Host "  Resized image failed; trying original..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $fallback -OutFile $dest -MaximumRedirection 8 -UseBasicParsing
}
if ((Get-Item $dest).Length -lt 10000) { throw "Downloaded file is unexpectedly small: $dest" }

$dest = Join-Path $photoDir "hospital.jpg"
$primary = "https://commons.wikimedia.org/wiki/Special:Redirect/file/Santa_Cabrini_Hospital_Exterior.jpg?width=1400"
$fallback = "https://upload.wikimedia.org/wikipedia/commons/7/75/Santa_Cabrini_Hospital_Exterior.jpg"
Write-Host "Downloading hospital.jpg..."
try {
    Invoke-WebRequest -Uri $primary -OutFile $dest -MaximumRedirection 8 -UseBasicParsing
} catch {
    Write-Host "  Resized image failed; trying original..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $fallback -OutFile $dest -MaximumRedirection 8 -UseBasicParsing
}
if ((Get-Item $dest).Length -lt 10000) { throw "Downloaded file is unexpectedly small: $dest" }

$dest = Join-Path $photoDir "medical_equipment.jpg"
$primary = "https://commons.wikimedia.org/wiki/Special:Redirect/file/Image_of_hospital_equipment.jpg?width=1000"
$fallback = "https://upload.wikimedia.org/wikipedia/commons/4/44/Image_of_hospital_equipment.jpg"
Write-Host "Downloading medical_equipment.jpg..."
try {
    Invoke-WebRequest -Uri $primary -OutFile $dest -MaximumRedirection 8 -UseBasicParsing
} catch {
    Write-Host "  Resized image failed; trying original..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $fallback -OutFile $dest -MaximumRedirection 8 -UseBasicParsing
}
if ((Get-Item $dest).Length -lt 10000) { throw "Downloaded file is unexpectedly small: $dest" }

Write-Host ""
Write-Host "SUCCESS: All real photos are now stored locally in assets\photos." -ForegroundColor Green
Write-Host "You can now upload the folder to GitHub Pages."
Write-Host ""
Get-ChildItem $photoDir -File | Select-Object Name, @{Name="SizeKB";Expression={[math]::Round($_.Length/1KB,0)}} | Format-Table -AutoSize