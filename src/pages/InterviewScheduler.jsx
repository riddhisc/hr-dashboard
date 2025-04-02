import React, { useState, useEffect, Fragment } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import {
  CalendarIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EnvelopeIcon,
  VideoCameraIcon,
  MapPinIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  PlusIcon,
  ArrowLeftIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { getAvailableSlotsForDate, findCommonAvailability, bookInterviewSlot } from '../models/InterviewerSchedule';
import { scheduleInterviewWithInterviewers } from '../redux/slices/interviewsSlice';

// Simple Email Input Modal Component
const EmailInputModal = ({ isOpen, closeModal, sendInvitations, interviewers, candidate }) => {
  const [emails, setEmails] = useState({});
  const [customEmails, setCustomEmails] = useState('');
  const [includeGmail, setIncludeGmail] = useState(true);
  
  // Initialize emails state with interviewer emails
  useEffect(() => {
    const initialEmails = {};
    interviewers.forEach(interviewer => {
      initialEmails[interviewer.id] = {
        email: interviewer.email,
        name: interviewer.name,
        selected: true
      };
    });
    setEmails(initialEmails);
  }, [interviewers]);
  
  const handleToggleEmail = (id) => {
    setEmails(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        selected: !prev[id].selected
      }
    }));
  };
  
  const handleSendInvites = () => {
    // Collect all selected email addresses
    const selectedEmails = Object.values(emails)
      .filter(entry => entry.selected)
      .map(entry => ({ email: entry.email, name: entry.name }));
    
    // Add candidate email
    if (candidate.email && candidate.email.includes('@')) {
      selectedEmails.push({ email: candidate.email, name: candidate.name });
    }
    
    // Add custom emails
    if (customEmails.trim()) {
      const customEmailList = customEmails.split(',').map(email => email.trim());
      customEmailList.forEach(email => {
        if (email.includes('@')) {
          selectedEmails.push({ email, name: '' });
        }
      });
    }
    
    // Add your Gmail if selected
    if (includeGmail) {
      selectedEmails.push({ email: 'riddhis1999@gmail.com', name: 'You' });
    }
    
    sendInvitations(selectedEmails);
    closeModal();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal}></div>
        
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200 mb-4">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Send Calendar Invitations
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-4">
                Select recipients for the calendar invitation:
              </p>
              
              <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                {Object.entries(emails).map(([id, { email, name, selected }]) => (
                  <div key={id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`email-${id}`}
                      checked={selected}
                      onChange={() => handleToggleEmail(id)}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <label htmlFor={`email-${id}`} className="ml-2 text-sm text-gray-700 flex-1">
                      {name} ({email})
                    </label>
                  </div>
                ))}
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="include-gmail"
                    checked={includeGmail}
                    onChange={() => setIncludeGmail(!includeGmail)}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <label htmlFor="include-gmail" className="ml-2 text-sm text-blue-700 flex-1 font-medium">
                    Send to riddhis1999@gmail.com
                  </label>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Email Addresses
                </label>
                <textarea
                  value={customEmails}
                  onChange={(e) => setCustomEmails(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Enter additional emails separated by commas"
                  rows={2}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Example: john@example.com, mary@example.com
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              className="inline-flex justify-center w-full rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={handleSendInvites}
            >
              Send Invitations
            </button>
            <button
              type="button"
              className="mt-3 inline-flex justify-center w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
              onClick={closeModal}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const InterviewScheduler = () => {
  console.log('💡 InterviewScheduler component rendering');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  
  // State for storing interviewers from database
  const [dbInterviewers, setDbInterviewers] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedInterviewers, setSelectedInterviewers] = useState([]);
  const [availableSlots, setAvailableSlots] = useState({});
  const [commonAvailableSlots, setCommonAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [candidateId, setCandidateId] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [interviewType, setInterviewType] = useState('technical');
  const [interviewLocation, setInterviewLocation] = useState('video');
  const [interviewNotes, setInterviewNotes] = useState('');
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [scheduledInterview, setScheduledInterview] = useState(null);
  
  // Modal state
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  
  // Load interviewers from localStorage
  useEffect(() => {
    try {
      const storedInterviewers = localStorage.getItem('interviewers');
      if (storedInterviewers) {
        const parsedInterviewers = JSON.parse(storedInterviewers);
        console.log('Loaded interviewers from localStorage:', parsedInterviewers.length);
        setDbInterviewers(parsedInterviewers);
      } else {
        console.log('No interviewers found in localStorage');
        setDbInterviewers([]);
      }
    } catch (error) {
      console.error('Error loading interviewers from localStorage:', error);
      toast.error('Failed to load interviewers');
      setDbInterviewers([]);
    }
  }, []);
  
  // Mock candidates data (in a real app, this would come from the API)
  const candidates = [
    { id: 'candidate_1', name: 'John Smith', position: 'Frontend Developer' },
    { id: 'candidate_2', name: 'Sarah Johnson', position: 'Senior Frontend Developer' },
    { id: 'candidate_3', name: 'Michael Chen', position: 'Backend Developer' },
    { id: 'candidate_4', name: 'Emily Williams', position: 'DevOps Engineer' },
    { id: 'candidate_5', name: 'David Brown', position: 'UI/UX Designer' },
  ];
  
  // Generate date options for the next 14 days
  const dateOptions = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const formattedDate = date.toISOString().split('T')[0];
    const displayDate = date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
    dateOptions.push({ value: formattedDate, label: displayDate });
  }
  
  // On component init, set today's date as default
  useEffect(() => {
    if (!selectedDate && dateOptions.length > 0) {
      // Set today's date as default
      const today = new Date();
      const formattedToday = today.toISOString().split('T')[0];
      setSelectedDate(formattedToday);
      console.log('Setting default date to today:', formattedToday);
    }
  }, [dateOptions, selectedDate]);
  
  // Generate availability data for interviewers
  const getInterviewerAvailability = (date) => {
    console.log(`Generating availability for ${dbInterviewers.length} interviewers on ${date}`);
    
    const availabilityData = {};
    
    // For each interviewer, generate mock availability
    dbInterviewers.forEach(interviewer => {
      // Generate a predictable but varying pattern based on interviewer ID and date
      const dateNum = parseInt(date.replace(/-/g, ''));
      const idNum = parseInt(interviewer.id.replace(/\D/g, '')) || Math.floor(Math.random() * 100);
      const isAvailableDay = (dateNum + idNum) % 3 !== 0; // Make some interviewers unavailable
      
      if (isAvailableDay) {
        // Create mock slots with some availability
        const mockSlots = [
          { start: "09:00", end: "10:00", available: (dateNum + idNum) % 5 !== 0 },
          { start: "10:00", end: "11:00", available: (dateNum + idNum) % 4 !== 0 },
          { start: "11:00", end: "12:00", available: (dateNum + idNum) % 3 !== 0 },
          { start: "13:00", end: "14:00", available: (dateNum + idNum) % 2 !== 0 },
          { start: "14:00", end: "15:00", available: (dateNum + idNum) % 3 !== 0 },
          { start: "15:00", end: "16:00", available: (dateNum + idNum) % 4 !== 0 },
          { start: "16:00", end: "17:00", available: (dateNum + idNum) % 5 !== 0 },
        ];
        
        // Store the interviewer with their availability
        availabilityData[interviewer.id] = {
          interviewer: {
            id: interviewer.id,
            name: interviewer.name,
            role: interviewer.role,
            department: interviewer.department,
            expertise: interviewer.expertise,
            avatar: interviewer.avatar
          },
          availableSlots: mockSlots.filter(slot => slot.available)
        };
      } else {
        // This interviewer is not available
        availabilityData[interviewer.id] = {
          interviewer: {
            id: interviewer.id,
            name: interviewer.name,
            role: interviewer.role,
            department: interviewer.department,
            expertise: interviewer.expertise,
            avatar: interviewer.avatar
          },
          availableSlots: []
        };
      }
    });
    
    return availabilityData;
  };
  
  // Update available slots when date changes
  useEffect(() => {
    if (selectedDate) {
      setIsLoadingAvailability(true);
      // Simulate API delay
      setTimeout(() => {
        const slots = getInterviewerAvailability(selectedDate);
        setAvailableSlots(slots);
        setIsLoadingAvailability(false);
      }, 500); // Simulated delay for API call
    }
  }, [selectedDate, dbInterviewers]);
  
  // Update common available slots when selected interviewers change
  useEffect(() => {
    if (selectedDate && selectedInterviewers.length > 0) {
      // Extract just the available slots for the selected interviewers
      const selectedInterviewersSlots = selectedInterviewers.map(id => 
        availableSlots[id]?.availableSlots || []
      );
      
      // If any interviewer has no available slots, there can't be common availability
      if (selectedInterviewersSlots.some(slots => slots.length === 0)) {
        console.log('At least one interviewer has no available slots');
        setCommonAvailableSlots([]);
        setSelectedSlot(null);
        return;
      }
      
      // Find common slots
      const firstInterviewerSlots = selectedInterviewersSlots[0];
      
      const commonSlots = firstInterviewerSlots.filter(slot => {
        // Check if this slot is available for all other interviewers
        return selectedInterviewersSlots.every(interviewerSlots => 
          interviewerSlots.some(otherSlot => 
            otherSlot.start === slot.start && 
            otherSlot.end === slot.end
          )
        );
      });
      
      console.log(`Found ${commonSlots.length} common available slots`);
      setCommonAvailableSlots(commonSlots);
      
      // Reset selected slot if it's no longer available
      if (selectedSlot && !commonSlots.some(slot => 
        slot.start === selectedSlot.start && slot.end === selectedSlot.end
      )) {
        setSelectedSlot(null);
      }
    } else {
      setCommonAvailableSlots([]);
      setSelectedSlot(null);
    }
  }, [selectedDate, selectedInterviewers, availableSlots, selectedSlot]);
  
  // Handle interviewer selection/deselection
  const toggleInterviewer = (interviewerId) => {
    setSelectedInterviewers(prev => {
      if (prev.includes(interviewerId)) {
        return prev.filter(id => id !== interviewerId);
      } else {
        return [...prev, interviewerId];
      }
    });
  };
  
  // Handle candidate selection
  const handleCandidateChange = (e) => {
    const selectedCandidate = candidates.find(c => c.id === e.target.value);
    setCandidateId(selectedCandidate?.id || '');
    setCandidateName(selectedCandidate?.name || '');
  };
  
  // Handle scheduling the interview
  const handleScheduleInterview = async () => {
    if (!selectedDate || !selectedSlot || selectedInterviewers.length === 0 || !candidateId) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Prepare interview data
      const interviewData = {
        applicantId: candidateId,
        applicantName: candidateName,
        // Use a mock job ID and title for demo purposes
        jobId: 'job_1',
        jobTitle: 'Demo Position',
        date: `${selectedDate}T${selectedSlot.start}:00`,
        time: `${selectedSlot.start} - ${selectedSlot.end}`,
        duration: parseInt(selectedSlot.end.split(':')[0]) * 60 + parseInt(selectedSlot.end.split(':')[1]) - 
                 (parseInt(selectedSlot.start.split(':')[0]) * 60 + parseInt(selectedSlot.start.split(':')[1])),
        interviewers: selectedInterviewers.map(id => {
          const interviewer = dbInterviewers.find(i => i.id === id);
          return {
            id: interviewer.id,
            name: interviewer.name,
            email: interviewer.email,
            role: interviewer.role
          };
        }),
        type: interviewType,
        location: interviewLocation,
        notes: interviewNotes,
        status: 'scheduled',
        feedback: '',
        organizer: {
          id: user?.id || 'user_1',
          name: user?.name || 'Demo User',
          email: user?.email || 'demo@example.com'
        }
      };
      
      /*
      --------- COMMENTED OUT SCHEDULER FUNCTIONALITY ---------
      // In a real application, this would send a request to the backend API
      // to create a new interview and save it to the database
      
      // Dispatch the Redux action to schedule the interview
      const resultAction = await dispatch(scheduleInterviewWithInterviewers(interviewData));
      
      if (scheduleInterviewWithInterviewers.fulfilled.match(resultAction)) {
        // Set the scheduled interview details from the result
        setScheduledInterview({
          ...resultAction.payload,
          time: `${selectedSlot.start} - ${selectedSlot.end}`,
          interviewers: selectedInterviewers.map(id => {
            const interviewer = dbInterviewers.find(i => i.id === id);
            return { id: interviewer.id, name: interviewer.name };
          }),
          candidateId,
          candidateName
        });
        
        // Move to confirmation step
        setStep(3);
        toast.success('Interview scheduled successfully!');
      } else {
        toast.error('Failed to schedule interview: ' + resultAction.error?.message);
      }
      --------- END COMMENTED SCHEDULER FUNCTIONALITY ---------
      */
      
      // Simulating interview scheduling without actual API calls or state changes
      console.log('Simulating interview scheduling with data:', interviewData);
      
      // Create a mock interview object for the confirmation step
      const mockInterview = {
        id: `interview_${Date.now()}`,
        ...interviewData,
        date: selectedDate,
        time: `${selectedSlot.start} - ${selectedSlot.end}`,
        status: 'scheduled',
        createdAt: new Date().toISOString()
      };
      
      // Set the scheduled interview directly for the confirmation UI
      setScheduledInterview({
        ...mockInterview,
        interviewers: selectedInterviewers.map(id => {
          const interviewer = dbInterviewers.find(i => i.id === id);
          return { id: interviewer.id, name: interviewer.name };
        }),
        candidateId,
        candidateName
      });
      
      // Move to confirmation step without actually saving anything
      setStep(3);
      toast.success('Interview scheduled successfully (Demo Mode)!');
      
    } catch (error) {
      toast.error('An error occurred: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create and download an .ics calendar file
  const createAndDownloadIcsFile = () => {
    // Format date for iCalendar format (YYYYMMDDTHHMMSSZ)
    const formatICSDate = (dateString, timeString) => {
      const date = new Date(`${dateString}T${timeString}:00`);
      return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    };
    
    const startDate = formatICSDate(selectedDate, selectedSlot.start);
    const endDate = formatICSDate(selectedDate, selectedSlot.end);
    
    // Get the interviewer names for the description
    const interviewerNames = selectedInterviewers.map(id => {
      const interviewer = dbInterviewers.find(i => i.id === id);
      return interviewer ? interviewer.name : '';
    }).join(', ');
    
    // Create the iCalendar content
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'CALSCALE:GREGORIAN',
      'METHOD:REQUEST',
      'BEGIN:VEVENT',
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      `SUMMARY:Interview with ${candidateName}`,
      `DESCRIPTION:${interviewType.charAt(0).toUpperCase() + interviewType.slice(1)} interview for ${candidateName}.\\n\\nInterviewers: ${interviewerNames}\\n\\n${interviewNotes || ''}`,
      `LOCATION:${interviewLocation === 'video' ? 'Video Call (link will be sent separately)' : 
                interviewLocation === 'phone' ? 'Phone Call' : 'Office'}`,
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'BEGIN:VALARM',
      'TRIGGER:-PT15M',
      'ACTION:DISPLAY',
      'DESCRIPTION:Reminder',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
    
    // Create a Blob with the iCalendar content
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    
    // Create a link element to download the file
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `interview_${candidateName.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Create a Gmail calendar event link
  const createGmailCalendarLink = () => {
    // Format date for URL parameters (YYYYMMDD)
    const formatDateForUrl = (dateStr) => {
      const date = new Date(dateStr);
      return date.toISOString().replace(/-|:|\.\d+/g, '');
    };
    
    const startDateTime = `${selectedDate}T${selectedSlot.start}:00`;
    const endDateTime = `${selectedDate}T${selectedSlot.end}:00`;
    
    const start = formatDateForUrl(startDateTime);
    const end = formatDateForUrl(endDateTime);
    
    // Get interviewer names for details
    const interviewersText = selectedInterviewers.map(id => {
      const interviewer = dbInterviewers.find(i => i.id === id);
      return interviewer ? interviewer.name : '';
    }).join(', ');
    
    // Create details text
    const details = `${interviewType.charAt(0).toUpperCase() + interviewType.slice(1)} interview for ${candidateName}
    
Interviewers: ${interviewersText}

${interviewNotes || ''}`;
    
    // Create location text
    const location = interviewLocation === 'video' 
      ? 'Video Call (link will be sent separately)' 
      : interviewLocation === 'phone' 
        ? 'Phone Call' 
        : 'Office';
    
    // Build the Gmail Calendar URL
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Interview with ${candidateName}`)}&dates=${start}/${end}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
    
    return url;
  };

  // Send emails directly to Gmail (simulated)
  const sendDirectGmailInvites = (recipients) => {
    /*
    ----- COMMENTED OUT EMAIL SENDING FUNCTIONALITY -----
    // In a real application, this would:
    // 1. Send actual email invites via an API endpoint
    // 2. Use Google Calendar API to add events to recipients' calendars
    // 3. Track and store invitation status in the database
    ----- END COMMENTED EMAIL SENDING FUNCTIONALITY -----
    */
    
    // Show processing status
    toast.info('Simulating sending calendar invitations (Demo Mode)...');
    
    // Generate Gmail calendar link
    const gmailCalendarLink = createGmailCalendarLink();
    
    // Simulate API call with setTimeout
    setTimeout(() => {
      // Success feedback with direct calendar link
      toast.success(
        <div>
          <p className="font-bold mb-1">Demo Mode: Calendar invitations prepared for:</p>
          <ul className="list-disc pl-4 max-h-32 overflow-y-auto">
            {recipients.map((recipient, index) => (
              <li key={index}>{recipient.name ? `${recipient.name} (${recipient.email})` : recipient.email}</li>
            ))}
          </ul>
          <div className="mt-3 pt-2 border-t border-gray-200">
            <p className="text-sm font-medium text-blue-700 mb-1">Add to your calendar directly:</p>
            <a 
              href={gmailCalendarLink}
              target="_blank"
              rel="noopener noreferrer" 
              className="inline-block mt-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 text-sm rounded-md"
              onClick={(e) => {
                e.stopPropagation(); // Prevent toast from closing when clicking the link
              }}
            >
              Open in Google Calendar →
            </a>
          </div>
        </div>,
        { autoClose: false, closeOnClick: false }
      );
      
      // Show Google Calendar integration message
      toast.info(
        <div>
          <p>No emails were actually sent. Click the "Open in Google Calendar →" link to add this event to your calendar.</p>
        </div>,
        { autoClose: 8000 }
      );
    }, 1500);
  };

  // Handle sending calendar invites
  const handleSendInvites = () => {
    // Open email modal to collect recipient information
    const selectedInterviewerObjects = selectedInterviewers.map(id => {
      return dbInterviewers.find(i => i.id === id);
    }).filter(Boolean);
    
    // Open modal with interviewer data
    setIsEmailModalOpen(true);
  };

  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Email Modal */}
      <EmailInputModal 
        isOpen={isEmailModalOpen}
        closeModal={() => setIsEmailModalOpen(false)}
        sendInvitations={sendDirectGmailInvites}
        interviewers={selectedInterviewers.map(id => dbInterviewers.find(i => i.id === id)).filter(Boolean)}
        candidate={{ name: candidateName, email: candidateId.includes('@') ? candidateId : '' }}
      />
      
      {step === 3 ? (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-3">
              <CheckCircleIcon className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Interview Scheduled</h2>
            <p className="text-gray-500 mt-1">
              {scheduledInterview 
                ? `Interview with ${scheduledInterview.candidateName} scheduled for ${scheduledInterview.date} at ${scheduledInterview.time}.`
                : `Interview with ${candidateName} has been scheduled.`
              }
            </p>
          </div>
          
          <div className="bg-gray-50 border border-gray-100 rounded-md p-6 mb-6">
            <h3 className="text-lg font-medium mb-4">Interview Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <CalendarIcon className="w-5 h-5 mt-0.5 mr-3 text-gray-500" />
                <div>
                  <p className="font-medium">Date & Time</p>
                  <p className="text-gray-500">
                    {scheduledInterview 
                      ? `${scheduledInterview.date} at ${scheduledInterview.time}`
                      : `${selectedDate} at ${selectedSlot?.start} - ${selectedSlot?.end}`
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <UserGroupIcon className="w-5 h-5 mt-0.5 mr-3 text-gray-500" />
                <div>
                  <p className="font-medium">Interviewers</p>
                  <div>
                    {scheduledInterview 
                      ? scheduledInterview.interviewers.map(i => (
                          <p key={i.id} className="text-gray-500">{i.name}</p>
                        ))
                      : selectedInterviewers.map(id => {
                          const interviewer = dbInterviewers.find(i => i.id === id);
                          return interviewer ? (
                            <p key={id} className="text-gray-500">{interviewer.name}</p>
                          ) : null;
                        })
                    }
                  </div>
                </div>
              </div>
              
              <div className="flex items-start">
                <DocumentTextIcon className="w-5 h-5 mt-0.5 mr-3 text-gray-500" />
                <div>
                  <p className="font-medium">Interview Type</p>
                  <p className="text-gray-500 capitalize">
                    {scheduledInterview?.type || interviewType}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <MapPinIcon className="w-5 h-5 mt-0.5 mr-3 text-gray-500" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-gray-500 capitalize">
                    {scheduledInterview?.location || interviewLocation}
                  </p>
                </div>
              </div>
            </div>
            
            {(scheduledInterview?.notes || interviewNotes) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="font-medium mb-1">Notes</p>
                <p className="text-gray-500">
                  {scheduledInterview?.notes || interviewNotes}
                </p>
              </div>
            )}
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
            
            <div className="flex space-x-3">
              <a
                href={createGmailCalendarLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <CalendarIcon className="w-5 h-5 mr-2" />
                Add to Google Calendar
              </a>
              
              <button
                onClick={handleScheduleInterview}
                disabled={isLoading}
                className={`px-4 py-2 rounded-md ${
                  isLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isLoading ? 'Scheduling...' : 'Save Interview'}
              </button>
              
              <button
                onClick={handleSendInvites}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <EnvelopeIcon className="w-5 h-5 mr-2" />
                Send Calendar Invites
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6 flex items-center">
            <button
              onClick={handleBack}
              className="mr-4 p-2 rounded-md hover:bg-gray-100 text-gray-600"
              aria-label="Go back"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              {step === 1 ? "Select Interview Date" : "Choose Interviewers & Time"}
            </h1>
          </div>
          
          <div className="scheduler-progress mb-8">
            <div className="flex items-center justify-center">
              <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <span className="ml-2 text-sm font-medium">Choose Date & Interviewers</span>
              </div>
              
              <div className="w-12 h-1 mx-2 bg-gray-200"></div>
              
              <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <ClockIcon className="w-5 h-5" />
                </div>
                <span className="ml-2 text-sm font-medium">Select Time & Details</span>
              </div>
              
              <div className="w-12 h-1 mx-2 bg-gray-200"></div>
              
              <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <CheckCircleIcon className="w-5 h-5" />
                </div>
                <span className="ml-2 text-sm font-medium">Confirmation</span>
              </div>
            </div>
          </div>
          
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-medium mb-4 flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2 text-gray-500" />
                  Select Interview Date
                </h2>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select a date</option>
                    {dateOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Candidate
                  </label>
                  <select
                    value={candidateId}
                    onChange={handleCandidateChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select a candidate</option>
                    {candidates.map(candidate => (
                      <option key={candidate.id} value={candidate.id}>
                        {candidate.name} - {candidate.position}
                      </option>
                    ))}
                  </select>
                </div>
                
                {selectedDate && (
                  <div className="text-right">
                    <button
                      onClick={() => setStep(2)}
                      disabled={!selectedDate || selectedInterviewers.length === 0 || !candidateId}
                      className={`px-4 py-2 rounded-md ${
                        !selectedDate || selectedInterviewers.length === 0 || !candidateId
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      Next: Select Time
                    </button>
                  </div>
                )}
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-medium mb-4 flex items-center">
                  <UserGroupIcon className="w-5 h-5 mr-2 text-gray-500" />
                  Select Interviewers
                </h2>
                
                {selectedDate ? (
                  <>
                    <p className="text-sm text-gray-500 mb-4">
                      Select at least one available interviewer for the selected date
                    </p>
                    
                    {isLoadingAvailability ? (
                      <div className="py-8 text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading interviewer availability...</p>
                      </div>
                    ) : (
                      <>
                        {dbInterviewers.length === 0 ? (
                          <div className="bg-white rounded-lg p-10 shadow-md text-center">
                            <UserGroupIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Interviewers Available</h3>
                            <p className="text-gray-500 mb-6">
                              You need to add interviewers before you can schedule interviews.
                            </p>
                            <Link
                              to="/interviewers"
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                            >
                              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                              Add Interviewers
                            </Link>
                          </div>
                        ) : (
                          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                            {dbInterviewers.map(interviewer => {
                              const isAvailable = availableSlots[interviewer.id] && 
                                                availableSlots[interviewer.id].availableSlots.length > 0;
                              
                              return (
                                <div 
                                  key={interviewer.id} 
                                  onClick={() => isAvailable && toggleInterviewer(interviewer.id)}
                                  className={`p-4 border rounded-lg flex items-center ${
                                    selectedInterviewers.includes(interviewer.id)
                                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                      : 'border-gray-200 hover:border-gray-300'
                                  } ${isAvailable ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'} 
                                  transition-all duration-200 transform hover:translate-y-[-2px]`}
                                >
                                  <div className="relative">
                                    <img 
                                      src={interviewer.avatar} 
                                      alt={interviewer.name} 
                                      className="w-12 h-12 rounded-full mr-4 object-cover border-2 border-gray-100"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(interviewer.name);
                                      }}
                                    />
                                    {isAvailable && selectedInterviewers.includes(interviewer.id) && (
                                      <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-0.5">
                                        <CheckCircleIcon className="w-4 h-4 text-white" />
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                      <h3 className="font-medium text-gray-900">{interviewer.name}</h3>
                                      {isAvailable ? (
                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full inline-flex items-center">
                                          <CheckCircleIcon className="w-3 h-3 mr-1" />
                                          Available
                                        </span>
                                      ) : (
                                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full inline-flex items-center">
                                          <XCircleIcon className="w-3 h-3 mr-1" />
                                          Unavailable
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">{interviewer.role}</p>
                                    <div className="flex flex-wrap mt-2 gap-1">
                                      {interviewer.expertise.map((skill, index) => (
                                        <span 
                                          key={index} 
                                          className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full"
                                        >
                                          {skill}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  {isAvailable && (
                                    <div className="ml-4">
                                      <input
                                        type="checkbox"
                                        checked={selectedInterviewers.includes(interviewer.id)}
                                        onChange={() => toggleInterviewer(interviewer.id)}
                                        className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                                        aria-label={`Select ${interviewer.name}`}
                                      />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                            
                            {/* Always show the Add Interviewers button */}
                            <div className="p-4 mt-4 border border-dashed border-gray-300 rounded-lg text-center">
                              <Link
                                to="/interviewers"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                              >
                                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                                Add More Interviewers
                              </Link>
                            </div>
                          </div>
                        )}
                        
                        {dbInterviewers.length > 0 && Object.values(availableSlots).every(slot => slot.availableSlots.length === 0) && (
                          <div className="my-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                            <div className="flex">
                              <div className="flex-shrink-0">
                                <XCircleIcon className="h-5 w-5 text-yellow-400" />
                              </div>
                              <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                  No interviewers are available on this date. Please try selecting a different date.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-4 bg-blue-50 rounded-md p-3 flex items-center">
                          <InformationCircleIcon className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0" />
                          <p className="text-sm text-blue-700">
                            {selectedInterviewers.length === 0 ? (
                              "Please select at least one interviewer to proceed"
                            ) : (
                              `${selectedInterviewers.length} interviewer${selectedInterviewers.length > 1 ? 's' : ''} selected`
                            )}
                          </p>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="rounded-md bg-gray-50 p-6 text-center">
                    <CalendarIcon className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">Please select a date first</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Available interviewers will be shown based on the selected date
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-medium mb-4 flex items-center">
                  <ClockIcon className="w-5 h-5 mr-2 text-gray-500" />
                  Select Interview Time
                </h2>
                
                {commonAvailableSlots.length > 0 ? (
                  <div className="space-y-2 mb-6">
                    <p className="text-sm text-gray-500 mb-2">
                      These time slots are available for all selected interviewers:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {commonAvailableSlots.map((slot, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2 px-3 text-sm rounded-md ${
                            selectedSlot && selectedSlot.start === slot.start
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          {slot.start} - {slot.end}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <XCircleIcon className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">No common availability</h3>
                        <p className="text-sm text-yellow-700 mt-1">
                          The selected interviewers don't have any common available time slots on this date. 
                          Try selecting a different date or different interviewers.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Back
                  </button>
                  
                  <button
                    onClick={() => setStep(3)}
                    disabled={!selectedSlot}
                    className={`px-4 py-2 rounded-md ${
                      !selectedSlot
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    Next: Review Details
                  </button>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-medium mb-4 flex items-center">
                  <DocumentTextIcon className="w-5 h-5 mr-2 text-gray-500" />
                  Interview Details
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Interview Type
                    </label>
                    <select
                      value={interviewType}
                      onChange={(e) => setInterviewType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="technical">Technical</option>
                      <option value="behavioral">Behavioral</option>
                      <option value="hr">HR</option>
                      <option value="culture">Culture Fit</option>
                      <option value="initial">Initial Screening</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Interview Location
                    </label>
                    <select
                      value={interviewLocation}
                      onChange={(e) => setInterviewLocation(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="video">Video Call</option>
                      <option value="phone">Phone Call</option>
                      <option value="in-person">In-Person</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes for Interviewers
                    </label>
                    <textarea
                      value={interviewNotes}
                      onChange={(e) => setInterviewNotes(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Add any specific topics to cover or questions to ask..."
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InterviewScheduler; 