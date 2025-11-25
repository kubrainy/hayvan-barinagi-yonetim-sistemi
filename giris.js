document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("loginForm");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const id = document.getElementById("user-id").value;
    const password = document.getElementById("password").value;

    try {
      const res = await fetch("http://localhost:3000/api/giris", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.mesaj || "Giriş başarısız.");
        return;
      }

      const data = await res.json();
      localStorage.setItem("kullaniciId", id);
      if (data.rol === "yonetici") {
        window.location.href = "yonetici.html";
      } else if (data.rol === "kullanici") {
        window.location.href = "kullanici.html";
      } else {
        alert("Bilinmeyen rol.");
      }
    } catch (err) {
      console.error("❌ Hata:", err);
      alert("Sunucuya ulaşılamıyor.");
    }
     
  });
 

});


