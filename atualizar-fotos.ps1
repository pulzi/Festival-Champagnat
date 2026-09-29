# Varre a pasta "fotos" e gera o fotos.js da galeria.
# fotos\Palco\img1.jpg  -> álbum "Palco"
# fotos\Videos\clip.mp4 -> álbum "Videos" (vídeos também funcionam)
# fotos\img2.jpg        -> álbum "Geral"
$raiz = $PSScriptRoot
$pasta = Join-Path $raiz 'fotos'
$ext = '.jpg', '.jpeg', '.png', '.webp', '.avif', '.mp4', '.webm', '.mov'
$itens = Get-ChildItem -Path $pasta -Recurse -File |
  Where-Object { $ext -contains $_.Extension.ToLower() } |
  Sort-Object FullName |
  ForEach-Object {
    $rel = $_.FullName.Substring($pasta.Length + 1).Replace('\', '/')
    $partes = $rel.Split('/')
    $cat = if ($partes.Length -gt 1) { $partes[0] } else { 'Geral' }
    $src = [uri]::EscapeUriString("fotos/$rel")
    "  { src: '$src', categoria: '$($cat -replace "'", '')' }"
  }
$corpo = ($itens -join ",`n")
$js = "// Gerado por atualizar-fotos.ps1. Não edite na mão.`nwindow.FOTOS = [`n$corpo`n];`n"
Set-Content -Path (Join-Path $raiz 'fotos.js') -Value $js -Encoding utf8
Write-Host "Pronto: $($itens.Count) arquivo(s) na galeria."
