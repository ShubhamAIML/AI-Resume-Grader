// Global variables
let selectedFile = null;
const fileInput = document.getElementById('fileInput');
const uploadSection = document.getElementById('uploadSection');
const selectedFileDiv = document.getElementById('selectedFile');
const fileName = document.getElementById('fileName');
const removeFileBtn = document.getElementById('removeFile');
const analyzeButton = document.getElementById('analyzeButton');
const roleSelect = document.getElementById('roleSelect');
const loading = document.getElementById('loading');
const results = document.getElementById('results');
const errorMessage = document.getElementById('errorMessage');
const scoreNumber = document.getElementById('scoreNumber');
const scoreFill = document.getElementById('scoreFill');

// Event listeners
fileInput.addEventListener('change', handleFileSelect);
uploadSection.addEventListener('dragover', handleDragOver);
uploadSection.addEventListener('drop', handleDrop);
uploadSection.addEventListener('dragleave', handleDragLeave);
removeFileBtn.addEventListener('click', removeSelectedFile);
analyzeButton.addEventListener('click', analyzeResume);

// Functions
function handleFileSelect(e) {
    errorMessage.classList.remove('show');
    const file = e.target.files[0];
    if (file && isValidFileType(file) && file.size <= 16 * 1024 * 1024) {
        selectedFile = file;
        displaySelectedFile(file.name);
        enableAnalyzeButton();
    } else {
        if (!isValidFileType(file)) {
            showError('Invalid file type. Please upload a PDF, TXT, DOC, or DOCX file.');
        } else {
            showError('File is too large. Maximum size is 16MB.');
        }
    }
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadSection.classList.remove('dragover');
    errorMessage.classList.remove('show');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (isValidFileType(file) && file.size <= 16 * 1024 * 1024) {
            selectedFile = file;
            displaySelectedFile(file.name);
            enableAnalyzeButton();
        } else {
            if (!isValidFileType(file)) {
                showError('Invalid file type. Please upload a PDF, TXT, DOC, or DOCX file.');
            } else {
                showError('File is too large. Maximum size is 16MB.');
            }
        }
    }
}

function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadSection.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadSection.classList.remove('dragover');
}

function isValidFileType(file) {
    const allowedExtensions = ['pdf', 'txt', 'doc', 'docx'];
    const extension = file.name.split('.').pop().toLowerCase();
    return allowedExtensions.includes(extension);
}

function displaySelectedFile(name) {
    fileName.textContent = name;
    selectedFileDiv.classList.add('show');
}

function enableAnalyzeButton() {
    analyzeButton.disabled = false;
}

function removeSelectedFile() {
    selectedFile = null;
    fileInput.value = '';
    selectedFileDiv.classList.remove('show');
    fileName.textContent = 'No file selected';
    analyzeButton.disabled = true;
    errorMessage.classList.remove('show');
    results.classList.remove('show');
}

function analyzeResume() {
    if (!selectedFile) {
        showError('Please select a file first.');
        return;
    }
    const role = roleSelect.value;
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('role', role);
    showLoading();
    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Server error: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            displayResults(data.results);
            results.classList.add('show');
        } else {
            showError(data.error || 'An error occurred during analysis.');
        }
    })
    .catch(error => {
        showError('Failed to analyze resume: ' + error.message);
    })
    .finally(() => {
        hideLoading();
    });
}

function showLoading() {
    loading.classList.add('show');
    results.classList.remove('show');
    errorMessage.classList.remove('show');
}

function hideLoading() {
    loading.classList.remove('show');
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
}

function displayResults(resultsData) {
    // Score
    const score = resultsData.score;
    scoreNumber.textContent = score;
    scoreFill.style.width = score + '%';

    // Contact Info
    const contactInfoDiv = document.getElementById('contactInfo');
    contactInfoDiv.innerHTML = '';
    const contactInfo = resultsData.contact_info;
    if (contactInfo.emails.length > 0) {
        contactInfoDiv.innerHTML += `<div class="detail-item">Email: ${contactInfo.emails.join(', ')}</div>`;
    }
    if (contactInfo.phones.length > 0) {
        contactInfoDiv.innerHTML += `<div class="detail-item">Phone: ${contactInfo.phones.join(', ')}</div>`;
    }
    if (contactInfo.linkedin.length > 0) {
        contactInfoDiv.innerHTML += `<div class="detail-item">LinkedIn: ${contactInfo.linkedin.join(', ')}</div>`;
    }
    if (!contactInfo.emails.length && !contactInfo.phones.length && !contactInfo.linkedin.length) {
        contactInfoDiv.innerHTML = '<div class="detail-item">No contact information found</div>';
    }

    // Sections Found
    const sectionsFoundDiv = document.getElementById('sectionsFound');
    sectionsFoundDiv.innerHTML = resultsData.sections_found.map(section => `<span class="tag">${section}</span>`).join('');

    // Skills Found
    const skillsFoundDiv = document.getElementById('skillsFound');
    skillsFoundDiv.innerHTML = resultsData.skills_found.map(skill => `<span class="tag">${skill}</span>`).join('');

    // Experience Years
    const experienceYearsDiv = document.getElementById('experienceYears');
    experienceYearsDiv.innerHTML = `<div class="detail-item">${resultsData.experience_years} years</div>`;

    // Feedback
    const feedbackList = document.getElementById('feedbackList');
    feedbackList.innerHTML = resultsData.feedback.map(fb => {
        const isPositive = fb.startsWith('✓');
        const className = isPositive ? 'positive' : 'negative';
        return `<div class="feedback-item ${className}">${fb}</div>`;
    }).join('');

    // Suggestions
    const suggestionsDiv = document.getElementById('suggestions');
    const suggestionsList = document.getElementById('suggestionsList');
    if (resultsData.suggestions && resultsData.suggestions.length > 0) {
        suggestionsList.innerHTML = resultsData.suggestions.map(sug => `<div class="suggestion-item">${sug}</div>`).join('');
        suggestionsDiv.style.display = 'block';
    } else {
        suggestionsDiv.style.display = 'none';
    }
}

function downloadImage() {
    const resultsElement = document.getElementById('results');

    // Elements to modify during capture
    const elementsWithBackdrop = resultsElement.querySelectorAll(
        '.score-card, .detail-card, .feedback-section, .suggestions, .feedback-item'
    );
    const elementsWithAnimations = resultsElement.querySelectorAll(
        '.score-card::before, .score-fill::after'
    );
    const elementsWithTransparentBg = resultsElement.querySelectorAll(
        '.score-card, .detail-card, .feedback-section, .suggestions'
    );
    const feedbackItems = resultsElement.querySelectorAll('.feedback-item');
    const suggestionItems = resultsElement.querySelectorAll('.suggestion-item');

    // Store original styles
    const originalStyles = new Map();
    
    // Disable backdrop-filter
    elementsWithBackdrop.forEach(el => {
        originalStyles.set(el, {
            backdropFilter: el.style.backdropFilter,
            webkitBackdropFilter: el.style.webkitBackdropFilter
        });
        el.style.backdropFilter = 'none';
        el.style.webkitBackdropFilter = 'none';
    });

    // Disable animations
    elementsWithAnimations.forEach(el => {
        originalStyles.set(el, {
            animation: el.style.animation
        });
        el.style.animation = 'none';
    });

    // Replace semi-transparent backgrounds with solid color
    elementsWithTransparentBg.forEach(el => {
        originalStyles.set(el, {
            background: el.style.background
        });
        el.style.background = '#282828';
    });

    // Adjust feedback-item backgrounds
    feedbackItems.forEach(el => {
        originalStyles.set(el, {
            background: el.style.background
        });
        if (el.classList.contains('positive')) {
            el.style.background = '#1e641e';
        } else if (el.classList.contains('negative')) {
            el.style.background = '#641e1e';
        }
    });

    // Adjust suggestion-item background
    suggestionItems.forEach(el => {
        originalStyles.set(el, {
            background: el.style.background
        });
        el.style.background = '#323232';
    });

    // Use html2canvas with options to ensure solid background
    html2canvas(resultsElement, {
        scale: 2,
        backgroundColor: '#1a1a1a',
        useCORS: true,
        allowTaint: true,
        logging: false,
        windowWidth: document.body.scrollWidth
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'resume_analysis.png';
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();

        // Restore original styles
        elementsWithBackdrop.forEach(el => {
            const styles = originalStyles.get(el);
            el.style.backdropFilter = styles.backdropFilter;
            el.style.webkitBackdropFilter = styles.webkitBackdropFilter;
        });
        elementsWithAnimations.forEach(el => {
            const styles = originalStyles.get(el);
            el.style.animation = styles.animation;
        });
        elementsWithTransparentBg.forEach(el => {
            const styles = originalStyles.get(el);
            el.style.background = styles.background;
        });
        feedbackItems.forEach(el => {
            const styles = originalStyles.get(el);
            el.style.background = styles.background;
        });
        suggestionItems.forEach(el => {
            const styles = originalStyles.get(el);
            el.style.background = styles.background;
        });
    }).catch(err => {
        console.error('Failed to download image:', err);
        alert('Failed to download image. Please try again.');
    });
}
