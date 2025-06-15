import React, { useState, useRef } from 'react';
import { Upload, FileText, Brain, Target, Star, CheckCircle, AlertCircle, RotateCcw, Award, TrendingUp, Users, Zap } from 'lucide-react';

interface SectionScores {
  contact_info: number;
  education: number;
  experience: number;
  skills: number;
  formatting: number;
  keywords: number;
}

interface AnalysisResult {
  total_score: number;
  section_scores: SectionScores;
  feedback: string[];
  parsed_data: any;
}

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [roleType, setRoleType] = useState('general');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Please select a PDF file');
      return;
    }

    if (file.size > 16 * 1024 * 1024) {
      setError('File size must be less than 16MB');
      return;
    }

    setSelectedFile(file);
    setError('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const analyzeResume = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    const formData = new FormData();
    formData.append('resume', selectedFile);
    formData.append('role_type', roleType);

    try {
      const response = await fetch('/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error occurred' }));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while analyzing your resume. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setResults(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 border-green-200';
    if (score >= 60) return 'bg-yellow-100 border-yellow-200';
    return 'bg-red-100 border-red-200';
  };

  const getScoreDescription = (score: number) => {
    if (score >= 90) return '🏆 Outstanding! Your resume is exceptional and will definitely stand out to employers.';
    if (score >= 80) return '🎉 Excellent! Your resume is well-optimized and ready to impress employers.';
    if (score >= 70) return '👍 Very Good! Your resume is strong with just a few areas for improvement.';
    if (score >= 60) return '✅ Good resume! Some improvements could make it even stronger.';
    if (score >= 40) return '📈 Your resume has potential. Follow the suggestions below to boost your score.';
    return '🔧 Your resume needs significant improvement. Focus on the feedback below.';
  };

  const sectionNames: Record<keyof SectionScores, string> = {
    contact_info: 'Contact Information',
    education: 'Education',
    experience: 'Work Experience',
    skills: 'Skills',
    formatting: 'Formatting',
    keywords: 'Keywords'
  };

  const sectionIcons: Record<keyof SectionScores, React.ReactNode> = {
    contact_info: <Users size={20} />,
    education: <Award size={20} />,
    experience: <TrendingUp size={20} />,
    skills: <Zap size={20} />,
    formatting: <FileText size={20} />,
    keywords: <Target size={20} />
  };

  if (results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
              <Brain className="text-indigo-600" size={50} />
              Resume Analysis Results
            </h1>
            <p className="text-xl text-gray-600">Your comprehensive resume evaluation is complete</p>
          </div>

          {/* Score Display */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className="relative inline-flex items-center justify-center w-56 h-56 mb-6">
                <svg className="w-56 h-56 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#e5e7eb"
                    strokeWidth="6"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke={results.total_score >= 80 ? '#10b981' : results.total_score >= 60 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${results.total_score * 2.51} 251`}
                    strokeLinecap="round"
                    className="transition-all duration-2000 ease-out"
                    style={{
                      filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))'
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className={`text-6xl font-bold ${getScoreColor(results.total_score)} mb-2`}>
                    {results.total_score}
                  </span>
                  <span className="text-gray-500 text-xl">/ 100</span>
                  <div className="mt-2 px-4 py-1 rounded-full bg-gray-100">
                    <span className="text-sm font-medium text-gray-600">
                      {results.total_score >= 80 ? 'Excellent' : results.total_score >= 60 ? 'Good' : 'Needs Work'}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                {getScoreDescription(results.total_score)}
              </p>
            </div>

            {/* Section Scores */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {Object.entries(results.section_scores).map(([section, score]) => (
                <div key={section} className={`rounded-2xl p-6 border-2 transition-all duration-300 hover:scale-105 ${getScoreBgColor(score)}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${score >= 80 ? 'bg-green-200' : score >= 60 ? 'bg-yellow-200' : 'bg-red-200'}`}>
                      {sectionIcons[section as keyof SectionScores]}
                    </div>
                    <h3 className="font-semibold text-gray-800">
                      {sectionNames[section as keyof SectionScores]}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-3xl font-bold ${getScoreColor(score)}`}>
                      {score}
                    </span>
                    <span className="text-gray-500 text-lg">/100</span>
                  </div>
                  <div className="mt-3 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-1000 ${score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback Section */}
          {results.feedback && results.feedback.length > 0 && (
            <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-gray-100">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Target className="text-indigo-600" />
                Actionable Improvements
              </h2>
              <div className="grid gap-4">
                {results.feedback.map((feedback, index) => (
                  <div key={index} className="flex items-start gap-4 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border-l-4 border-amber-400 hover:shadow-lg transition-all duration-300">
                    <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                      <span className="text-amber-600 font-bold text-sm">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 font-medium">{feedback}</p>
                    </div>
                    <AlertCircle className="text-amber-600 flex-shrink-0" size={20} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="text-center space-y-4">
            <button
              onClick={resetForm}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              <RotateCcw size={24} />
              Analyze Another Resume
            </button>
            <p className="text-gray-600">
              Want to improve your score? Update your resume and try again!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12 text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 flex items-center justify-center gap-4">
            <Brain className="text-white animate-pulse" size={60} />
            AI Resume Grader
          </h1>
          <p className="text-xl md:text-2xl opacity-90 max-w-4xl mx-auto leading-relaxed mb-8">
            Get instant, comprehensive feedback on your resume with our advanced AI-powered scoring system. 
            Upload your PDF and receive detailed insights to land your dream job.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="bg-white/20 px-4 py-2 rounded-full">✨ AI-Powered Analysis</span>
            <span className="bg-white/20 px-4 py-2 rounded-full">📊 Detailed Scoring</span>
            <span className="bg-white/20 px-4 py-2 rounded-full">🎯 Role-Specific Feedback</span>
            <span className="bg-white/20 px-4 py-2 rounded-full">⚡ Instant Results</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          {!isAnalyzing ? (
            <div className="p-8 lg:p-12">
              {/* Upload Section */}
              <div className="mb-8">
                <div
                  className={`border-3 border-dashed rounded-3xl p-12 text-center transition-all duration-300 cursor-pointer ${
                    isDragOver
                      ? 'border-indigo-500 bg-indigo-50 scale-105 shadow-lg'
                      : selectedFile
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50 hover:shadow-md'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    className="hidden"
                  />
                  
                  <div className="flex flex-col items-center">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-all duration-300 ${
                      selectedFile ? 'bg-green-100 scale-110' : 'bg-indigo-100'
                    }`}>
                      {selectedFile ? (
                        <CheckCircle className="text-green-600" size={48} />
                      ) : (
                        <Upload className="text-indigo-600" size={48} />
                      )}
                    </div>
                    
                    {selectedFile ? (
                      <>
                        <h3 className="text-2xl font-semibold text-green-800 mb-2">
                          ✅ {selectedFile.name}
                        </h3>
                        <p className="text-green-600 text-lg">Ready for AI analysis</p>
                        <p className="text-gray-500 text-sm mt-2">
                          File size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </>
                    ) : (
                      <>
                        <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                          Drag and drop your resume here
                        </h3>
                        <p className="text-gray-600 text-lg mb-4">or click to browse files</p>
                        <div className="bg-gray-100 px-4 py-2 rounded-full">
                          <span className="text-gray-600 text-sm">PDF files only • Max 16MB</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Role Selector */}
              <div className="mb-8">
                <label className="block text-xl font-semibold text-gray-800 mb-4">
                  🎯 Select your target role for personalized scoring:
                </label>
                <select
                  value={roleType}
                  onChange={(e) => setRoleType(e.target.value)}
                  className="w-full max-w-md px-6 py-4 border-2 border-gray-300 rounded-2xl text-lg focus:border-indigo-500 focus:outline-none transition-all duration-200 bg-white shadow-sm"
                >
                  <option value="general">🌟 General</option>
                  <option value="developer">💻 Software Developer</option>
                  <option value="data_scientist">📊 Data Scientist</option>
                  <option value="designer">🎨 Designer</option>
                  <option value="manager">👔 Manager</option>
                </select>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-6 bg-red-50 border-2 border-red-200 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="text-red-600 flex-shrink-0" size={24} />
                    <p className="text-red-800 font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* Analyze Button */}
              {selectedFile && (
                <div className="text-center">
                  <button
                    onClick={analyzeResume}
                    disabled={isAnalyzing}
                    className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-xl hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-2xl"
                  >
                    <Brain size={28} />
                    🚀 Analyze My Resume with AI
                  </button>
                  <p className="text-gray-600 mt-4">
                    Analysis typically takes 10-30 seconds
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Loading State */
            <div className="p-12 text-center">
              <div className="flex flex-col items-center">
                <div className="relative mb-8">
                  <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Brain className="text-indigo-600" size={32} />
                  </div>
                </div>
                <h3 className="text-3xl font-semibold text-gray-800 mb-4">
                  🤖 AI is analyzing your resume...
                </h3>
                <p className="text-gray-600 text-lg mb-6">
                  Our advanced algorithms are evaluating your resume across multiple criteria
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-sm">
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">Parsing content</span>
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">Analyzing structure</span>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">Scoring sections</span>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">Generating feedback</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-center text-white border border-white/20 hover:bg-white/20 transition-all duration-300">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="text-white" size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-3">AI-Powered Analysis</h3>
            <p className="opacity-90">Advanced NLP algorithms analyze your resume content intelligently</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-center text-white border border-white/20 hover:bg-white/20 transition-all duration-300">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="text-white" size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-3">Comprehensive Scoring</h3>
            <p className="opacity-90">Detailed evaluation across 6 key criteria with weighted importance</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-center text-white border border-white/20 hover:bg-white/20 transition-all duration-300">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="text-white" size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-3">Role-Specific Feedback</h3>
            <p className="opacity-90">Personalized suggestions based on your target job role and industry</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-center text-white border border-white/20 hover:bg-white/20 transition-all duration-300">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="text-white" size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-3">Instant Results</h3>
            <p className="opacity-90">Get your comprehensive analysis and feedback in seconds</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;