const listElement = document.querySelector('#blog-grid');
const contentElement = document.getElementById('blog-content');

// 1. JSON dosyasını çekme ve listeyi oluşturma
fetch('linker.json')
    .then(response => {
        // HTTP hatası varsa (örneğin 404), JSON hatası yerine daha anlamlı bir hata fırlatır
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
        // JSON format hatası veya dosya bulunamazsa konsola yazdır
        console.error('Liste yükleme hatası:', error);
        // Hata mesajını blog içeriği alanında da gösterebiliriz
        contentElement.innerHTML = `<p style="color: red;">Listeler yüklenemedi. JSON formatını veya dosya yolunu kontrol edin.</p>`;
    });


// 2. Blog içeriğini (Markdown dosyasını) yükleme
function loadBlogPost(filename, title) {
    // Markdown dosyasını çekme
    fetch(filename)
        .then(response => {
            if (!response.ok) {
                // Eğer blog dosyası yoksa (404), kullanıcıya bilgi ver
                throw new Error(`'${title}' için dosya bulunamadı: ${filename}`);
            }
            return response.text(); 
        })
        .then(markdownText => {
            // marked kütüphanesi ile Markdown'u HTML'e çevir
            // marked'in burada tanımlı olduğundan artık eminiz!
            const htmlContent = marked.parse(markdownText);
            
            // İçeriği sayfaya bas
            contentElement.innerHTML = `
                <h2>${title}</h2> 
                ${htmlContent}
            `;
        })
        .catch(error => {
            contentElement.innerHTML = `<h2 style="color: red;">Yükleme Hatası:</h2> <p>${error.message}</p>`;
            console.error(error);
        });
}
