// ==================== DOM ELEMANLARI TANIMLAMALARI ====================
// HTML dosyasından gerekli elemanları alıyoruz
const listElement = document.querySelector('#blog-grid'); // Izgara listesi (UL)
const contentContainer = document.getElementById('blog-content-container'); // Tüm modal (açılır içerik) alanı
const contentElement = document.getElementById('blog-content'); // İçeriğin yükleneceği div
const postTitleElement = document.getElementById('post-title'); // Açılan içeriğin başlık alanı

// ==================== KAPATMA İŞLEVİ ====================
// Modal'ı kapatan düğme dinleyicisi
document.getElementById('close-post-btn').addEventListener('click', () => {
    contentContainer.style.display = 'none'; // Konteyneri gizle
    document.body.style.overflow = 'auto'; // Arka plan kaydırmayı geri aç
});

// ==================== JSON ÇEKME VE LİSTE OLUŞTURMA ====================
// 1. linker.json dosyasını çekme ve ızgara listesini oluşturma
fetch('linker.json')
    .then(response => {
        if (!response.ok) {
            throw new Error(`linker.json yüklenemedi: ${response.status} ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        // JSON dosyasındaki her öğe için bir ızgara kutucuğu oluştur
        data.forEach(post => {
            const listItem = document.createElement('li');
            const link = document.createElement('a');

            link.textContent = post.title;
            link.href = '#'; 

            // Linke tıklama olayını ekleme
            link.addEventListener('click', (e) => {
                e.preventDefault(); 
                loadBlogPost(post.file, post.title); // Blog içeriğini yükle
            });

            listItem.appendChild(link);
            listElement.appendChild(listItem);
        });
    })
    .catch(error => {
        console.error('Liste yükleme hatası:', error);
        // Liste yüklenemezse ana ekranda hata mesajı göster
        listElement.innerHTML = `<p style="color: red; text-align: center;">Blog listesi yüklenemedi. 'linker.json' dosyasını kontrol edin.</p>`;
    });


// ==================== BLOG İÇERİĞİNİ YÜKLEME VE MODAL'I AÇMA ====================
// 2. Blog içeriğini (Markdown dosyasını) yükleme
function loadBlogPost(filename, title) {
    // Markdown dosyasını çekme
    fetch(filename)
        .then(response => {
            if (!response.ok) {
                // Eğer blog dosyası yoksa (404), hata fırlat
                throw new Error(`'${title}' için dosya bulunamadı. Lütfen 'post/${filename}' yolunu kontrol edin.`);
            }
            return response.text(); 
        })
        .then(markdownText => {
            // marked kütüphanesi ile Markdown'u HTML'e çevir
            const htmlContent = marked.parse(markdownText);
            
            // Başlığı ve içeriği ayarla
            postTitleElement.textContent = title;
            contentElement.innerHTML = htmlContent;
            
            // Konteyneri GÖSTER ve kaydırmayı engelle
            contentContainer.style.display = 'block'; 
            document.body.style.overflow = 'hidden'; 

            // Modalı en üste kaydır
            contentContainer.scrollTop = 0;
        })
        .catch(error => {
            // Hata durumunda başlık ve içeriği göster ve modal'ı aç
            postTitleElement.textContent = "Yükleme Hatası";
            contentElement.innerHTML = `<p style="color: red;">${error.message}</p><p>Lütfen dosyanın GitHub'da var olduğundan emin olun.</p>`;
            
            contentContainer.style.display = 'block';
            document.body.style.overflow = 'auto'; // Hata mesajı kısa olabilir, kaydırmayı aç
        });
}
