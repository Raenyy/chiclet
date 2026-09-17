# Chiclet

**Chiclet**, masaüstünde kullanılmak üzere geliştirdiğim, WebRTC tabanlı bir sohbet uygulamasıdır. Mesajlaşma, sesli ve görüntülü iletişim gibi özellikleri tek bir arayüzde bir araya getirmeyi amaçlar.

Proje, oyun oynarken veya başka bir uygulama kullanırken erişilebilen, özelleştirilebilir ve masaüstü üzerinde hareket ettirilebilen bir sohbet deneyimi oluşturma fikriyle geliştirilmektedir.

> **Durum:** Geliştirme aşamasında.

## Ekran Görüntüleri

<p align="center">
  <img src="screenshots/login.png" width="280" alt="Giriş Ekranı"/>
  <img src="screenshots/chat.png" width="280" alt="Sohbet"/>
</p>
<p align="center">
  <img src="screenshots/voice-video.png" width="420" alt="Sesli ve Görüntülü Arama"/>
</p>
<p align="center">
  <img src="screenshots/themes.png" width="380" alt="Tema Seçici"/>
  <img src="screenshots/studio.png" width="380" alt="Duvar Kağıdı Stüdyosu"/>
</p>

## Özellikler

* P2P tabanlı mesajlaşma
* Sesli iletişim
* Görüntülü iletişim
* Özelleştirilebilir tema ve arka plan
* Taşınabilir ve yeniden boyutlandırılabilir sohbet penceresi
* Masaüstü üzerinde kullanılabilen şeffaf pencere
* Emoji ve çıkartma desteği
* Yapay zekâ asistanı entegrasyonu
* Bağlı kullanıcılar arasında tema senkronizasyonu

## Kullanılan Teknolojiler

* **React** — Kullanıcı arayüzü
* **Electron** — Masaüstü uygulaması
* **Vite** — Geliştirme ve derleme altyapısı
* **JavaScript** — Uygulama mantığı
* **PeerJS / WebRTC** — P2P bağlantı ve iletişim
* **Web Media API** — Ses ve görüntü erişimi

## Proje Yapısı

```text
chiclet/
├── main.cjs
├── package.json
└── src/
    ├── App.jsx
    ├── index.css
    ├── components/
    └── services/
```

## Kurulum

### Gereksinimler

* Node.js 18+
* npm

### Çalıştırma

```bash
git clone https://github.com/KULLANICI/chiclet.git
cd chiclet
npm install
npm run electron:dev
```

### Hazır .exe (Windows)

Kurulum gerektirmeden çalıştırmak için [Releases](../../releases) bölümünden indirilebilir.

## Geliştirme Notu

Bu proje, masaüstü uygulamaları, gerçek zamanlı iletişim ve WebRTC tabanlı sistemler üzerine pratik yapmak amacıyla geliştirilmektedir. Yeni özellikler eklenmeye ve mevcut yapı iyileştirilmeye devam edilmektedir.

## Lisans

MIT