import mongoose from 'mongoose';

const jobSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a job title'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Please add a department'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Please add a location'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Please add a job type'],
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'],
      default: 'Full-time',
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    requirements: {
      type: String,
      required: [true, 'Please add requirements'],
    },
    salary: {
      min: {
        type: Number,
        required: [true, 'Please add a minimum salary'],
      },
      max: {
        type: Number,
        required: [true, 'Please add a maximum salary'],
      },
      currency: {
        type: String,
        default: 'USD',
      },
    },
    skills: {
      type: [String],
      required: [true, 'Please add at least one required skill'],
    },
    status: {
      type: String,
      enum: ['open', 'closed', 'draft'],
      default: 'open',
    },
    postedDate: {
      type: Date,
      default: Date.now,
    },
    closingDate: {
      type: Date,
      required: [true, 'Please add a closing date'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for applicants
jobSchema.virtual('applicants', {
  ref: 'Applicant',
  localField: '_id',
  foreignField: 'jobId',
  justOne: false,
});

const Job = mongoose.model('Job', jobSchema);

export default Job; 