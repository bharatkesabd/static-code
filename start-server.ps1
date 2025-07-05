# Simple HTTP Server for testing
param(
    [int]$Port = 8000
)

Write-Host "Starting HTTP server on port $Port..." -ForegroundColor Green
Write-Host "Open your browser to: http://localhost:$Port" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow

try {
    # Try to use Python HTTP server
    if (Get-Command python -ErrorAction SilentlyContinue) {
        python -m http.server $Port
    }
    # Try Node.js if available
    elseif (Get-Command node -ErrorAction SilentlyContinue) {
        npx http-server -p $Port
    }
    # Use PowerShell HTTP listener as fallback
    else {
        Write-Host "Using PowerShell HTTP listener..." -ForegroundColor Yellow
        
        $listener = New-Object System.Net.HttpListener
        $listener.Prefixes.Add("http://localhost:$Port/")
        $listener.Start()
        
        Write-Host "HTTP Server started on http://localhost:$Port" -ForegroundColor Green
        
        while ($listener.IsListening) {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response
            
            $localPath = $request.Url.LocalPath
            if ($localPath -eq '/') { $localPath = '/index.html' }
            
            $filePath = Join-Path $PWD.Path $localPath.TrimStart('/')
            
            if (Test-Path $filePath) {
                $content = Get-Content $filePath -Raw -Encoding UTF8
                $extension = [System.IO.Path]::GetExtension($filePath)
                
                switch ($extension) {
                    '.html' { $response.ContentType = 'text/html; charset=utf-8' }
                    '.css' { $response.ContentType = 'text/css; charset=utf-8' }
                    '.js' { $response.ContentType = 'application/javascript; charset=utf-8' }
                    '.json' { $response.ContentType = 'application/json; charset=utf-8' }
                    default { $response.ContentType = 'text/plain; charset=utf-8' }
                }
                
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($content)
                $response.ContentLength64 = $buffer.Length
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
            } else {
                $response.StatusCode = 404
                $notFound = "404 - File not found: $localPath"
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($notFound)
                $response.ContentLength64 = $buffer.Length
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
            }
            
            $response.Close()
        }
    }
}
catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
finally {
    if ($listener) {
        $listener.Stop()
        Write-Host "Server stopped." -ForegroundColor Yellow
    }
}
