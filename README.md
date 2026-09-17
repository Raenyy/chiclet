# Chiclet

**Chiclet**, masaüstünde kullanılmak üzere geliştirdiğim, WebRTC tabanlı bir sohbet uygulamasıdır. Mesajlaşma, sesli ve görüntülü iletişim gibi özellikleri tek bir arayüzde bir araya getirmeyi amaçlar.

Proje, oyun oynarken veya başka bir uygulama kullanırken erişilebilen, özelleştirilebilir ve masaüstü üzerinde hareket ettirilebilen bir sohbet deneyimi oluşturma fikriyle geliştirilmektedir.

> **Durum:** Geliştirme aşamasında.

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

## Geliştirme Notu

Bu proje, masaüstü uygulamaları, gerçek zamanlı iletişim ve WebRTC tabanlı sistemler üzerine pratik yapmak amacıyla geliştirilmektedir. Yeni özellikler eklenmeye ve mevcut yapı iyileştirilmeye devam edilmektedir.

## Lisans

MIT