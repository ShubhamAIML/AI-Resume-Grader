# 🚀 Resume Grader

**Resume Grader** is an AI-powered Flask web application that analyzes resumes and provides actionable feedback to help users craft job-winning resumes. Leveraging natural language processing and a sleek, modern interface, it evaluates resume content, formatting, and role-specific relevance. Deploy it seamlessly on Render and elevate your job application game! 📄✨

---

## 🌟 Features

* 📂 **File Upload**: Accepts PDF, TXT, DOC, and DOCX files (up to 16MB).
* 🎯 **Role-Based Analysis**: Customized feedback for roles like Software Developer, Data Scientist, UI/UX Designer, or General.
* 🧠 **AI-Driven Insights**:

  * Extracts contact details (email, phone, LinkedIn).
  * Identifies resume sections (e.g., Experience, Education, Skills).
  * Detects skills and estimates years of experience.
  * Assigns a resume score (0-100) with a dynamic progress bar.
* 📝 **Detailed Feedback**: Highlights strengths (✓) and weaknesses (✗).
* 💡 **Improvement Suggestions**: Offers tips to enhance your resume.
* 📸 **Downloadable Results**: Save analysis as a high-quality PNG image.
* 🎨 **Modern UI**: Features glassmorphism design, animations, and responsive layouts.
* ⚡ **Real-Time Analysis**: Instant results powered by Flask and spaCy.

---

## 🛠️ Technologies Used

* **Backend**: Python, Flask, spaCy, NLTK, PyPDF2, python-docx
* **Frontend**: HTML5, CSS3, JavaScript, Font Awesome, html2canvas
* **Deployment**: Render (Python web service), gunicorn
* **Dependencies**: Listed in `requirements.txt`

---

## 📋 Prerequisites

Before running or deploying, ensure you have:

* 🐍 Python 3.10.12
* 🐙 Git
* ☁️ Render account (for deployment)
* 📦 Virtual environment (recommended for local setup)

---

## 🏁 Local Setup

Follow these steps to run the application locally:

### Clone the Repository:

```bash
git clone https://github.com/ShubhamAIML/AI-Resume-Grader.git  
cd resume-grader
```

### Create a Virtual Environment:

```bash
python -m venv venv  
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### Install Dependencies:

```bash
pip install -r requirements.txt
```

### Download spaCy Model:

```bash
python -m spacy download en_core_web_sm
```

### Set Environment Variables:

Create a `.env` file in the root directory:

```bash
echo "SECRET_KEY=$(python -c 'import secrets; print(secrets.token_hex(16))')" > .env
```

### Run the Application:

```bash
python app.py
```

Visit [http://localhost:5000](http://localhost:5000) in your browser to use the app.

---

## ☁️ Deploying to Render

Deploy your Resume Grader on Render’s free tier with these steps:

### Prepare Your Repository:

Ensure your project structure matches:

```
resume-grader/
├── app.py
├── requirements.txt
├── gunicorn.conf.py
├── Procfile
├── render.yaml
├── .gitignore
├── download_spacy_model.sh
├── templates/
│   └── index.html
├── static/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── script.js
```

### Make the spaCy Script Executable:

```bash
chmod +x download_spacy_model.sh
```

### Initialize Git and Push to GitHub:

```bash
git init  
git add .  
git commit -m "Initial commit for Resume Grader"  
git remote add origin https://github.com/ShubhamAIML/AI-Resume-Grader.git  
git push -u origin main
```

### Create a Web Service on Render:

* Log in to Render and select **New > Web Service**.
* Connect your GitHub repository.
* If using `render.yaml`, Render auto-configures settings. Otherwise:

  * **Runtime**: Python
  * **Build Command**: `./download_spacy_model.sh`
  * **Start Command**: `gunicorn app:app`
  * **Environment Variables**:

    * `SECRET_KEY`: Generate a secure key (e.g., `python -c "import secrets; print(secrets.token_hex(16))"`) or let Render generate it.
    * `PYTHON_VERSION`: 3.10.12

### Deploy:

* Click **Create Web Service** or push changes to trigger deployment.
* Check build logs to ensure the spaCy model downloads successfully.
* Access your app at the Render URL (e.g., `https://resume-grader.onrender.com`).

---

## 📂 Project Structure

```
resume-grader/
├── app.py                  # Flask application logic
├── requirements.txt        # Python dependencies
├── gunicorn.conf.py        # Gunicorn configuration for Render
├── Procfile                # Render start command
├── render.yaml             # Render deployment blueprint
├── .gitignore              # Files to ignore in Git
├── download_spacy_model.sh # Script to install spaCy model
├── templates/
│   └── index.html          # Frontend HTML template
├── static/
│   ├── css/
│   │   └── style.css       # CSS styles
│   └── js/
│       └── script.js       # JavaScript logic
```

---

## 🎮 How to Use

### Upload a Resume:

* Drag and drop or click to upload a PDF, TXT, DOC, or DOCX file (max 16MB).

### Select a Target Role:

* Choose from General, Software Developer, Data Scientist, or UI/UX Designer.

### Analyze:

* Click **Analyze Resume** to receive a score, feedback, and suggestions.

### Review Results:

* View your resume score, contact info, sections, skills, and experience.
* Check detailed feedback and improvement tips.

### Download Analysis:

* Click **Download Analysis** to save results as a PNG image.

---

## 🐞 Troubleshooting

### Render Build Fails:

* Check logs for spaCy model download errors. Ensure `download_spacy_model.sh` is executable (`chmod +x`).
* Verify `requirements.txt` dependencies are correct.

### File Upload Errors:

* Confirm files are in supported formats (PDF, TXT, DOC, DOCX) and under 16MB.
* Check `app.py` for correct `UPLOAD_FOLDER` configuration.

### Analysis Fails:

* Ensure `en_core_web_sm` spaCy model is installed.
* Review server logs for errors in `app.py`.

### Static Files Not Loading:

* Verify `style.css` and `script.js` are in `static/css/` and `static/js/`.
* Check `index.html` for correct `url_for` paths.

---

## 🔮 Future Enhancements

* 🌍 Support additional file formats (e.g., RTF).
* 📊 Add database integration for result storage.
* 🤖 Upgrade to advanced NLP models for deeper analysis.
* 🎨 Implement customizable UI themes.
* 📱 Enhance mobile responsiveness.

---

## 📜 License

This project is licensed under the MIT License. See the LICENSE file for details.

---

## 🙌 Contributing

We welcome contributions! 🎉

* Fork the repository.
* Create a feature branch (`git checkout -b feature/YourFeature`).
* Commit changes (`git commit -m 'Add YourFeature'`).
* Push to the branch (`git push origin feature/YourFeature`).
* Open a Pull Request.

---

## 📧 Contact

Questions or feedback? Reach out via:

* **Email**: [24081712@scale.iitrpr.ac.in](24081712@scale.iitrpr.ac.in)
* **GitHub**: ShubhamAIML

**Happy resume grading! 🚀📄**

---
