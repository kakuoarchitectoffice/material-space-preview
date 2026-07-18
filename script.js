(() => {
  "use strict";

  const FAVORITES_STORAGE_KEY = "tiles-space-favorites";
  const SAMPLE_CART_STORAGE_KEY = "tiles-space-sample-cart";
  const DB_NAME = "tiles-space-demo-admin";
  const DB_VERSION = 1;

  const { products, rooms, projects } = window.TileSpaceData;

  class JsonStorageRepository {
    constructor(key) { this.key = key; }
    read() {
      try { const parsed = JSON.parse(localStorage.getItem(this.key) || "[]"); return Array.isArray(parsed) ? parsed : []; }
      catch (error) { console.warn(`${this.key} の保存データを初期化しました`, error); return []; }
    }
    write(items) { localStorage.setItem(this.key, JSON.stringify([...new Set(items)])); return this.read(); }
    add(id) { return this.write([...this.read(), id]); }
    remove(id) { return this.write(this.read().filter((item) => item !== id)); }
    has(id) { return this.read().includes(id); }
  }

  class DemoProjectRepository {
    open() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
          const db = request.result;
          ["projects", "rooms", "products"].forEach((name) => { if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, { keyPath: "id" }); });
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(new Error("デモ管理データベースを開けませんでした。"));
      });
    }
    async list(storeName) {
      const db = await this.open();
      return new Promise((resolve, reject) => {
        const req = db.transaction(storeName, "readonly").objectStore(storeName).getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(new Error(`${storeName} の読み込みに失敗しました。`));
      });
    }
    async put(storeName, value) {
      const db = await this.open();
      return new Promise((resolve, reject) => {
        const req = db.transaction(storeName, "readwrite").objectStore(storeName).put(value);
        req.onsuccess = () => resolve(value);
        req.onerror = () => reject(new Error(`${storeName} の保存に失敗しました。`));
      });
    }
    async seed() {
      const existing = await this.list("projects");
      if (existing.length) return;
      await Promise.all(projects.map((item) => this.put("projects", item)));
      await Promise.all(rooms.map((item) => this.put("rooms", item)));
      await Promise.all(Object.values(products).map((item) => this.put("products", item)));
    }
  }

  const repositories = {
    favorites: new JsonStorageRepository(FAVORITES_STORAGE_KEY),
    samples: new JsonStorageRepository(SAMPLE_CART_STORAGE_KEY),
    admin: new DemoProjectRepository()
  };
  window.TileSpaceRepositories = repositories;

  const app = document.querySelector("#app");
  const dialog = document.querySelector("#material-dialog");
  const toast = document.querySelector(".toast");
  const state = { roomId: "arrival", selectedProductId: "travertine", mode: "room", mobileMenu: false };

  const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  const query = () => new URLSearchParams(location.search);
  const currentView = () => query().get("view") || "showroom";
  const itemById = (id) => products[id] || projects.find((item) => item.id === id) || rooms.find((item) => item.id === id);
  const route = (view, params = {}) => {
    const next = new URL(location.href);
    next.search = "";
    next.searchParams.set("view", view);
    Object.entries(params).forEach(([key, value]) => next.searchParams.set(key, value));
    history.pushState({}, "", next);
    render();
  };
  const notify = (message) => {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(notify.timer);
    notify.timer = setTimeout(() => toast.classList.remove("show"), 2400);
  };
  window.TileSpaceApp = { route, openProduct, notify };

  function shell(content, light = true) {
    const view = currentView();
    const nav = [["projects", "PROJECTS"], ["showroom", "SHOWROOM"], ["materials", "MATERIALS"], ["favorites", "FAVORITES"]];
    return `<header class="site-header ${light ? "on-light" : ""}">
      <a class="brand" href="?view=showroom" data-route="showroom">tiles <span>SPACE</span></a>
      <nav class="desktop-nav" aria-label="メインナビゲーション">${nav.map(([id, label]) => `<a href="?view=${id}" data-route="${id}" ${view === id ? 'aria-current="page"' : ""}>${label}${id === "favorites" ? ` <small data-favorite-count>${favoriteItems().length}</small>` : ""}</a>`).join("")}</nav>
      <div class="header-actions"><a class="search-link" href="?view=search" data-route="search">SEARCH</a><a class="consult-link" href="?view=consultation" data-route="consultation">CONSULTATION</a><button class="menu-toggle" type="button" aria-label="メニュー" aria-expanded="false">MENU</button></div>
    </header>
    <nav class="mobile-panel" aria-label="モバイルナビゲーション">${nav.concat([["search", "SEARCH"], ["consultation", "CONSULTATION"]]).map(([id, label]) => `<a href="?view=${id}" data-route="${id}">${label}</a>`).join("")}</nav>
    ${content}
    ${light ? `<footer class="site-footer"><a class="brand" href="?view=showroom" data-route="showroom">tiles <span>SPACE</span></a><nav>${nav.map(([id,label])=>`<a href="?view=${id}" data-route="${id}">${label}</a>`).join("")}</nav><small>PRIVATE CONCEPT / 2026</small></footer>` : ""}`;
  }

  function favoriteItems() {
    return repositories.favorites.read().map(itemById).filter(Boolean);
  }

  function toggleFavorite(id) {
    const active = repositories.favorites.has(id);
    active ? repositories.favorites.remove(id) : repositories.favorites.add(id);
    notify(active ? "お気に入りから削除しました" : "MY MATERIAL BOARDに保存しました");
    if (dialog.open && dialog.dataset.id === id) updateDialogFavorite(id);
    document.querySelectorAll("[data-favorite-count]").forEach((node) => { node.textContent = favoriteItems().length; });
    document.querySelectorAll(`[data-toggle-favorite="${CSS.escape(id)}"]`).forEach((button) => { button.setAttribute("aria-pressed", String(!active)); button.textContent = !active ? "SAVED" : "SAVE"; });
  }

  function addSample(id) {
    if (!products[id]) return;
    if (repositories.samples.has(id)) notify("このタイルはサンプル候補に追加済みです");
    else { repositories.samples.add(id); notify("サンプル候補に追加しました"); }
  }

  function openProduct(id) {
    const product = products[id];
    if (!product) return;
    dialog.dataset.id = id;
    const image = dialog.querySelector(".dialog-media img");
    image.src = product.image;
    image.alt = `${product.title}のタイル単体表面`;
    dialog.querySelector("#material-dialog-title").textContent = product.title;
    dialog.querySelector(".dialog-description").textContent = product.description;
    const specs = [["品番", product.code], ["カラー", product.color], ["サイズ", product.size], ["厚み", product.thickness], ["表面仕上げ", product.finish], ["使用可能箇所", product.use.join(" / ")]];
    dialog.querySelector(".spec-list").innerHTML = specs.map(([term, value]) => `<div><dt>${escapeHtml(term)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("");
    updateDialogFavorite(id);
    dialog.querySelector("[data-dialog-space]").href = `?view=showroom&room=${product.roomId}`;
    dialog.showModal();
  }

  function updateDialogFavorite(id) {
    dialog.querySelector("[data-dialog-favorite]").textContent = repositories.favorites.has(id) ? "お気に入り済み" : "お気に入りに追加";
  }

  function renderShowroom() {
    const roomParam = query().get("room");
    if (roomParam && rooms.some((room) => room.id === roomParam)) state.roomId = roomParam;
    const room = rooms.find((item) => item.id === state.roomId) || rooms[0];
    if (!room.productIds.includes(state.selectedProductId)) state.selectedProductId = room.productIds[0];
    const product = products[state.selectedProductId];
    const traceMarkup = room.traces.map((trace) => `<button class="trace ${trace.productId === product.id ? "active" : ""}" style="left:${trace.x}%;top:${trace.y}%" data-trace="${trace.productId}" aria-label="${trace.label}の素材を見る"><span>${trace.label}</span></button>`).join("");
    const content = `<main class="showroom"><section class="showroom-stage" aria-label="${room.titleJa}のデジタルショールーム">
      <img class="room-photo" src="${room.image}" alt="${room.titleJa}の空間イメージ">
      <nav class="room-path" aria-label="ROOM PATH">${rooms.map((item) => `<button class="${item.id === room.id ? "active" : ""}" data-room="${item.id}"><span>0${item.order}</span>${item.title}</button>`).join("")}</nav>
      <div class="hero-copy"><p class="micro">MATERIAL TO SPACE</p><h1>空間を歩き、<br>素材に出会う。</h1></div>
      <div class="showroom-mode" aria-label="表示モード"><button data-mode="room" class="${state.mode === "room" ? "active" : ""}">ROOM</button><button data-mode="material" class="${state.mode === "material" ? "active" : ""}">MATERIAL</button><button data-mode="story" class="${state.mode === "story" ? "active" : ""}">STORY</button></div>
      <div class="material-traces" ${state.mode === "story" ? "hidden" : ""}>${traceMarkup}</div>
      <aside class="showroom-story" ${state.mode === "story" ? "" : "hidden"}><p class="micro">0${room.order} / ${room.title}</p><h2>${room.titleJa}</h2><p>${room.story}</p><button class="button button--light" data-save-room="${room.id}">この部屋を保存</button></aside>
      <p class="room-status">0${room.order} / 03 &nbsp; ${room.title}</p>
      <div class="material-bar">
        <div class="material-summary"><img src="${product.image}" alt="${product.title}の表面"><div><h2>${product.title}</h2><p>デモタイル / 正式商品選定前</p></div><button class="heart" type="button" data-toggle-favorite="${product.id}" aria-pressed="${repositories.favorites.has(product.id)}">${repositories.favorites.has(product.id) ? "SAVED" : "SAVE"}</button></div>
        <button class="bar-link" type="button" data-open-product="${product.id}">詳細を見る</button>
        <button class="sample-button" type="button" data-add-sample="${product.id}">サンプルを請求</button>
      </div>
    </section></main>`;
    app.innerHTML = shell(content, false);
  }

  function renderProjects() {
    const category = query().get("category") || "ALL";
    const categories = ["ALL", ...new Set(projects.map((project) => project.category))];
    const visible = projects.filter((project) => project.status === "published" && (category === "ALL" || project.category === category));
    const content = `<main class="page"><section class="page-hero"><p class="micro">CURATED SPACES</p><h1>空間から、<br>プロジェクトへ。</h1><p>ショールームを歩くように、素材・光・家具がつくる空間の全体像からご覧ください。</p></section>
      <div class="filter-row">${categories.map((item) => `<button class="${item === category ? "active" : ""}" data-category="${item}">${item}</button>`).join("")}</div>
      <section class="project-grid">${visible.map((project, index) => `<article class="project-card ${index % 2 ? "small" : ""}"><img src="${project.image}" alt="${project.title}の空間"><div class="project-card__meta"><div><h2>${project.title}</h2><p>${project.category} / ${project.location}</p></div><button class="text-button" data-toggle-favorite="${project.id}">${repositories.favorites.has(project.id) ? "SAVED" : "SAVE"}</button></div><a href="?view=showroom" data-project-enter="${project.id}" aria-label="${project.title}に入る"></a></article>`).join("")}</section></main>`;
    app.innerHTML = shell(content);
  }

  function renderMaterials() {
    const content = `<main class="page"><section class="page-hero"><p class="micro">MATERIAL LIBRARY</p><h1>空間で出会った、<br>素材を詳しく。</h1><p>商品画像は空間写真と分けて管理しています。掲載情報はすべて正式商品選定前のデモです。</p></section>
      <div class="filter-row"><button class="active">ALL</button><button>FLOOR</button><button>WALL</button><button>STONE</button><button>EARTH</button></div>
      <section class="materials-layout"><div class="material-grid">${Object.values(products).map((product) => `<article class="material-card"><a href="?view=material&id=${product.id}" data-material-page="${product.id}"><img src="${product.image}" alt="${product.title}のタイル単体表面"><h2>${product.title}</h2><p>DEMO TILE / ${product.finish}</p></a><div class="material-actions"><button data-toggle-favorite="${product.id}">${repositories.favorites.has(product.id) ? "SAVED" : "SAVE"}</button><button data-add-sample="${product.id}">SAMPLE</button></div></article>`).join("")}</div></section></main>`;
    app.innerHTML = shell(content);
  }

  function renderMaterialDetail() {
    const product = products[query().get("id")] || products.travertine;
    const content = `<main class="page"><section class="form-layout" style="padding-top:150px"><div><img src="${product.image}" alt="${product.title}のタイル単体表面"></div><div><p class="micro">DEMO TILE / 正式商品選定前</p><h1 style="font-family:'Noto Sans JP';font-weight:300;font-size:clamp(38px,5vw,70px);margin:30px 0">${product.title}</h1><p style="line-height:2">${product.description}</p><dl class="spec-list">${[["品番",product.code],["カラー",product.color],["サイズ",product.size],["厚み",product.thickness],["表面仕上げ",product.finish],["使用可能箇所",product.use.join(" / ")]].map(([a,b])=>`<div><dt>${a}</dt><dd>${b}</dd></div>`).join("")}</dl><p class="demo-note">掲載情報はコンセプトサイト用のデモです。正式商品選定後に更新してください。</p><div class="dialog-actions"><button data-toggle-favorite="${product.id}">${repositories.favorites.has(product.id)?"お気に入り済み":"お気に入りに追加"}</button><button data-add-sample="${product.id}">サンプル候補に追加</button><a href="?view=showroom&room=${product.roomId}" data-route="showroom" data-room-param="${product.roomId}">このタイルを使用した空間事例</a></div></div></section></main>`;
    app.innerHTML = shell(content);
  }

  function savedCard(item) {
    const isProduct = item.type === "tile";
    const href = isProduct ? `?view=material&id=${item.id}` : item.type === "project" ? "?view=showroom" : `?view=showroom&room=${item.id}`;
    return `<article class="saved-card" data-saved-card="${item.id}"><img src="${item.image}" alt="${item.title || item.titleJa}"><p class="type">${item.type === "tile" ? "TILE" : item.type === "project" ? "PROJECT" : "ROOM"}</p><h2>${item.title || item.titleJa}</h2>${isProduct ? `<dl><div><dt>品番</dt><dd>${item.code}</dd></div><div><dt>カラー</dt><dd>${item.color}</dd></div><div><dt>サイズ</dt><dd>${item.size}</dd></div><div><dt>仕上げ</dt><dd>${item.finish}</dd></div><div><dt>用途</dt><dd>${item.use.join(" / ")}</dd></div></dl>` : `<p class="muted">${item.location || item.story}</p>`}<div class="saved-card__actions"><a href="${href}" ${isProduct ? `data-material-page="${item.id}"` : `data-route="showroom"`}>詳細を見る</a>${isProduct ? `<button data-add-sample="${item.id}">サンプル候補に追加</button>` : ""}<button data-remove-favorite="${item.id}">お気に入り解除</button></div></article>`;
  }

  function renderFavorites() {
    const items = favoriteItems();
    const body = items.length ? `<div class="board-tools"><span>${items.length} SAVED ITEMS</span><a class="button" href="?view=samples" data-route="samples">SAMPLE CART <span>${repositories.samples.read().length}</span></a></div><section class="board-grid">${items.map(savedCard).join("")}</section>` : `<section class="empty-state"><p class="micro">NO SAVED MATERIALS</p><h2>まだ保存された素材や空間はありません。</h2><p class="muted">ショールームを巡り、気になる素材や部屋を保存してください。</p><a class="button button--dark" href="?view=showroom" data-route="showroom">SHOWROOMへ</a></section>`;
    const content = `<main class="page"><section class="page-hero"><p class="micro">MY MATERIAL BOARD</p><h1>お気に入りを、<br>次の提案へ。</h1><p>タイル・部屋・プロジェクトを一つのボードで確認し、サンプル請求や空間相談へ進めます。</p></section>${body}</main>`;
    app.innerHTML = shell(content);
  }

  async function submitSampleRequest(formData) {
    await new Promise((resolve) => setTimeout(resolve, 350));
    return { success: true, reference: `DEMO-${Date.now().toString().slice(-6)}`, formData };
  }
  window.submitSampleRequest = submitSampleRequest;

  function renderSamples() {
    const selected = repositories.samples.read().map((id) => products[id]).filter(Boolean);
    const content = `<main class="page"><section class="page-hero"><p class="micro">SAMPLE REQUEST</p><h1>素材を、<br>手元で確かめる。</h1><p>複数のタイル候補をまとめて確認できます。このデモでは実際の送信は行いません。</p></section><section class="sample-layout"><div><h2>SELECTED MATERIALS / ${selected.length}</h2><div class="cart-list">${selected.length ? selected.map((item) => `<article class="cart-row"><img src="${item.image}" alt="${item.title}"><div><h3>${item.title}</h3><p>${item.code} / 正式商品選定前</p></div><button data-remove-sample="${item.id}">削除</button></article>`).join("") : `<p class="muted" style="padding:30px 0">サンプル候補はまだありません。</p>`}</div></div><form class="form-panel" id="sample-form" novalidate><p class="micro">REQUEST FORM / DEMO</p><h2>お届け先・用途</h2><div class="field"><label for="sample-name">お名前 *</label><input id="sample-name" name="name" autocomplete="name" required></div><div class="field"><label for="sample-email">メールアドレス *</label><input id="sample-email" name="email" type="email" autocomplete="email" required></div><div class="field"><label for="sample-company">会社名</label><input id="sample-company" name="company" autocomplete="organization"></div><div class="field"><label for="sample-purpose">用途・プロジェクト</label><textarea id="sample-purpose" name="purpose" rows="4"></textarea></div><p class="form-message" role="alert"></p><button class="button button--dark" type="submit" ${selected.length ? "" : "disabled"}>入力内容を確認</button></form></section></main>`;
    app.innerHTML = shell(content);
  }

  function renderConsultation() {
    const content = `<main class="page"><section class="page-hero"><p class="micro">SPACE DESIGN CONSULTATION</p><h1>この世界観を、<br>次の空間へ。</h1><p>タイル選定だけでなく、貼り方、目地、家具、照明を含む空間全体についてご相談いただくデモ導線です。</p></section><section class="form-layout"><div><p class="micro">FROM MATERIAL TO SPACE</p><h2 style="font-family:'Noto Sans JP';font-weight:300;font-size:34px;line-height:1.55">素材の印象を言葉にできなくても構いません。</h2><p class="muted" style="line-height:2">保存した素材や空間を参照しながら、方向性を一緒に整理する想定です。デモのため実送信は行いません。</p></div><form class="form-panel" id="consult-form" novalidate><div class="field"><span>ご相談内容</span><div class="choice-row"><label><input type="radio" name="type" value="空間デザイン" checked> 空間デザイン</label><label><input type="radio" name="type" value="タイル選定"> タイル選定</label><label><input type="radio" name="type" value="サンプル"> サンプル</label></div></div><div class="field"><label for="consult-name">お名前 *</label><input id="consult-name" name="name" required></div><div class="field"><label for="consult-email">メールアドレス *</label><input id="consult-email" name="email" type="email" required></div><div class="field"><label for="consult-message">ご相談内容 *</label><textarea id="consult-message" name="message" rows="5" required></textarea></div><p class="form-message" role="alert"></p><button class="button button--dark" type="submit">入力内容を確認</button></form></section></main>`;
    app.innerHTML = shell(content);
  }

  function renderSearch() {
    const term = query().get("q") || "";
    const normalized = term.toLowerCase();
    const all = [...projects, ...rooms.map((room) => ({ ...room, type: "room" })), ...Object.values(products)];
    const results = term ? all.filter((item) => JSON.stringify(item).toLowerCase().includes(normalized)) : all;
    const content = `<main class="page"><section class="page-hero"><p class="micro">SEARCH</p><h1>空間と素材を、<br>横断して探す。</h1></section><form class="search-form"><input name="q" value="${escapeHtml(term)}" type="search" placeholder="例：グレージュ、ラウンジ、石目" aria-label="検索語"><input type="hidden" name="view" value="search"><button>SEARCH</button></form><section class="search-results"><p class="micro">${results.length} RESULTS</p>${results.map((item) => { const image = item.image; const title = item.title || item.titleJa; const type = item.type === "tile" ? "MATERIAL" : item.type === "room" ? "ROOM" : "PROJECT"; const href = item.type === "tile" ? `?view=material&id=${item.id}` : item.type === "room" ? `?view=showroom&room=${item.id}` : "?view=showroom"; return `<article class="result-row"><img src="${image}" alt="${title}"><div><p>${type}</p><h2>${title}</h2></div><a class="text-button" href="${href}">VIEW</a></article>`; }).join("")}</section></main>`;
    app.innerHTML = shell(content);
  }

  function render() {
    const views = { showroom: renderShowroom, projects: renderProjects, materials: renderMaterials, material: renderMaterialDetail, favorites: renderFavorites, samples: renderSamples, consultation: renderConsultation, search: renderSearch };
    (views[currentView()] || renderShowroom)();
    document.title = `${currentView().toUpperCase()} — tiles SPACE`;
    window.scrollTo(0, 0);
  }

  app.addEventListener("click", (event) => {
    const routeLink = event.target.closest("[data-route]");
    if (routeLink) { event.preventDefault(); route(routeLink.dataset.route, routeLink.dataset.roomParam ? { room: routeLink.dataset.roomParam } : {}); return; }
    const menu = event.target.closest(".menu-toggle");
    if (menu) { const panel = document.querySelector(".mobile-panel"); const open = panel.classList.toggle("open"); menu.setAttribute("aria-expanded", String(open)); return; }
    const roomButton = event.target.closest("[data-room]");
    if (roomButton) { state.roomId = roomButton.dataset.room; state.selectedProductId = rooms.find((room) => room.id === state.roomId).productIds[0]; const image = document.querySelector(".room-photo"); image?.classList.add("is-changing"); setTimeout(renderShowroom, 180); return; }
    const mode = event.target.closest("[data-mode]");
    if (mode) { state.mode = mode.dataset.mode; renderShowroom(); return; }
    const trace = event.target.closest("[data-trace]");
    if (trace) { state.selectedProductId = trace.dataset.trace; state.mode = "material"; renderShowroom(); return; }
    const productButton = event.target.closest("[data-open-product]");
    if (productButton) { openProduct(productButton.dataset.openProduct); return; }
    const materialPage = event.target.closest("[data-material-page]");
    if (materialPage) { event.preventDefault(); route("material", { id: materialPage.dataset.materialPage }); return; }
    const favorite = event.target.closest("[data-toggle-favorite]");
    if (favorite) { event.preventDefault(); toggleFavorite(favorite.dataset.toggleFavorite); return; }
    const removeFavorite = event.target.closest("[data-remove-favorite]");
    if (removeFavorite) { repositories.favorites.remove(removeFavorite.dataset.removeFavorite); renderFavorites(); notify("お気に入りを解除しました"); return; }
    const sample = event.target.closest("[data-add-sample]");
    if (sample) { addSample(sample.dataset.addSample); return; }
    const removeSample = event.target.closest("[data-remove-sample]");
    if (removeSample) { repositories.samples.remove(removeSample.dataset.removeSample); renderSamples(); notify("サンプル候補から削除しました"); return; }
    const saveRoom = event.target.closest("[data-save-room]");
    if (saveRoom) { toggleFavorite(saveRoom.dataset.saveRoom); return; }
    const category = event.target.closest("[data-category]");
    if (category) { route("projects", { category: category.dataset.category }); return; }
    const enter = event.target.closest("[data-project-enter]");
    if (enter) { event.preventDefault(); route("showroom"); }
  });

  app.addEventListener("submit", async (event) => {
    if (event.target.id === "sample-form") {
      event.preventDefault();
      const form = event.target;
      const message = form.querySelector(".form-message");
      if (!form.checkValidity()) { message.textContent = "必須項目とメールアドレスをご確認ください。"; form.reportValidity(); return; }
      const data = Object.fromEntries(new FormData(form));
      const selectedIds = repositories.samples.read();
      const result = await submitSampleRequest({ ...data, productIds: selectedIds });
      if (result.success) { repositories.samples.write([]); form.outerHTML = `<section class="success-panel"><p class="micro">REQUEST COMPLETE / DEMO</p><h2>デモ受付が完了しました。</h2><p>実際の送信は行われていません。受付番号: ${result.reference}</p><a class="button" href="?view=showroom">SHOWROOMへ戻る</a></section>`; }
    }
    if (event.target.id === "consult-form") {
      event.preventDefault();
      const form = event.target;
      const message = form.querySelector(".form-message");
      if (!form.checkValidity()) { message.textContent = "必須項目をご確認ください。"; form.reportValidity(); return; }
      const data = Object.fromEntries(new FormData(form));
      form.outerHTML = `<section class="success-panel"><p class="micro">CONFIRMATION / DEMO</p><h2>入力内容をご確認ください。</h2><dl class="spec-list">${Object.entries(data).map(([key,value])=>`<div><dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}</dl><p>このデモでは送信されません。</p><button class="button" type="button" onclick="location.reload()">入力画面へ戻る</button></section>`;
    }
  });

  dialog.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  dialog.querySelector("[data-dialog-favorite]").addEventListener("click", () => toggleFavorite(dialog.dataset.id));
  dialog.querySelector("[data-dialog-sample]").addEventListener("click", () => addSample(dialog.dataset.id));
  dialog.querySelector("[data-dialog-space]").addEventListener("click", (event) => { event.preventDefault(); const product = products[dialog.dataset.id]; dialog.close(); route("showroom", { room: product.roomId }); });
  addEventListener("popstate", render);
  repositories.admin.seed().catch((error) => console.warn(error.message));
  render();
})();
