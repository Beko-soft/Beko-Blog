// ==================== DOM ELEMANLARI ====================
const navButtons = document.querySelectorAll('.nav-btn');
const pages = document.querySelectorAll('.page-content');
const listElement = document.querySelector('#blog-grid');
const contentContainer = document.getElementById('blog-content-container');
const contentElement = document.getElementById('blog-content');
const postTitleElement = document.getElementById('post-title');
const underline = document.getElementById('blog-underline');

// ==================== NAVİGASYON ANİMASYON FONKSİYONU ====================
function updateUnderline(targetButton) {
    const rect = targetButton.getBoundingClientRect();
    const navRect = document.getElementById('main-nav').getBoundingClientRect();
    
    // Alt çizgiyi seçilen butonun altına konumlandır ve genişliğini ayarla
    underline.style.width = `${rect.width}px`;
    underline.style.transform = `translateX(${rect.left - navRect.left}px)`;
}

// ==================== SAYFA DEĞİŞTİRME MANTIĞI ====================
navButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = button.getAttribute('data-target');

        // 1. Sayfa Görünürlüğünü Değiştir
        pages.forEach(page => {
            page.classList.add('hidden-page');
        });
        document.getElementById(targetId).classList.remove('hidden-page');
        document.getElementById(targetId).classList.add('active-page');
        
        // 2. Buton Stilini Değiştir
        navButtons.forEach(btn => btn.classList.remove('active-nav-btn'));
        button.classList.add('active-nav-btn');

        // 3. Alt Çizgiyi Kaydır
        updateUnderline(button);
    });
});

// Başlangıçta 'LABORATUVAR' butonunu aktif yap ve alt çizgiyi ayarla
const initialButton = document.querySelector('.nav-btn[data-target="laboratuvar"]');
initialButton.classList.add('active-nav-btn');
// İlk yüklemede, tarayıcı DOM'u yükledikten sonra alt çizgiyi ayarla
window.addEventListener('load', () => {
    // Navigasyonu LABARATUVAR'a ayarla
    const initialBlogButton = document.querySelector('.nav-btn[data-target="laboratuvar"]');
    if (initialBlogButton) {
        updateUnderline(initialBlogButton);
    }
});


// ==================== BLOG İŞLEVLERİ (ÖNCEKİ MANTIK) ====================

// Kapatma işlevi
document.getElementById('close-post-btn').addEventListener('click', () => {
    contentContainer.classList.add('hidden-modal'); 
    document.body.style.overflow = 'auto'; 
});

// JSON çekme ve liste oluşturma
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

                link.textContent = post.title;
                link.href = '#';

                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    loadBlogPost(post.file, post.title); 
                });

                listItem.appendChild(link);
                listElement.appendChild(listItem);
            });
        })
        .catch(error => {
            console.error('Liste yükleme hatası:', error);
            listElement.innerHTML = `<p style="color: red; text-align: center;">Blog listesi yüklenemedi. 'linker.json' dosyasını kontrol edin.</p>`;
        });
}

// Blog içeriğini yükleme
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

// Uygulama başlangıcında blog listesini yükle
initializeBlog();
