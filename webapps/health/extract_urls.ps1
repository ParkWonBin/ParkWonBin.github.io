$dir = "C:\Users\an344\Desktop\insta_downloader\downloads\yeddam_soul\combined"
$files = Get-ChildItem -Path $dir -Filter "*.txt"
$results = @()
foreach ($f in $files) {
    $content = Get-Content $f.FullName -Raw -Encoding UTF8
    if ($content -match 'URL:\s*(https://www\.instagram\.com/yeddam_soul/reel/[^\s]+)') {
        $name = $f.BaseName
        $url = $matches[1]
        # Extract episode number from filename
        if ($name -match '^(\d+\.?\d*)') {
            $ep = $matches[1]
        } elseif ($name -match '긴급') {
            $ep = 'special'
        } elseif ($name -match '밤에') {
            $ep = '03'
        } else {
            $ep = 'unknown'
        }
        $results += "$ep|$url"
    }
}
$results | Sort-Object | ForEach-Object { Write-Output $_ }
