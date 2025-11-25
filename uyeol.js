document.getElementById("uyeForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const ad = document.querySelector('[name="ad"]').value;
  const soyad = document.querySelector('[name="soyad"]').value;
  const yas = document.querySelector('[name="yas"]').value;
  const tel = document.querySelector('[name="tel"]').value;
  const tc = document.querySelector('[name="tc"]').value;
  const email = document.querySelector('[name="email"]').value;
  const adres = document.querySelector('[name="adres"]').value;
  const id = document.getElementById("user-id").value;
  const password = document.getElementById("password").value;
  const rol = document.getElementById("rol").value;

  try {
    const res = await fetch("http://localhost:3000/api/uyeol", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ad, soyad, yas, tel, tc, email, adres,
        id, password, rol
      })
    });

    const data = await res.json();
    alert(data.mesaj || "Kayıt başarılı!");
    window.location.href = "giris.html";
  } catch (err) {
    alert("❌ Sunucu hatası");
    console.error(err);
  }
});
