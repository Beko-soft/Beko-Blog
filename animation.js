// ==================== DOM ELEMANLARI ====================
const navButtons = document.querySelectorAll('.nav-btn');
const pages = document.querySelectorAll('.page-content');
const blogGridElement = document.getElementById('blog-grid');
const sozlukContentElement = document.getElementById('sozluk-content'); 
const contentContainer = document.getElementById('blog-content-container');
const contentElement = document.getElementById('blog-content');
const postTitleElement = document.getElementById('post-title');

// IDE Elemanları
const ideContainer = document.getElementById('ide-container');
const ideStatusMessage = document.getElementById('ide-status-message');
const runButton = document.getElementById('run-code-btn');
const codeInput = document.getElementById('python-code-input');
const codeOutput = document.getElementById('python-code-output');

let pyodide = null; // Pyodide yorumlayıcısını tutacak değişken

// ==================== NAVİGASYON VE SAYFA DEĞİŞTİRME MANTIĞI ====================

function setActivePage(targetId) {
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

        setActivePage(targetId);
        
        navButtons.forEach(btn => btn.classList.remove('active-nav-btn'));
        button.classList.add('active-nav-btn');
    });
});


// ==================== BAŞLANGIÇ AYARI (DOM YÜKLENDİĞİNDE) ====================
document.addEventListener('DOMContentLoaded', () => {
    const initialButton = document.querySelector('.nav-btn[data-target="laboratuvar"]');
    if (initialButton) {
        initialButton.classList.add('active-nav-btn');
        setActivePage('laboratuvar'); 
    }
    
    // Blog ve Sözlüğü yükle
    initializeBlog();
    loadSozlukContent();

    // Pyodide'yi başlat
    initializePyodide();
});


// =========================================================
// 1. LABORATUVAR IDE İŞLEVLERİ (Pyodide Wasm Entegrasyonu)
// =========================================================

async function initializePyodide() {
    ideStatusMessage.textContent = "Pyodide (Python Yorumlayıcısı) Yükleniyor... Bu biraz sürebilir.";
    
    try {
        // Pyodide'yi başlat ve global değişkene ata
        pyodide = await loadPyodide();

        // Başarılı yükleme durumunda IDE'yi göster ve butonu aktifleştir
        ideStatusMessage.textContent = "Pyodide Yüklendi. Kod yazmaya hazırsın!";
        ideStatusMessage.style.color = "#2ecc71"; // Yeşil mesaj
        ideContainer.classList.remove('hidden');
        runButton.disabled = false;
        runButton.textContent = "▶ Kodu Çalıştır";

        // Çalıştır butonunu Pyodide ile bağla
        runButton.addEventListener('click', runPythonCode);
        
        codeOutput.textContent = "Pyodide 0.25.0 yüklendi. Artık Python kodunu çalıştırabilirsin.";

    } catch (error) {
        console.error("Pyodide Yükleme Hatası:", error);
        ideStatusMessage.textContent = "Hata: Pyodide yüklenemedi. Lütfen internet bağlantınızı kontrol edin.";
        ideStatusMessage.style.color = "#e74c3c"; // Kırmızı mesaj
    }
}

function runPythonCode() {
    if (!pyodide) {
        codeOutput.textContent = "Hata: Python yorumlayıcısı henüz hazır değil.";
        return;
    }

    const code = codeInput.value;
    codeOutput.textContent = ">>> Kod Çalıştırılıyor...\n";
    runButton.disabled = true;
    runButton.textContent = "Çalışıyor...";

    try {
        // Pyodide'nin çıktı akışını (stdout) yakalamak için geçici bir mekanizma (Pyodide bunu otomatik olarak yapabilir)
        const output = pyodide.runPython(code);
        
        // runPython'dan dönen değer varsa (örneğin son satır bir ifade ise) onu göster
        if (output !== undefined) {
            codeOutput.textContent += String(output) + "\n";
        }
        
    } catch (err) {
        // Hataları yakala ve çıktı alanında göster
        codeOutput.textContent += "Hata:\n" + String(err);
    } finally {
        runButton.disabled = false;
        runButton.textContent = "▶ Kodu Çalıştır";
    }
}


// =========================================================
// 2. BLOG İŞLEVLERİ (linker.json)
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
                
                // Konu etiketini oluştur
                const konu = (post.konu || 'genel').toLowerCase();
                const tagSpan = document.createElement('span');
                tagSpan.textContent = konu;
                tagSpan.classList.add('post-tag', `tag-${konu}`); 

                // Başlık metnini oluştur
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
// 3. SÖZLÜK İŞLEVLERİ (data/sozluk.md)
// =========================================================

function loadSozlukContent() {
    fetch('data/sozluk.md') 
        .then(response => {
            if (!response.ok) {
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
