# Vẽ biểu tượng app (đèn lồng) cho PWA: icons/icon-192.png, icon-512.png, icon-maskable-512.png
Add-Type -AssemblyName System.Drawing
$Root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $Root 'icons'
New-Item -ItemType Directory -Force $out | Out-Null

function Draw-Icon([int]$size, [string]$file, [bool]$maskable) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $s = $size / 512.0
  # nền: maskable phủ kín, thường thì bo góc
  $bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush ((New-Object System.Drawing.Point 0, 0), (New-Object System.Drawing.Point 0, $size), [System.Drawing.Color]::FromArgb(255, 32, 38, 72), [System.Drawing.Color]::FromArgb(255, 11, 14, 28))
  if ($maskable) { $g.FillRectangle($bg, 0, 0, $size, $size) }
  else {
    $r = 110 * $s; $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddArc(0, 0, $r, $r, 180, 90); $path.AddArc($size - $r, 0, $r, $r, 270, 90); $path.AddArc($size - $r, $size - $r, $r, $r, 0, 90); $path.AddArc(0, $size - $r, $r, $r, 90, 90); $path.CloseFigure()
    $g.FillPath($bg, $path)
  }
  $k = if ($maskable) { 0.78 } else { 1.0 }   # vùng an toàn cho icon maskable
  $cx = $size / 2.0; $cy = $size / 2.0 + 8 * $s
  $u = $s * $k
  # quầng sáng
  $glow = New-Object System.Drawing.Drawing2D.GraphicsPath
  $gw = 330 * $u; $glow.AddEllipse([float]($cx - $gw / 2), [float]($cy - $gw / 2), [float]$gw, [float]$gw)
  $pg = New-Object System.Drawing.Drawing2D.PathGradientBrush $glow
  $pg.CenterColor = [System.Drawing.Color]::FromArgb(150, 255, 170, 70); $pg.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 255, 170, 70))
  $g.FillPath($pg, $glow)
  $gold = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 245, 190, 80))
  $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 245, 190, 80)), ([float](8 * $u))
  # dây treo, nắp trên/dưới
  $g.DrawLine($pen, [float]$cx, [float]($cy - 200 * $u), [float]$cx, [float]($cy - 150 * $u))
  $g.FillRectangle($gold, [float]($cx - 55 * $u), [float]($cy - 155 * $u), [float](110 * $u), [float](26 * $u))
  $g.FillRectangle($gold, [float]($cx - 55 * $u), [float]($cy + 120 * $u), [float](110 * $u), [float](26 * $u))
  # thân đèn
  $bw = 250 * $u; $bh = 260 * $u
  $rect = New-Object System.Drawing.RectangleF ([float]($cx - $bw / 2)), ([float]($cy - 135 * $u)), ([float]$bw), ([float]$bh)
  $body = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, ([System.Drawing.Color]::FromArgb(255, 255, 120, 60)), ([System.Drawing.Color]::FromArgb(255, 200, 30, 40)), ([float]0)
  $blend = New-Object System.Drawing.Drawing2D.Blend 3; $blend.Factors = [float[]]@(1.0, 0.0, 1.0); $blend.Positions = [float[]]@(0.0, 0.5, 1.0); $body.Blend = $blend
  $g.FillEllipse($body, $rect)
  # gân đèn
  $rib = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(110, 120, 10, 20)), ([float](5 * $u))
  foreach ($w in @(0.33, 0.66)) { $g.DrawEllipse($rib, [float]($cx - $bw * $w / 2), $rect.Y, [float]($bw * $w), $rect.Height) }
  $g.DrawLine($rib, [float]$cx, [float]($cy - 135 * $u), [float]$cx, [float]($cy + 125 * $u))
  # tua rua
  $g.DrawLine($pen, [float]$cx, [float]($cy + 146 * $u), [float]$cx, [float]($cy + 200 * $u))
  $g.FillEllipse($gold, [float]($cx - 12 * $u), [float]($cy + 196 * $u), [float](24 * $u), [float](24 * $u))
  $bmp.Save((Join-Path $out $file), [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
}
Draw-Icon 192 'icon-192.png' $false
Draw-Icon 512 'icon-512.png' $false
Draw-Icon 512 'icon-maskable-512.png' $true
Draw-Icon 180 'apple-touch-icon.png' $true
Get-ChildItem $out | Select-Object Name, Length
