import mongoose from 'mongoose';

const interviewSchema = mongoose.Schema(
  {
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Applicant',
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    interviewers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    date: {
      type: Date,
      required: [true, 'Please add an interview date'],
    },
    time: {
      type: String,
      required: [true, 'Please add an interview time'],
    },
    duration: {
      type: Number, // in minutes
      required: [true, 'Please add interview duration'],
      default: 60,
    },
    type: {
      type: String,
      enum: ['phone', 'video', 'in-person', 'technical', 'hr'],
      required: [true, 'Please add an interview type'],
    },
    location: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      strengths: {
        type: String,
      },
      weaknesses: {
        type: String,
      },
      notes: {
        type: String,
      },
      recommendation: {
        type: String,
        enum: ['hire', 'reject', 'consider'],
      },
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Add applicant and job info
interviewSchema.pre('find', function() {
  this.populate({
    path: 'applicantId',
    select: 'name email phone status'
  }).populate({
    path: 'jobId',
    select: 'title department'
  });
});

const Interview = mongoose.model('Interview', interviewSchema);

export default Interview; 