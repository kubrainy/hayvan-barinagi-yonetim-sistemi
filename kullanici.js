document.addEventListener("DOMContentLoaded", function () {
  const { createPetCard, button, showImage, emptyState } = PetUI;
  const grid = document.getElementById("pet-grid");
  const kullaniciId = localStorage.getItem("kullaniciId");

  function sahiplen(hayvan) {
    fetch("http://localhost:3001/api/istek", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hayvanAdi: hayvan.ad,
        gonderen: kullaniciId || "Bilinmeyen kullanıcı"
      })
    })
      .then(res => res.json())
      .then(data => {
        if (!data.success) {
          alert(data.mesaj || "Bu hayvan için zaten bir istek gönderilmiş.");
          return;
        }
        alert("✅ İstek başarıyla gönderildi.");
      })
      .catch(err => {
        console.error("❌ Hata:", err);
        alert("Sunucu hatası, lütfen tekrar deneyin.");
      });
  }

  fetch("http://localhost:3001/api/hayvanlar")
    .then(res => res.json())
    .then(data => {
      if (data.length === 0) {
        grid.append(emptyState("Henüz kayıtlı hayvan yok."));
        return;
      }

      data.forEach(hayvan => {
        // Sahiplendi mi? Rozet mi (kart kendisi ekler), buton mu?
        const actions = hayvan.sahiplendi
          ? []
          : [button({ label: "Sahiplen", variant: "primary", className: "sahiplen-btn", onClick: () => sahiplen(hayvan) })];

        grid.append(createPetCard(hayvan, {
          actions,
          // Fotoğrafa tıklanınca büyük hali göster
          onImageClick: h => showImage(h.foto, h.ad)
        }));
      });
    })
    .catch(err => {
      console.error("❌ Listeleme hatası:", err);
      grid.append(emptyState("Hayvanlar yüklenemedi."));
    });
});
