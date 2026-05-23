$files = Get-ChildItem -Path "d:\telgr\src\app\[locale]" -Filter "page.tsx" -Recurse
foreach ($f in $files) {
    $content = Get-Content $f.FullName -Raw
    $newContent = $content -replace ' px-4 lg:px-6 ', ' px-1.5 lg:px-6 '
    $newContent = $newContent -replace ' px-4 sm:px-6', ' px-1.5 sm:px-6'
    $newContent = $newContent -replace ' mx-auto px-6 pt-4 ', ' mx-auto px-1.5 sm:px-6 pt-4 '
    $newContent = $newContent -replace ' px-6 max-w-\[800px\]', ' px-1.5 sm:px-6 max-w-[800px]'
    [IO.File]::WriteAllText($f.FullName, $newContent)
}
