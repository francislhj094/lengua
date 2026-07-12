Add-Type -AssemblyName System.Drawing;
$image = [System.Drawing.Image]::FromFile('d:\Spanish\lengua\assets\logo.png');
$image.Save('d:\Spanish\lengua\assets\icon.png', [System.Drawing.Imaging.ImageFormat]::Png);
$image.Save('d:\Spanish\lengua\assets\favicon.png', [System.Drawing.Imaging.ImageFormat]::Png);
$image.Dispose();
