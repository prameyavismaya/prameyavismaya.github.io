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
        ctx.font = `${this.size}px "League Spartan", sans-serif`;
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
// SIDE PANE
// ============================================
function openSidePane(title, content) {
    document.getElementById('side-pane-title').textContent = title;
    document.getElementById('side-pane-content').textContent = content;
    document.getElementById('side-pane').classList.add('open');
    document.getElementById('side-pane-overlay').classList.add('visible');
}

function closeSidePane() {
    document.getElementById('side-pane').classList.remove('open');
    document.getElementById('side-pane-overlay').classList.remove('visible');
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSidePane();
});

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
            cat.courses.forEach(course => allCourses.push(course));
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
        const catLabel = document.createElement('span');
        catLabel.className = 'tree-subcategory-label';
        catLabel.textContent = category.name;
        container.appendChild(catLabel);

        category.courses.forEach(course => {
            const item = createTreeCourseItem(course, courseIndex);
            container.appendChild(item);
            courseIndex++;
        });
    });

    setupFilters();
}

function createTreeCourseItem(course, index) {
    const item = document.createElement('div');
    item.className = 'tree-course-item';
    item.dataset.suitableFor = course.suitableFor || '';

    // Toggle button (course title row)
    const toggle = document.createElement('button');
    toggle.className = 'tree-course-toggle';

    const arrow = document.createElement('span');
    arrow.className = 'tree-arrow';
    arrow.textContent = '▶';
    toggle.appendChild(arrow);
    toggle.appendChild(document.createTextNode(' ' + course.title));

    // Subtree (expanded children)
    const subtree = document.createElement('div');
    subtree.className = 'tree-course-subtree';

    // Description
    if (course.description) {
        subtree.appendChild(createSubItemBtn('Description', course.description));
    }

    // Prerequisites
    if (course.prerequisites) {
        subtree.appendChild(createSubItemBtn('Prerequisites', course.prerequisites));
    }

    // Relevant Exams
    if (course.relevantExams) {
        subtree.appendChild(createSubItemBtn('Relevant Exams', course.relevantExams));
    }

    // Suitable for (static, shown inline)
    if (course.suitableFor) {
        subtree.appendChild(createSubItemStatic('Suitable for: ' + course.suitableFor));
    }

    // Watch Here (detail page)
    if (course.youtubeLink) {
        subtree.appendChild(createSubItemAction('Watch Here', () => showCourseDetail(index), 'watch-here'));
    }

    // Watch on YouTube
    if (course.youtubeLink) {
        subtree.appendChild(createSubItemLink('Watch on YouTube', course.youtubeLink, 'watch-yt'));
    }

    // Course Notes
    if (course.pdfLink) {
        subtree.appendChild(createSubItemLink('Course Notes', course.pdfLink, 'notes'));
    }

    // Toggle expand/collapse
    toggle.addEventListener('click', () => {
        const isOpen = subtree.classList.contains('open');
        // Close all other open subtrees
        document.querySelectorAll('.tree-course-subtree.open').forEach(st => {
            st.classList.remove('open');
            if (st.previousElementSibling) {
                st.previousElementSibling.classList.remove('expanded');
            }
        });
        if (!isOpen) {
            subtree.classList.add('open');
            toggle.classList.add('expanded');
        }
    });

    item.appendChild(toggle);
    item.appendChild(subtree);
    return item;
}

// ============================================
// COURSE FILTERS
// ============================================
function setupFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;

            if (filter === 'all') {
                // Activate only "All"
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                applyFilter(['all']);
            } else {
                // Toggle this specific filter; deactivate "All"
                btn.classList.toggle('active');
                document.querySelector('.filter-btn[data-filter="all"]').classList.remove('active');

                const activeFilters = Array.from(
                    document.querySelectorAll('.filter-btn.active')
                ).map(b => b.dataset.filter);

                if (activeFilters.length === 0) {
                    // Nothing active → fall back to All
                    document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');
                    applyFilter(['all']);
                } else {
                    applyFilter(activeFilters);
                }
            }
        });
    });
}

function applyFilter(activeFilters) {
    document.querySelectorAll('.tree-course-item').forEach(item => {
        const suitableFor = item.dataset.suitableFor || '';
        const showAll = activeFilters.includes('all');
        const matches = showAll || activeFilters.some(
            f => suitableFor.toLowerCase().includes(f.toLowerCase())
        );

        if (matches) {
            item.classList.remove('grayed');
        } else {
            item.classList.add('grayed');
            // Collapse any open subtree
            const subtree = item.querySelector('.tree-course-subtree');
            const toggle = item.querySelector('.tree-course-toggle');
            if (subtree) subtree.classList.remove('open');
            if (toggle) toggle.classList.remove('expanded');
        }
    });
}

function createSubItemBtn(label, content) {
    const row = document.createElement('div');
    row.className = 'tree-subitem';
    const btn = document.createElement('button');
    btn.className = 'tree-subitem-btn';
    btn.textContent = label;
    btn.addEventListener('click', () => openSidePane(label, content));
    row.appendChild(btn);
    return row;
}

function createSubItemStatic(text) {
    const row = document.createElement('div');
    row.className = 'tree-subitem';
    const span = document.createElement('span');
    span.className = 'tree-subitem-static';
    span.textContent = text;
    row.appendChild(span);
    return row;
}

function createSubItemAction(label, action, cssClass) {
    const row = document.createElement('div');
    row.className = 'tree-subitem';
    const btn = document.createElement('button');
    btn.className = 'tree-subitem-btn tree-subitem-' + cssClass;
    btn.textContent = label;
    btn.addEventListener('click', action);
    row.appendChild(btn);
    return row;
}

function createSubItemLink(label, href, cssClass) {
    const row = document.createElement('div');
    row.className = 'tree-subitem';
    const a = document.createElement('a');
    a.className = 'tree-subitem-link tree-subitem-' + cssClass;
    a.textContent = label;
    a.href = href;
    a.target = '_blank';
    row.appendChild(a);
    return row;
}

// ============================================
// COURSE DETAIL VIEW
// ============================================
let player = null;

function showCourseDetail(index) {
    if (!ytReady) {
        pendingCourseIndex = index;
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
    document.getElementById('detail-description').textContent = course.description || '';

    document.getElementById('detail-prereqs').innerHTML = course.prerequisites ? `
        <strong>Prerequisites</strong>
        <span>${course.prerequisites}</span>
    ` : '';

    document.getElementById('detail-relevant-exams').innerHTML = course.relevantExams ? `
        <strong>Relevant Exams</strong>
        <span>${course.relevantExams}</span>
    ` : '';

    document.getElementById('detail-suitable-for').innerHTML = course.suitableFor ? `
        <strong>Suitable For</strong>
        <span>${course.suitableFor}</span>
    ` : '';

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

function getPlaylistId(url) {
    if (!url) return null;
    const match = url.match(/[?&]list=([^&]+)/);
    return match ? match[1] : null;
}

function onPlayerReady(event) {
    waitForPlaylist(event.target, 0);
}

function waitForPlaylist(ytPlayer, attempt) {
    const videoIds = ytPlayer.getPlaylist();
    if (videoIds && videoIds.length > 0) {
        buildPlaylistSidebar(videoIds);
        updateActiveLecture(0);
    } else if (attempt < 30) {
        setTimeout(() => waitForPlaylist(ytPlayer, attempt + 1), 200);
    } else {
        document.getElementById('detail-playlist').innerHTML =
            '<div class="playlist-loading">Could not load playlist items.</div>';
    }
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
