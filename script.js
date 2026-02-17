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
        if (this.y < -30) this.reset();
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
    floatingSymbols.forEach(s => { s.update(); s.draw(); });
    requestAnimationFrame(animate);
}
animate();

// ============================================
// NAVIGATION
// ============================================
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    document.querySelectorAll('nav a').forEach(l => l.classList.remove('active'));
    const navLink = document.querySelector(`nav a[href="#${sectionId}"]`);
    if (navLink) navLink.classList.add('active');
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
// YOUTUBE IFRAME API
// ============================================
let ytReady = false;
let pendingCourseIndex = null;

// Load the IFrame Player API asynchronously
const ytScript = document.createElement('script');
ytScript.src = 'https://www.youtube.com/iframe_api';
document.head.appendChild(ytScript);

window.onYouTubeIframeAPIReady = function() {
    ytReady = true;
    if (pendingCourseIndex !== null) {
        const idx = pendingCourseIndex;
        pendingCourseIndex = null;
        showCourseDetail(idx);
    }
};

// ============================================
// LOAD & DISPLAY COURSES
// ============================================
let allCourses = [];

async function loadCourses() {
    try {
        const response = await fetch('courses.json');
        const data = await response.json();
        allCourses = [];
        data.categories.forEach(cat => {
            cat.subcategories.forEach(sub => {
                sub.courses.forEach(course => allCourses.push(course));
            });
        });
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
    let courseIndex = 0;

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
            const coursesHtml = subcategory.courses.map(course => {
                const html = createCourseCard(course, courseIndex);
                courseIndex++;
                return html;
            }).join('');
            subcategoryDiv.innerHTML = `
                <h4 class="subcategory-title">${subcategory.name}</h4>
                <div class="courses-grid">${coursesHtml}</div>
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

function createCourseCard(course, index) {
    const playlistId = getPlaylistId(course.youtubeLink);
    return `
        <div class="course-card">
            <h5 class="course-title">${course.title}</h5>
            <p class="course-description">${course.description}</p>
            <div class="course-prereqs">
                <strong>Prerequisites</strong>
                <span class="course-prereqs-text">${course.prerequisites}</span>
            </div>
            ${playlistId ? `
                <div class="video-container">
                    <button class="video-toggle" onclick="showCourseDetail(${index})">
                        <span class="video-toggle-icon">▶</span>
                        <span>Watch Lectures</span>
                    </button>
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

// ============================================
// COURSE DETAIL VIEW
// ============================================
let player = null;

function showCourseDetail(index) {
    // If YouTube API isn't loaded yet, queue and wait
    if (!ytReady) {
        pendingCourseIndex = index;
        // Show section immediately with a loading state
        document.getElementById('detail-title').textContent = allCourses[index].title;
        document.getElementById('detail-video').innerHTML = '';
        document.getElementById('detail-playlist').innerHTML =
            '<div class="playlist-loading">Loading player...</div>';
        showSection('course-detail');
        document.querySelectorAll('nav a').forEach(l => l.classList.remove('active'));
        const nav = document.querySelector('nav a[href="#courses"]');
        if (nav) nav.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    const course = allCourses[index];
    const playlistId = getPlaylistId(course.youtubeLink);

    // Populate text info
    document.getElementById('detail-title').textContent = course.title;
    document.getElementById('detail-description').textContent = course.description;
    document.getElementById('detail-prereqs').innerHTML = `
        <strong>Prerequisites</strong>
        <span>${course.prerequisites}</span>
    `;

    let linksHtml = '';
    if (course.youtubeLink) {
        linksHtml += `<a href="${course.youtubeLink}" target="_blank" class="course-link youtube-link">↗ Open on YouTube</a>`;
    }
    if (course.pdfLink) {
        linksHtml += `<a href="${course.pdfLink}" target="_blank" class="course-link pdf-link">◈ Course Notes</a>`;
    }
    document.getElementById('detail-links').innerHTML = linksHtml;

    // Destroy previous player
    if (player) {
        player.destroy();
        player = null;
    }

    // Setup player container
    document.getElementById('detail-video').innerHTML = '<div id="yt-player"></div>';
    document.getElementById('detail-playlist').innerHTML =
        '<div class="playlist-loading">Loading playlist...</div>';

    if (playlistId) {
        player = new YT.Player('yt-player', {
            width: '100%',
            height: '100%',
            playerVars: {
                listType: 'playlist',
                list: playlistId,
            },
            events: {
                onReady: onPlayerReady,
                onStateChange: onPlayerStateChange,
            }
        });
    }

    showSection('course-detail');
    document.querySelectorAll('nav a').forEach(l => l.classList.remove('active'));
    const nav = document.querySelector('nav a[href="#courses"]');
    if (nav) nav.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function onPlayerReady(event) {
    const videoIds = event.target.getPlaylist() || [];
    buildPlaylistSidebar(videoIds);
    updateActiveLecture(0);
}

function onPlayerStateChange(event) {
    if (player) {
        updateActiveLecture(player.getPlaylistIndex());
    }
}

function buildPlaylistSidebar(videoIds) {
    const sidebar = document.getElementById('detail-playlist');
    sidebar.innerHTML = '';

    videoIds.forEach((videoId, i) => {
        const item = document.createElement('button');
        item.className = 'playlist-item';
        item.dataset.index = i;
        item.innerHTML = `
            <img class="playlist-thumb" src="https://img.youtube.com/vi/${videoId}/default.jpg" alt="">
            <div class="playlist-item-info">
                <span class="playlist-item-number">${i + 1}</span>
                <span class="playlist-item-title">Lecture ${i + 1}</span>
            </div>
        `;
        item.addEventListener('click', () => {
            player.playVideoAt(i);
        });
        sidebar.appendChild(item);
    });

    // Fetch actual video titles asynchronously
    videoIds.forEach((videoId, i) => {
        fetchVideoTitle(videoId, i);
    });
}

async function fetchVideoTitle(videoId, index) {
    try {
        const resp = await fetch(
            `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`
        );
        const data = await resp.json();
        if (data.title) {
            const items = document.querySelectorAll('.playlist-item');
            if (items[index]) {
                items[index].querySelector('.playlist-item-title').textContent = data.title;
            }
        }
    } catch (e) {
        // Keep "Lecture N" fallback
    }
}

function updateActiveLecture(activeIndex) {
    document.querySelectorAll('.playlist-item').forEach((item, i) => {
        item.classList.toggle('active', i === activeIndex);
    });
    // Scroll active item into view in sidebar
    const activeItem = document.querySelector('.playlist-item.active');
    if (activeItem) {
        activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
}

function hideCourseDetail() {
    if (player) {
        player.destroy();
        player = null;
    }
    document.getElementById('detail-video').innerHTML = '';
    document.getElementById('detail-playlist').innerHTML = '';
    showSection('courses');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

loadCourses();
