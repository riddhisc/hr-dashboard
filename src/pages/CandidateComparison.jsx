import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, UserPlusIcon, UserMinusIcon } from '@heroicons/react/24/outline';
import { fetchApplicants, selectAllApplicants } from '../features/applicants/applicantsSlice';
import { fetchInterviews } from '../redux/slices/interviewsSlice';
import { toast } from 'react-toastify';

function CandidateComparison() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSelectionPanel, setShowSelectionPanel] = useState(true);
  const [comparisonAttributes, setComparisonAttributes] = useState({
    basic: true,
    skills: true,
    experience: true,
    interview: true,
    feedback: true
  });

  // Get all applicants from Redux
  const applicants = useSelector(selectAllApplicants);
  const interviews = useSelector(state => state.interviews.interviews);
  const { user } = useSelector(state => state.auth);
  const isLocalStorageUser = user?.provider === 'google' || user?.isGoogleUser || user?.isDemo === true;

  useEffect(() => {
    // Fetch data when component mounts
    dispatch(fetchApplicants());
    dispatch(fetchInterviews());
  }, [dispatch]);

  // Filter applicants based on search term
  const filteredApplicants = applicants.filter(applicant => 
    applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    applicant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (applicant.jobTitle && applicant.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get interview data for a candidate
  const getCandidateInterviews = (candidateId) => {
    return interviews.filter(interview => 
      interview.applicantId === candidateId || 
      (interview.applicantId && interview.applicantId._id === candidateId)
    );
  };

  // Add candidate to comparison
  const addCandidate = (candidate) => {
    if (selectedCandidates.length < 3 && !selectedCandidates.some(c => c._id === candidate._id)) {
      setSelectedCandidates([...selectedCandidates, candidate]);
    } else if (selectedCandidates.length >= 3) {
      toast.warning('You can compare up to 3 candidates at a time');
    }
  };

  // Remove candidate from comparison
  const removeCandidate = (candidateId) => {
    setSelectedCandidates(selectedCandidates.filter(c => c._id !== candidateId));
  };

  // Toggle selection panel
  const toggleSelectionPanel = () => {
    setShowSelectionPanel(!showSelectionPanel);
  };

  // Toggle comparison attributes
  const toggleAttribute = (attribute) => {
    setComparisonAttributes({
      ...comparisonAttributes,
      [attribute]: !comparisonAttributes[attribute]
    });
  };

  // Calculate match score (simplified version)
  const calculateMatchScore = (candidate) => {
    // This would be more sophisticated in a real app
    const interviews = getCandidateInterviews(candidate._id);
    let score = 50; // Base score
    
    // Boost score based on status
    if (candidate.status === 'shortlisted') score += 10;
    if (candidate.status === 'interview') score += 20;
    
    // Add points for completed interviews with positive feedback
    if (interviews.length > 0) {
      interviews.forEach(interview => {
        if (interview.status === 'completed' && interview.feedback) {
          if (interview.feedback.rating && interview.feedback.rating > 3) {
            score += 10;
          }
          if (interview.feedback.recommendation === 'hire') {
            score += 15;
          }
        }
      });
    }
    
    // Cap at 100
    return Math.min(score, 100);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/applicants')}
            className="mr-4 p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-500" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Candidate Comparison</h1>
        </div>
        
        <button 
          onClick={toggleSelectionPanel}
          className="px-4 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          {showSelectionPanel ? 'Hide Selection Panel' : 'Show Selection Panel'}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Selection Panel */}
        {showSelectionPanel && (
          <div className="w-full md:w-1/3 bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Select Candidates to Compare</h2>
            
            {/* Search Box */}
            <div className="mb-4">
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Candidates List */}
            <div className="max-h-96 overflow-y-auto">
              {filteredApplicants.length > 0 ? (
                filteredApplicants.map(applicant => (
                  <div 
                    key={applicant._id} 
                    className="p-3 border-b border-gray-100 hover:bg-gray-50 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{applicant.name}</p>
                      <p className="text-sm text-gray-500">{applicant.jobTitle}</p>
                    </div>
                    
                    <button
                      onClick={() => addCandidate(applicant)}
                      disabled={selectedCandidates.some(c => c._id === applicant._id)}
                      className={`p-1 rounded-full ${
                        selectedCandidates.some(c => c._id === applicant._id)
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-primary-600 hover:bg-primary-50'
                      }`}
                    >
                      <UserPlusIcon className="w-5 h-5" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">No candidates found</p>
              )}
            </div>
          </div>
        )}
        
        {/* Comparison View */}
        <div className={`w-full ${showSelectionPanel ? 'md:w-2/3' : 'md:w-full'} bg-white rounded-lg shadow p-4`}>
          {selectedCandidates.length > 0 ? (
            <div>
              {/* Attribute Selection */}
              <div className="mb-4 flex flex-wrap gap-2">
                <button 
                  onClick={() => toggleAttribute('basic')}
                  className={`px-3 py-1 text-sm rounded-full ${
                    comparisonAttributes.basic ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  Basic Info
                </button>
                <button 
                  onClick={() => toggleAttribute('skills')}
                  className={`px-3 py-1 text-sm rounded-full ${
                    comparisonAttributes.skills ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  Skills
                </button>
                <button 
                  onClick={() => toggleAttribute('experience')}
                  className={`px-3 py-1 text-sm rounded-full ${
                    comparisonAttributes.experience ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  Experience
                </button>
                <button 
                  onClick={() => toggleAttribute('interview')}
                  className={`px-3 py-1 text-sm rounded-full ${
                    comparisonAttributes.interview ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  Interview
                </button>
                <button 
                  onClick={() => toggleAttribute('feedback')}
                  className={`px-3 py-1 text-sm rounded-full ${
                    comparisonAttributes.feedback ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  Feedback
                </button>
              </div>
              
              {/* Comparison Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                        Attribute
                      </th>
                      {selectedCandidates.map(candidate => (
                        <th key={candidate._id} className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex justify-between items-center">
                            <span>{candidate.name}</span>
                            <button
                              onClick={() => removeCandidate(candidate._id)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <UserMinusIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Match Score */}
                    <tr>
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                        Match Score
                      </td>
                      {selectedCandidates.map(candidate => (
                        <td key={candidate._id} className="px-4 py-3 whitespace-nowrap">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-primary-600 h-2.5 rounded-full" 
                              style={{ width: `${calculateMatchScore(candidate)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {calculateMatchScore(candidate)}%
                          </span>
                        </td>
                      ))}
                    </tr>
                    
                    {/* Basic Info Section */}
                    {comparisonAttributes.basic && (
                      <>
                        <tr className="bg-gray-50">
                          <td colSpan={selectedCandidates.length + 1} className="px-4 py-2 font-semibold text-gray-700">
                            Basic Information
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                            Job Position
                          </td>
                          {selectedCandidates.map(candidate => (
                            <td key={candidate._id} className="px-4 py-3 whitespace-nowrap text-gray-800">
                              {candidate.jobTitle || 'Not specified'}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                            Status
                          </td>
                          {selectedCandidates.map(candidate => (
                            <td key={candidate._id} className="px-4 py-3 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full font-medium
                                ${candidate.status === 'pending' ? 'bg-gray-100 text-gray-800' : ''}
                                ${candidate.status === 'shortlisted' ? 'bg-blue-100 text-blue-800' : ''}
                                ${candidate.status === 'interview' ? 'bg-yellow-100 text-yellow-800' : ''}
                                ${candidate.status === 'hired' ? 'bg-green-100 text-green-800' : ''}
                                ${candidate.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                              `}>
                                {candidate.status}
                              </span>
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                            Contact
                          </td>
                          {selectedCandidates.map(candidate => (
                            <td key={candidate._id} className="px-4 py-3 whitespace-nowrap text-gray-800">
                              <div>{candidate.email}</div>
                              <div>{candidate.phone}</div>
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                            Source
                          </td>
                          {selectedCandidates.map(candidate => (
                            <td key={candidate._id} className="px-4 py-3 whitespace-nowrap text-gray-800">
                              {candidate.source || 'Not specified'}
                            </td>
                          ))}
                        </tr>
                      </>
                    )}
                    
                    {/* Skills Section (placeholder - would be more detailed in a real app) */}
                    {comparisonAttributes.skills && (
                      <>
                        <tr className="bg-gray-50">
                          <td colSpan={selectedCandidates.length + 1} className="px-4 py-2 font-semibold text-gray-700">
                            Skills
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                            Technical Skills
                          </td>
                          {selectedCandidates.map(candidate => (
                            <td key={candidate._id} className="px-4 py-3 text-gray-800">
                              <div className="flex flex-wrap gap-1">
                                {/* This would come from actual data in a real app */}
                                {candidate.jobTitle?.includes('Frontend') && (
                                  <>
                                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">React</span>
                                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">JavaScript</span>
                                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">CSS</span>
                                  </>
                                )}
                                {candidate.jobTitle?.includes('Backend') && (
                                  <>
                                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Node.js</span>
                                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Express</span>
                                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">MongoDB</span>
                                  </>
                                )}
                                {!candidate.jobTitle?.includes('Frontend') && !candidate.jobTitle?.includes('Backend') && (
                                  <span className="text-gray-500 text-sm">No skills data</span>
                                )}
                              </div>
                            </td>
                          ))}
                        </tr>
                      </>
                    )}
                    
                    {/* Experience Section */}
                    {comparisonAttributes.experience && (
                      <>
                        <tr className="bg-gray-50">
                          <td colSpan={selectedCandidates.length + 1} className="px-4 py-2 font-semibold text-gray-700">
                            Experience
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                            Resume
                          </td>
                          {selectedCandidates.map(candidate => (
                            <td key={candidate._id} className="px-4 py-3 text-gray-800">
                              {candidate.resumeUrl ? (
                                <a 
                                  href={candidate.resumeUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-primary-600 hover:text-primary-800"
                                >
                                  View Resume
                                </a>
                              ) : (
                                <span className="text-gray-500">No resume available</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      </>
                    )}
                    
                    {/* Interview Section */}
                    {comparisonAttributes.interview && (
                      <>
                        <tr className="bg-gray-50">
                          <td colSpan={selectedCandidates.length + 1} className="px-4 py-2 font-semibold text-gray-700">
                            Interview
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                            Interviews Completed
                          </td>
                          {selectedCandidates.map(candidate => {
                            const candidateInterviews = getCandidateInterviews(candidate._id);
                            const completedInterviews = candidateInterviews.filter(
                              interview => interview.status === 'completed'
                            );
                            
                            return (
                              <td key={candidate._id} className="px-4 py-3 text-gray-800">
                                {completedInterviews.length} of {candidateInterviews.length}
                              </td>
                            );
                          })}
                        </tr>
                      </>
                    )}
                    
                    {/* Feedback Section */}
                    {comparisonAttributes.feedback && (
                      <>
                        <tr className="bg-gray-50">
                          <td colSpan={selectedCandidates.length + 1} className="px-4 py-2 font-semibold text-gray-700">
                            Feedback
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                            Latest Feedback
                          </td>
                          {selectedCandidates.map(candidate => {
                            const candidateInterviews = getCandidateInterviews(candidate._id);
                            const interviewsWithFeedback = candidateInterviews.filter(
                              interview => interview.feedback && 
                                (typeof interview.feedback === 'object' ? 
                                Object.keys(interview.feedback).length > 0 : 
                                interview.feedback.trim() !== '')
                            );
                            
                            const latestInterview = interviewsWithFeedback.length > 0 ? 
                              interviewsWithFeedback.sort((a, b) => 
                                new Date(b.updatedAt || b.date) - new Date(a.updatedAt || a.date)
                              )[0] : null;
                            
                            return (
                              <td key={candidate._id} className="px-4 py-3 text-gray-800">
                                {latestInterview ? (
                                  <div>
                                    {typeof latestInterview.feedback === 'object' && latestInterview.feedback.recommendation && (
                                      <div className="mb-1">
                                        <span className={`px-2 py-1 text-xs rounded-full font-medium
                                          ${latestInterview.feedback.recommendation === 'hire' ? 'bg-green-100 text-green-800' : ''}
                                          ${latestInterview.feedback.recommendation === 'reject' ? 'bg-red-100 text-red-800' : ''}
                                          ${latestInterview.feedback.recommendation === 'consider' ? 'bg-yellow-100 text-yellow-800' : ''}
                                        `}>
                                          {latestInterview.feedback.recommendation.charAt(0).toUpperCase() + 
                                           latestInterview.feedback.recommendation.slice(1)}
                                        </span>
                                      </div>
                                    )}
                                    
                                    {typeof latestInterview.feedback === 'object' && latestInterview.feedback.rating && (
                                      <div className="flex items-center mb-1">
                                        <span className="text-sm mr-1">Rating: </span>
                                        <div className="flex">
                                          {[...Array(5)].map((_, i) => (
                                            <svg 
                                              key={i} 
                                              className={`w-4 h-4 ${i < latestInterview.feedback.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                                              fill="currentColor" 
                                              viewBox="0 0 20 20"
                                            >
                                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    
                                    <div className="text-sm text-gray-600 line-clamp-2">
                                      {typeof latestInterview.feedback === 'object' 
                                        ? (latestInterview.feedback.notes || latestInterview.feedback.strengths || 'No detailed feedback')
                                        : latestInterview.feedback
                                      }
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-gray-500">No feedback available</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                        <tr>
                          <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                            HR Notes
                          </td>
                          {selectedCandidates.map(candidate => (
                            <td key={candidate._id} className="px-4 py-3 text-gray-800">
                              {candidate.notes ? (
                                <p className="text-sm text-gray-600 line-clamp-4">{candidate.notes}</p>
                              ) : (
                                <span className="text-gray-500">No notes available</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates selected</h3>
              <p className="text-gray-500 text-center max-w-sm mb-4">
                Add candidates from the selection panel to compare them side by side.
              </p>
              {!showSelectionPanel && (
                <button 
                  onClick={toggleSelectionPanel}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Show Selection Panel
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CandidateComparison; 