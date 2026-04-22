# S-DES PROJECT

Simplified DES (S-DES) şifreleme algoritmasını adım adım görselleştiren, retro tasarımlı interaktif bir web uygulaması.

---

## Gereksinimler

- Modern bir web tarayıcısı (Chrome, Firefox, Edge, Safari)
- **Node.js** (test çalıştırmak için)
---

## Proje Klasör Yapısı

```
proje-klasoru/
│
├── index.html                        # Ana HTML; giriş, işlem ve kapanış ekranları
├── main.js                           # UI koordinatörü; adım navigasyonu ve render döngüsü
├── style.css                         # Tüm stiller (VT323 retro font, piksel estetik)
├── package.json                      # Proje tanımı (ES Module ayarı burada)
│
├── src/
│   ├── config/
│   │   └── constants.js              # Permütasyon tabloları ve S-Box'lar
│   ├── utils/
│   │   └── sdes_utils.js             # Paylaşılan yardımcılar: permute() ve xor()
│   ├── core/
│   │   ├── KeyGenerator.js           # Saf algoritma: K1 ve K2 üretimi
│   │   └── SDES.js                   # Saf algoritma: şifreleme ve çözme
│   └── visualize/
│       ├── KeyGeneratorVisualizer.js # Anahtar üretimini log adımlarıyla sarar
│       └── SDESVisualizer.js         # Şifrelemeyi log adımlarıyla sarar
│
├── tests/
│   ├── test.helper.js                # describe / it / assertEquals yardımcıları
│   ├── keygen.test.js                # Anahtar üretimi birim testleri
│   └── sdes.test.js                  # Şifreleme / Çözme / Round-trip testleri
│
└── global/                           # Tüm görsel dosyalar
    ├── cat.gif
    ├── cat2.gif
    ├── cat3.gif
    ├── pati.gif
    ├── anahtar-ikonu.gif
    ├── akıs.png
    ├── IP_table.png
    ├── IP-1_table.png
    ├── P10_table.png
    ├── P8_table.png
    ├── EP_table.png
    ├── P4_table.png
    ├── S0_box.png
    └── S1_box.png
```

---

## Kurulum

Depoyu klonlayın veya dosyaları indirin, ardından proje klasörüne girin:

```bash
cd proje-klasoru
```

Bağımlılık kurulumu gerekmez; proje harici bir kütüphane kullanmaz.

---

## Kullanım

1. **Giriş Ekranı** — PLAINTEXT alanına 8 bit, KEY alanına 10 bit girin (yalnızca `0` ve `1` kabul edilir). Bir kutuya değer girilince imleç otomatik sonraki kutuya atlar.

2. **START SYSTEM ►** butonuna basın. Uygulama şifrelemeyi hesaplar ve adımları sıraya koyar.

3. **İşlem Ekranı** — Her adımda detay kutusunda açıklama, tablo görseli ve giriş/çıkış değerleri gösterilir. Üstteki stepper aktif adımı işaretler.
   - **NEXT** → bir sonraki adıma geçer
   - **PREV** → bir önceki adıma döner
   - Son adımdan sonra kapanış ekranı otomatik açılır.

4. **Kapanış Ekranı** — Girilen PLAINTEXT ve üretilen CIPHERTEXT gösterilir. **RESET SYSTEM** butonu ile başa dönülür.

---

## Algoritma Özeti

| Parametre      | Değer                    |
|----------------|--------------------------|
| Algoritma      | Simplified DES (S-DES)   |
| Plaintext      | 8 bit                    |
| Anahtar        | 10 bit                   |
| Alt Anahtarlar | K1, K2 (8 bit)           |
| Round Sayısı   | 2                        |

**Şifreleme akışı:** `IP → Round 1 (EP → XOR/K1 → S0/S1 → P4) → SW → Round 2 (EP → XOR/K2 → S0/S1 → P4) → IP⁻¹`

**Çözme akışı:** Aynı yapı, K1 ve K2 yer değiştirilmiş olarak uygulanır.

---

## Testleri Çalıştırma

Testler Node.js ile doğrudan terminalden çalıştırılır; tarayıcı gerekmez.

```bash
# Anahtar üretimi testleri
node tests/keygen.test.js

# Şifreleme / Çözme / Round-trip testleri
node tests/sdes.test.js
```

Beklenen çıktı örneği:

```
---Category : SDES Encryption---
PASSED: should encrypt vector #1: 10101010 → 00010110
PASSED: should encrypt vector #2: 01110010 → 01110111

---Category : SDES Decryption---
PASSED: should decrypt vector #1: 00010110 → 10101010
...
```

### Test Vektörleri

| Plaintext  | Ciphertext | Master Key   |
|------------|------------|--------------|
| 10101010   | 00010110   | 0111111101   |
| 01110010   | 01110111   | 1010000010   |

---

