document.addEventListener("DOMContentLoaded", function () {
  console.log("JS dosyası yüklendi");

  fetch("http://localhost:3000/api/istatistikler")
    .then(res => res.json())
    .then(stats => {
      document.getElementById("toplam").textContent = `Toplam Hayvan: ${stats.toplamHayvan}`;
      document.getElementById("sahiplendirilen").textContent = `Sahiplendirilen: ${stats.sahiplendirilen}`;
      document.getElementById("barinakta").textContent = `Barınakta Kalan: ${stats.barinaktaKalan}`;
      document.getElementById("istekler").textContent = `Bekleyen İstek: ${stats.bekleyenIstek}`;
    });

  document.querySelectorAll('.add-animal').forEach(button => {
    button.addEventListener('click', function () {
      document.getElementById('add-animal-form').style.display = 'block';
    });
  });

  let tumHayvanlar = [];

  fetch("http://localhost:3000/api/hayvanlar")
    .then(res => res.json())
    .then(data => {
      tumHayvanlar = data;
      renderHayvanlar(tumHayvanlar);
    });

 function renderHayvanlar(list) {
  const container = document.querySelector('.animal-list');
  if (!container) return;
  container.querySelectorAll(".pet-card").forEach(card => card.remove());

  list.forEach(hayvan => {  // 🔧 Eksik olan forEach eklendi
    const card = document.createElement("div");
    card.className = "pet-card";
    card.innerHTML = `
      <img src="${hayvan.foto}" alt="${hayvan.ad}">
      <div class="pet-info">
        <p>Adı: ${hayvan.ad}</p>
        <p>Cinsi: ${hayvan.cins}</p>
        <p><input type="checkbox" ${hayvan.asi ? 'checked' : ''} disabled> Aşıları</p>
        <p>Doğum Tarihi: ${hayvan.dogumTarihi || "Bilinmiyor"}</p>
        <p>Şehir: ${hayvan.sehir || "Belirtilmemiş"}</p>
        <p>İletişim: ${hayvan.iletisim || "Belirtilmemiş"}</p>
        ${hayvan.sahiplendi ? '<p style="color:green;font-weight:bold">✅ Sahiplendi</p>' : ''}
        <button class="edit-button"
          data-id="${hayvan._id}"
          data-ad="${hayvan.ad}"
          data-cins="${hayvan.cins}"
          data-asi="${hayvan.asi}"
          data-foto="${hayvan.foto}"
          data-dogum="${hayvan.dogumTarihi || ''}"
          data-sehir="${hayvan.sehir || ''}"
          data-iletisim="${hayvan.iletisim || ''}">
          Düzenle
        </button>
        <button class="delete-button" data-id="${hayvan._id}">Sil</button>
      </div>
    `;
    container.insertBefore(card, container.querySelector('.add-animal'));
  });

  // Silme butonları
  document.querySelectorAll('.delete-button').forEach(button => {
    button.addEventListener('click', function () {
      const id = this.dataset.id;
      if (confirm("Silmek istediğinize emin misiniz?")) {
        fetch(`http://localhost:3000/api/hayvanlar/${id}`, {
          method: 'DELETE'
        })
          .then(res => res.json())
          .then(() => location.reload());
      }
    });
  });
}


  document.querySelectorAll(".istatistik-kutu").forEach(kutu => {
    const filter = kutu.dataset.filter;
    kutu.addEventListener("click", () => {
      document.querySelectorAll(".istatistik-kutu").forEach(k => k.classList.remove("aktif-kutu"));
      kutu.classList.add("aktif-kutu");

      if (filter === "all") {
        renderHayvanlar(tumHayvanlar);
      } else if (filter === "sahiplendi") {
        renderHayvanlar(tumHayvanlar.filter(h => h.sahiplendi));
      } else if (filter === "barinakta") {
        renderHayvanlar(tumHayvanlar.filter(h => !h.sahiplendi));
      }
    });
  });

  window.addAnimal = function (event) {
    event.preventDefault();
    const ad = document.querySelector('[name="ad"]').value;
    const cins = document.querySelector('[name="cins"]').value;
    const asi = document.querySelector('[name="asi"]').checked;
    const foto = document.querySelector('[name="foto"]').value;
    const dogumTarihi = document.querySelector('[name="dogumTarihi"]').value;
    const sehir = document.querySelector('[name="sehir"]').value;
    const iletisim = document.querySelector('[name="iletisim"]').value;

    fetch('http://localhost:3000/api/hayvanlar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ad, cins, asi, foto, dogumTarihi, sehir, iletisim })
    })
      .then(res => res.json())
      .then(() => {
        alert("Hayvan başarıyla eklendi!");
        document.getElementById('add-animal-form').style.display = 'none';
        event.target.reset();
        location.reload();
      });
  };
});

// Düzenle butonu
document.addEventListener('click', function (e) {
  if (e.target.classList.contains('edit-button')) {
    const modal = document.getElementById('edit-animal-form');
    modal.style.display = 'block';
    modal.querySelector('[name="edit-id"]').value = e.target.dataset.id;
    modal.querySelector('[name="edit-ad"]').value = e.target.dataset.ad;
    modal.querySelector('[name="edit-cins"]').value = e.target.dataset.cins;
    modal.querySelector('[name="edit-foto"]').value = e.target.dataset.foto;
    modal.querySelector('[name="edit-dogum"]').value = e.target.dataset.dogum;
    modal.querySelector('[name="edit-sehir"]').value = e.target.dataset.sehir;
    modal.querySelector('[name="edit-asi"]').checked = e.target.dataset.asi === 'true';
    modal.querySelector('[name="edit-iletisim"]').value = e.target.dataset.iletisim || "";
  }
});


function updateAnimal(event) {
  event.preventDefault(); // sayfa yönlendirmesini engeller

  const id = document.querySelector('[name="edit-id"]').value;
  const ad = document.querySelector('[name="edit-ad"]').value;
  const cins = document.querySelector('[name="edit-cins"]').value;
  const asi = document.querySelector('[name="edit-asi"]').checked;
  const foto = document.querySelector('[name="edit-foto"]').value;
  const dogumTarihi = document.querySelector('[name="edit-dogum"]').value;
  const sehir = document.querySelector('[name="edit-sehir"]').value;
  const iletisim = document.querySelector('[name="edit-iletisim"]').value;

  fetch(`http://localhost:3000/api/hayvanlar/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ad, cins, asi, foto, dogumTarihi, sehir, iletisim })
  })
    .then(res => res.json())
    .then(() => {
      alert("Bilgiler güncellendi!");
      document.getElementById("edit-animal-form").style.display = "none";
      location.reload();
    })
    .catch(err => {
      console.error("❌ Güncelleme hatası:", err);
      alert("Güncelleme başarısız.");
    });
}
// Sahiplenme isteklerini getir
fetch("http://localhost:3000/api/istekler")
  .then(res => res.json())
  .then(data => {
    const container = document.querySelector(".request-list");
    const title = container.querySelector("h2");

    // Sahiplendirilmiş hayvanları çek
    fetch("http://localhost:3000/api/hayvanlar")
      .then(res => res.json())
      .then(hayvanlar => {
        const sahiplendirilmisHayvanAdlari = hayvanlar
          .filter(h => h.sahiplendi)
          .map(h => h.ad.toLowerCase());

        data.forEach(istek => {
          const item = document.createElement("div");
          item.className = "request-item";
          item.innerHTML = `
            <p>${istek.gonderen} kullanıcısı ${istek.hayvanAdi} adlı hayvanı sahiplenmek istiyor</p>
            <button class="onayla">Onayla</button>
            <button class="reddet">Reddet</button>
          `;

          const onaylaBtn = item.querySelector(".onayla");
          const reddetBtn = item.querySelector(".reddet");

          // Eğer zaten sahiplendiyse, onayla butonunu devre dışı bırak
          if (sahiplendirilmisHayvanAdlari.includes(istek.hayvanAdi.toLowerCase())) {
            onaylaBtn.disabled = true;
            onaylaBtn.textContent = "Zaten Sahiplendi";
          }

          // ONAYLA
          onaylaBtn.addEventListener("click", () => {
            fetch(`http://localhost:3000/api/hayvan-sahiplendir/${encodeURIComponent(istek.hayvanAdi)}`, {
              method: "PATCH"
            })
              .then(res => res.json())
              .then(result => {
                if (result.success) {
                  // Tüm aynı hayvana ait isteklerdeki onayla butonlarını devre dışı bırak
                  document.querySelectorAll(".request-item").forEach(el => {
                    if (el.textContent.includes(istek.hayvanAdi)) {
                      const btn = el.querySelector(".onayla");
                      if (btn) {
                        btn.disabled = true;
                        btn.textContent = "Zaten Sahiplendi";
                      }
                    }
                  });

                  // Hayvan kartına "Sahiplendi" etiketi ekleyin
                  const kartlar = document.querySelectorAll(".pet-card");
                  kartlar.forEach(kart => {
                    if (kart.textContent.includes(istek.hayvanAdi)) {
                      const info = kart.querySelector(".pet-info");
                      if (!info.innerHTML.includes("Sahiplendi")) {
                        const etiket = document.createElement("p");
                        etiket.textContent = "✅ Sahiplendi";
                        etiket.style.color = "green";
                        etiket.style.fontWeight = "bold";
                        info.appendChild(etiket);
                      }
                    }
                  });
                } else {
                  alert("Hayvan zaten sahiplendirilmiş.");
                }
              });
          });

          // REDDET
          reddetBtn.addEventListener("click", () => {
            fetch(`http://localhost:3000/api/istek/${istek._id}`, {
              method: "DELETE"
            })
              .then(() => item.remove());
          });

          container.appendChild(item);
        });

        if (data.length === 0) {
          const p = document.createElement("p");
          p.textContent = "Bekleyen istek yok.";
          container.appendChild(p);
        }
      });
  })
  .catch(err => console.error("❌ Sahiplenme istekleri yüklenemedi:", err));
