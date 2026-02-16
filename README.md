# Math Courses Website

A modern, clean website for hosting math lecture videos and course notes.

## 📁 Structure

```
math-courses-website/
├── index.html          # Main website page
├── styles.css          # Styling
├── script.js           # JavaScript for dynamic content
├── courses.json        # Course data (EDIT THIS to add/modify courses)
├── pdfs/              # Folder for PDF notes
│   ├── sequences-and-series.pdf
│   ├── binomial-theorem.pdf
│   └── ...
└── README.md          # This file
```

## 🚀 How to Deploy on GitHub Pages

1. **Create a GitHub repository:**
   ```bash
   # On GitHub, create a new repository (e.g., "math-courses")
   ```

2. **Push your code:**
   ```bash
   cd ~/Desktop/DriveGeneral/math-courses-website
   git add .
   git commit -m "Initial commit: Math courses website"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
   git push -u origin main
   ```

3. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Click "Settings" → "Pages"
   - Under "Source", select "main" branch and "/" (root) folder
   - Click "Save"
   - Your site will be live at: `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/`

## ✏️ How to Add/Edit Courses

**Everything is controlled by `courses.json`!** Just edit this file.

### Adding a New Course

Open `courses.json` and add to the appropriate subcategory:

```json
{
  "title": "Your Course Name",
  "description": "Brief description of what the course covers",
  "prerequisites": "What students should know before taking this",
  "youtubeLink": "https://www.youtube.com/playlist?list=YOUR-PLAYLIST-ID",
  "pdfLink": "pdfs/your-course-notes.pdf"
}
```

### Adding a New Subcategory

```json
{
  "name": "New Topic (e.g., Geometry)",
  "courses": [
    { /* course objects here */ }
  ]
}
```

### Adding a New Category

```json
{
  "name": "Graduate Math",
  "icon": "🎯",
  "subcategories": [
    { /* subcategory objects here */ }
  ]
}
```

## 📄 Adding PDF Files

1. Place your PDF in the `pdfs/` folder
2. Reference it in `courses.json` as: `"pdfLink": "pdfs/filename.pdf"`

## 🎨 Customization

- **Colors**: Edit CSS variables in `styles.css` (`:root` section)
- **Content**: Edit `index.html` for "About" section and page title
- **Structure**: Edit `courses.json` for all course data

## 📝 Example: Complete courses.json Entry

```json
{
  "categories": [
    {
      "name": "High School Math",
      "icon": "🎓",
      "subcategories": [
        {
          "name": "Algebra",
          "courses": [
            {
              "title": "Sequences and Series",
              "description": "Comprehensive study of sequences and series",
              "prerequisites": "Basic algebra",
              "youtubeLink": "https://youtube.com/...",
              "pdfLink": "pdfs/sequences.pdf"
            }
          ]
        }
      ]
    }
  ]
}
```

## 🛠️ Testing Locally

You can test the website locally by opening `index.html` in your browser. However, due to CORS restrictions, you might need to use a local server:

```bash
# Using Python 3
python3 -m http.server 8000

# Then open: http://localhost:8000
```

## 📧 Support

For issues or questions, refer to GitHub Pages documentation: https://pages.github.com/
