document.addEventListener("DOMContentLoaded", function () {
  fetch("http://localhost:3000/api/hayvanlar")
    .then(res => res.json())
    .then(data => {
      const container = document.querySelector(".pet-gallery");
      const kullaniciId = localStorage.getItem("kullaniciId");

      data.forEach(hayvan => {
        const card = document.createElement("div");
        card.className = "pet-card";
        
        // Sahiplendi mi? Etiket mi, buton mu?
        const sahiplikIcerigi = hayvan.sahiplendi
          ? `<p style="color: green; font-weight: bold;">✅ Sahiplendi</p>`
          : `<button class="sahiplen-btn">Sahiplen</button>`;

        card.innerHTML = `
  <img src="${hayvan.foto}" alt="${hayvan.ad}">
  <div class="pet-info">
    <p>Adı: ${hayvan.ad}</p>
    <p>Cinsi: ${hayvan.cins}</p>
    <p><input type="checkbox" ${hayvan.asi ? "checked" : ""} disabled> Aşıları</p>
    <p>Doğum Tarihi: ${hayvan.dogumTarihi || "Bilinmiyor"}</p>
    <p>Şehir: ${hayvan.sehir || "Belirtilmemiş"}</p>
    <p>İletişim: ${hayvan.iletisim || "Yok"}</p>
    ${sahiplikIcerigi}
  </div>
`;



        // Eğer sahiplenilmemişse butona tıklama işlevi ekle
        const button = card.querySelector(".sahiplen-btn");
        if (button) {
          button.addEventListener("click", function () {
            fetch("http://localhost:3000/api/istek", {
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
          });
        }

        container.appendChild(card);
      });
    })
    .catch(err => console.error("❌ Listeleme hatası:", err));
});
// Fotoğrafa tıklanınca büyük hali göster
document.addEventListener('click', function (e) {
  if (e.target.tagName === 'IMG' && e.target.closest('.pet-card')) {
    const modal = document.getElementById("image-modal");
    const modalImg = document.getElementById("modal-image");
    modalImg.src = e.target.src;
    modal.style.display = "flex";
  }

  // Kapatma işlemi
  if (e.target.id === "modal-close") {
    document.getElementById("image-modal").style.display = "none";
  }
});
