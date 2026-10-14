import * as THREE from "three";
import { createEngine, disposeGroup } from "../three/engine.js";
import { makeRoom, loadFurniture, replaceColor } from "../three/models.js";
import {
  defaultRoom,
  extras,
  uid,
  dimensions,
  clampPlacement,
  overlaps,
  validWindow,
  validateSaved,
  furnitureLibrary,
  startingFurniture,
} from "../three/room-state.js";
import { icon, escapeHTML as e, toast, download } from "../utils/ui.js";

const storageKey = "ali-turan-room-v1";
export async function mountPlanner(main, products) {
  const library = [...furnitureLibrary(products), ...extras];
  let room = defaultRoom(),
    selected = null,
    editingWindow = null,
    editingColumn = null,
    disposed = false;
  const query = new URLSearchParams(location.search);
  const initialProduct =
    products.find((p) => p.id === query.get("model")) ||
    library.find((p) => p.id === query.get("model")) ||
    products[0];
  const initial =
    initialProduct.type === "set"
      ? library.find((p) => p.parentId === initialProduct.id)
      : initialProduct;
  const requested = query.get("color");
  room.furniture.push(...startingFurniture(initialProduct, room, requested));
  selected = room.furniture[0].id;
  const dimensionField = (name, label, min, max, step) =>
    `<div class="unit-field"><label for="room-${name}">${label} (m)</label><input id="room-${name}" data-dimension="${name}" type="number" min="${min}" max="${max}" step="${step}" value="${room[name]}"></div><input type="range" data-dimension="${name}" min="${min}" max="${max}" step="${step}" value="${room[name]}" aria-label="${label} kaydırıcısı">`;
  main.innerHTML = `<div class="wrap"><header class="planner-head"><div><span class="eyebrow">Sizin mekânınız, sizin kompozisyonunuz</span><h1>Odanı <em>tasarla.</em></h1><p>Seçin, sürükleyin, yerleştirin. Tahmini ölçülere dayanan 3D temsillerle yerleşiminizi deneyin.</p></div><div class="planner-actions"><button class="btn outline" id="room-save">${icon("save", 15)} Tasarımı Kaydet</button><button class="btn outline" id="room-load">${icon("rotate", 15)} Kaydı Aç</button><button class="btn outline" id="room-forget">${icon("trash", 15)} Kaydı Sil</button><button class="btn outline" id="room-reset">Odayı Sıfırla</button></div></header><div class="planner-shell"><div class="planner-stage" id="planner-stage"><div class="loading-3d">Yaşam alanınız hazırlanıyor…</div><div class="selection-info" id="selection-info" aria-live="polite"></div><button class="mobile-panel-toggle" id="panel-toggle" aria-expanded="false" aria-controls="planner-panel">Ayarlar ${icon("plus", 16)}</button><div class="axis-label axis-width" id="axis-width"></div><div class="axis-label axis-depth" id="axis-depth"></div><div class="planner-warning" id="planner-warning" role="status"></div><div class="planner-toolbar"><button data-rotate="-1" aria-label="Mobilyayı sola döndür">${icon("rotate", 18)}</button><button data-rotate="1" aria-label="Mobilyayı sağa döndür"><span style="transform:scaleX(-1);display:flex">${icon("rotate", 18)}</span></button><button id="zoom-in" aria-label="Odaya yaklaş">${icon("plus", 18)}</button><button id="zoom-out" aria-label="Odadan uzaklaş">${icon("minus", 18)}</button><button id="camera-reset" aria-label="Kamerayı sıfırla">${icon("reset", 18)}</button><button id="room-screenshot" aria-label="Görünümü PNG olarak kaydet">${icon("camera", 18)}</button><button id="furniture-delete" aria-label="Seçili mobilyayı sil">${icon("trash", 18)}</button></div></div><aside class="planner-panel" id="planner-panel" aria-label="Oda ayarları"><details open><summary>01 — Oda Ölçüleri</summary>${dimensionField("width", "Genişlik", 2, 10, 0.1)}${dimensionField("depth", "Derinlik", 2, 10, 0.1)}${dimensionField("height", "Duvar yüksekliği", 2, 4, 0.1)}</details><details><summary>02 — Duvarlar ve Pencereler</summary><label for="window-wall">Duvar</label><select id="window-wall"><option value="back">Arka duvar · Genişlik (X)</option><option value="side">Yan duvar · Derinlik (Z)</option></select><label for="window-position">Yatay merkez (m)</label><input id="window-position" type="number" min="0" step=".1" value="2"><div class="field-row"><div><label for="window-width">Genişlik (m)</label><input id="window-width" type="number" min=".3" step=".1" value="1.2"></div><div><label for="window-height">Yükseklik (m)</label><input id="window-height" type="number" min=".3" step=".1" value="1.1"></div></div><label for="window-sill">Yerden yükseklik (m)</label><input id="window-sill" type="number" min="0" step=".1" value=".9"><button class="btn outline" id="window-add">Pencere Ekle ${icon("plus", 15)}</button><button class="btn outline" id="window-new" hidden>Yeni Pencere</button><div id="window-list"></div><p class="notice">Ölçüler duvar sınırları içinde kalmalı. Pencereler duvarda gerçek açıklıklar oluşturur.</p></details><details><summary>03 — Kolonlar</summary><div class="field-row"><div><label for="column-width">Genişlik (m)</label><input id="column-width" type="number" min=".15" max="2" step=".05" value=".4"></div><div><label for="column-depth">Derinlik (m)</label><input id="column-depth" type="number" min=".15" max="2" step=".05" value=".4"></div></div><div class="field-row"><div><label for="column-x">X konumu (m)</label><input id="column-x" type="number" step=".1" value=".5"></div><div><label for="column-z">Z konumu (m)</label><input id="column-z" type="number" step=".1" value=".5"></div></div><label for="column-rotation">Dönüş (°)</label><input id="column-rotation" type="number" step="15" value="0"><button class="btn outline" id="column-add">Kolon Ekle ${icon("plus", 15)}</button><button class="btn outline" id="column-new" hidden>Yeni Kolon</button><div id="column-list"></div></details><details open><summary>04 — Mobilyalar</summary><label for="furniture-model">Model seçin</label><select id="furniture-model">${library.map((p) => `<option value="${e(p.id)}" ${p.id === initial.id ? "selected" : ""}>${e(p.name)}</option>`).join("")}</select><button class="btn outline" id="furniture-add">Odaya Ekle ${icon("plus", 15)}</button><button class="btn outline" id="furniture-replace">Seçili Modeli Değiştir</button><div id="furniture-list"></div><div class="field-row"><div><label for="furniture-x">Seçili X (m)</label><input id="furniture-x" type="number" step=".1"></div><div><label for="furniture-z">Seçili Z (m)</label><input id="furniture-z" type="number" step=".1"></div></div><label for="furniture-angle">Seçili dönüş (°)</label><input id="furniture-angle" type="number" step="15"><p class="notice">Mobilyayı seçip sürükleyin. Klavye: oklar ile taşıma, R ile döndürme, Delete ile silme. Boş alanda sürükleyerek kamerayı çevirin.</p></details><details open><summary>05 — Renk ve Malzemeler</summary><p class="small-label" id="selected-color">Görseldeki renk</p><div class="swatches" id="planner-colors"></div><p class="notice">3D modeller yaklaşık temsillerdir. Kesin ölçüler ve kumaş seçenekleri için bizimle görüşün.</p></details><button class="btn" id="view-save">Görünümü Kaydet ${icon("camera", 16)}</button><p class="notice">Tasarımlar yalnızca bu tarayıcıda saklanır. Şirkete gönderilmez.</p></aside></div></div>`;
  const host = main.querySelector("#planner-stage");
  let engine;
  try {
    engine = createEngine(host);
  } catch {
    host.querySelector(".loading-3d").textContent =
      "WebGL bu tarayıcıda kullanılamıyor. 3D tasarımcı için güncel, WebGL destekli bir tarayıcı kullanın.";
    main
      .querySelectorAll("button,input,select")
      .forEach((el) => (el.disabled = true));
    return () => {};
  }
  const { scene, canvas, camera, controls } = engine;
  canvas.tabIndex = 0;
  canvas.setAttribute(
    "aria-label",
    "Etkileşimli 3D oda. Ok tuşları ile seçili mobilyayı taşıyın.",
  );
  canvas.setAttribute("role", "application");
  canvas.style.position = "absolute";
  canvas.style.inset = "0";
  let roomMesh,
    outline = null;
  const models = new Map(),
    pending = new Map();
  const productFor = (item) => library.find((p) => p.id === item.productId);
  const number = (id) => Number(main.querySelector(`#${id}`).value);
  const findSelected = () => room.furniture.find((f) => f.id === selected);
  function warning() {
    const messages = [];
    for (let i = 0; i < room.furniture.length; i++) {
      const a = room.furniture[i],
        product = productFor(a);
      if (product.type === "rug") continue;
      for (const b of room.furniture.slice(i + 1)) {
        const other = productFor(b);
        if (
          other.type !== "rug" &&
          overlaps(a, dimensions(product), b, dimensions(other))
        )
          messages.push("Bazı mobilyalar üst üste geliyor.");
      }
      for (const column of room.columns)
        if (overlaps(a, dimensions(product), column, column))
          messages.push("Mobilya ve kolon yerleşimi çakışıyor.");
    }
    main.querySelector("#planner-warning").textContent = [
      ...new Set(messages),
    ].join(" ");
  }
  function select(id) {
    selected = id;
    updateSelection();
  }
  function updateSelection() {
    outline?.removeFromParent();
    outline?.geometry.dispose();
    outline?.material.dispose();
    outline = null;
    const item = findSelected(),
      p = item && productFor(item);
    if (item) {
      const s = dimensions(p),
        points = [
          [-1, -1],
          [-1, 1],
          [1, 1],
          [1, -1],
          [-1, -1],
        ].map(
          ([x, z]) =>
            new THREE.Vector3((x * s.width) / 2, 0.025, (z * s.depth) / 2),
        );
      outline = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineBasicMaterial({ color: "#92745d" }),
      );
      outline.position.set(item.x, 0, item.z);
      outline.rotation.y = item.rotation;
      scene.add(outline);
    }
    main.querySelector("#selection-info").innerHTML = item
      ? `<strong>${e(p.name)}</strong>${p.dimensions.width} × ${p.dimensions.depth} cm · Tahmini ölçüler<br>Seçili mobilyayı sürükleyerek taşıyın.`
      : "<strong>Mekânınıza alan açın.</strong>Bir mobilya ekleyin veya seçin.";
    for (const [key, value] of [
      ["x", item?.x],
      ["z", item?.z],
      ["angle", item ? (item.rotation * 180) / Math.PI : undefined],
    ]) {
      const input = main.querySelector(`#furniture-${key}`);
      input.value = value === undefined ? "" : Number(value.toFixed(2));
      input.disabled = !item;
    }
    main.querySelector("#furniture-delete").disabled = !item;
    main.querySelector("#furniture-replace").disabled = !item;
    main.querySelectorAll("[data-rotate]").forEach((b) => (b.disabled = !item));
    main.querySelector("#planner-colors").innerHTML = item
      ? p.colors
          .map(
            (c) =>
              `<button data-room-color="${e(c.hex)}" aria-label="${e(c.name)} rengi" aria-pressed="${c.hex === item.color}" style="background:${e(c.hex)}"></button>`,
          )
          .join("")
      : "";
    main.querySelector("#selected-color").textContent = item
      ? `${p.name} · ${p.colors.find((c) => c.hex === item.color)?.name || "Renk"}`
      : "Renk seçmek için bir mobilya seçin.";
    main.querySelectorAll("[data-room-color]").forEach(
      (btn) =>
        (btn.onclick = () => {
          const active = findSelected();
          if (!active) return;
          active.color = btn.dataset.roomColor;
          if (models.has(active.id))
            replaceColor(models.get(active.id), active.color);
          updateSelection();
        }),
    );
    main.querySelector("#furniture-list").innerHTML =
      room.furniture
        .map(
          (f) =>
            `<div class="planner-object"><button data-select-furniture="${f.id}" aria-pressed="${selected === f.id}">${e(productFor(f).name)}${selected === f.id ? " · Seçili" : ""}</button><button data-delete-furniture="${f.id}" aria-label="${e(productFor(f).name)} sil">${icon("trash", 14)}</button></div>`,
        )
        .join("") || '<p class="planner-empty">Henüz mobilya eklenmedi.</p>';
    main
      .querySelectorAll("[data-select-furniture]")
      .forEach((b) => (b.onclick = () => select(b.dataset.selectFurniture)));
    main
      .querySelectorAll("[data-delete-furniture]")
      .forEach(
        (b) => (b.onclick = () => deleteFurniture(b.dataset.deleteFurniture)),
      );
    warning();
  }
  function syncModels() {
    const ids = new Set(room.furniture.map((f) => f.id));
    for (const [id, model] of models)
      if (
        !ids.has(id) ||
        model.userData.productId !==
          room.furniture.find((f) => f.id === id)?.productId
      ) {
        disposeGroup(model);
        models.delete(id);
      }
    for (const item of room.furniture) {
      const model = models.get(item.id);
      if (model) {
        model.position.set(item.x, 0, item.z);
        model.rotation.y = item.rotation;
        replaceColor(model, item.color);
        continue;
      }
      if (pending.get(item.id) === item.productId) continue;
      const targetProduct = item.productId;
      pending.set(item.id, targetProduct);
      loadFurniture(productFor(item), item.color).then((group) => {
        if (pending.get(item.id) === targetProduct) pending.delete(item.id);
        const current = room.furniture.find((f) => f.id === item.id);
        if (
          disposed ||
          !current ||
          current.productId !== targetProduct ||
          models.has(item.id)
        ) {
          disposeGroup(group);
          return;
        }
        group.userData.instanceId = item.id;
        group.position.set(current.x, 0, current.z);
        group.rotation.y = current.rotation;
        replaceColor(group, current.color);
        scene.add(group);
        models.set(item.id, group);
        if (group.userData.loadFailed)
          toast("Ürün modeli yüklenemedi; örnek model gösteriliyor.");
        updateSelection();
      });
    }
    updateSelection();
  }
  function architecture() {
    if (roomMesh) disposeGroup(roomMesh);
    roomMesh = makeRoom(room);
    scene.add(roomMesh);
    main.querySelector("#axis-width").textContent =
      `Genişlik · X: ${room.width.toFixed(1)} m`;
    main.querySelector("#axis-depth").textContent =
      `Derinlik · Z: ${room.depth.toFixed(1)} m`;
    main.querySelector("#window-list").innerHTML = room.windows
      .map(
        (w, i) =>
          `<div class="planner-object"><button data-edit-window="${w.id}">Pencere ${i + 1} · ${w.wall === "back" ? "Arka" : "Yan"}</button><button data-remove-window="${w.id}" aria-label="Pencere ${i + 1} sil">${icon("trash", 14)}</button></div>`,
      )
      .join("");
    main.querySelectorAll("[data-remove-window]").forEach(
      (b) =>
        (b.onclick = () => {
          room.windows = room.windows.filter(
            (w) => w.id !== b.dataset.removeWindow,
          );
          resetWindowEdit();
          architecture();
        }),
    );
    main.querySelectorAll("[data-edit-window]").forEach(
      (b) =>
        (b.onclick = () => {
          const w = room.windows.find((w) => w.id === b.dataset.editWindow);
          editingWindow = w.id;
          for (const key of ["wall", "position", "width", "height", "sill"])
            main.querySelector(`#window-${key}`).value = w[key];
          main.querySelector("#window-add").textContent = "Pencereyi Güncelle";
          main.querySelector("#window-new").hidden = false;
        }),
    );
    main.querySelector("#column-list").innerHTML = room.columns
      .map(
        (c, i) =>
          `<div class="planner-object"><button data-edit-column="${c.id}">Kolon ${i + 1}</button><button data-remove-column="${c.id}" aria-label="Kolon ${i + 1} sil">${icon("trash", 14)}</button></div>`,
      )
      .join("");
    main.querySelectorAll("[data-remove-column]").forEach(
      (b) =>
        (b.onclick = () => {
          room.columns = room.columns.filter(
            (c) => c.id !== b.dataset.removeColumn,
          );
          resetColumnEdit();
          architecture();
        }),
    );
    main.querySelectorAll("[data-edit-column]").forEach(
      (b) =>
        (b.onclick = () => {
          const c = room.columns.find((c) => c.id === b.dataset.editColumn);
          editingColumn = c.id;
          for (const key of ["width", "depth", "x", "z", "rotation"])
            main.querySelector(`#column-${key}`).value =
              key === "rotation" ? (c[key] * 180) / Math.PI : c[key];
          main.querySelector("#column-add").textContent = "Kolonu Güncelle";
          main.querySelector("#column-new").hidden = false;
        }),
    );
    warning();
  }
  function resetWindowEdit() {
    editingWindow = null;
    main.querySelector("#window-add").textContent = "Pencere Ekle";
    main.querySelector("#window-new").hidden = true;
  }
  function resetColumnEdit() {
    editingColumn = null;
    main.querySelector("#column-add").textContent = "Kolon Ekle";
    main.querySelector("#column-new").hidden = true;
  }
  main.querySelector("#window-new").onclick = resetWindowEdit;
  main.querySelector("#column-new").onclick = resetColumnEdit;
  function syncDimensionInputs() {
    main
      .querySelectorAll("[data-dimension]")
      .forEach((input) => (input.value = room[input.dataset.dimension]));
  }
  main.querySelectorAll("[data-dimension]").forEach(
    (input) =>
      (input.onchange = () => {
        const name = input.dataset.dimension,
          value = Number(input.value),
          min = Number(input.min),
          max = Number(input.max);
        if (!Number.isFinite(value) || value < min || value > max) {
          toast("Oda ölçüsü belirtilen aralıkta olmalı.");
          syncDimensionInputs();
          return;
        }
        room[name] = value;
        const previous = room.furniture.length;
        room.furniture = room.furniture.filter((item) =>
          clampPlacement(item, dimensions(productFor(item)), room),
        );
        room.columns = room.columns.filter((c) => clampPlacement(c, c, room));
        const kept = [];
        for (const win of room.windows)
          if (validWindow(win, room, kept)) kept.push(win);
        if (kept.length !== room.windows.length)
          toast("Yeni ölçülere sığmayan pencereler kaldırıldı.");
        room.windows = kept;
        if (previous !== room.furniture.length)
          toast("Yeni odaya sığmayan mobilyalar kaldırıldı.");
        if (!findSelected()) selected = room.furniture[0]?.id || null;
        syncDimensionInputs();
        architecture();
        syncModels();
        engine.reset(room.width, room.depth, room.height);
      }),
  );
  main.querySelector("#window-add").onclick = () => {
    if (room.windows.length >= 20 && !editingWindow) {
      toast("En fazla 20 pencere ekleyebilirsiniz.");
      return;
    }
    const win = {
      id: editingWindow || uid(),
      wall: main.querySelector("#window-wall").value,
      position: number("window-position"),
      width: number("window-width"),
      height: number("window-height"),
      sill: number("window-sill"),
    };
    if (!validWindow(win, room, room.windows)) {
      toast(
        "Pencere duvar sınırları içinde olmalı ve diğer pencerelerle çakışmamalı.",
      );
      return;
    }
    room.windows = room.windows.filter((w) => w.id !== win.id);
    room.windows.push(win);
    resetWindowEdit();
    architecture();
  };
  main.querySelector("#column-add").onclick = () => {
    if (room.columns.length >= 20 && !editingColumn) {
      toast("En fazla 20 kolon ekleyebilirsiniz.");
      return;
    }
    const column = {
      id: editingColumn || uid(),
      width: number("column-width"),
      depth: number("column-depth"),
      x: number("column-x"),
      z: number("column-z"),
      rotation: (number("column-rotation") * Math.PI) / 180,
    };
    if (
      ![column.width, column.depth, column.x, column.z, column.rotation].every(
        Number.isFinite,
      ) ||
      column.width < 0.15 ||
      column.depth < 0.15 ||
      column.width > 2 ||
      column.depth > 2 ||
      !clampPlacement(column, column, room)
    ) {
      toast("Kolon ölçülerini ve konumunu kontrol edin.");
      return;
    }
    room.columns = room.columns.filter((c) => c.id !== column.id);
    room.columns.push(column);
    resetColumnEdit();
    architecture();
  };
  main.querySelector("#furniture-add").onclick = () => {
    if (room.furniture.length >= 30) {
      toast("En fazla 30 mobilya ekleyebilirsiniz.");
      return;
    }
    const p = library.find(
        (p) => p.id === main.querySelector("#furniture-model").value,
      ),
      item = {
        id: uid(),
        productId: p.id,
        x: room.width / 2,
        z: room.depth * 0.65,
        rotation: 0,
        color: p.colors[0].hex,
      };
    if (!clampPlacement(item, dimensions(p), room)) {
      toast("Bu model mevcut oda ölçülerine sığmıyor.");
      return;
    }
    room.furniture.push(item);
    selected = item.id;
    syncModels();
  };
  main.querySelector("#furniture-replace").onclick = () => {
    const active = findSelected();
    if (!active) return;
    const p = library.find(
        (p) => p.id === main.querySelector("#furniture-model").value,
      ),
      replacement = { ...active, productId: p.id, color: p.colors[0].hex };
    if (!clampPlacement(replacement, dimensions(p), room)) {
      toast("Yeni model odaya sığmıyor.");
      return;
    }
    Object.assign(active, replacement);
    syncModels();
  };
  function deleteFurniture(id = selected) {
    room.furniture = room.furniture.filter((f) => f.id !== id);
    if (selected === id) selected = room.furniture[0]?.id || null;
    syncModels();
  }
  main.querySelector("#furniture-delete").onclick = () => deleteFurniture();
  function moveSelected(x, z, rotation) {
    const item = findSelected();
    if (!item) return;
    const next = { ...item, x, z, rotation };
    if (
      ![x, z, rotation].every(Number.isFinite) ||
      !clampPlacement(next, dimensions(productFor(item)), room)
    ) {
      toast("Mobilya bu dönüşle oda sınırlarına sığmıyor.");
      updateSelection();
      return;
    }
    Object.assign(item, next);
    const model = models.get(item.id);
    if (model) {
      model.position.set(item.x, 0, item.z);
      model.rotation.y = item.rotation;
    }
    updateSelection();
  }
  main.querySelectorAll("[data-rotate]").forEach(
    (b) =>
      (b.onclick = () => {
        const item = findSelected();
        if (item)
          moveSelected(
            item.x,
            item.z,
            item.rotation + (Number(b.dataset.rotate) * Math.PI) / 12,
          );
      }),
  );
  for (const key of ["x", "z", "angle"])
    main.querySelector(`#furniture-${key}`).onchange = () =>
      moveSelected(
        number("furniture-x"),
        number("furniture-z"),
        (number("furniture-angle") * Math.PI) / 180,
      );
  main.querySelector("#zoom-in").onclick = () => engine.zoom(1.15);
  main.querySelector("#zoom-out").onclick = () => engine.zoom(1 / 1.15);
  main.querySelector("#camera-reset").onclick = () =>
    engine.reset(room.width, room.depth, room.height);
  const screenshot = () => {
    try {
      download(engine.capture(), "ali-turan-oda.png");
      toast("Görünüm PNG olarak kaydedildi.");
    } catch {
      toast(
        "Görünüm kaydedilemedi. Model dosyalarının aynı kaynaktan yüklendiğini kontrol edin.",
      );
    }
  };
  main.querySelector("#room-screenshot").onclick = screenshot;
  main.querySelector("#view-save").onclick = screenshot;
  main.querySelector("#room-save").onclick = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ version: 1, room }));
      toast("Tasarım bu tarayıcıya kaydedildi.");
    } catch {
      toast("Tarayıcı yerel depolama izni vermedi.");
    }
  };
  main.querySelector("#room-load").onclick = () => {
    try {
      const data = localStorage.getItem(storageKey);
      if (!data) {
        toast("Henüz kaydedilmiş bir tasarım yok.");
        return;
      }
      room = validateSaved(JSON.parse(data), library);
      selected = room.furniture[0]?.id || null;
      resetWindowEdit();
      resetColumnEdit();
      syncDimensionInputs();
      architecture();
      syncModels();
      engine.reset(room.width, room.depth, room.height);
      toast("Kaydedilmiş tasarım açıldı.");
    } catch (error) {
      toast(`Kayıt açılamadı: ${error.message}`);
    }
  };
  main.querySelector("#room-forget").onclick = () => {
    try {
      localStorage.removeItem(storageKey);
      toast("Kaydedilmiş tasarım silindi.");
    } catch {
      toast("Tarayıcı kayda erişim izni vermedi.");
    }
  };
  main.querySelector("#room-reset").onclick = () => {
    room = defaultRoom();
    selected = null;
    resetWindowEdit();
    resetColumnEdit();
    syncDimensionInputs();
    architecture();
    syncModels();
    engine.reset(room.width, room.depth, room.height);
    toast("Oda sıfırlandı. Kaydedilmiş tasarım korunuyor.");
  };
  main.querySelector("#panel-toggle").onclick = () => {
    const open = main.querySelector("#planner-panel").classList.toggle("open");
    main
      .querySelector("#panel-toggle")
      .setAttribute("aria-expanded", String(open));
    main.querySelector("#panel-toggle").innerHTML =
      `Ayarlar ${icon(open ? "minus" : "plus", 16)}`;
    if (open)
      main.querySelector("#planner-panel").scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
        block: "nearest",
      });
  };
  const raycaster = new THREE.Raycaster(),
    pointer = new THREE.Vector2(),
    plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  let dragging = null,
    offset = new THREE.Vector3();
  function point(event) {
    const rect = canvas.getBoundingClientRect();
    pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      (-(event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);
    return raycaster.ray.intersectPlane(plane, new THREE.Vector3());
  }
  function instance(object) {
    while (object) {
      if (object.userData.instanceId) return object.userData.instanceId;
      object = object.parent;
    }
    return null;
  }
  const down = (event) => {
    if (event.button !== 0) return;
    const location = point(event);
    const hit = raycaster
      .intersectObjects([...models.values()], true)
      .find((h) => instance(h.object));
    if (!hit) return;
    select(instance(hit.object));
    const item = findSelected();
    if (!location || !item) return;
    dragging = item.id;
    offset.set(item.x - location.x, 0, item.z - location.z);
    controls.enabled = false;
    canvas.setPointerCapture(event.pointerId);
    event.stopImmediatePropagation();
    canvas.focus({ preventScroll: true });
  };
  const move = (event) => {
    if (!dragging) return;
    const location = point(event),
      item = room.furniture.find((f) => f.id === dragging);
    if (location && item) {
      moveSelected(location.x + offset.x, location.z + offset.z, item.rotation);
    }
  };
  const up = (event) => {
    if (!dragging) return;
    dragging = null;
    controls.enabled = true;
    if (canvas.hasPointerCapture(event.pointerId))
      canvas.releasePointerCapture(event.pointerId);
  };
  canvas.addEventListener("pointerdown", down, true);
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);
  const keyboard = (event) => {
    const item = findSelected();
    if (!item) return;
    const step = event.shiftKey ? 0.2 : 0.05;
    if (
      [
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "r",
        "R",
        "Delete",
        "Backspace",
      ].includes(event.key)
    )
      event.preventDefault();
    if (event.key === "Delete" || event.key === "Backspace") deleteFurniture();
    else if (["r", "R"].includes(event.key))
      moveSelected(item.x, item.z, item.rotation + Math.PI / 12);
    else if (event.key === "ArrowLeft")
      moveSelected(item.x - step, item.z, item.rotation);
    else if (event.key === "ArrowRight")
      moveSelected(item.x + step, item.z, item.rotation);
    else if (event.key === "ArrowUp")
      moveSelected(item.x, item.z - step, item.rotation);
    else if (event.key === "ArrowDown")
      moveSelected(item.x, item.z + step, item.rotation);
  };
  canvas.addEventListener("keydown", keyboard);
  const lost = () =>
    toast("3D görüntüleme kesildi. Tasarımınızı kaydedip sayfayı yenileyin.");
  host.addEventListener("webgl-lost", lost);
  architecture();
  syncModels();
  engine.reset(room.width, room.depth, room.height);
  return () => {
    disposed = true;
    canvas.removeEventListener("pointerdown", down, true);
    canvas.removeEventListener("pointermove", move);
    canvas.removeEventListener("pointerup", up);
    canvas.removeEventListener("pointercancel", up);
    canvas.removeEventListener("keydown", keyboard);
    host.removeEventListener("webgl-lost", lost);
    engine.dispose();
    models.clear();
  };
}
