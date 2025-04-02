import mongoose from 'mongoose';

const applicantSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Please add a phone number'],
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'shortlisted', 'interview', 'hired', 'rejected'],
      default: 'pending',
    },
    source: {
      type: String,
      enum: ['linkedin', 'indeed', 'company', 'referral', 'other'],
      required: [true, 'Please add a source'],
    },
    resumeUrl: {
      type: String,
      required: [true, 'Please add a resume URL'],
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for interviews
applicantSchema.virtual('interviews', {
  ref: 'Interview',
  localField: '_id',
  foreignField: 'applicantId',
  justOne: false,
});

// Add job title as a virtual field
applicantSchema.virtual('jobTitle', {
  ref: 'Job',
  localField: 'jobId',
  foreignField: '_id',
  justOne: true,
  get: function(job) {
    return job ? job.title : '';
  }
});

const Applicant = mongoose.model('Applicant', applicantSchema);

export default Applicant; 