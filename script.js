// ============================================
// FLOATING MATHEMATICAL SYMBOLS (Canvas)
// ============================================
const canvas = document.getElementById('math-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const symbols = '∫∑∏∂∇∞πφθλΔ∈⊂∪∩∀∃αβγδεζηικμνξρστυψω√≈≡≤≥±∝∠⊥∥'.split('');
const colors = [
    'rgba(212, 165, 116, 0.08)',  // gold
    'rgba(180, 142, 173, 0.06)',  // lavender
    'rgba(136, 192, 208, 0.05)',  // teal
    'rgba(163, 190, 140, 0.05)', // sage
];

class FloatingSymbol {
    constructor() {
        this.reset();
        // Start at random Y so they don't all begin at bottom
        this.y = Math.random() * canvas.height;
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + 20;
        this.symbol = symbols[Math.floor(Math.random() * symbols.length)];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.size = 14 + Math.random() * 24;
        this.speed = 0.15 + Math.random() * 0.35;
        this.drift = (Math.random() - 0.5) * 0.3;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.005;
    }

    update() {
        this.y -= this.speed;
        this.x += this.drift;
        this.rotation += this.rotationSpeed;

        if (this.y < -30) {
            this.reset();
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.font = `${this.size}px "Cormorant Garamond", Georgia, serif`;
        ctx.fillStyle = this.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.symbol, 0, 0);
        ctx.restore();
    }
}

const floatingSymbols = Array.from({ length: 30 }, () => new FloatingSymbol());

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    floatingSymbols.forEach(s => {
        s.update();
        s.draw();
    });
    requestAnimationFrame(animate);
}

animate();

// ============================================
// NAVIGATION
// ============================================
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    document.getElementById(sectionId).classList.add('active');

    document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`nav a[href="#${sectionId}"]`).classList.add('active');
}

document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = link.getAttribute('href').substring(1);
        showSection(sectionId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

// ============================================
// LOAD & DISPLAY COURSES
// ============================================
async function loadCourses() {
    try {
        const response = await fetch('courses.json');
        const data = await response.json();
        displayCourses(data.categories);
    } catch (error) {
        console.error('Error loading courses:', error);
        document.getElementById('course-categories').innerHTML =
            '<p style="color: var(--text-dim);">Error loading courses. Please check courses.json file.</p>';
    }
}

function displayCourses(categories) {
    const container = document.getElementById('course-categories');
    container.innerHTML = '';

    categories.forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category';

        categoryDiv.innerHTML = `
            <div class="category-header">
                <span class="category-icon">${category.icon}</span>
                <h3 class="category-title">${category.name}</h3>
            </div>
        `;

        category.subcategories.forEach(subcategory => {
            const subcategoryDiv = document.createElement('div');
            subcategoryDiv.className = 'subcategory';

            subcategoryDiv.innerHTML = `
                <h4 class="subcategory-title">${subcategory.name}</h4>
                <div class="courses-grid">
                    ${subcategory.courses.map(course => createCourseCard(course)).join('')}
                </div>
            `;

            categoryDiv.appendChild(subcategoryDiv);
        });

        container.appendChild(categoryDiv);
    });
}

function getPlaylistId(url) {
    if (!url) return null;
    const match = url.match(/[?&]list=([^&]+)/);
    return match ? match[1] : null;
}

function createCourseCard(course) {
    const playlistId = getPlaylistId(course.youtubeLink);
    const cardId = 'player-' + Math.random().toString(36).substring(2, 9);

    return `
        <div class="course-card">
            <h5 class="course-title">${course.title}</h5>
            <p class="course-description">${course.description}</p>
            <div class="course-prereqs">
                <strong>Prerequisites</strong>
                <span class="course-prereqs-text">${course.prerequisites}</span>
            </div>
            ${playlistId ? `
                <div class="video-container" id="${cardId}">
                    <button class="video-toggle" onclick="toggleVideo('${cardId}', '${playlistId}')">
                        <span class="video-toggle-icon">▶</span>
                        <span>Watch Lectures</span>
                    </button>
                    <div class="video-embed" style="display: none;"></div>
                </div>
            ` : ''}
            <div class="course-links">
                ${course.youtubeLink ? `
                    <a href="${course.youtubeLink}" target="_blank" class="course-link youtube-link">
                        ↗ Open on YouTube
                    </a>
                ` : ''}
                ${course.pdfLink ? `
                    <a href="${course.pdfLink}" target="_blank" class="course-link pdf-link">
                        ◈ Course Notes
                    </a>
                ` : ''}
            </div>
        </div>
    `;
}

function toggleVideo(cardId, playlistId) {
    const container = document.getElementById(cardId);
    const embedDiv = container.querySelector('.video-embed');
    const button = container.querySelector('.video-toggle');

    if (embedDiv.style.display === 'none') {
        // Load iframe only on first click (saves bandwidth)
        if (!embedDiv.innerHTML) {
            embedDiv.innerHTML = `
                <iframe
                    src="https://www.youtube.com/embed/videoseries?list=${playlistId}"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen>
                </iframe>
            `;
        }
        embedDiv.style.display = 'block';
        button.classList.add('active');
        button.querySelector('.video-toggle-icon').textContent = '▼';
        button.querySelector('span:last-child').textContent = 'Hide Lectures';
    } else {
        embedDiv.style.display = 'none';
        button.classList.remove('active');
        button.querySelector('.video-toggle-icon').textContent = '▶';
        button.querySelector('span:last-child').textContent = 'Watch Lectures';
    }
}

loadCourses();
