const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB bağlantısı
mongoose.connect('mongodb://localhost:27017/pet4life')
  .then(() => console.log('✅ MongoDB bağlantısı başarılı'))
  .catch((err) => console.error('❌ MongoDB bağlantı hatası:', err.message));

// Kullanici Modeli eklendi ✅
const Kullanici = mongoose.model('Kullanici', {
  id: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rol: { type: String, default: 'kullanici' },
  ad: String,
  soyad: String,
  yas: String,
  tel: String,
  tc: String,
  email: String,
  adres: String
});

const Animal = mongoose.model('Animal', {
  ad: String,
  cins: String,
  asi: Boolean,
  foto: String,
  dogumTarihi: String,
  sehir: String,
  iletisim: String,
  sahiplendi: { type: Boolean, default: false }
});

const Istek = mongoose.model('Istek', {
  hayvanAdi: String,
  gonderen: String,
  tarih: { type: Date, default: Date.now }
});

// Giriş kontrolü
app.post('/api/giris', async (req, res) => {
  const { id, password } = req.body;
  try {
    const kullanici = await Kullanici.findOne({ id, password });
    if (!kullanici) {
      return res.status(401).json({ mesaj: "Geçersiz kimlik bilgileri" });
    }
    return res.json({ rol: kullanici.rol });
  } catch (err) {
    console.error("❌ Giriş işleminde hata:", err);
    return res.status(500).json({ mesaj: "Sunucu hatası" });
  }
});

// Hayvanları listele
app.get('/api/hayvanlar', async (req, res) => {
  const hayvanlar = await Animal.find();
  res.json(hayvanlar);
});

// Hayvan ekle
app.post('/api/hayvanlar', async (req, res) => {
  const yeniHayvan = new Animal(req.body);
  await yeniHayvan.save();
  res.json({ success: true });
});

// Hayvan sil
app.delete('/api/hayvanlar/:id', async (req, res) => {
  const result = await Animal.findByIdAndDelete(req.params.id);
  if (!result) {
    return res.status(404).json({ success: false, mesaj: "Hayvan bulunamadı" });
  }
  res.json({ success: true });
});

// Hayvan bilgilerini güncelle
app.patch('/api/hayvanlar/:id', async (req, res) => {
  try {
    const updated = await Animal.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, mesaj: "Hayvan bulunamadı" });
    res.json({ success: true, hayvan: updated });
  } catch (err) {
    res.status(500).json({ success: false, mesaj: "Sunucu hatası" });
  }
});

// Sahiplenme isteği gönder
app.post('/api/istek', async (req, res) => {
  try {
    const { hayvanAdi, gonderen } = req.body;

    // Hayvan var mı?
    const hayvan = await Animal.findOne({ ad: hayvanAdi });
    if (!hayvan) {
      return res.status(404).json({ success: false, mesaj: "Hayvan bulunamadı." });
    }

    // Hayvan sahiplendirildiyse istek gönderme
    if (hayvan.sahiplendi) {
      return res.status(400).json({ success: false, mesaj: "Bu hayvan zaten sahiplendirildi." });
    }

    // Aynı kullanıcı aynı hayvana birden fazla istek atamasın
    const mevcutAyniKullaniciIstek = await Istek.findOne({ hayvanAdi, gonderen });
    if (mevcutAyniKullaniciIstek) {
      return res.status(400).json({ success: false, mesaj: "Zaten bu kullanıcı bu hayvana istek attı." });
    }

    // İstek kaydet
    const yeniIstek = new Istek({ hayvanAdi, gonderen });
    await yeniIstek.save();
    res.json({ success: true });

  } catch (err) {
    console.error("❌ İstek oluşturma hatası:", err);
    res.status(500).json({ success: false, mesaj: "Sunucu hatası" });
  }
});



// İstekleri listele
app.get('/api/istekler', async (req, res) => {
  try {
    const istekler = await Istek.find().sort({ tarih: -1 });
    res.json(istekler);
  } catch (err) {
    res.status(500).json({ success: false, mesaj: "Sunucu hatası" });
  }
});

// İstek sil
app.delete('/api/istek/:id', async (req, res) => {
  try {
    await Istek.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, mesaj: "Silinemedi" });
  }
});

// Üye ol
app.post('/api/uyeol', async (req, res) => {
  const { id, password, rol, ad, soyad, yas, tel, tc, email, adres } = req.body;

  if (!id || !password || !rol) {
    return res.status(400).json({ mesaj: "Tüm alanlar zorunludur" });
  }

  try {
    const mevcut = await Kullanici.findOne({ id });
    if (mevcut) {
      return res.status(400).json({ mesaj: "❌ Bu ID zaten kayıtlı" });
    }

    const yeniKullanici = new Kullanici({
      id, password, rol,
      ad, soyad, yas, tel, tc, email, adres
    });

    await yeniKullanici.save();
    res.json({ mesaj: "✅ Kayıt başarılı" });
  } catch (err) {
    console.error("❌ Üye olma hatası:", err);
    res.status(500).json({ mesaj: "Sunucu hatası" });
  }
});

// Sahiplendirme
app.patch('/api/hayvan-sahiplendir/:ad', async (req, res) => {
  try {
    const hayvan = await Animal.findOneAndUpdate(
      { ad: req.params.ad },
      { sahiplendi: true },
      { new: true }
    );
    if (!hayvan) return res.status(404).json({ success: false, mesaj: "Hayvan bulunamadı" });

    // İlgili hayvanın diğer tüm istekleri silinsin (isteğe bağlı yorum satırına alınabilir)
    // await Istek.deleteMany({ hayvanAdi: req.params.ad });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, mesaj: "Sunucu hatası" });
  }
});

// İstatistikler
app.get('/api/istatistikler', async (req, res) => {
  try {
    const toplamHayvan = await Animal.countDocuments();
    const sahiplendirilen = await Animal.countDocuments({ sahiplendi: true });
    const bekleyenIstek = await Istek.countDocuments();
    const barinaktaKalan = toplamHayvan - sahiplendirilen;

    res.json({
      toplamHayvan,
      sahiplendirilen,
      barinaktaKalan,
      bekleyenIstek
    });
  } catch (err) {
    console.error("❌ İstatistik hatası:", err);
    res.status(500).json({ mesaj: "İstatistik alınamadı" });
  }
});

// Sunucuyu başlat
app.listen(3000, () => {
  console.log('🚀 Sunucu 3000 portunda çalışıyor');
});
