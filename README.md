# 🐾 Hayvan Barınağı Yönetim Sistemi

Bu proje, **2025 Haziran** ayında geliştirilmiş olup hayvan barınaklarının dijital ortamda daha verimli yönetilebilmesini sağlamak amacıyla tasarlanmıştır. Sistem; kullanıcıların hayvanları inceleyip sahiplenme talebi göndermesine, yöneticilerin ise talepleri onaylamasına, hayvan ekleyip silmesine olanak tanır.

---

## 🚀 Kullanılan Teknolojiler

- **Frontend:** HTML, CSS, JavaScript (framework yok; ortak parçalar Web Components ile)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Yayın:** Vercel (statik ön yüz + Express API fonksiyonu)

---

## 🔧 Özellikler

- ✔️ Kullanıcı kaydı ve giriş sistemi  
- ✔️ Hayvanların listelenmesi  
- ✔️ Fotoğrafa tıklayınca büyütme (kartlarda ve hayvan ekleme/düzenleme ekranında)  
- ✔️ Telefondan veya bilgisayardan fotoğraf seçerek hayvan ekleme  
- ✔️ Sahiplenme talebi gönderme  
- ✔️ Yönetici paneli  
  - Talep onaylama / reddetme (yeni talepler sayfa yenilenmeden listeye düşer)  
  - Hayvan ekleme / düzenleme / silme  
- ✔️ Sahiplendirilen hayvanların “Sahiplendi” etiketiyle görünmesi  
- ✔️ Genel istatistikler (toplam hayvan sayısı, sahiplendirilenler vb.)  
- ✔️ Tüm ekran boyutlarında çalışan (responsive) arayüz

---

## 📁 Proje Yapısı

```
hayvan-barinagi-yonetim-sistemi/
├── public/                  # Ön yüz (statik dosyalar)
│   ├── index.html           # Ana sayfa
│   ├── giris.html           # Giriş
│   ├── uyeol.html           # Üye ol
│   ├── kullanici.html       # Kullanıcı sayfası (hayvanlar, sahiplenme)
│   ├── yonetici.html        # Yönetici paneli
│   ├── css/
│   │   ├── base.css         # Renk paleti, header/footer, buton, modal, hero
│   │   ├── forms.css        # Form bileşenleri
│   │   └── pets.css         # Hayvan kartı, istatistik, yönetici paneli
│   ├── js/
│   │   ├── components.js    # <site-header>, <site-footer>, modal, hayvan kartı
│   │   ├── giris.js  uyeol.js  kullanici.js  yonetici.js   # sayfa betikleri
│   └── img/                 # Görseller (icons/ altında sosyal medya ve logo)
├── api/index.js             # Vercel giriş noktası (Express uygulamasını dışa aktarır)
├── server.js                # Express API + MongoDB (yerelde de buradan çalışır)
├── scripts/seed.js          # Örnek hayvanları ekler (silme yapmaz)
├── vercel.json              # Vercel ayarları
└── package.json
```

---

## 🛠 Yerelde Çalıştırma

Gereksinimler: Node.js ve yerelde çalışan MongoDB (`mongodb://localhost:27017`).

```bash
npm install        # bağımlılıkları yükle
npm start          # API'yi başlat → http://localhost:3001
npm run seed       # (isteğe bağlı) örnek hayvanları ekle
```

Ardından `public/index.html` dosyasını tarayıcıda açın. Dosyadan veya `localhost`'tan açıldığında ön yüz API'ye `http://localhost:3001/api` üzerinden bağlanır.

---

## ☁️ Vercel'de Yayınlama

1. Ücretsiz bir [MongoDB Atlas](https://www.mongodb.com/atlas) kümesi oluşturun (Network Access: `0.0.0.0/0`).
2. Bağlantı adresini ortam değişkeni olarak ekleyin: `vercel env add MONGODB_URI production`
3. `vercel --prod` ile yayınlayın. Yayında ön yüz API'ye aynı alan adındaki `/api` üzerinden bağlanır.
4. Örnek veri için: `MONGODB_URI` tanımlıyken `npm run seed`

> Bu bir demo projesidir; şifreler düz metin saklanır ve yönetici işlemleri ayrıca yetkilendirilmez. Gerçek kişisel veri girmeyin.
