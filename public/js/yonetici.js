// Yönetici paneli (yonetici.html)
document.addEventListener("DOMContentLoaded", function () {
  const { h, createPetCard, button, markAdopted, emptyState, openModal, closeModal, showImage, setPhoto } = PetUI;

  const animalGrid = document.getElementById("animal-grid");
  const requestBox = document.getElementById("request-items");
  let tumHayvanlar = [];

  // ---------- İstatistikler ----------
  function loadStats() {
    return fetch(`${API}/istatistikler`)
      .then(res => res.json())
      .then(stats => {
        document.getElementById("toplam").textContent = stats.toplamHayvan;
        document.getElementById("sahiplendirilen").textContent = stats.sahiplendirilen;
        document.getElementById("barinakta").textContent = stats.barinaktaKalan;
        document.getElementById("istekler").textContent = stats.bekleyenIstek;
      })
      .catch(err => console.error("❌ İstatistikler yüklenemedi:", err));
  }

  loadStats();

  // "Bekleyen İstek" kutusu: istek paneline kaydır ve kısa süre vurgula
  document.querySelectorAll("[data-scroll-to]").forEach(kutu => {
    kutu.addEventListener("click", () => {
      const hedef = document.getElementById(kutu.dataset.scrollTo);
      if (!hedef) return;
      hedef.scrollIntoView({ behavior: "smooth", block: "start" });
      hedef.focus({ preventScroll: true });
      hedef.classList.add("is-highlight");
      setTimeout(() => hedef.classList.remove("is-highlight"), 1600);
    });
  });

  // ---------- Hayvan listesi ----------
  function renderHayvanlar(list) {
    animalGrid.replaceChildren();

    if (list.length === 0) {
      animalGrid.append(emptyState("Gösterilecek hayvan yok."));
      return;
    }

    list.forEach(hayvan => {
      animalGrid.append(createPetCard(hayvan, {
        // Fotoğrafa tıklanınca büyük hali göster
        onImageClick: hayvan => showImage(hayvan.foto, hayvan.ad),
        actions: [
          button({ label: "Düzenle", variant: "secondary", className: "edit-button", onClick: () => openEditForm(hayvan) }),
          button({ label: "Sil", variant: "danger", className: "delete-button", onClick: () => deleteHayvan(hayvan._id) })
        ]
      }));
    });
  }

  function deleteHayvan(id) {
    if (!confirm("Silmek istediğinize emin misiniz?")) return;

    fetch(`${API}/hayvanlar/${id}`, { method: "DELETE" })
      .then(res => res.json())
      .then(() => location.reload());
  }

  // Filtre kutuları (Toplam / Sahiplendirilen / Barınakta Kalan)
  const filtreKutulari = document.querySelectorAll(".stat[data-filter]");
  filtreKutulari.forEach(kutu => {
    kutu.addEventListener("click", () => {
      filtreKutulari.forEach(k => {
        k.classList.toggle("is-active", k === kutu);
        k.setAttribute("aria-pressed", String(k === kutu));
      });

      const filter = kutu.dataset.filter;
      if (filter === "sahiplendi") {
        renderHayvanlar(tumHayvanlar.filter(hayvan => hayvan.sahiplendi));
      } else if (filter === "barinakta") {
        renderHayvanlar(tumHayvanlar.filter(hayvan => !hayvan.sahiplendi));
      } else {
        renderHayvanlar(tumHayvanlar);
      }
    });
  });

  // ---------- Hayvan ekle ----------
  document.getElementById("add-animal-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const f = event.target.elements;

    if (!f.foto.value) {
      alert("Lütfen bir fotoğraf seçin.");
      return;
    }

    fetch(`${API}/hayvanlar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ad: f.ad.value,
        cins: f.cins.value,
        asi: f.asi.checked,
        foto: f.foto.value,
        dogumTarihi: f.dogumTarihi.value,
        sehir: f.sehir.value,
        iletisim: f.iletisim.value
      })
    })
      .then(res => res.json())
      .then(() => {
        alert("Hayvan başarıyla eklendi!");
        closeModal("add-animal-modal");
        event.target.reset();
        setPhoto(event.target.querySelector(".photo-field"), "");
        location.reload();
      })
      .catch(err => {
        console.error("❌ Ekleme hatası:", err);
        alert("Hayvan eklenemedi.");
      });
  });

  // ---------- Hayvan düzenle ----------
  const editForm = document.getElementById("edit-animal-form");

  function openEditForm(hayvan) {
    const f = editForm.elements;
    f["edit-id"].value = hayvan._id;
    f["edit-ad"].value = hayvan.ad || "";
    f["edit-cins"].value = hayvan.cins || "";
    setPhoto(editForm.querySelector(".photo-field"), hayvan.foto); // yeni seçilmezse mevcut fotoğraf korunur
    f["edit-dogum"].value = hayvan.dogumTarihi || "";
    f["edit-sehir"].value = hayvan.sehir || "";
    f["edit-asi"].checked = !!hayvan.asi;
    f["edit-iletisim"].value = hayvan.iletisim || "";
    openModal("edit-animal-modal");
  }

  editForm.addEventListener("submit", function (event) {
    event.preventDefault(); // sayfa yönlendirmesini engeller
    const f = event.target.elements;

    fetch(`${API}/hayvanlar/${f["edit-id"].value}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ad: f["edit-ad"].value,
        cins: f["edit-cins"].value,
        asi: f["edit-asi"].checked,
        foto: f["edit-foto"].value,
        dogumTarihi: f["edit-dogum"].value,
        sehir: f["edit-sehir"].value,
        iletisim: f["edit-iletisim"].value
      })
    })
      .then(res => res.json())
      .then(() => {
        alert("Bilgiler güncellendi!");
        closeModal("edit-animal-modal");
        location.reload();
      })
      .catch(err => {
        console.error("❌ Güncelleme hatası:", err);
        alert("Güncelleme başarısız.");
      });
  });

  // ---------- Sahiplenme istekleri ----------
  function disableOnayla(btn) {
    btn.disabled = true;
    btn.textContent = "Zaten Sahiplendi";
  }

  function istegiOnayla(istek) {
    fetch(`${API}/hayvan-sahiplendir/${encodeURIComponent(istek.hayvanAdi)}`, {
      method: "PATCH"
    })
      .then(res => res.json())
      .then(result => {
        if (!result.success) {
          alert("Hayvan zaten sahiplendirilmiş.");
          return;
        }

        // Aynı hayvana ait tüm isteklerdeki onayla butonlarını devre dışı bırak
        requestBox.querySelectorAll(".request-item").forEach(item => {
          if (item.dataset.ad === istek.hayvanAdi) disableOnayla(item.querySelector(".onayla"));
        });

        // Hayvan kartına "Sahiplendi" rozeti ekle
        markAdopted(istek.hayvanAdi);
        tumHayvanlar.forEach(hayvan => {
          if (hayvan.ad === istek.hayvanAdi) hayvan.sahiplendi = true;
        });
      });
  }

  function istegiReddet(istek, item) {
    fetch(`${API}/istek/${istek._id}`, { method: "DELETE" })
      .then(() => {
        item.remove();
        if (requestBox.children.length === 0) requestBox.append(emptyState("Bekleyen istek yok."));
        loadStats();
      });
  }

  function createRequestItem(istek, zatenSahiplendi) {
    const onaylaBtn = button({ label: "Onayla", variant: "primary", className: "onayla", onClick: () => istegiOnayla(istek) });
    const reddetBtn = button({ label: "Reddet", variant: "danger", className: "reddet", onClick: () => istegiReddet(istek, item) });

    // Hayvan zaten sahiplendiyse onayla butonunu devre dışı bırak
    if (zatenSahiplendi) disableOnayla(onaylaBtn);

    const item = h("div", { class: "request-item", "data-ad": istek.hayvanAdi },
      h("p", { class: "request-item__text" },
        h("strong", {}, istek.gonderen), " kullanıcısı ",
        h("strong", {}, istek.hayvanAdi), " adlı hayvanı sahiplenmek istiyor"
      ),
      h("div", { class: "request-item__actions" }, onaylaBtn, reddetBtn)
    );
    return item;
  }

  function renderIstekler(istekler, hayvanlar) {
    requestBox.replaceChildren();

    if (istekler.length === 0) {
      requestBox.append(emptyState("Bekleyen istek yok."));
      return;
    }

    const sahiplendirilmisAdlar = new Set(
      hayvanlar.filter(hayvan => hayvan.sahiplendi).map(hayvan => (hayvan.ad || "").toLowerCase())
    );

    istekler.forEach(istek => {
      requestBox.append(createRequestItem(istek, sahiplendirilmisAdlar.has((istek.hayvanAdi || "").toLowerCase())));
    });
  }

  // ---------- Verileri yükle ----------
  fetch(`${API}/hayvanlar`)
    .then(res => res.json())
    .then(data => {
      tumHayvanlar = data;
      renderHayvanlar(tumHayvanlar);
    })
    .catch(err => {
      console.error("❌ Hayvanlar yüklenemedi:", err);
      animalGrid.replaceChildren(emptyState("Hayvanlar yüklenemedi."));
    });

  // Kullanıcıların gönderdiği istekleri çeker. Liste değişmediyse yeniden çizmez.
  let sonIstekler = null;

  function loadIstekler() {
    return Promise.all([
      fetch(`${API}/istekler`).then(res => res.json()),
      fetch(`${API}/hayvanlar`).then(res => res.json())
    ])
      .then(([istekler, hayvanlar]) => {
        const imza = istekler.map(istek => istek._id).join(",");
        if (imza === sonIstekler) return;
        sonIstekler = imza;
        renderIstekler(istekler, hayvanlar);
      })
      .catch(err => {
        console.error("❌ Sahiplenme istekleri yüklenemedi:", err);
        // Liste daha önce yüklendiyse olduğu gibi bırak, sadece ilk yüklemede hata göster
        if (sonIstekler === null) requestBox.replaceChildren(emptyState("İstekler yüklenemedi."));
      });
  }

  loadIstekler();

  // Yeni gelen istekler sayfayı yenilemeden düşsün: 10 saniyede bir ve sekmeye dönünce kontrol et
  function yenile() {
    if (document.hidden) return;
    loadStats();
    loadIstekler();
  }

  setInterval(yenile, 10000);
  document.addEventListener("visibilitychange", yenile);
});
