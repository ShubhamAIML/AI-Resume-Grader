# AI Resume Grader

An AI-powered web application that analyzes resumes and provides detailed feedback and scoring.

## Features

- 📄 Support for PDF, doc, docx and TXT file formats
- 🎯 Role-specific analysis (Developer, Data Scientist, Designer, General)
- 📊 Comprehensive scoring system (0-100)
- 📝 Detailed feedback on resume sections
- 🛠️ Skills identification and analysis
- 📱 Responsive design for mobile and desktop
- 🚀 Real-time analysis with progress indicators

## Installation

### Prerequisites

- Python 3.7 or higher
- pip (Python package installer)

### Setup Steps

1. **Clone or download the project files**
   ```bash
   # Create a new directory for the project
   mkdir ai-resume-grader
   cd ai-resume-grader
   ```

2. **Create a virtual environment (recommended)**
   ```bash
   python -m venv venv
   
   # Activate virtual environment
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Download spaCy language model**
   ```bash
   python -m spacy download en_core_web_sm
   ```

5. **Create necessary directories**
   ```bash
   mkdir uploads
   mkdir templates
   ```

6. **Move the HTML file to templates directory**
   - Save the provided HTML file as `templates/index.html`

7. **Run the application**
   ```bash
   python app.py
   ```

8. **Access the application**
   - Open your browser and go to `http://localhost:5000`

## File Structure

```
ai-resume-grader/
├── static/
│   ├── css/styles.css
│   └── js/script.js
├── templates/
│   └── index.html
├── uploads/
│   └── .gitkeep
├── .gitignore
├── Procfile
├── README.md
├── app.py
├── requirements.txt
└── runtime.txt
```

## Usage

1. **Upload Resume**: Click "Choose File" or drag and drop your resume (PDF, TXT, DOC, DOCX format)
2. **Select Role**: Choose the target role from the dropdown menu
3. **Analyze**: Click "Analyze Resume" to get instant feedback
4. **Review Results**: View your score, detailed feedback, and improvement suggestions

## Scoring Criteria

The application evaluates resumes based on:

- **Contact Information (20%)**: Email, phone number presence
- **Section Completeness (25%)**: Required sections like experience, education, skills
- **Skills Analysis (20%)**: Role-relevant technical and soft skills
- **Experience Analysis (20%)**: Years of experience identification
- **Formatting Quality (15%)**: Structure, readability, and presentation

## Role-Specific Analysis

### Developer
- Programming languages (Python, JavaScript, Java, etc.)
- Frameworks and libraries
- Development tools and methodologies
- Cloud platforms and databases

### Data Scientist
- Statistical and ML tools (Python, R, TensorFlow, etc.)
- Data visualization tools
- Big data technologies
- Analytics platforms

### Designer
- Design software (Photoshop, Figma, Sketch, etc.)
- UI/UX principles
- Design methodologies
- Creative skills

### General
- Soft skills and transferable abilities
- Leadership and communication
- Project management
- General business skills

## Troubleshooting

### Common Issues

1. **spaCy model not found**
   ```bash
   python -m spacy download en_core_web_sm
   ```

2. **NLTK data not found**
   - The app will automatically download required NLTK data on first run

3. **File upload issues**
   - Ensure file size is under 16MB
   - Only PDF, TXT, DOC and DOCX files are supported

4. **Port already in use**
   - Change the port in app.py: `app.run(debug=True, host='0.0.0.0', port=5001)`

## Customization

### Adding New Roles
Edit the `SKILL_SETS` dictionary in `app.py` to add new roles and their associated skills.

### Modifying Scoring Criteria
Adjust the scoring weights in the `grade_resume()` function in `app.py`.

### Styling Changes
Modify the CSS in the `<style>` section of `templates/index.html`.

## Security Notes

- Files are processed in temporary storage and automatically deleted
- No data is permanently stored on the server
- Change the `SECRET_KEY` in `app.py` for production use

## License

This project is open source and available under the MIT License.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions, please check the troubleshooting section or create an issue in the project repository.