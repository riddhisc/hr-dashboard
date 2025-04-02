import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import interviewQuestions from '../models/InterviewQuestionBank';
import { DocumentTextIcon, FunnelIcon as FilterIcon, StarIcon, BookmarkIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';

const InterviewQuestionBank = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('General');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedQuestions, setSavedQuestions] = useState([]);
  const [showAddQuestionForm, setShowAddQuestionForm] = useState(false);
  const [allQuestions, setAllQuestions] = useState(interviewQuestions);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    category: 'Technical',
    difficulty: 'Medium',
    expectedAnswer: '',
    role: 'General'
  });

  // Load saved questions from localStorage
  useEffect(() => {
    const savedQuestionsFromStorage = localStorage.getItem('savedInterviewQuestions');
    if (savedQuestionsFromStorage) {
      setSavedQuestions(JSON.parse(savedQuestionsFromStorage));
    }
    
    // Load custom questions for all roles
    const updatedQuestions = { ...interviewQuestions };
    
    Object.keys(interviewQuestions).forEach(role => {
      const customQuestionsKey = `custom_questions_${role}`;
      const customQuestions = JSON.parse(localStorage.getItem(customQuestionsKey) || '[]');
      
      if (customQuestions.length > 0) {
        updatedQuestions[role] = [...(updatedQuestions[role] || []), ...customQuestions];
      }
    });
    
    setAllQuestions(updatedQuestions);
  }, []);

  // Save questions to localStorage when savedQuestions changes
  useEffect(() => {
    localStorage.setItem('savedInterviewQuestions', JSON.stringify(savedQuestions));
  }, [savedQuestions]);

  // Get all available roles
  const roles = Object.keys(allQuestions);

  // Get all unique categories
  const categories = ['All', ...new Set(
    Object.values(allQuestions)
      .flat()
      .map(q => q.category)
  )];

  // Get all unique difficulties
  const difficulties = ['All', ...new Set(
    Object.values(allQuestions)
      .flat()
      .map(q => q.difficulty)
  )];

  // Filter questions based on selected criteria
  const filteredQuestions = allQuestions[selectedRole]
    ? allQuestions[selectedRole]
        .filter(q => selectedCategory === 'All' || q.category === selectedCategory)
        .filter(q => selectedDifficulty === 'All' || q.difficulty === selectedDifficulty)
        .filter(q => q.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                   q.expectedAnswer.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  // Pagination logic
  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredQuestions.slice(indexOfFirstItem, indexOfLastItem);

  // Handle page changes
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRole, selectedCategory, selectedDifficulty, searchQuery]);

  // Save question to list
  const saveQuestion = (question) => {
    if (savedQuestions.some(q => q.id === question.id)) {
      setSavedQuestions(savedQuestions.filter(q => q.id !== question.id));
      toast.info('Question removed from saved list');
    } else {
      setSavedQuestions([...savedQuestions, question]);
      toast.success('Question saved to your list');
    }
  };

  // Handle new question submission
  const handleAddQuestion = () => {
    if (!newQuestion.question) {
      toast.error('Question is required');
      return;
    }

    // Create a custom ID
    const newId = `custom_${Date.now()}`;
    const questionToAdd = {
      ...newQuestion,
      id: newId,
      // Set default expected answer if empty
      expectedAnswer: newQuestion.expectedAnswer || 'No expected answer provided'
    };

    // Add to local storage (in a real app, this would go to the backend)
    const customQuestionsKey = `custom_questions_${newQuestion.role}`;
    const existingCustomQuestions = JSON.parse(localStorage.getItem(customQuestionsKey) || '[]');
    const updatedCustomQuestions = [...existingCustomQuestions, questionToAdd];
    localStorage.setItem(customQuestionsKey, JSON.stringify(updatedCustomQuestions));

    // Update allQuestions state to include the new question
    setAllQuestions(prevQuestions => {
      const updatedQuestions = { ...prevQuestions };
      
      if (!updatedQuestions[newQuestion.role]) {
        updatedQuestions[newQuestion.role] = [questionToAdd];
      } else {
        updatedQuestions[newQuestion.role] = [...updatedQuestions[newQuestion.role], questionToAdd];
      }
      
      return updatedQuestions;
    });

    // Reset form
    setNewQuestion({
      question: '',
      category: 'Technical',
      difficulty: 'Medium',
      expectedAnswer: '',
      role: 'General'
    });
    setShowAddQuestionForm(false);
    toast.success('New question added successfully!');
  };
  
  // Update allQuestions when selectedRole changes to ensure custom questions are loaded
  useEffect(() => {
    const customQuestionsKey = `custom_questions_${selectedRole}`;
    const customQuestions = JSON.parse(localStorage.getItem(customQuestionsKey) || '[]');
    
    if (customQuestions.length > 0) {
      setAllQuestions(prevQuestions => {
        const updatedQuestions = { ...prevQuestions };
        
        // Ensure we're not duplicating questions
        const baseQuestions = interviewQuestions[selectedRole] || [];
        const existingCustomQuestionIds = customQuestions.map(q => q.id);
        
        updatedQuestions[selectedRole] = [
          ...baseQuestions,
          ...customQuestions.filter(q => !baseQuestions.some(baseQ => baseQ.id === q.id))
        ];
        
        return updatedQuestions;
      });
    }
  }, [selectedRole]);

  // Pagination component
  const Pagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 mt-4">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${currentPage === 1 ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            Previous
          </button>
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${currentPage === totalPages ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
              <span className="font-medium">{Math.min(indexOfLastItem, filteredQuestions.length)}</span> of{' '}
              <span className="font-medium">{filteredQuestions.length}</span> results
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <span className="sr-only">Previous</span>
                <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
              </button>
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                const isCurrentPage = pageNumber === currentPage;

                return (
                  <button
                    key={pageNumber}
                    onClick={() => paginate(pageNumber)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                      isCurrentPage
                        ? 'bg-primary-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600'
                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${currentPage === totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <span className="sr-only">Next</span>
                <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interview Question Bank</h1>
          <p className="mt-1 text-sm text-gray-500">Select role-specific questions for interviews</p>
        </div>
        <button
          onClick={() => setShowAddQuestionForm(!showAddQuestionForm)}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          <PlusCircleIcon className="w-5 h-5 mr-2" />
          Add Question
        </button>
      </div>

      {/* Add Question Form */}
      {showAddQuestionForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-lg font-medium mb-4">Add a New Interview Question</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question
              </label>
              <textarea
                value={newQuestion.question}
                onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder="Enter the interview question"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Answer <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                value={newQuestion.expectedAnswer}
                onChange={(e) => setNewQuestion({...newQuestion, expectedAnswer: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder="What would be a good answer to this question? (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={newQuestion.role}
                onChange={(e) => setNewQuestion({...newQuestion, role: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={newQuestion.category}
                onChange={(e) => setNewQuestion({...newQuestion, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {categories.filter(c => c !== 'All').map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                value={newQuestion.difficulty}
                onChange={(e) => setNewQuestion({...newQuestion, difficulty: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {difficulties.filter(d => d !== 'All').map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 flex justify-end mt-4">
              <button
                onClick={() => setShowAddQuestionForm(false)}
                className="mr-4 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddQuestion}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Add Question
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md mb-8">
        <div className="p-6">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            <FilterIcon className="h-5 w-5 mr-2 text-gray-500" />
            Filters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Selected Questions */}
      {savedQuestions.length > 0 && (
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <StarIcon className="h-5 w-5 mr-2 text-yellow-500" />
              Your Selected Questions ({savedQuestions.length})
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {savedQuestions.map(question => (
                <div
                  key={question.id}
                  className="p-4 border border-gray-200 rounded-md hover:bg-gray-50"
                >
                  <div className="flex justify-between">
                    <h3 className="font-medium text-gray-900">{question.question}</h3>
                    <button
                      onClick={() => saveQuestion(question)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                  {/* Show expected answer when clicking on a question */}
                </div>
              ))}
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => {
                    // Here you would typically export or use these questions
                    // For demo purposes, we'll just show a toast
                    toast.success(`${savedQuestions.length} questions ready for your interview!`);
                  }}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Use Selected Questions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h2 className="text-lg font-medium mb-4 flex items-center">
            <DocumentTextIcon className="h-5 w-5 mr-2 text-gray-500" />
            Questions for {selectedRole} ({filteredQuestions.length})
          </h2>

          {filteredQuestions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No questions match your criteria</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {currentItems.map(question => (
                <div
                  key={question.id}
                  className="p-4 border border-gray-200 rounded-md hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                          {question.category}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          question.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                          question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {question.difficulty}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-900">{question.question}</h3>
                    </div>
                    <button
                      onClick={() => saveQuestion(question)}
                      className={`ml-4 ${
                        savedQuestions.some(q => q.id === question.id)
                          ? 'text-yellow-500 hover:text-yellow-700'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      <BookmarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-500 border-t border-gray-100 pt-2">
                    <p className="font-medium text-gray-700 mb-1">Expected Answer:</p>
                    <p>{question.expectedAnswer}</p>
                  </div>
                </div>
              ))}
              <Pagination />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewQuestionBank; 