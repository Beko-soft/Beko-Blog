// ==================== DOM ELEMANLARI ====================
const navButtons = document.querySelectorAll('.nav-btn');
const pages = document.querySelectorAll('.page-content');
const blogGridElement = document.getElementById('blog-grid');
// const labsGridElement = document.getElementById('labs-grid'); <-- SİLİNDİ
const sozlukContentElement = document.getElementById('sozluk-content'); 
const contentContainer = document.getElementById('blog-content-container');
const contentElement = document.getElementById('blog-content');
const postTitleElement = document.getElementById('post-title');


// ... [Navigasyon ve DOMContentLoaded Kodları Aynı Kalıyor] ...

document.addEventListener('DOMContentLoaded', () => {
    // Başlangıçta Laboratuvar'ı seç
    const initialButton = document.querySelector('.nav-btn[data-target="laboratuvar"]');
    if (initialButton) {
        initialButton.classList.add('active-nav-btn');
        setActivePage('laboratuvar'); 
    }
    
    // Uygulama başlangıcında tüm dinamik içerikleri yükle
    initializeBlog();
    // initializeLabs(); <-- SİLİNDİ
    loadSozlukContent();
});


// ... [Blog İşlevleri Aynı Kalıyor] ...


// =========================================================
// 2. LABORATUVAR İŞLEVLERİ (labs.json KALDIRILDI)
// =========================================================

// initializeLabs() fonksiyonu tamamen kaldırıldı.
// Laboratuvar içeriği artık index.html'deki statik vizyon metni.


// =========================================================
// 3. SÖZLÜK İŞLEVLERİ (Path Düzeltildi)
// =========================================================

function loadSozlukContent() {
    // Doğrudan ana dizine göre path'i kullanıyoruz.
    fetch('data/sozluk.md') 
        .then(response => {
            if (!response.ok) {
                // Hatanın nerede olduğunu anlamak için 404 durumunu kontrol et
                if (response.status === 404) {
                     throw new Error(`'sozluk.md' dosyası 'data/' klasöründe bulunamadı (404).`);
                }
                throw new Error(`Dosya yüklenirken hata oluştu: ${response.status}`);
            }
            return response.text();
        })
        .then(markdownText => {
            const htmlContent = marked.parse(markdownText);
            sozlukContentElement.innerHTML = htmlContent;
        })
        .catch(error => {
            console.error('Sözlük Yükleme Hatası:', error);
            sozlukContentElement.innerHTML = `<p style="color: red; text-align: center;">Sözlük içeriği yüklenemedi: ${error.message}</p>`;
        });
}
