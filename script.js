// Navigation
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // Show selected section
    document.getElementById(sectionId).classList.add('active');

    // Update nav active state
    document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`nav a[href="#${sectionId}"]`).classList.add('active');
}

// Handle nav clicks
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = link.getAttribute('href').substring(1);
        showSection(sectionId);
    });
});

// Load and display courses
async function loadCourses() {
    try {
        const response = await fetch('courses.json');
        const data = await response.json();
        displayCourses(data.categories);
    } catch (error) {
        console.error('Error loading courses:', error);
        document.getElementById('course-categories').innerHTML =
            '<p>Error loading courses. Please check courses.json file.</p>';
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

function createCourseCard(course) {
    return `
        <div class="course-card">
            <h5 class="course-title">${course.title}</h5>
            <p class="course-description">${course.description}</p>
            <div class="course-prereqs">
                <strong>Prerequisites:</strong>
                <span class="course-prereqs-text">${course.prerequisites}</span>
            </div>
            <div class="course-links">
                ${course.youtubeLink ? `
                    <a href="${course.youtubeLink}" target="_blank" class="course-link youtube-link">
                        ▶ YouTube
                    </a>
                ` : ''}
                ${course.pdfLink ? `
                    <a href="${course.pdfLink}" target="_blank" class="course-link pdf-link">
                        📄 Notes (PDF)
                    </a>
                ` : ''}
            </div>
        </div>
    `;
}

// Load courses when page loads
loadCourses();
