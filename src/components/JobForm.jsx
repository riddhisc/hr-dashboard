import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { XMarkIcon } from '@heroicons/react/24/outline'

// Form validation schema
const jobSchema = yup.object({
  title: yup.string().required('Job title is required'),
  department: yup.string().required('Department is required'),
  description: yup.string().required('Job description is required').min(20, 'Description must be at least 20 characters'),
  requirements: yup.string().required('Requirements are required'),
  location: yup.string().required('Location is required'),
  type: yup.string().required('Job type is required'),
  status: yup.string().required('Status is required'),
  salary: yup.object({
    min: yup.number().required('Minimum salary is required').positive('Salary must be positive'),
    max: yup.number().required('Maximum salary is required').positive('Salary must be positive')
      .test('is-greater', 'Maximum salary must be greater than minimum', function(value) {
        return value > this.parent.min;
      })
  }),
  closingDate: yup.string().required('Closing date is required'),
  skills: yup.array().of(yup.string()).min(1, 'At least one skill is required')
}).required();

function JobForm({ onSubmit, onCancel, initialData = null }) {
  // Get current date in YYYY-MM-DD format for the closing date default
  const oneMonthFromNow = new Date();
  oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
  const defaultClosingDate = oneMonthFromNow.toISOString().split('T')[0];

  const defaultValues = initialData || {
    title: '',
    department: 'Engineering',
    description: '',
    requirements: '',
    location: 'Remote',
    type: 'Full-time',
    status: 'published',
    salary: { min: 50000, max: 100000, currency: 'USD' },
    closingDate: defaultClosingDate,
    skills: []
  };

  const { 
    register, 
    handleSubmit, 
    control,
    formState: { errors, isSubmitting },
    watch,
    setValue
  } = useForm({
    resolver: yupResolver(jobSchema),
    defaultValues
  });

  const [skillInput, setSkillInput] = useState('');
  const skills = watch('skills');

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setValue('skills', [...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setValue('skills', skills.filter(skill => skill !== skillToRemove));
  };

  const handleFormSubmit = (data) => {
    // Ensure the data has the correct format
    const formattedData = {
      ...data,
      salary: {
        min: Number(data.salary.min),
        max: Number(data.salary.max),
        currency: 'USD'
      }
    };
    onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Job Title
        </label>
        <input
          id="title"
          type="text"
          {...register('title')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="department" className="block text-sm font-medium text-gray-700">
          Department
        </label>
        <select
          id="department"
          {...register('department')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="Engineering">Engineering</option>
          <option value="Design">Design</option>
          <option value="Marketing">Marketing</option>
          <option value="Sales">Sales</option>
          <option value="HR">HR</option>
          <option value="Finance">Finance</option>
          <option value="Operations">Operations</option>
        </select>
        {errors.department && (
          <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Job Description
        </label>
        <textarea
          id="description"
          rows={4}
          {...register('description')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="requirements" className="block text-sm font-medium text-gray-700">
          Requirements
        </label>
        <textarea
          id="requirements"
          rows={3}
          {...register('requirements')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
        {errors.requirements && (
          <p className="mt-1 text-sm text-red-600">{errors.requirements.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <select
            id="location"
            {...register('location')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="Remote">Remote</option>
            <option value="Onsite">Onsite</option>
            <option value="Hybrid">Hybrid</option>
          </select>
          {errors.location && (
            <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Job Type
          </label>
          <select
            id="type"
            {...register('type')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
            <option value="Remote">Remote</option>
          </select>
          {errors.type && (
            <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
          Required Skills
        </label>
        <div className="mt-1 flex space-x-2">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            placeholder="Add a skill and press Enter"
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
          <button
            type="button"
            onClick={addSkill}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Add
          </button>
        </div>
        {errors.skills && (
          <p className="mt-1 text-sm text-red-600">{errors.skills.message}</p>
        )}
        <div className="mt-2 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="ml-2 text-primary-600 hover:text-primary-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="salary" className="block text-sm font-medium text-gray-700">
          Salary Range
        </label>
        <div className="mt-1 grid grid-cols-2 gap-4">
          <div>
            <input
              type="number"
              {...register('salary.min')}
              placeholder="Minimum"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
            {errors.salary?.min && (
              <p className="mt-1 text-sm text-red-600">{errors.salary.min.message}</p>
            )}
          </div>
          <div>
            <input
              type="number"
              {...register('salary.max')}
              placeholder="Maximum"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
            {errors.salary?.max && (
              <p className="mt-1 text-sm text-red-600">{errors.salary.max.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="closingDate" className="block text-sm font-medium text-gray-700">
            Closing Date
          </label>
          <input
            type="date"
            id="closingDate"
            {...register('closingDate')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
          {errors.closingDate && (
            <p className="mt-1 text-sm text-red-600">{errors.closingDate.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            {...register('status')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          {isSubmitting ? 'Saving...' : 'Save Job'}
        </button>
      </div>
    </form>
  );
}

export default JobForm; 