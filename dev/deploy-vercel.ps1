param([switch]$BuildOnly, [switch]$ForgetToken, [string]$Project = 'mot-kiep-nguoi')
# Đóng gói game thành trang web tĩnh (dist/) rồi đưa lên Vercel qua REST API.
# Không cần Node hay Vercel CLI; chỉ cần một Vercel token (https://vercel.com/account/settings/tokens).
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [Text.Encoding]::UTF8
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$Root = Split-Path -Parent $PSScriptRoot
$Dist = Join-Path $Root 'dist'
$utf8 = New-Object System.Text.UTF8Encoding($false)

# ── 1. Đóng gói dist/ ───────────────────────────────────────────────
# index.html trong dự án là phần thân trang (Artifact tự bọc khung HTML);
# ở đây ta tự bọc thành một tài liệu HTML đầy đủ.
if (Test-Path $Dist) { Remove-Item -Recurse -Force $Dist }
New-Item -ItemType Directory -Force (Join-Path $Dist 'js') | Out-Null

$src = [IO.File]::ReadAllText((Join-Path $Root 'index.html'), $utf8)
$cut = $src.IndexOf('<div id="app"')
if ($cut -lt 0) { throw 'Không tìm thấy <div id="app"> trong index.html' }
$headPart = $src.Substring(0, $cut).Trim()
$bodyPart = $src.Substring($cut).Trim()

$desc = 'Trò chơi mô phỏng cuộc đời người Việt bằng 3D: mỗi tình huống đời thường được diễn lại trong những khung cảnh thu nhỏ, từ lúc chào đời đến khi về già.'
$icon = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='88'>%F0%9F%8F%AE</text></svg>"

$html = @"
<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="$desc">
<meta name="theme-color" content="#0e1120">
<meta property="og:type" content="website">
<meta property="og:title" content="Một Kiếp Người">
<meta property="og:description" content="$desc">
<link rel="icon" href="$icon">
<style>:root{color-scheme:dark;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>
$headPart
</head>
<body>
$bodyPart
</body>
</html>
"@
[IO.File]::WriteAllText((Join-Path $Dist 'index.html'), $html, $utf8)
Copy-Item (Join-Path $Root 'styles.css') $Dist
Copy-Item (Join-Path $Root 'js\*.js') (Join-Path $Dist 'js')

$all = Get-ChildItem -Path $Dist -Recurse -File
$kb = [math]::Round((($all | Measure-Object Length -Sum).Sum) / 1KB)
Write-Host "Đã đóng gói $($all.Count) file ($kb KB) vào dist/"
if ($BuildOnly) { return }

# ── 2. Lấy token (nhập tay hoặc dùng bản đã lưu, mã hoá theo tài khoản Windows) ──
$tokenFile = Join-Path $env:APPDATA 'mot-kiep-nguoi\vercel-token.dat'
if ($ForgetToken -and (Test-Path $tokenFile)) { Remove-Item -Force $tokenFile }
$secure = $null
if (Test-Path $tokenFile) {
  try { $secure = Get-Content $tokenFile | ConvertTo-SecureString } catch { $secure = $null }
}
if (-not $secure) {
  Write-Host ''
  Write-Host 'Cần một Vercel token. Tạo tại: https://vercel.com/account/settings/tokens'
  $secure = Read-Host -AsSecureString 'Dán token vào đây rồi bấm Enter (ký tự sẽ không hiện ra)'
  $ans = Read-Host 'Lưu token (đã mã hoá, chỉ tài khoản Windows này mở được) để lần sau cập nhật khỏi nhập lại? (c/k)'
  if ($ans -match '^[cCyY]') {
    New-Item -ItemType Directory -Force (Split-Path $tokenFile) | Out-Null
    $secure | ConvertFrom-SecureString | Set-Content $tokenFile
  }
}
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
$token = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
$auth = @{ Authorization = "Bearer $token" }
$api = 'https://api.vercel.com'

function Show-ApiError($err) {
  $msg = $err.Exception.Message
  if ($err.ErrorDetails -and $err.ErrorDetails.Message) { $msg = $err.ErrorDetails.Message }
  Write-Host "Lỗi từ Vercel: $msg" -ForegroundColor Red
}

try {
  # ── 3. Tải từng file lên (theo mã SHA1) ──────────────────────────
  $files = @()
  foreach ($f in $all) {
    $rel = $f.FullName.Substring($Dist.Length + 1).Replace('\', '/')
    $sha = (Get-FileHash -Algorithm SHA1 -LiteralPath $f.FullName).Hash.ToLower()
    Invoke-RestMethod -Method Post -Uri "$api/v2/files" -Headers ($auth + @{ 'x-vercel-digest' = $sha }) -ContentType 'application/octet-stream' -InFile $f.FullName | Out-Null
    $files += @{ file = $rel; sha = $sha; size = $f.Length }
    Write-Host "  đã tải lên $rel"
  }

  # ── 4. Tạo bản triển khai production ───────────────────────────────
  $body = @{
    name = $Project
    target = 'production'
    files = $files
    projectSettings = @{ framework = $null; buildCommand = $null; installCommand = $null; outputDirectory = $null; devCommand = $null }
  } | ConvertTo-Json -Depth 6 -Compress
  $dep = Invoke-RestMethod -Method Post -Uri "$api/v13/deployments?skipAutoDetectionConfirmation=1" -Headers $auth -ContentType 'application/json; charset=utf-8' -Body ([Text.Encoding]::UTF8.GetBytes($body))
  Write-Host "Đang triển khai ($($dep.id))..."

  do {
    Start-Sleep -Seconds 3
    $d = Invoke-RestMethod -Uri "$api/v13/deployments/$($dep.id)" -Headers $auth
    Write-Host "  trạng thái: $($d.readyState)"
  } while ($d.readyState -in @('QUEUED', 'INITIALIZING', 'BUILDING'))

  if ($d.readyState -ne 'READY') { throw "Triển khai dừng ở trạng thái $($d.readyState)" }
  $aliases = @($d.alias) | Where-Object { $_ }
  $url = if ($aliases.Count -gt 0) { "https://$($aliases[0])" } else { "https://$($d.url)" }
  Set-Content -Path (Join-Path $PSScriptRoot 'last-deploy.txt') -Value "$url`n$($dep.id)" -Encoding UTF8
  Write-Host ''
  Write-Host "XONG! Game đã lên mạng tại: $url" -ForegroundColor Green
} catch {
  Show-ApiError $_
  exit 1
} finally {
  $token = $null; $auth = $null
}
