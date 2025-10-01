// ==================== DOM ELEMANLARI ====================
const navButtons = document.querySelectorAll('.nav-btn');
const pages = document.querySelectorAll('.page-content');
const blogGridElement = document.getElementById('blog-grid');
const labsGridElement = document.getElementById('labs-grid'); 
const sozlukContentElement = document.getElementById('sozluk-content'); 
const contentContainer = document.getElementById('blog-content-container');
const contentElement = document.getElementById('blog-content');
const postTitleElement = document.getElementById('post-title');


// ==================== NAVİGASYON VE SAYFA DEĞİŞTİRME MANTIĞI ====================

function setActivePage(targetId) {
    // Sayfa Görünürlüğünü Değiştir
    pages.forEach(page => {
        page.classList.add('hidden-page');
        page.classList.remove('active-page');
    });
    const targetPage = document.getElementById(targetId);
    if (targetPage) {
        targetPage.classList.remove('hidden-page');
        targetPage.classList.add('active-page');
    }
}

navButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = button.getAttribute('data-target');

        // Sayfayı değiştir
        setActivePage(targetId);
        
        // Buton Stilini Değiştir (Büyütme/Vurgu)
        navButtons.forEach(btn => btn.classList.remove('active-nav-btn'));
        button.classList.add('active-nav-btn');
    });
});


// ==================== BAŞLANGIÇ AYARI (DOM YÜKLENDİĞİNDE) ====================
document.addEventListener('DOMContentLoaded', () => {
    // Başlangıçta Laboratuvar'ı seç
    const initialButton = document.querySelector('.nav-btn[data-target="laboratuvar"]');
    if (initialButton) {
        initialButton.classList.add('active-nav-btn');
        setActivePage('laboratuvar'); 
    }
    
    // Uygulama başlangıcında tüm dinamik içerikleri yükle
    initializeBlog();
    initializeLabs();
    loadSozlukContent();
});


// =========================================================
// 1. BLOG İŞLEVLERİ (Konu Etiketi Entegrasyonu)
// =========================================================

function initializeBlog() {
    fetch('linker.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`linker.json yüklenemedi: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            data.forEach(post => {
                const listItem = document.createElement('li');
                const link = document.createElement('a');
                
                // 1. Konu etiketini oluştur (KONU EKLEMESİ)
                const konu = (post.konu || 'genel').toLowerCase();
                const tagSpan = document.createElement('span');
                tagSpan.textContent = konu;
                tagSpan.classList.add('post-tag', `tag-${konu}`); 

                // 2. Başlık metnini oluştur
                const titleText = document.createElement('span');
                titleText.textContent = post.title;
                titleText.style.fontSize = '1.2em'; 

                // Linke hem başlığı hem etiketi ekle
                link.appendChild(titleText);
                link.appendChild(tagSpan);

                link.href = '#';

                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    loadBlogPost(post.file, post.title); 
                });

                listItem.appendChild(link);
                blogGridElement.appendChild(listItem);
            });
        })
        .catch(error => {
            console.error('Blog Liste yükleme hatası:', error);
            blogGridElement.innerHTML = `<p style="color: red; text-align: center;">Blog listesi yüklenemedi. 'linker.json' dosyasını kontrol edin.</p>`;
        });
}

function loadBlogPost(filename, title) {
    fetch(filename)
        .then(response => {
            if (!response.ok) {
                throw new Error(`'${title}' için dosya bulunamadı. Lütfen '${filename}' yolunu kontrol edin.`);
            }
            return response.text();
        })
        .then(markdownText => {
            const htmlContent = marked.parse(markdownText);
            
            postTitleElement.textContent = title;
            contentElement.innerHTML = htmlContent;
            
            contentContainer.classList.remove('hidden-modal'); 
            document.body.style.overflow = 'hidden'; 
            contentContainer.scrollTop = 0;
        })
        .catch(error => {
            postTitleElement.textContent = "Yükleme Hatası";
            contentElement.innerHTML = `<p style="color: red;">${error.message}</p>`;
            
            contentContainer.classList.remove('hidden-modal');
            document.body.style.overflow = 'auto';
        });
}

document.getElementById('close-post-btn').addEventListener('click', () => {
    contentContainer.classList.add('hidden-modal'); 
    document.body.style.overflow = 'auto'; 
});


// =========================================================
// 2. LABORATUVAR İŞLEVLERİ (labs.json - WASM IDE Vurgusu)
// =========================================================

function initializeLabs() {
    fetch('labs.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`labs.json yüklenemedi: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            data.forEach(project => {
                const listItem = document.createElement('li');
                const link = document.createElement('a');

                link.innerHTML = `<strong>${project.title}</strong><br><small>${project.description}</small>`;
                link.href = project.link; 
                link.target = '_blank'; 

                listItem.appendChild(link);
                labsGridElement.appendChild(listItem);
            });
        })
        .catch(error => {
            console.error('Laboratuvar Liste yükleme hatası:', error);
            labsGridElement.innerHTML = `<p style="color: red; text-align: center;">Laboratuvar projeleri yüklenemedi. 'labs.json' dosyasını kontrol edin.</p>`;
        });
}

// =========================================================
// 3. SÖZLÜK İŞLEVLERİ (data/sozluk.md)
// =========================================================

// Sözlük içeriğini yükleme (Sayfalama alanı boş bırakıldı)
function loadSozlukContent() {
    fetch('data/sozluk.md')
        .then(response => {
            if (!response.ok) {
                throw new Error(`'sozluk.md' dosyası 'data/' klasöründe bulunamadı.`);
            }
            return response.text();
        })
        .then(markdownText => {
            const htmlContent = marked.parse(markdownText);
            sozlukContentElement.innerHTML = htmlContent;
            
            // NOT: Sayfalama mantığı buraya eklenecektir.
        })
        .catch(error => {
            console.error('Sözlük Yükleme Hatası:', error);
            sozlukContentElement.innerHTML = `<p style="color: red; text-align: center;">Sözlük içeriği yüklenemedi: ${error.message}</p>`;
        });
}
