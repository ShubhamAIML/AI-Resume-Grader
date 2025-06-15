import os
import re
import json
from datetime import datetime
from flask import Flask, render_template, request, jsonify, redirect, url_for
from flask_cors import CORS
import PyPDF2
import spacy
from werkzeug.utils import secure_filename
from collections import Counter
import math

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Create uploads directory if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Load spaCy model (install with: python -m spacy download en_core_web_sm)
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    print("Warning: spaCy model not found. Install with: python -m spacy download en_core_web_sm")
    nlp = None

class ResumeGrader:
    def __init__(self):
        # Define scoring weights
        self.weights = {
            'contact_info': 15,
            'education': 20,
            'experience': 25,
            'skills': 20,
            'formatting': 10,
            'keywords': 10
        }
        
        # Common resume keywords by category
        self.keywords = {
            'technical': ['python', 'java', 'javascript', 'react', 'sql', 'aws', 'docker', 'kubernetes', 'git', 'api', 'machine learning', 'data science', 'artificial intelligence', 'html', 'css', 'node.js', 'mongodb', 'postgresql', 'redis', 'elasticsearch'],
            'management': ['leadership', 'management', 'team', 'project', 'strategy', 'planning', 'budget', 'stakeholder', 'agile', 'scrum', 'coordination', 'delegation'],
            'communication': ['communication', 'presentation', 'writing', 'collaboration', 'interpersonal', 'public speaking', 'negotiation', 'client relations'],
            'analytical': ['analysis', 'research', 'problem solving', 'critical thinking', 'data analysis', 'statistics', 'optimization', 'troubleshooting']
        }
        
        # Role-specific keywords
        self.role_keywords = {
            'developer': ['programming', 'coding', 'software', 'development', 'framework', 'database', 'testing', 'debugging', 'version control', 'ci/cd', 'microservices', 'rest api'],
            'data_scientist': ['statistics', 'machine learning', 'data mining', 'visualization', 'python', 'r', 'sql', 'modeling', 'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch'],
            'designer': ['design', 'ui/ux', 'photoshop', 'illustrator', 'figma', 'prototyping', 'user experience', 'visual', 'wireframing', 'user research', 'design systems'],
            'manager': ['management', 'leadership', 'strategy', 'team building', 'project management', 'budget', 'operations', 'kpi', 'performance', 'mentoring']
        }

    def extract_text_from_pdf(self, file_path):
        """Extract text from PDF file"""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
                return text
        except Exception as e:
            print(f"Error extracting PDF text: {e}")
            return ""

    def parse_resume(self, text):
        """Parse resume text and extract structured information"""
        resume_data = {
            'contact_info': self.extract_contact_info(text),
            'education': self.extract_education(text),
            'experience': self.extract_experience(text),
            'skills': self.extract_skills(text),
            'text': text
        }
        return resume_data

    def extract_contact_info(self, text):
        """Extract contact information from resume text"""
        contact_info = {}
        
        # Email pattern
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, text)
        contact_info['email'] = emails[0] if emails else None
        
        # Phone pattern (improved)
        phone_pattern = r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
        phones = re.findall(phone_pattern, text)
        contact_info['phone'] = phones[0] if phones else None
        
        # LinkedIn pattern
        linkedin_pattern = r'linkedin\.com/in/[\w-]+'
        linkedin = re.findall(linkedin_pattern, text.lower())
        contact_info['linkedin'] = linkedin[0] if linkedin else None
        
        # GitHub pattern
        github_pattern = r'github\.com/[\w-]+'
        github = re.findall(github_pattern, text.lower())
        contact_info['github'] = github[0] if github else None
        
        return contact_info

    def extract_education(self, text):
        """Extract education information"""
        education_keywords = ['bachelor', 'master', 'phd', 'degree', 'university', 'college', 'education', 'graduated', 'gpa', 'honors', 'summa cum laude', 'magna cum laude']
        education_section = []
        
        lines = text.split('\n')
        for i, line in enumerate(lines):
            if any(keyword in line.lower() for keyword in education_keywords):
                # Include surrounding lines for context
                context_lines = lines[max(0, i-2):min(len(lines), i+3)]
                education_section.extend(context_lines)
        
        return list(set(education_section))  # Remove duplicates

    def extract_experience(self, text):
        """Extract work experience information"""
        experience_keywords = ['experience', 'work', 'employment', 'job', 'position', 'role', 'company', 'intern', 'volunteer', 'project', 'achievements']
        experience_section = []
        
        lines = text.split('\n')
        for i, line in enumerate(lines):
            if any(keyword in line.lower() for keyword in experience_keywords):
                # Include surrounding lines for context
                context_lines = lines[max(0, i-2):min(len(lines), i+3)]
                experience_section.extend(context_lines)
        
        return list(set(experience_section))

    def extract_skills(self, text):
        """Extract skills from resume text"""
        all_skills = []
        text_lower = text.lower()
        
        # Check for technical keywords
        for category, keywords in self.keywords.items():
            found_skills = [skill for skill in keywords if skill in text_lower]
            all_skills.extend(found_skills)
        
        return list(set(all_skills))

    def score_contact_info(self, contact_info):
        """Score contact information completeness"""
        score = 0
        feedback = []
        
        if contact_info.get('email'):
            score += 40
        else:
            feedback.append("Add a professional email address")
        
        if contact_info.get('phone'):
            score += 30
        else:
            feedback.append("Include a phone number")
        
        if contact_info.get('linkedin'):
            score += 20
        else:
            feedback.append("Add your LinkedIn profile URL")
        
        if contact_info.get('github'):
            score += 10
        else:
            feedback.append("Consider adding your GitHub profile (especially for technical roles)")
        
        return min(score, 100), feedback

    def score_education(self, education):
        """Score education section"""
        score = 0
        feedback = []
        
        if education:
            score += 70
            degree_keywords = ['bachelor', 'master', 'phd', 'degree']
            if any(keyword in ' '.join(education).lower() for keyword in degree_keywords):
                score += 30
            else:
                feedback.append("Clearly specify your degree type (Bachelor's, Master's, etc.)")
        else:
            score = 0
            feedback.append("Add education section with your degree and institution")
        
        return min(score, 100), feedback

    def score_experience(self, experience):
        """Score work experience section"""
        score = 0
        feedback = []
        
        if experience:
            score += 50
            
            # Check for quantified achievements
            numbers_pattern = r'\d+[%$]?'
            if re.search(numbers_pattern, ' '.join(experience)):
                score += 30
            else:
                feedback.append("Quantify your achievements with numbers (e.g., '20% increase in sales', 'managed team of 5')")
            
            # Check for action verbs
            action_verbs = ['achieved', 'led', 'managed', 'developed', 'created', 'improved', 'increased', 'reduced', 'implemented', 'designed', 'optimized']
            if any(verb in ' '.join(experience).lower() for verb in action_verbs):
                score += 20
            else:
                feedback.append("Use strong action verbs to describe your accomplishments")
        else:
            feedback.append("Add work experience section with your roles and achievements")
        
        return min(score, 100), feedback

    def score_skills(self, skills):
        """Score skills section"""
        score = 0
        feedback = []
        
        if skills:
            # Base score for having skills
            score += 40
            
            # Bonus for variety of skills
            if len(skills) >= 8:
                score += 40
            elif len(skills) >= 5:
                score += 30
            elif len(skills) >= 3:
                score += 20
            else:
                feedback.append("Add more relevant skills (aim for 8+ skills)")
            
            # Bonus for technical skills
            technical_skills = [skill for skill in skills if skill in self.keywords['technical']]
            if technical_skills:
                score += 20
            
        else:
            feedback.append("Add a skills section with relevant technical and soft skills")
        
        return min(score, 100), feedback

    def score_formatting(self, text):
        """Score resume formatting and structure"""
        score = 100
        feedback = []
        
        # Check length
        word_count = len(text.split())
        if word_count < 200:
            score -= 30
            feedback.append("Resume seems too short - aim for 400-800 words")
        elif word_count > 1200:
            score -= 15
            feedback.append("Resume might be too long - consider condensing to 1-2 pages")
        
        # Check for section headers
        common_sections = ['experience', 'education', 'skills', 'summary', 'objective', 'projects']
        found_sections = sum(1 for section in common_sections if section in text.lower())
        if found_sections < 3:
            score -= 40
            feedback.append("Include clear section headers (Experience, Education, Skills, etc.)")
        
        # Check for bullet points or structured format
        if '•' in text or '-' in text or '*' in text:
            score += 10
        else:
            feedback.append("Use bullet points to organize information clearly")
        
        return max(score, 0), feedback

    def score_keywords(self, text, role_type='general'):
        """Score keyword relevance"""
        score = 0
        feedback = []
        text_lower = text.lower()
        
        # General keywords
        general_keywords = []
        for category_keywords in self.keywords.values():
            general_keywords.extend(category_keywords)
        
        found_general = sum(1 for keyword in general_keywords if keyword in text_lower)
        score += min(found_general * 4, 60)
        
        # Role-specific keywords
        if role_type in self.role_keywords:
            role_keywords = self.role_keywords[role_type]
            found_role = sum(1 for keyword in role_keywords if keyword in text_lower)
            score += min(found_role * 8, 40)
        
        if score < 40:
            feedback.append(f"Include more relevant keywords for {role_type} roles")
        
        return min(score, 100), feedback

    def grade_resume(self, resume_data, role_type='general'):
        """Grade the entire resume and return score with feedback"""
        scores = {}
        all_feedback = {}
        
        # Score each section
        scores['contact_info'], all_feedback['contact_info'] = self.score_contact_info(resume_data['contact_info'])
        scores['education'], all_feedback['education'] = self.score_education(resume_data['education'])
        scores['experience'], all_feedback['experience'] = self.score_experience(resume_data['experience'])
        scores['skills'], all_feedback['skills'] = self.score_skills(resume_data['skills'])
        scores['formatting'], all_feedback['formatting'] = self.score_formatting(resume_data['text'])
        scores['keywords'], all_feedback['keywords'] = self.score_keywords(resume_data['text'], role_type)
        
        # Calculate weighted total score
        total_score = sum(scores[category] * (self.weights[category] / 100) for category in self.weights)
        
        # Compile all feedback
        feedback_summary = []
        for category, feedback_list in all_feedback.items():
            feedback_summary.extend(feedback_list)
        
        return {
            'total_score': round(total_score),
            'section_scores': scores,
            'feedback': feedback_summary,
            'parsed_data': resume_data
        }

# Initialize the grader
grader = ResumeGrader()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_resume():
    try:
        if 'resume' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['resume']
        role_type = request.form.get('role_type', 'general')
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if file and file.filename.lower().endswith('.pdf'):
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            
            try:
                # Extract text from PDF
                text = grader.extract_text_from_pdf(file_path)
                
                if not text.strip():
                    return jsonify({'error': 'Could not extract text from PDF. Please ensure your PDF contains readable text.'}), 400
                
                # Parse resume
                resume_data = grader.parse_resume(text)
                
                # Grade resume
                results = grader.grade_resume(resume_data, role_type)
                
                # Clean up uploaded file
                os.remove(file_path)
                
                return jsonify(results)
                
            except Exception as e:
                # Clean up uploaded file if error occurs
                if os.path.exists(file_path):
                    os.remove(file_path)
                return jsonify({'error': f'Error processing resume: {str(e)}'}), 500
        
        return jsonify({'error': 'Please upload a PDF file'}), 400
    
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/health')
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)