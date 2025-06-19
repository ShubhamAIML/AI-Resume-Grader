import os
import re
import PyPDF2
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import spacy
from collections import Counter
import json
from datetime import datetime
import tempfile
from flask import Flask, request, render_template, jsonify, flash, redirect, url_for
from werkzeug.utils import secure_filename
import docx

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

# Load spaCy model
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    nlp = None

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')
app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER', tempfile.gettempdir())
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Create uploads directory if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

ALLOWED_EXTENSIONS = {'pdf', 'txt', 'doc', 'docx'}

# Predefined skill sets for different roles
SKILL_SETS = {
    'developer': [
        'python', 'javascript', 'java', 'c++', 'html', 'css', 'react', 'angular', 'vue',
        'node.js', 'django', 'flask', 'spring', 'git', 'docker', 'kubernetes', 'aws',
        'azure', 'sql', 'mongodb', 'postgresql', 'mysql', 'api', 'rest', 'graphql',
        'agile', 'scrum', 'testing', 'ci/cd', 'linux', 'bash', 'typescript', 'redux'
    ],
    'data_scientist': [
        'python', 'r', 'sql', 'machine learning', 'deep learning', 'tensorflow', 'pytorch',
        'scikit-learn', 'pandas', 'numpy', 'matplotlib', 'seaborn', 'jupyter', 'statistics',
        'data visualization', 'big data', 'hadoop', 'spark', 'tableau', 'power bi',
        'excel', 'sas', 'spss', 'nlp', 'computer vision', 'ai', 'aws', 'azure', 'gcp'
    ],
    'designer': [
        'photoshop', 'illustrator', 'figma', 'sketch', 'adobe xd', 'indesign', 'ui/ux',
        'user experience', 'user interface', 'wireframing', 'prototyping', 'typography',
        'color theory', 'branding', 'logo design', 'web design', 'mobile design',
        'responsive design', 'css', 'html', 'javascript', 'after effects', 'premiere'
    ],
    'general': [
        'communication', 'leadership', 'teamwork', 'problem solving', 'project management',
        'time management', 'critical thinking', 'adaptability', 'creativity', 'collaboration',
        'presentation', 'negotiation', 'customer service', 'sales', 'marketing', 'analysis'
    ]
}

# Common resume sections
REQUIRED_SECTIONS = [
    'contact', 'email', 'phone', 'experience', 'education', 'skills', 'summary', 'objective'
]

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(file_path):
    """Extract text from PDF file"""
    try:
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        return text
    except Exception as e:
        return f"Error reading PDF: {str(e)}"

def extract_text_from_txt(file_path):
    """Extract text from TXT file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()
    except Exception as e:
        return f"Error reading TXT: {str(e)}"

def extract_text_from_docx(file_path):
    """Extract text from DOC/DOCX file"""
    try:
        doc = docx.Document(file_path)
        text = ""
        for para in doc.paragraphs:
            text += para.text + "\n"
        return text
    except Exception as e:
        return f"Error reading DOC/DOCX: {str(e)}"

def extract_contact_info(text):
    """Extract contact information from resume text"""
    contact_info = {}
    
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    emails = re.findall(email_pattern, text)
    contact_info['emails'] = emails
    
    phone_pattern = r'(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})'
    phones = re.findall(phone_pattern, text)
    contact_info['phones'] = ['-'.join(phone) for phone in phones]
    
    linkedin_pattern = r'linkedin\.com/in/[\w-]+'
    linkedin = re.findall(linkedin_pattern, text.lower())
    contact_info['linkedin'] = linkedin
    
    return contact_info

def extract_sections(text):
    """Identify which resume sections are present"""
    text_lower = text.lower()
    found_sections = []
    
    section_keywords = {
        'contact': ['email', 'phone', 'address', 'linkedin'],
        'summary': ['summary', 'profile', 'objective', 'about'],
        'experience': ['experience', 'work', 'employment', 'career', 'professional'],
        'education': ['education', 'degree', 'university', 'college', 'school'],
        'skills': ['skills', 'technical', 'competencies', 'abilities', 'proficient'],
        'projects': ['projects', 'portfolio', 'work samples'],
        'certifications': ['certification', 'certificate', 'licensed', 'accredited']
    }
    
    for section, keywords in section_keywords.items():
        if any(keyword in text_lower for keyword in keywords):
            found_sections.append(section)
    
    return found_sections

def analyze_skills(text, role='general'):
    """Analyze skills mentioned in the resume"""
    text_lower = text.lower()
    relevant_skills = SKILL_SETS.get(role, SKILL_SETS['general'])
    
    found_skills = []
    for skill in relevant_skills:
        if skill.lower() in text_lower:
            found_skills.append(skill)
    
    return found_skills

def calculate_experience_years(text):
    """Estimate years of experience from resume text"""
    year_pattern = r'\b(19|20)\d{2}\b'
    years = re.findall(year_pattern, text)
    
    if len(years) >= 2:
        years = [int(year) for year in years]
        return max(years) - min(years)
    
    exp_pattern = r'(\d+)[\s]*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)'
    exp_matches = re.findall(exp_pattern, text.lower())
    
    if exp_matches:
        return max([int(match) for match in exp_matches])
    
    return 0

def analyze_formatting(text):
    """Analyze resume formatting quality"""
    score = 0
    feedback = []
    
    word_count = len(text.split())
    if 300 <= word_count <= 800:
        score += 20
    elif word_count < 300:
        feedback.append("Resume is too short. Aim for 300-800 words.")
    else:
        feedback.append("Resume is too long. Keep it concise (300-800 words).")
    
    if '•' in text or '-' in text or '*' in text:
        score += 15
        feedback.append("Good use of bullet points for readability.")
    else:
        feedback.append("Add bullet points to improve readability.")
    
    lines = text.split('\n')
    properly_formatted_lines = 0
    for line in lines:
        line = line.strip()
        if line and (line[0].isupper() or line.startswith('•') or line.startswith('-')):
            properly_formatted_lines += 1
    
    if properly_formatted_lines / max(len(lines), 1) > 0.7:
        score += 15
    else:
        feedback.append("Improve consistency in capitalization and formatting.")
    
    return score, feedback

def grade_resume(text, role='general'):
    """Main function to grade resume and provide feedback"""
    total_score = 0
    feedback = []
    
    contact_info = extract_contact_info(text)
    contact_score = 0
    
    if contact_info['emails']:
        contact_score += 10
        feedback.append("✓ Email found")
    else:
        feedback.append("✗ Add a professional email address")
    
    if contact_info['phones']:
        contact_score += 10
        feedback.append("✓ Phone number found")
    else:
        feedback.append("✗ Add a phone number")
    
    total_score += contact_score
    
    sections = extract_sections(text)
    section_score = 0
    
    required = ['contact', 'experience', 'education', 'skills']
    found_required = sum(1 for req in required if req in sections)
    section_score = (found_required / len(required)) * 25
    
    if 'summary' in sections:
        feedback.append("✓ Professional summary present")
    else:
        feedback.append("✗ Add a professional summary/objective")
    
    if 'experience' in sections:
        feedback.append("✓ Work experience section found")
    else:
        feedback.append("✗ Add work experience section")
    
    total_score += section_score
    
    skills = analyze_skills(text, role)
    if len(skills) >= 5:
        skills_score = 20
        feedback.append(f"✓ Good skill set found: {', '.join(skills[:5])}")
    elif len(skills) >= 3:
        skills_score = 15
        feedback.append(f"Good skills found, consider adding more: {', '.join(skills)}")
    else:
        skills_score = 10
        feedback.append("✗ Add more relevant technical skills")
    
    total_score += skills_score
    
    exp_years = calculate_experience_years(text)
    if exp_years >= 3:
        exp_score = 20
        feedback.append(f"✓ {exp_years} years of experience identified")
    elif exp_years >= 1:
        exp_score = 15
        feedback.append(f"Good: {exp_years} years of experience")
    else:
        exp_score = 10
        feedback.append("✗ Clearly state your years of experience")
    
    total_score += exp_score
    
    format_score, format_feedback = analyze_formatting(text)
    total_score += format_score
    feedback.extend(format_feedback)
    
    total_score = min(total_score, 100)
    
    suggestions = []
    if total_score < 70:
        suggestions.append("Focus on adding quantifiable achievements (e.g., 'Increased sales by 20%')")
        suggestions.append("Use action verbs to start bullet points (e.g., 'Developed', 'Managed', 'Led')")
        suggestions.append("Tailor your resume to specific job requirements")
    
    if len(skills) < 5:
        suggestions.append(f"Add more {role}-specific skills to match job requirements")
    
    return {
        'score': total_score,
        'feedback': feedback,
        'suggestions': suggestions,
        'contact_info': contact_info,
        'sections_found': sections,
        'skills_found': skills,
        'experience_years': exp_years
    }

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file selected'}), 400
    
    file = request.files['file']
    role = request.form.get('role', 'general')
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(filename)[1], dir=app.config['UPLOAD_FOLDER']) as temp_file:
            file.save(temp_file.name)
            temp_path = temp_file.name
        
        try:
            file_ext = filename.rsplit('.', 1)[1].lower()
            
            if file_ext == 'pdf':
                text = extract_text_from_pdf(temp_path)
            elif file_ext == 'txt':
                text = extract_text_from_txt(temp_path)
            elif file_ext in ['doc', 'docx']:
                text = extract_text_from_docx(temp_path)
            else:
                return jsonify({'error': 'Unsupported file type'}), 400
            
            os.unlink(temp_path)
            
            if text.startswith('Error'):
                return jsonify({'error': text}), 400
            
            results = grade_resume(text, role)
            
            return jsonify({
                'success': True,
                'filename': filename,
                'role': role,
                'results': results
            })
            
        except Exception as e:
            if os.path.exists(temp_path):
                os.unlink(temp_path)
            return jsonify({'error': f'Error processing file: {str(e)}'}), 500
    
    return jsonify({'error': 'Invalid file type. Please upload PDF, TXT, DOC, or DOCX files.'}), 400

@app.route('/health')
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
