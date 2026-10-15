import { escapeHTML as e, icon, imageSrcset } from "../utils/ui.js";

export function mountProductGallery(product) {
  const mainImage = document.querySelector("#gallery-image");
  const openButton = document.querySelector("#gallery-open");
  const thumbs = [...document.querySelectorAll("[data-image]")];
  const dialog = document.createElement("dialog");
  dialog.id = "image-dialog";
  dialog.className = "image-dialog";
  dialog.setAttribute("aria-labelledby", "image-title");
  dialog.innerHTML = `<header class="image-header"><h2 id="image-title">${e(product.name)}</h2><span id="image-counter" aria-live="polite"></span><button id="image-close" aria-label="Fotoğraf penceresini kapat">${icon("close")}</button></header><div class="image-viewport" role="region" tabindex="0" aria-label="Fotoğraf alanı. Yakınlaştırdıktan sonra sürükleyerek gezinin."><div class="image-plane"><img id="image-full" alt="" draggable="false"></div></div><footer class="image-footer"><div class="image-tools"><button id="image-prev" aria-label="Önceki fotoğraf">${icon("chevron")}</button><button id="image-next" aria-label="Sonraki fotoğraf">${icon("chevron")}</button><button id="image-minus" aria-label="Fotoğrafı uzaklaştır">${icon("minus")}</button><output id="image-zoom" aria-live="polite">100%</output><button id="image-plus" aria-label="Fotoğrafı yakınlaştır">${icon("plus")}</button><button id="image-reset" aria-label="Yakınlaştırmayı sıfırla">${icon("reset")}</button></div><p id="image-help">Yakınlaştırmak için + / −, fare tekerleği veya iki parmağınızı kullanın. Sürükleyerek gezinin.</p><p id="image-error" role="status" hidden>Fotoğraf yüklenemedi. Başka bir fotoğraf seçebilir veya pencereyi kapatabilirsiniz.</p></footer>`;
  document.body.append(dialog);
  const viewport = dialog.querySelector(".image-viewport");
  const plane = dialog.querySelector(".image-plane");
  const image = dialog.querySelector("#image-full");
  const minus = dialog.querySelector("#image-minus");
  const plus = dialog.querySelector("#image-plus");
  const reset = dialog.querySelector("#image-reset");
  const pointers = new Map();
  let index = 0,
    zoom = 1,
    request = 0,
    ready = false,
    pinch = null;

  function select(next) {
    index = (next + product.images.length) % product.images.length;
    mainImage.src = product.images[index];
    mainImage.srcset = imageSrcset(product.images[index]);
    mainImage.alt = `${product.name} — görsel ${index + 1}`;
    thumbs.forEach((button, i) =>
      button.setAttribute("aria-pressed", String(i === index)),
    );
  }

  function layout() {
    if (!dialog.open || !ready) return;
    const fit = Math.min(
      (viewport.clientWidth - 32) / image.naturalWidth,
      (viewport.clientHeight - 32) / image.naturalHeight,
    );
    const width = image.naturalWidth * fit * zoom,
      height = image.naturalHeight * fit * zoom;
    plane.style.width = `${Math.max(viewport.clientWidth, width + 32)}px`;
    plane.style.height = `${Math.max(viewport.clientHeight, height + 32)}px`;
    image.style.width = `${width}px`;
    image.style.height = `${height}px`;
    dialog.querySelector("#image-zoom").value = `${Math.round(zoom * 100)}%`;
    minus.disabled = reset.disabled = zoom <= 1;
    plus.disabled = zoom >= 4;
    viewport.classList.toggle("can-pan", zoom > 1);
  }

  function zoomTo(value, point) {
    if (!ready) return;
    const bounds = viewport.getBoundingClientRect();
    const anchor = point || {
      x: bounds.left + viewport.clientWidth / 2,
      y: bounds.top + viewport.clientHeight / 2,
    };
    const before = image.getBoundingClientRect();
    const x = (anchor.x - before.left) / before.width,
      y = (anchor.y - before.top) / before.height;
    zoom = Math.max(1, Math.min(4, value));
    layout();
    const after = image.getBoundingClientRect();
    viewport.scrollLeft += after.left + x * after.width - anchor.x;
    viewport.scrollTop += after.top + y * after.height - anchor.y;
  }

  async function show(next = index) {
    select(next);
    const current = ++request;
    ready = false;
    zoom = 1;
    pointers.clear();
    pinch = null;
    image.style.visibility = "hidden";
    image.alt = `${product.name} — görsel ${index + 1} / ${product.images.length}`;
    image.src = product.images[index]; // Full-resolution source, independent of thumbnail srcset.
    dialog.querySelector("#image-counter").textContent =
      `${index + 1} / ${product.images.length}`;
    dialog.querySelector("#image-error").hidden = true;
    viewport.setAttribute("aria-busy", "true");
    minus.disabled = plus.disabled = reset.disabled = true;
    if (!dialog.open) {
      dialog.showModal();
      document.body.classList.add("photo-viewer-open");
    }
    try {
      await image.decode();
      if (current !== request || !dialog.open) return;
      ready = true;
      image.style.visibility = "visible";
      layout();
      viewport.scrollTo(0, 0);
    } catch {
      if (current === request && dialog.open)
        dialog.querySelector("#image-error").hidden = false;
    } finally {
      if (current === request) viewport.setAttribute("aria-busy", "false");
    }
  }

  thumbs.forEach((button, i) => (button.onclick = () => select(i)));
  openButton.onclick = () => show();
  function close() {
    request++;
    ready = false;
    pointers.clear();
    pinch = null;
    dialog.close();
    document.body.classList.remove("photo-viewer-open");
  }
  dialog.querySelector("#image-close").onclick = close;
  dialog.querySelector("#image-prev").onclick = () => show(index - 1);
  dialog.querySelector("#image-next").onclick = () => show(index + 1);
  for (const button of dialog.querySelectorAll("#image-prev,#image-next"))
    button.disabled = product.images.length < 2;
  minus.onclick = () => zoomTo(zoom - 0.5);
  plus.onclick = () => zoomTo(zoom + 0.5);
  reset.onclick = () => zoomTo(1);
  dialog.addEventListener("close", () => {
    // A queued close event must not affect a viewer that has reopened already.
    if (dialog.open) return;
    request++;
    pointers.clear();
    document.body.classList.remove("photo-viewer-open");
  });
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    close();
  });
  dialog.addEventListener("click", (event) => {
    const bounds = dialog.getBoundingClientRect();
    if (
      event.target === dialog &&
      (event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom)
    )
      close();
  });
  dialog.addEventListener("keydown", (event) => {
    const actions = {
      ArrowLeft: () => show(index - 1),
      ArrowRight: () => show(index + 1),
      "+": () => zoomTo(zoom + 0.5),
      "=": () => zoomTo(zoom + 0.5),
      "-": () => zoomTo(zoom - 0.5),
      0: () => zoomTo(1),
    };
    if (actions[event.key]) {
      event.preventDefault();
      actions[event.key]();
    }
  });
  viewport.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      zoomTo(zoom * Math.exp(-event.deltaY * 0.002), {
        x: event.clientX,
        y: event.clientY,
      });
    },
    { passive: false },
  );
  viewport.addEventListener("dblclick", (event) =>
    zoomTo(zoom > 1 ? 1 : 2, { x: event.clientX, y: event.clientY }),
  );
  viewport.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    viewport.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = { distance: Math.hypot(a.x - b.x, a.y - b.y), zoom };
    }
    viewport.classList.add("is-panning");
  });
  viewport.addEventListener("pointermove", (event) => {
    const previous = pointers.get(event.pointerId);
    if (!previous) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size === 2 && pinch?.distance > 0) {
      const [a, b] = [...pointers.values()];
      zoomTo((pinch.zoom * Math.hypot(a.x - b.x, a.y - b.y)) / pinch.distance, {
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2,
      });
    } else if (pointers.size === 1 && zoom > 1) {
      viewport.scrollLeft -= event.clientX - previous.x;
      viewport.scrollTop -= event.clientY - previous.y;
    }
  });
  const end = (event) => {
    pointers.delete(event.pointerId);
    pinch = null;
    if (viewport.hasPointerCapture(event.pointerId))
      viewport.releasePointerCapture(event.pointerId);
    if (!pointers.size) viewport.classList.remove("is-panning");
  };
  viewport.addEventListener("pointerup", end);
  viewport.addEventListener("pointercancel", end);
  const observer = new ResizeObserver(layout);
  observer.observe(viewport);
  return () => {
    request++;
    observer.disconnect();
    close();
    dialog.remove();
    document.body.classList.remove("photo-viewer-open");
    openButton.onclick = null;
    thumbs.forEach((button) => (button.onclick = null));
  };
}
