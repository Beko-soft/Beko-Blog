// marked.js kütüphanesini buraya dahil etmeliyiz (index.html içinde <script> olarak eklenmiştir)

const listElement = document.querySelector('#blog-list ul');
const contentElement = document.getElementById('blog-content');

// 1. JSON dosyasını çekme ve listeyi oluşturma
fetch('linker.json')
    .then(response => response.json())
    .then(data => {
        data.forEach(post => {
            const listItem = document.createElement('li');
            const link = document.createElement('a');

            link.textContent = post.title;
            link.href = '#'; // Sayfa yenilenmesini engellemek için # kullanıyoruz

            // Linke tıklama olayını ekleme
            link.addEventListener('click', (e) => {
                e.preventDefault(); // Varsayılan link davranışını engelle
                loadBlogPost(post.file); // Blog içeriğini yükle
            });

            listItem.appendChild(link);
            listElement.appendChild(listItem);
        });
    })
    .catch(error => console.error('Hata: JSON dosyası yüklenemedi', error));


// 2. Blog içeriğini (Markdown dosyasını) yükleme
function loadBlogPost(filename) {
    // Markdown dosyasını çekme
    fetch(filename)
        .then(response => {
            if (!response.ok) {
                throw new Error('Blog dosyası bulunamadı: ' + filename);
            }
            return response.text(); // İçeriği düz metin olarak al
        })
        .then(markdownText => {
            // marked kütüphanesi ile Markdown'u HTML'e çevir
            const htmlContent = marked.parse(markdownText);
            
            // İçeriği sayfaya bas
            contentElement.innerHTML = `
                <h2>${filename} İçeriği:</h2> 
                ${htmlContent}
            `;
        })
        .catch(error => {
            contentElement.innerHTML = `<p style="color: red;">Hata: ${error.message}</p>`;
            console.error(error);
        });
}
