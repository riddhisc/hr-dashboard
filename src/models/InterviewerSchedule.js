// Mock data for interviewers and their availability
const interviewers = [
  {
    id: "interviewer_1",
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    role: "Technical Lead",
    department: "Engineering",
    expertise: ["Frontend", "React", "JavaScript"],
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    calendar: [
      { 
        date: "2024-04-15", 
        slots: [
          { start: "09:00", end: "10:00", available: true },
          { start: "10:00", end: "11:00", available: false, title: "Team Meeting" },
          { start: "11:00", end: "12:00", available: true },
          { start: "13:00", end: "14:00", available: true },
          { start: "14:00", end: "15:00", available: true },
          { start: "15:00", end: "16:00", available: false, title: "Project Review" },
          { start: "16:00", end: "17:00", available: true },
        ]
      },
      { 
        date: "2024-04-16", 
        slots: [
          { start: "09:00", end: "10:00", available: true },
          { start: "10:00", end: "11:00", available: true },
          { start: "11:00", end: "12:00", available: false, title: "Sprint Planning" },
          { start: "13:00", end: "14:00", available: false, title: "Sprint Planning" },
          { start: "14:00", end: "15:00", available: true },
          { start: "15:00", end: "16:00", available: true },
          { start: "16:00", end: "17:00", available: true },
        ]
      },
      { 
        date: "2024-04-17", 
        slots: [
          { start: "09:00", end: "10:00", available: false, title: "Technical Discussion" },
          { start: "10:00", end: "11:00", available: false, title: "Technical Discussion" },
          { start: "11:00", end: "12:00", available: true },
          { start: "13:00", end: "14:00", available: true },
          { start: "14:00", end: "15:00", available: true },
          { start: "15:00", end: "16:00", available: true },
          { start: "16:00", end: "17:00", available: false, title: "1:1 Meeting" },
        ]
      },
    ]
  },
  {
    id: "interviewer_2",
    name: "Michael Chen",
    email: "michael.chen@example.com",
    role: "Senior Backend Developer",
    department: "Engineering",
    expertise: ["Backend", "Node.js", "Database Design"],
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    calendar: [
      { 
        date: "2024-04-15", 
        slots: [
          { start: "09:00", end: "10:00", available: false, title: "API Planning" },
          { start: "10:00", end: "11:00", available: false, title: "API Planning" },
          { start: "11:00", end: "12:00", available: true },
          { start: "13:00", end: "14:00", available: true },
          { start: "14:00", end: "15:00", available: false, title: "Database Review" },
          { start: "15:00", end: "16:00", available: true },
          { start: "16:00", end: "17:00", available: true },
        ]
      },
      { 
        date: "2024-04-16", 
        slots: [
          { start: "09:00", end: "10:00", available: true },
          { start: "10:00", end: "11:00", available: true },
          { start: "11:00", end: "12:00", available: false, title: "Sprint Planning" },
          { start: "13:00", end: "14:00", available: false, title: "Sprint Planning" },
          { start: "14:00", end: "15:00", available: true },
          { start: "15:00", end: "16:00", available: true },
          { start: "16:00", end: "17:00", available: true },
        ]
      },
      { 
        date: "2024-04-17", 
        slots: [
          { start: "09:00", end: "10:00", available: true },
          { start: "10:00", end: "11:00", available: true },
          { start: "11:00", end: "12:00", available: true },
          { start: "13:00", end: "14:00", available: false, title: "Team Sync" },
          { start: "14:00", end: "15:00", available: false, title: "Performance Review" },
          { start: "15:00", end: "16:00", available: true },
          { start: "16:00", end: "17:00", available: true },
        ]
      },
    ]
  },
  {
    id: "interviewer_3",
    name: "Emily Davis",
    email: "emily.davis@example.com",
    role: "HR Manager",
    department: "Human Resources",
    expertise: ["Recruitment", "Employee Relations", "Onboarding"],
    avatar: "https://randomuser.me/api/portraits/women/17.jpg",
    calendar: [
      { 
        date: "2024-04-15", 
        slots: [
          { start: "09:00", end: "10:00", available: true },
          { start: "10:00", end: "11:00", available: true },
          { start: "11:00", end: "12:00", available: true },
          { start: "13:00", end: "14:00", available: false, title: "HR Team Meeting" },
          { start: "14:00", end: "15:00", available: false, title: "HR Team Meeting" },
          { start: "15:00", end: "16:00", available: true },
          { start: "16:00", end: "17:00", available: true },
        ]
      },
      { 
        date: "2024-04-16", 
        slots: [
          { start: "09:00", end: "10:00", available: false, title: "Onboarding Session" },
          { start: "10:00", end: "11:00", available: false, title: "Onboarding Session" },
          { start: "11:00", end: "12:00", available: true },
          { start: "13:00", end: "14:00", available: true },
          { start: "14:00", end: "15:00", available: true },
          { start: "15:00", end: "16:00", available: false, title: "Recruitment Planning" },
          { start: "16:00", end: "17:00", available: true },
        ]
      },
      { 
        date: "2024-04-17", 
        slots: [
          { start: "09:00", end: "10:00", available: true },
          { start: "10:00", end: "11:00", available: true },
          { start: "11:00", end: "12:00", available: false, title: "Benefits Discussion" },
          { start: "13:00", end: "14:00", available: true },
          { start: "14:00", end: "15:00", available: true },
          { start: "15:00", end: "16:00", available: true },
          { start: "16:00", end: "17:00", available: false, title: "Executive Meeting" },
        ]
      },
    ]
  },
  {
    id: "interviewer_4",
    name: "David Wilson",
    email: "david.wilson@example.com",
    role: "Engineering Manager",
    department: "Engineering",
    expertise: ["System Architecture", "Team Leadership", "Technical Strategy"],
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    calendar: [
      { 
        date: "2024-04-15", 
        slots: [
          { start: "09:00", end: "10:00", available: false, title: "Management Meeting" },
          { start: "10:00", end: "11:00", available: false, title: "Management Meeting" },
          { start: "11:00", end: "12:00", available: true },
          { start: "13:00", end: "14:00", available: true },
          { start: "14:00", end: "15:00", available: true },
          { start: "15:00", end: "16:00", available: false, title: "Project Review" },
          { start: "16:00", end: "17:00", available: false, title: "Planning Session" },
        ]
      },
      { 
        date: "2024-04-16", 
        slots: [
          { start: "09:00", end: "10:00", available: true },
          { start: "10:00", end: "11:00", available: true },
          { start: "11:00", end: "12:00", available: false, title: "Sprint Planning" },
          { start: "13:00", end: "14:00", available: false, title: "Sprint Planning" },
          { start: "14:00", end: "15:00", available: false, title: "1:1 with Direct Report" },
          { start: "15:00", end: "16:00", available: false, title: "1:1 with Direct Report" },
          { start: "16:00", end: "17:00", available: true },
        ]
      },
      { 
        date: "2024-04-17", 
        slots: [
          { start: "09:00", end: "10:00", available: true },
          { start: "10:00", end: "11:00", available: false, title: "Architecture Review" },
          { start: "11:00", end: "12:00", available: false, title: "Architecture Review" },
          { start: "13:00", end: "14:00", available: true },
          { start: "14:00", end: "15:00", available: true },
          { start: "15:00", end: "16:00", available: true },
          { start: "16:00", end: "17:00", available: false, title: "Department Meeting" },
        ]
      },
    ]
  },
  {
    id: "interviewer_5",
    name: "Jessica Martinez",
    email: "jessica.martinez@example.com",
    role: "UX Designer",
    department: "Design",
    expertise: ["User Research", "Interaction Design", "Prototyping"],
    avatar: "https://randomuser.me/api/portraits/women/63.jpg",
    calendar: [
      { 
        date: "2024-04-15", 
        slots: [
          { start: "09:00", end: "10:00", available: true },
          { start: "10:00", end: "11:00", available: false, title: "Design Review" },
          { start: "11:00", end: "12:00", available: false, title: "Design Review" },
          { start: "13:00", end: "14:00", available: true },
          { start: "14:00", end: "15:00", available: true },
          { start: "15:00", end: "16:00", available: true },
          { start: "16:00", end: "17:00", available: false, title: "UX Team Sync" },
        ]
      },
      { 
        date: "2024-04-16", 
        slots: [
          { start: "09:00", end: "10:00", available: false, title: "User Testing" },
          { start: "10:00", end: "11:00", available: false, title: "User Testing" },
          { start: "11:00", end: "12:00", available: false, title: "User Testing" },
          { start: "13:00", end: "14:00", available: true },
          { start: "14:00", end: "15:00", available: true },
          { start: "15:00", end: "16:00", available: true },
          { start: "16:00", end: "17:00", available: true },
        ]
      },
      { 
        date: "2024-04-17", 
        slots: [
          { start: "09:00", end: "10:00", available: true },
          { start: "10:00", end: "11:00", available: true },
          { start: "11:00", end: "12:00", available: true },
          { start: "13:00", end: "14:00", available: true },
          { start: "14:00", end: "15:00", available: false, title: "Design Sprint" },
          { start: "15:00", end: "16:00", available: false, title: "Design Sprint" },
          { start: "16:00", end: "17:00", available: false, title: "Design Sprint" },
        ]
      },
    ]
  }
];

// Helper function to get available slots for a specific date
export const getAvailableSlotsForDate = (date) => {
  console.log(`Getting available slots for date: ${date}`);
  
  const availableSlots = {};
  
  interviewers.forEach(interviewer => {
    // First try to find the exact date match
    let daySchedule = interviewer.calendar.find(day => day.date === date);
    
    // If no exact match found, generate mock data for the requested date
    if (!daySchedule) {
      console.log(`No calendar data found for ${interviewer.name} on ${date}, generating mock data`);
      
      // Generate a predictable but varying pattern based on interviewer ID and date
      // This ensures some interviewers are available and some aren't
      const dateNum = parseInt(date.replace(/-/g, ''));
      const idNum = parseInt(interviewer.id.replace('interviewer_', ''));
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
        
        daySchedule = {
          date,
          slots: mockSlots
        };
      } else {
        // This interviewer is not available at all on this day
        daySchedule = {
          date,
          slots: []
        };
      }
    }
    
    if (daySchedule && daySchedule.slots.length > 0) {
      availableSlots[interviewer.id] = {
        interviewer: {
          id: interviewer.id,
          name: interviewer.name,
          role: interviewer.role,
          department: interviewer.department,
          expertise: interviewer.expertise,
          avatar: interviewer.avatar
        },
        availableSlots: daySchedule.slots.filter(slot => slot.available)
      };
    } else {
      // If interviewer has no slots or no available slots, still include them but mark them as unavailable
      availableSlots[interviewer.id] = {
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
  
  console.log('Generated available slots:', availableSlots);
  return availableSlots;
};

// Helper function to find common available slots for multiple interviewers
export const findCommonAvailability = (interviewerIds, date) => {
  console.log(`Finding common availability for ${interviewerIds.length} interviewers on ${date}`);
  
  if (!interviewerIds || interviewerIds.length === 0) {
    return [];
  }
  
  // Get available slots for all interviewers on the selected date
  const availableSlotsData = getAvailableSlotsForDate(date);
  
  // Extract just the available slots for the selected interviewers
  const selectedInterviewersSlots = interviewerIds.map(id => 
    availableSlotsData[id]?.availableSlots || []
  );
  
  // If any interviewer has no available slots, there can't be common availability
  if (selectedInterviewersSlots.some(slots => slots.length === 0)) {
    console.log('At least one interviewer has no available slots');
    return [];
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
  return commonSlots;
};

// Helper function to book an interview slot
export const bookInterviewSlot = (interviewerIds, date, slot, interviewDetails) => {
  // In a real application, this would make an API call to update the database
  // For this demo, we'll just return a success message
  
  return {
    success: true,
    message: "Interview scheduled successfully",
    details: {
      interviewers: interviewerIds.map(id => {
        const interviewer = interviewers.find(i => i.id === id);
        return {
          id: interviewer.id,
          name: interviewer.name,
          email: interviewer.email
        };
      }),
      date,
      time: `${slot.start} - ${slot.end}`,
      ...interviewDetails
    }
  };
};

export default interviewers; 