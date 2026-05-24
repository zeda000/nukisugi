/* ===== Mobile Nav Toggle ===== */
(function () {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open);
  });

  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !toggle.contains(e.target)) {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
})();

/* ===== Genre Tags (placeholder data) ===== */
(function () {
  const genres = [
    '単体作品', 'ハイビジョン', '巨乳', 'スレンダー', '人妻・主婦',
    '素人', 'OL', '美少女', 'ロリ系', 'ギャル', 'フェラ・手コキ',
    '中出し', '騎乗位', 'ハーレム', 'ドラマ・ドキュメント',
    'ナンパ・逆ナン', 'オナニー・自慰', 'ぽっちゃり', '痴女',
    '企画', '女子校生', '秘書', '看護師', '教師',
  ];

  const container = document.getElementById('genreGrid');
  if (!container) return;

  container.innerHTML = '';
  genres.forEach((g) => {
    const a = document.createElement('a');
    a.href = `genre.html?tag=${encodeURIComponent(g)}`;
    a.className = 'genre-tag';
    a.textContent = g;
    container.appendChild(a);
  });
})();

/* ===== DMM Affiliate API Helper (stub) ===== *
 *
 * 実際の利用時は DMMアフィリエイトAPIキーを取得し、
 * CORS対応のサーバーサイドプロキシ経由でリクエストを送る。
 *
 * 例: GET https://api.dmm.com/affiliate/v3/ItemList
 *   ?api_id=YOUR_API_ID
 *   &affiliate_id=YOUR_AFFILIATE_ID
 *   &site=FANZA
 *   &service=digital
 *   &floor=videoa
 *   &hits=20
 *   &sort=rank
 *   &output=json
 */
const DMM = {
  affiliateId: 'Asides-002',
  apiId: '2RnzUS46RGXEDPSrugG1',

  affiliateURL(productURL) {
    return `https://al.dmm.co.jp/?lurl=${encodeURIComponent(productURL)}&af_id=${this.affiliateId}&ch=api&ch_id=link`;
  },

  buildCardHTML(item, rank) {
    const rankBadge = rank ? `<span class="card-rank">${rank}位</span>` : '';
    const thumb = item.imageURL?.large || '';
    const title = item.title || '';
    const actress = item.iteminfo?.actress?.[0]?.name || '';
    const url = item.affiliateURL || this.affiliateURL(item.URL) || '#';

    return `
      <a href="${url}" class="card" target="_blank" rel="noopener noreferrer nofollow">
        <div class="card-thumb">
          ${thumb ? `<img src="${thumb}" alt="${title}" loading="lazy">` : ''}
        </div>
        <div class="card-body">
          ${rankBadge}
          <p class="card-title">${title}</p>
          ${actress ? `<p class="card-meta">${actress}</p>` : ''}
        </div>
      </a>`;
  },

  async fetchItems(params = {}) {
    const query = new URLSearchParams({
      api_id: this.apiId,
      affiliate_id: this.affiliateId,
      site: 'FANZA',
      service: 'digital',
      floor: 'videoa',
      hits: 20,
      sort: 'rank',
      output: 'json',
      ...params,
    });
    const res = await fetch(`https://api.dmm.com/affiliate/v3/ItemList?${query}`);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    return data.result?.items || [];
  },
};

window.DMM = DMM;

/* ===== Sample Image Gallery ===== */
(function () {
  const gallery = document.querySelector('.sample-gallery');
  if (!gallery) return;

  const cid = gallery.dataset.cid;
  if (!cid) return;

  const MAX = 12;
  const BASE = `https://pics.dmm.co.jp/digital/video/${cid}/${cid}jp-`;

  const wrap = document.createElement('div');
  wrap.className = 'sample-gallery-inner';
  gallery.appendChild(wrap);

  // ライトボックス用オーバーレイ
  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.innerHTML = '<img class="lightbox-img"><button class="lightbox-close">&times;</button><button class="lightbox-prev">&#10094;</button><button class="lightbox-next">&#10095;</button>';
  document.body.appendChild(overlay);

  const lbImg   = overlay.querySelector('.lightbox-img');
  const lbClose = overlay.querySelector('.lightbox-close');
  const lbPrev  = overlay.querySelector('.lightbox-prev');
  const lbNext  = overlay.querySelector('.lightbox-next');

  let loaded = [];
  let current = 0;

  function openLightbox(idx) {
    current = idx;
    lbImg.src = loaded[current];
    overlay.classList.add('is-open');
  }
  lbClose.addEventListener('click', () => overlay.classList.remove('is-open'));
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('is-open'); });
  lbPrev.addEventListener('click', () => { current = (current - 1 + loaded.length) % loaded.length; lbImg.src = loaded[current]; });
  lbNext.addEventListener('click', () => { current = (current + 1) % loaded.length; lbImg.src = loaded[current]; });
  document.addEventListener('keydown', e => {
    if (!overlay.classList.contains('is-open')) return;
    if (e.key === 'ArrowLeft')  lbPrev.click();
    if (e.key === 'ArrowRight') lbNext.click();
    if (e.key === 'Escape')     lbClose.click();
  });

  for (let i = 1; i <= MAX; i++) {
    const src = `${BASE}${i}.jpg`;
    const img = document.createElement('img');
    img.src = src;
    img.alt = `サンプル画像 ${i}`;
    img.loading = 'lazy';
    img.className = 'sample-img';
    img.addEventListener('load', () => {
      const idx = loaded.length;
      loaded.push(src);
      img.addEventListener('click', () => openLightbox(idx));
      wrap.appendChild(img);
    });
    img.addEventListener('error', () => {});
  }
})();
