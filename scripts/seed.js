// Örnek hayvanları veritabanına ekler.  Kullanım:  npm run seed   (proje kökünden)
// Yalnızca EKLER: aynı adda hayvan varsa atlar, hiçbir kaydı silmez veya değiştirmez.
// Yerelde localhost'a, MONGODB_URI tanımlıysa o veritabanına (ör. Atlas) yazar.
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pet4life';
const W = 'https://upload.wikimedia.org/wikipedia/commons/'; // Wikimedia Commons (serbest lisanslı fotoğraflar)
const tel = '05052171675';

const ornekHayvanlar = [
  { ad: 'Bal', cins: 'Golden Retriever', asi: true, foto: W + 'b/bd/Golden_Retriever_Dukedestiny01_drvd.jpg', dogumTarihi: '2023-04-12', sehir: 'Ankara', iletisim: tel },
  { ad: 'Zeytin', cins: 'Labrador Retriever', asi: true, foto: W + 'thumb/9/90/Labrador_Retriever_portrait.jpg/960px-Labrador_Retriever_portrait.jpg', dogumTarihi: '2022-09-03', sehir: 'İstanbul', iletisim: tel },
  { ad: 'Portakal', cins: 'Tekir Kedi', asi: true, foto: W + 'thumb/6/68/Orange_tabby_cat_sitting_on_fallen_leaves-Hisashi-01A.jpg/960px-Orange_tabby_cat_sitting_on_fallen_leaves-Hisashi-01A.jpg', dogumTarihi: '2024-02-20', sehir: 'İzmir', iletisim: tel },
  { ad: 'Şeker', cins: 'Yavru Kedi', asi: false, foto: W + 'thumb/a/a5/Red_Kitten_01.jpg/960px-Red_Kitten_01.jpg', dogumTarihi: '2026-06-10', sehir: 'Bursa', iletisim: tel },
  { ad: 'Kar', cins: 'Sokak Kedisi', asi: true, foto: W + 'thumb/b/b6/Felis_catus-cat_on_snow.jpg/960px-Felis_catus-cat_on_snow.jpg', dogumTarihi: '2021-12-01', sehir: 'Eskişehir', iletisim: tel }
];

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

(async () => {
  await mongoose.connect(MONGODB_URI, { dbName: 'pet4life', serverSelectionTimeoutMS: 8000 });
  console.log('✅ MongoDB bağlantısı başarılı');

  for (const hayvan of ornekHayvanlar) {
    if (await Animal.exists({ ad: hayvan.ad })) {
      console.log('atlandı (zaten var):', hayvan.ad);
    } else {
      await Animal.create(hayvan);
      console.log('eklendi:', hayvan.ad);
    }
  }

  console.log('toplam hayvan sayısı:', await Animal.countDocuments());
  await mongoose.disconnect();
})().catch(err => {
  console.error('❌ Hata:', err.message);
  process.exit(1);
});
