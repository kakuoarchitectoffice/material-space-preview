(() => {
  "use strict";
  const SESSION_KEY = "tiles-space-demo-admin-session";
  const DB_NAME = "tiles-space-demo-admin";
  const DB_VERSION = 1;
  const app = document.querySelector("#admin-app");
  const state = { view: "dashboard", projectId: "quiet-residence", roomId: "arrival", pendingTrace: null };

  class AdminRepository {
    open() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => ["projects", "rooms", "products"].forEach((name) => { if (!request.result.objectStoreNames.contains(name)) request.result.createObjectStore(name, { keyPath: "id" }); });
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(new Error("IndexedDBを開けませんでした。"));
      });
    }
    async all(store) { const db = await this.open(); return new Promise((resolve, reject) => { const req = db.transaction(store, "readonly").objectStore(store).getAll(); req.onsuccess = () => resolve(req.result); req.onerror = () => reject(new Error("データを読み込めませんでした。")); }); }
    async get(store, id) { const db = await this.open(); return new Promise((resolve, reject) => { const req = db.transaction(store, "readonly").objectStore(store).get(id); req.onsuccess = () => resolve(req.result); req.onerror = () => reject(new Error("データを読み込めませんでした。")); }); }
    async put(store, value) { const db = await this.open(); return new Promise((resolve, reject) => { const req = db.transaction(store, "readwrite").objectStore(store).put(value); req.onsuccess = () => resolve(value); req.onerror = () => reject(new Error("データを保存できませんでした。")); }); }
    async seed() {
      const existing = await this.all("projects");
      if (existing.length) return;
      const { projects, rooms, products } = window.TileSpaceData;
      await Promise.all(projects.map((item) => this.put("projects", item)));
      await Promise.all(rooms.map((item) => this.put("rooms", item)));
      await Promise.all(Object.values(products).map((item) => this.put("products", item)));
    }
  }
  const repo = new AdminRepository();
  const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));

  function loginScreen() {
    app.innerHTML = `<main class="admin-login"><div class="admin-login__image" aria-hidden="true"></div><section class="admin-login__panel"><p class="micro">TILES SPACE / DEMO ADMIN</p><h1>ショールーム管理</h1><p>プロジェクト、部屋、素材トレースをローカル環境で編集するためのデモ管理画面です。</p><p class="warning">この画面は本番認証ではありません。デモ用セッションをsessionStorageに保存し、編集データはIndexedDBにのみ保存します。公開時はSupabase Auth・RLS・Storage等の導入が必要です。</p><button class="button" type="button" data-demo-login>デモ管理画面に入る</button><a class="button button--light" style="margin-left:8px" href="index.html?view=showroom">公開プレビューへ戻る</a></section></main>`;
  }

  function shell(content) {
    return `<div class="admin-shell"><aside class="admin-sidebar"><a class="brand" href="admin.html">tiles <span>ADMIN</span></a><nav>${[["dashboard","DASHBOARD"],["projects","PROJECTS"],["editor","PROJECT EDITOR"],["rooms","ROOMS"],["traces","MATERIAL TRACES"],["products","PRODUCTS"]].map(([id,label])=>`<button class="${state.view===id?"active":""}" data-admin-view="${id}">${label}</button>`).join("")}</nav><div class="admin-exit"><a class="button button--light" href="index.html?view=showroom">PUBLIC PREVIEW</a><button data-logout>LOG OUT</button></div></aside><main class="admin-main"><p class="admin-warning">DEMO ADMIN — 本番の認証・権限管理ではありません。編集内容はこのブラウザのIndexedDBに保存されます。</p>${content}</main></div>`;
  }

  async function dashboard() {
    const [projects, rooms, products] = await Promise.all([repo.all("projects"), repo.all("rooms"), repo.all("products")]);
    app.innerHTML = shell(`<header class="admin-head"><div><p class="micro">OVERVIEW</p><h1>Dashboard</h1></div><a class="button" href="index.html?view=showroom">公開プレビュー</a></header><section class="admin-stats"><div class="admin-stat"><strong>${projects.length}</strong><span>PROJECTS</span></div><div class="admin-stat"><strong>${rooms.length}</strong><span>ROOMS</span></div><div class="admin-stat"><strong>${products.length}</strong><span>PRODUCTS</span></div><div class="admin-stat"><strong>${rooms.reduce((sum,room)=>sum+(room.traces?.length||0),0)}</strong><span>MATERIAL TRACES</span></div></section>`);
  }

  async function projectList() {
    const projects = await repo.all("projects");
    app.innerHTML = shell(`<header class="admin-head"><div><p class="micro">CONTENT</p><h1>Projects</h1></div><button class="button button--dark" data-new-project>新規プロジェクト</button></header><table class="admin-table"><thead><tr><th>TITLE</th><th>CATEGORY</th><th>LOCATION</th><th>STATUS</th><th>EDIT</th></tr></thead><tbody>${projects.map((p)=>`<tr><td>${escapeHtml(p.title)}</td><td>${escapeHtml(p.category)}</td><td>${escapeHtml(p.location)}</td><td><span class="status status--${p.status}">${p.status}</span></td><td><button class="text-button" data-edit-project="${p.id}">編集</button></td></tr>`).join("")}</tbody></table>`);
  }

  async function editor() {
    const project = await repo.get("projects", state.projectId) || { id: `project-${Date.now()}`, title: "", category: "RESIDENCE", location: "", status: "draft", description: "", image: "", roomIds: [] };
    app.innerHTML = shell(`<header class="admin-head"><div><p class="micro">STEP 1 / PROJECT INFO</p><h1>Project Editor</h1></div></header><form class="admin-panel" id="project-form"><input type="hidden" name="id" value="${escapeHtml(project.id)}"><div class="admin-grid"><div class="field"><label>プロジェクト名</label><input name="title" value="${escapeHtml(project.title)}" required></div><div class="field"><label>カテゴリ</label><select name="category"><option>RESIDENCE</option><option>HOSPITALITY</option><option>RETAIL</option><option>WORKSPACE</option></select></div><div class="field"><label>所在地</label><input name="location" value="${escapeHtml(project.location)}"></div><div class="field"><label>公開状態</label><select name="status"><option value="draft" ${project.status==="draft"?"selected":""}>draft</option><option value="published" ${project.status==="published"?"selected":""}>published</option></select></div><div class="field" style="grid-column:1/-1"><label>メイン画像パス</label><input name="image" value="${escapeHtml(project.image)}"></div><div class="field" style="grid-column:1/-1"><label>説明</label><textarea name="description" rows="4">${escapeHtml(project.description)}</textarea></div></div><div class="admin-actions"><button class="primary" type="submit">保存する</button><button type="button" data-next-rooms>次へ：部屋編集</button><a href="index.html?view=showroom">プレビュー</a></div><p class="form-message"></p></form>`);
  }

  async function roomList() {
    const rooms = (await repo.all("rooms")).sort((a,b)=>(a.order||0)-(b.order||0));
    app.innerHTML = shell(`<header class="admin-head"><div><p class="micro">STEP 2 / ROOMS</p><h1>Room Order</h1></div><button class="button" data-add-room>部屋を追加</button></header><p class="muted">行をドラッグして表示順を変更できます。</p><section class="room-list">${rooms.map((room)=>`<article class="room-admin-row" draggable="true" data-room-row="${room.id}"><span>0${room.order}</span><img src="${escapeHtml(room.image)}" alt=""><div><strong>${escapeHtml(room.title)}</strong><p>${escapeHtml(room.titleJa)}</p></div><button class="text-button" data-edit-traces="${room.id}">素材トレース</button></article>`).join("")}</section>`);
  }

  async function traceEditor() {
    const rooms = await repo.all("rooms");
    const products = await repo.all("products");
    const room = rooms.find((item)=>item.id===state.roomId) || rooms[0];
    if (!room) { app.innerHTML = shell(`<div class="admin-empty">部屋を先に作成してください。</div>`); return; }
    state.roomId = room.id;
    app.innerHTML = shell(`<header class="admin-head"><div><p class="micro">STEP 3 / MATERIAL TRACE</p><h1>${escapeHtml(room.title)} Traces</h1></div><select data-room-select>${rooms.map((item)=>`<option value="${item.id}" ${item.id===room.id?"selected":""}>${item.title}</option>`).join("")}</select></header><p class="muted">空間画像をクリックし、位置を％座標で登録します。商品を選んで保存してください。</p><section class="trace-editor" data-trace-editor><img src="${escapeHtml(room.image)}" alt="${escapeHtml(room.titleJa)}">${(room.traces||[]).map((trace,index)=>`<button class="trace-dot" style="left:${trace.x}%;top:${trace.y}%" title="${escapeHtml(trace.label)}">${index+1}</button>`).join("")}</section><form class="admin-panel" id="trace-form" style="margin-top:20px"><input name="x" type="hidden"><input name="y" type="hidden"><div class="admin-grid"><div class="field"><label>トレース名</label><input name="label" placeholder="WALL 01" required></div><div class="field"><label>紐づける商品</label><select name="productId">${products.map((product)=>`<option value="${product.id}">${product.title}</option>`).join("")}</select></div></div><div class="admin-actions"><button class="primary" type="submit" disabled>画像上の位置を選択してください</button><a href="index.html?view=showroom&room=${room.id}">プレビュー</a></div><p class="form-message"></p></form>`);
  }

  async function productList() {
    const products = await repo.all("products");
    app.innerHTML = shell(`<header class="admin-head"><div><p class="micro">INFORMATION LAYER</p><h1>Products</h1></div></header><table class="admin-table"><thead><tr><th>IMAGE</th><th>TITLE</th><th>CODE</th><th>COLOR</th><th>STATUS</th></tr></thead><tbody>${products.map((p)=>`<tr><td><img src="${p.image}" alt="" style="width:52px;height:52px;object-fit:cover"></td><td>${escapeHtml(p.title)}</td><td>${escapeHtml(p.code)}</td><td>${escapeHtml(p.color)}</td><td><span class="status status--draft">DEMO</span></td></tr>`).join("")}</tbody></table>`);
  }

  async function render() {
    if (!sessionStorage.getItem(SESSION_KEY)) { loginScreen(); return; }
    const views = { dashboard, projects: projectList, editor, rooms: roomList, traces: traceEditor, products: productList };
    try { await (views[state.view] || dashboard)(); } catch (error) { app.innerHTML = `<main class="admin-empty"><h1>管理データを読み込めませんでした。</h1><p>${escapeHtml(error.message)}</p></main>`; }
  }

  app.addEventListener("click", async (event) => {
    if (event.target.closest("[data-demo-login]")) { sessionStorage.setItem(SESSION_KEY, "demo-admin"); state.view = "dashboard"; render(); return; }
    if (event.target.closest("[data-logout]")) { sessionStorage.removeItem(SESSION_KEY); render(); return; }
    const view = event.target.closest("[data-admin-view]"); if (view) { state.view = view.dataset.adminView; render(); return; }
    const edit = event.target.closest("[data-edit-project]"); if (edit) { state.projectId = edit.dataset.editProject; state.view = "editor"; render(); return; }
    if (event.target.closest("[data-new-project]")) { state.projectId = `project-${Date.now()}`; state.view = "editor"; render(); return; }
    if (event.target.closest("[data-next-rooms]")) { state.view = "rooms"; render(); return; }
    const traces = event.target.closest("[data-edit-traces]"); if (traces) { state.roomId = traces.dataset.editTraces; state.view = "traces"; render(); }
  });

  app.addEventListener("change", (event) => { if (event.target.matches("[data-room-select]")) { state.roomId = event.target.value; render(); } });

  app.addEventListener("submit", async (event) => {
    if (event.target.id === "project-form") {
      event.preventDefault(); const form = event.target; if (!form.checkValidity()) return form.reportValidity();
      const existing = await repo.get("projects", form.elements.id.value);
      const value = { ...(existing || {}), ...Object.fromEntries(new FormData(form)), roomIds: existing?.roomIds || [] };
      await repo.put("projects", value); state.projectId = value.id; form.querySelector(".form-message").textContent = "IndexedDBに保存しました。";
    }
    if (event.target.id === "trace-form") {
      event.preventDefault(); const form = event.target; if (!state.pendingTrace || !form.checkValidity()) return;
      const room = await repo.get("rooms", state.roomId); const data = Object.fromEntries(new FormData(form));
      const trace = { id: `trace-${Date.now()}`, label: data.label, productId: data.productId, x: Number(data.x), y: Number(data.y) };
      await repo.put("rooms", { ...room, traces: [...(room.traces || []), trace] }); state.pendingTrace = null; render();
    }
  });

  app.addEventListener("click", (event) => {
    const editor = event.target.closest("[data-trace-editor]");
    if (!editor || event.target.closest(".trace-dot")) return;
    const bounds = editor.getBoundingClientRect();
    const x = Math.round(((event.clientX - bounds.left) / bounds.width) * 1000) / 10;
    const y = Math.round(((event.clientY - bounds.top) / bounds.height) * 1000) / 10;
    state.pendingTrace = { x, y };
    const form = document.querySelector("#trace-form");
    form.elements.x.value = x; form.elements.y.value = y;
    const submit = form.querySelector("button[type='submit']"); submit.disabled = false; submit.textContent = `この位置を保存 (${x}%, ${y}%)`;
  });

  let draggedRoom = null;
  app.addEventListener("dragstart", (event) => { const row = event.target.closest("[data-room-row]"); if (row) draggedRoom = row.dataset.roomRow; });
  app.addEventListener("dragover", (event) => { if (event.target.closest("[data-room-row]")) event.preventDefault(); });
  app.addEventListener("drop", async (event) => {
    const target = event.target.closest("[data-room-row]"); if (!target || !draggedRoom || target.dataset.roomRow === draggedRoom) return;
    event.preventDefault(); const rooms = (await repo.all("rooms")).sort((a,b)=>a.order-b.order); const from = rooms.findIndex((item)=>item.id===draggedRoom); const to = rooms.findIndex((item)=>item.id===target.dataset.roomRow); const [moved] = rooms.splice(from,1); rooms.splice(to,0,moved); await Promise.all(rooms.map((room,index)=>repo.put("rooms",{...room,order:index+1}))); draggedRoom=null; render();
  });
  repo.seed().then(render).catch((error) => { app.innerHTML = `<main class="admin-empty"><h1>初期データを準備できませんでした。</h1><p>${escapeHtml(error.message)}</p></main>`; });
})();
