Add-Type -AssemblyName System.Web
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add('http://127.0.0.1:8123/')
$listener.Start()
$root = 'C:\Users\yalin.jing\Desktop\需求交互'
while ($listener.IsListening) {
  try {
    $context = $listener.GetContext()
    $requestPath = $context.Request.Url.AbsolutePath.TrimStart('/')
    if ([string]::IsNullOrWhiteSpace($requestPath)) { $requestPath = 'preview.html' }
    $requestPath = $requestPath -replace '/', '\\'
    $fullPath = Join-Path $root $requestPath
    if (!(Test-Path $fullPath) -or (Get-Item $fullPath).PSIsContainer) {
      $context.Response.StatusCode = 404
      $bytes = [System.Text.Encoding]::UTF8.GetBytes('Not Found')
      $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
      $context.Response.Close()
      continue
    }
    $ext = [System.IO.Path]::GetExtension($fullPath).ToLowerInvariant()
    $contentType = switch ($ext) {
      '.html' { 'text/html; charset=utf-8' }
      '.js' { 'application/javascript; charset=utf-8' }
      '.css' { 'text/css; charset=utf-8' }
      '.json' { 'application/json; charset=utf-8' }
      '.png' { 'image/png' }
      '.jpg' { 'image/jpeg' }
      '.jpeg' { 'image/jpeg' }
      default { 'application/octet-stream' }
    }
    $bytes = [System.IO.File]::ReadAllBytes($fullPath)
    $context.Response.ContentType = $contentType
    $context.Response.ContentLength64 = $bytes.Length
    $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    $context.Response.Close()
  } catch {
    break
  }
}
