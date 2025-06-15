# 🎯 AI Resume Grader - Automated Resume Scoring System

A sophisticated Flask web application that analyzes resumes using AI and provides instant scoring with actionable feedback. Perfect for job seekers looking to optimize their resumes and increase their chances of landing interviews.

## 🌟 Key Features

- **AI-Powered Analysis**: Advanced natural language processing to understand resume content
- **Comprehensive Scoring**: 0-100 scoring system across multiple criteria with weighted importance
- **Role-Specific Feedback**: Tailored suggestions based on target job roles (Developer, Data Scientist, Designer, Manager)
- **PDF Processing**: Intelligent text extraction from PDF resumes
- **Real-time Feedback**: Instant actionable recommendations for improvement
- **Modern UI**: Beautiful, responsive interface with smooth animations
- **Mobile Optimized**: Works perfectly on all devices

## 🏗️ Project Structure

```
resume-grader/
├── app.py                 # Main Flask application with all Python logic
├── templates/
│   └── index.html        # Single HTML file with embedded CSS and JS
├── uploads/              # Temporary storage for uploaded files
├── requirements.txt      # Python dependencies
└── README.md            # Project documentation
```

## 🚀 Quick Setup

### Prerequisites
- Python 3.8 or higher
- pip package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <AI-Resume-Grader>
   cd AI-Resume-Grader
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Download spaCy model**
   ```bash
   python -m spacy download en_core_web_sm
   ```

5. **Run the application**
   ```bash
   python app.py
   ```

6. **Open your browser**
   Navigate to `http://localhost:5000`

## 🔧 Technologies Used

- **Backend**: Flask (Python)
- **NLP**: spaCy for natural language processing
- **PDF Processing**: PyPDF2 for text extraction
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Styling**: Custom CSS with modern design principles
- **Deployment**: Gunicorn WSGI server (production ready)

## 📊 Scoring Criteria

The AI grader evaluates resumes across 6 key areas:

1. **Contact Information (15%)**: Email, phone, LinkedIn, GitHub
2. **Education (20%)**: Degree information, institution details
3. **Work Experience (25%)**: Role descriptions, achievements, quantified results
4. **Skills (20%)**: Technical and soft skills relevance
5. **Formatting (10%)**: Structure, readability, section organization  
6. **Keywords (10%)**: Industry-relevant terms and role-specific language

## 🎯 Role-Specific Scoring

- **Software Developer**: Focus on programming languages, frameworks, technical projects
- **Data Scientist**: Emphasis on statistics, machine learning, data analysis tools
- **Designer**: UI/UX skills, design tools, portfolio mentions
- **Manager**: Leadership experience, team management, strategic planning
- **General**: Balanced evaluation across all criteria

## 🚀 Deployment on Render

1. **Prepare for deployment**
   - Ensure `gunicorn` is in requirements.txt
   - Add `Procfile` if needed: `web: gunicorn app:app`

2. **Deploy to Render**
   - Connect your GitHub repository
   - Set build command: `pip install -r requirements.txt && python -m spacy download en_core_web_sm`
   - Set start command: `gunicorn app:app`
   - Deploy!

## 🔍 API Endpoints

- `GET /`: Main application interface
- `POST /upload`: Resume upload and analysis endpoint
- `GET /health`: Health check for monitoring

## 🎨 UI/UX Features

- **Drag & Drop Upload**: Intuitive file upload experience
- **Real-time Validation**: Instant feedback on file selection
- **Progress Indicators**: Clear loading states during analysis
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Smooth Animations**: Professional micro-interactions
- **Accessibility**: Screen reader friendly and keyboard navigable

## 🔒 Security Features

- File size limits (16MB max)
- File type validation (PDF only)
- Secure filename handling
- Temporary file cleanup
- Input sanitization

## 📈 Future Enhancements

- Support for DOC/DOCX files
- Version history tracking
- Resume builder functionality
- Integration with job boards
- Batch processing capabilities
- Advanced AI tone analysis

## 🤝 Contributing

Feel free to fork this project and submit pull requests for improvements!

## 📄 License

This project is open source and available under the MIT License.

---

**Live Demo**: [Your Deployed URL Here]  

Built with ❤️ for the hackathon by Shubham.
