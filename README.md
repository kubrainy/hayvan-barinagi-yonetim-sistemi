# 🐾 Hayvan Barınağı Yönetim Sistemi

Bu proje, **2025 Haziran** ayında geliştirilmiş olup hayvan barınaklarının dijital ortamda daha verimli yönetilebilmesini sağlamak amacıyla tasarlanmıştır. Sistem; kullanıcıların hayvanları inceleyip sahiplenme talebi göndermesine, yöneticilerin ise talepleri onaylamasına, hayvan ekleyip silmesine olanak tanır.

---

## 🚀 Kullanılan Teknolojiler

- **Frontend:** HTML, CSS, JavaScript  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB  

---

## 🔧 Özellikler

- ✔️ Kullanıcı kaydı ve giriş sistemi  
- ✔️ Hayvanların listelenmesi  
- ✔️ Resimlere tıklayınca büyütme (modal)  
- ✔️ Sahiplenme talebi gönderme  
- ✔️ Yönetici paneli  
  - Talep onaylama / reddetme  
  - Hayvan ekleme / silme  
- ✔️ Sahiplendirilen hayvanların “Sahiplendi” etiketiyle görünmesi  
- ✔️ Genel istatistikler (toplam hayvan sayısı, sahiplendirilenler vb.)

---

## 📁 Proje Yapısı
📦 HayvanBarinagiYonetimSistemi
├── server.js
├── package.json
├── /public
│ ├── style.css
│ ├── script.js
│ └── img/ (hayvan resimleri)
├── giris.html
├── uyeol.html
├── kullanici.html
├── yonetici.html
└── README.md


---

## 🛠 Kurulum

Projeyi bilgisayarınıza indirdikten sonra aşağıdaki adımları izleyebilirsiniz:

```bash
# Gerekli bağımlılıkları yükleyin
npm install
node server.js
