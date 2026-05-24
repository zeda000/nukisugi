# build-articles.ps1 - data/articles.jsonからarticles/配下にHTMLを一括生成

$json = Get-Content "C:\claude\.local\bin\nukisugi\data\articles.json" -Raw -Encoding UTF8
$articles = $json | ConvertFrom-Json

$affiliateId = "Asides-002"
$outDir = "C:\claude\.local\bin\nukisugi\articles"

$header = @'
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="index, follow">
'@

$navFooter = @'
  <header class="site-header">
    <div class="container">
      <div class="header-inner">
        <a href="/" class="site-logo"><span class="logo-text">Nukisugi<span class="logo-accent">.com</span></span></a>
        <nav class="main-nav" id="mainNav">
          <ul class="nav-list">
            <li><a href="/">トップ</a></li>
            <li><a href="/ranking.html">ランキング</a></li>
            <li><a href="/new.html">新着</a></li>
            <li><a href="/actress.html">女優</a></li>
            <li><a href="/genre.html">ジャンル</a></li>
          </ul>
        </nav>
        <button class="nav-toggle" id="navToggle" aria-label="メニュー"><span></span><span></span><span></span></button>
      </div>
    </div>
  </header>
'@

$footer = @'
  <footer class="site-footer">
    <div class="container">
      <div class="footer-inner">
        <div class="footer-logo"><span class="logo-text">Nukisugi<span class="logo-accent">.com</span></span></div>
        <nav class="footer-nav">
          <a href="/about.html">このサイトについて</a>
          <a href="/privacy.html">プライバシーポリシー</a>
          <a href="/disclaimer.html">免責事項</a>
          <a href="/contact.html">お問い合わせ</a>
        </nav>
        <p class="footer-note">当サイトはDMMアフィリエイトプログラムを利用しています。</p>
        <p class="footer-copy">&copy; 2026 Nukisugi.com All Rights Reserved.</p>
      </div>
    </div>
  </footer>
  <script src="../assets/js/main.js"></script>
</body>
</html>
'@

$count = 0

foreach ($a in $articles) {
    $slug     = $a.slug
    $title    = $a.title
    $actress  = $a.actress
    $maker    = $a.maker
    $desc     = $a.description
    $catch    = $a.catchcopy
    $cid      = $a.cid
    $dmmUrl   = "https://www.dmm.co.jp/digital/videoa/-/detail/=/cid=$cid/"
    $afUrl    = "https://al.dmm.co.jp/?lurl=" + [Uri]::EscapeDataString($dmmUrl) + "&af_id=$affiliateId&ch=api&ch_id=link"

    # genre tags
    $genreTags = ($a.genres | ForEach-Object { "          <span class=`"genre-tag`">$_</span>" }) -join "`n"

    $html = $header
    $html += "  <meta name=`"description`" content=`"$($desc.Substring(0, [Math]::Min(120,$desc.Length)))…`">`n"
    $html += "  <title>$title | Nukisugi.com</title>`n"
    $html += "  <link rel=`"stylesheet`" href=`"../assets/css/style.css`">`n"
    $html += "  <link rel=`"preconnect`" href=`"https://fonts.googleapis.com`">`n"
    $html += "  <link href=`"https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap`" rel=`"stylesheet`">`n"
    $html += "</head>`n<body>`n"
    $html += $navFooter
    $html += "`n  <div class=`"container article-layout`">`n"
    $html += "    <main class=`"main-content`">`n"
    $html += "      <article class=`"article`">`n"
    $html += "        <div class=`"article-meta-top`">`n"
    $html += "          <span class=`"article-label`">$maker</span>`n"
    $html += "        </div>`n"
    $html += "        <h1 class=`"article-title`">$title</h1>`n"
    $html += "        <div class=`"article-catchcopy`">$catch</div>`n"
    $html += "        <div class=`"article-thumb-area`"><div class=`"article-thumb-placeholder`">作品サムネイル（DMM APIで取得）</div></div>`n"
    $html += "        <div class=`"article-info-table`">`n"
    $html += "          <div class=`"info-row`"><span class=`"info-label`">女優</span><span class=`"info-value`">$actress</span></div>`n"
    $html += "          <div class=`"info-row`"><span class=`"info-label`">メーカー</span><span class=`"info-value`">$maker</span></div>`n"
    $html += "          <div class=`"info-row`"><span class=`"info-label`">品番</span><span class=`"info-value`">$($a.cid)</span></div>`n"
    $html += "        </div>`n"
    $html += "        <div class=`"genre-grid article-genres`">`n$genreTags`n        </div>`n"
    $html += "        <div class=`"article-body`">`n"
    $html += "          <h2>作品概要</h2>`n"
    $html += "          <p>$desc</p>`n"
    $html += "        </div>`n"
    $html += "        <a href=`"$afUrl`" class=`"cta-button`" target=`"_blank`" rel=`"noopener noreferrer nofollow`">DMMで視聴する &rarr;</a>`n"
    $html += "      </article>`n    </main>`n"
    $html += "    <aside class=`"sidebar`">`n"
    $html += "      <div class=`"sidebar-widget`"><h3 class=`"widget-title`">DMMで見る</h3><a href=`"#`" target=`"_blank`" rel=`"noopener noreferrer nofollow`"><div class=`"dmm-banner-placeholder`">DMM バナー広告エリア</div></a></div>`n"
    $html += "    </aside>`n"
    $html += "  </div>`n"
    $html += $footer

    $outPath = Join-Path $outDir "$slug.html"
    [System.IO.File]::WriteAllText($outPath, $html, [System.Text.Encoding]::UTF8)
    $count++
    Write-Host "生成: $slug.html"
}

Write-Host "`n完了: $count 件の記事を生成しました"
