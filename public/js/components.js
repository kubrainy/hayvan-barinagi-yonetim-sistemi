/* =========================================================
   components.js  -  ortak arayüz bileşenleri
   <site-header>, <site-footer>, modal, buton ve hayvan kartı.
   Tüm sayfalarda <head> içinde, diğer scriptlerden önce yüklenir.
   ========================================================= */
(function () {
  "use strict";

  // API adresi: dosyadan açılınca veya localhost'ta yerel sunucu (3001), yayında aynı alan adındaki /api
  const yerel = location.protocol === "file:" || ["localhost", "127.0.0.1"].includes(location.hostname);
  window.API = yerel ? "http://localhost:3001/api" : "/api";

  // Küçük element üretici: h("a", { class: "btn", href: "#" }, "Metin")
  // Metinler textContent olarak eklenir, HTML olarak yorumlanmaz.
  function h(tag, attrs, ...children) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs || {})) {
      if (value == null || value === false) continue;
      if (key === "class") node.className = value;
      else if (key.startsWith("on") && typeof value === "function") {
        node.addEventListener(key.slice(2).toLowerCase(), value);
      } else node.setAttribute(key, value === true ? "" : value);
    }
    children.flat().forEach(child => {
      if (child != null && child !== false) node.append(child);
    });
    return node;
  }

  const USER_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>';

  const SOCIAL_LINKS = [
    ["Facebook", "img/icons/icons8-facebook.svg"],
    ["X", "img/icons/icons8-x.svg"],
    ["YouTube", "img/icons/icons8-youtube.svg"],
    ["Instagram", "img/icons/icons8-instagram.svg"],
    ["Reddit", "img/icons/icons8-reddit.svg"]
  ];

  // ---------- <site-header action-label="GİRİŞ" action-href="giris.html" [user]> ----------
  class SiteHeader extends HTMLElement {
    connectedCallback() {
      const actions = h("div", { class: "site-header__actions" });

      if (this.hasAttribute("user")) {
        // Giriş sırasında kaydedilen kullanıcı adı (giris.js)
        let kullaniciAdi = "";
        try { kullaniciAdi = localStorage.getItem("kullaniciId") || ""; } catch (_) { /* depolama kapalı olabilir */ }

        const chip = h("span", { class: "user-chip" });
        const icon = h("span", { "aria-hidden": "true" });
        icon.innerHTML = USER_ICON;
        chip.append(icon, h("span", { class: "user-chip__name", title: kullaniciAdi },
          kullaniciAdi ? `Merhaba, ${kullaniciAdi}` : "Merhaba"));
        actions.append(chip);
      }

      actions.append(
        h("a", { class: "btn btn--secondary btn--sm", href: this.getAttribute("action-href") || "index.html" },
          this.getAttribute("action-label") || "AnaSayfa")
      );

      this.replaceChildren(
        h("header", { class: "site-header" },
          h("div", { class: "site-header__inner container" },
            h("a", { class: "brand", href: "index.html" },
              h("img", { class: "brand__logo", src: "img/icons/icons8-pet-50.png", alt: "", width: "40", height: "40" }),
              h("span", { class: "brand__name" }, "PET 4 LİFE")
            ),
            actions
          )
        )
      );
    }
  }

  // ---------- <site-footer> ----------
  class SiteFooter extends HTMLElement {
    connectedCallback() {
      const year = new Date().getFullYear(); // her yıl kendiliğinden güncellenir

      this.replaceChildren(
        h("footer", { class: "site-footer" },
          h("div", { class: "site-footer__inner container" },
            h("ul", { class: "social-links" },
              SOCIAL_LINKS.map(([name, icon]) =>
                h("li", {}, h("a", { href: "#", "aria-label": name }, h("img", { src: icon, alt: "" })))
              )
            ),
            h("div", { class: "site-footer__contact" },
              h("p", {}, `© ${year} Pet 4 Life · Hayvan sahiplenme platformudur.`),
              h("p", {}, "İletişim: 505 217 16 75 / 312 255 10 05 · ",
                h("a", { href: "mailto:pet4u@mail.com" }, "pet4u@mail.com"))
            )
          )
        )
      );
    }
  }

  customElements.define("site-header", SiteHeader);
  customElements.define("site-footer", SiteFooter);

  // ---------- Modal ----------
  // Açmak için: data-modal-open="modal-id"   Kapatmak için: data-modal-close
  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add("is-open");
    document.body.classList.add("has-modal");
    const dialog = modal.querySelector(".modal__dialog");
    if (dialog) dialog.focus();
  }

  function closeModal(modal) {
    if (typeof modal === "string") modal = document.getElementById(modal);
    if (!modal) return;
    modal.classList.remove("is-open");
    if (!document.querySelector(".modal.is-open")) document.body.classList.remove("has-modal");
  }

  document.addEventListener("click", e => {
    const opener = e.target.closest("[data-modal-open]");
    if (opener) return openModal(opener.dataset.modalOpen);

    if (e.target.closest("[data-modal-close]")) return closeModal(e.target.closest(".modal"));

    // Karartılmış arka plana tıklayınca kapat
    if (e.target.classList.contains("modal")) closeModal(e.target);
  });

  // Esc yalnızca en üstteki pencereyi kapatır (ör. form üstünde açılan fotoğraf büyütme)
  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    const acik = document.querySelectorAll(".modal.is-open");
    if (acik.length) closeModal(acik[acik.length - 1]);
  });

  function showImage(src, alt) {
    const img = document.getElementById("modal-image");
    if (!img) return;
    img.src = src;
    img.alt = alt || "";
    openModal("image-modal");
  }

  // ---------- Fotoğraf seçici ----------
  // Telefondan veya bilgisayardan seçilen resim küçültülüp (en uzun kenar 800px, JPEG)
  // veri adresi olarak gizli input'a yazılır; hayvan kaydındaki "foto" alanı budur.
  const MAX_PHOTO_SIDE = 800;
  const MAX_PHOTO_FILE = 20 * 1024 * 1024;

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith("image/")) return reject(new Error("Lütfen bir resim dosyası seçin."));
      if (file.size > MAX_PHOTO_FILE) return reject(new Error("Fotoğraf 20 MB'tan büyük olamaz."));

      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, MAX_PHOTO_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.naturalWidth * scale);
        canvas.height = Math.round(img.naturalHeight * scale);
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#fff"; // şeffaf PNG'ler JPEG'de siyah kalmasın
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Fotoğraf okunamadı. Başka bir dosya deneyin."));
      };
      img.src = url;
    });
  }

  // Alanın içeriğini ayarlar (düzenlerken mevcut fotoğraf, sıfırlarken boş değer)
  function setPhoto(field, value) {
    const preview = field.querySelector(".photo-field__preview");
    field.querySelector("input[type=hidden]").value = value || "";
    field.querySelector("input[type=file]").value = "";
    preview.hidden = !value;
    if (value) preview.src = value; else preview.removeAttribute("src");
    field.querySelector(".photo-field__pick-text").textContent = value ? "Fotoğrafı değiştir" : "Fotoğraf seç";
  }

  document.addEventListener("change", async e => {
    if (!e.target.matches("[data-photo-input]")) return;
    const field = e.target.closest(".photo-field");
    const file = e.target.files[0];
    if (!file) return;

    try {
      setPhoto(field, await fileToDataUrl(file));
    } catch (err) {
      setPhoto(field, field.querySelector("input[type=hidden]").value); // eski seçimi koru
      alert(err.message);
    }
  });

  // Ekleme / düzenleme ekranındaki önizlemeye tıklayınca fotoğraf büyür
  function zoomPreview(el) {
    if (el.getAttribute("src")) showImage(el.src, el.alt);
  }

  document.addEventListener("click", e => {
    if (e.target.matches(".photo-field__preview")) zoomPreview(e.target);
  });

  document.addEventListener("keydown", e => {
    if ((e.key === "Enter" || e.key === " ") && e.target.matches(".photo-field__preview")) {
      e.preventDefault();
      zoomPreview(e.target);
    }
  });

  // ---------- Buton ----------
  // button({ label, variant: "primary" | "secondary" | "danger", onClick, className })
  function button({ label, variant = "secondary", onClick, className = "", type = "button" }) {
    return h("button", { type, class: `btn btn--sm btn--${variant} ${className}`.trim(), onClick }, label);
  }

  // ---------- Rozet ----------
  function adoptedBadge() {
    return h("span", { class: "badge badge--success", "data-adopted": "" }, "✓ Sahiplendi");
  }

  // ---------- Hayvan kartı ----------
  // createPetCard(hayvan, { actions: [button, ...], onImageClick: hayvan => {} })
  function createPetCard(hayvan, { actions = [], onImageClick } = {}) {
    const img = h("img", { class: "pet-card__img", src: hayvan.foto || "", alt: hayvan.ad || "", loading: "lazy" });
    if (onImageClick) img.addEventListener("click", () => onImageClick(hayvan));

    const meta = [
      ["Aşıları", hayvan.asi ? "Yapıldı" : "Yapılmadı"],
      ["Doğum Tarihi", hayvan.dogumTarihi || "Bilinmiyor"],
      ["Şehir", hayvan.sehir || "Belirtilmemiş"],
      ["İletişim", hayvan.iletisim || "Belirtilmemiş"]
    ];

    return h("article", {
        class: "card pet-card" + (onImageClick ? " pet-card--zoomable" : ""),
        "data-ad": hayvan.ad
      },
      h("div", { class: "pet-card__media" }, img),
      h("div", { class: "pet-card__body" },
        h("div", { class: "pet-card__head" },
          h("h3", { class: "pet-card__name" }, hayvan.ad),
          hayvan.sahiplendi && adoptedBadge()
        ),
        h("p", { class: "pet-card__breed" }, hayvan.cins),
        h("dl", { class: "pet-card__meta" },
          meta.map(([label, value]) => h("div", {}, h("dt", {}, label), h("dd", {}, value)))
        ),
        actions.length > 0 && h("div", { class: "pet-card__actions" }, actions)
      )
    );
  }

  // Adı verilen hayvanın kartlarına "Sahiplendi" rozeti ekler
  function markAdopted(ad) {
    document.querySelectorAll(".pet-card").forEach(card => {
      if (card.dataset.ad !== ad || card.querySelector("[data-adopted]")) return;
      card.querySelector(".pet-card__head").append(adoptedBadge());
    });
  }

  // Boş / hata durumu
  function emptyState(text) {
    return h("p", { class: "empty" }, text);
  }

  window.PetUI = { h, openModal, closeModal, showImage, setPhoto, button, createPetCard, markAdopted, emptyState };
})();
