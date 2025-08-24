'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Logo from '@/components/Logo';
import { SPECIALTIES, SERVICE_LEVELS } from '@/types/planner';
import { signUpPlanner } from '@/lib/supabaseClient';
// Form validation schema
const signupSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  company: z.string().min(2, 'Company name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid phone number is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  website: z.string().optional(),
  location: z.object({
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    country: z.string().min(2, 'Country is required'),
  }),
  serviceLevel: z.enum(Object.values(SERVICE_LEVELS)),
  specialties: z.array(z.string())
    .min(1, 'Select at least one specialty')
    .max(5, 'Maximum 5 specialties allowed'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupForm = z.infer<typeof signupSchema>;

export default function PlannerSignup() {
  // Removed payment step for now
  const { register, handleSubmit, formState: { errors }, watch } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      company: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      website: '',
      location: {
        city: '',
        state: '',
        country: ''
      },
      serviceLevel: 'full-service',
      specialties: [],

    }
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: SignupForm) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const { data: signupData, error: signupError } = await signUpPlanner(
        data.email,
        data.password,
        {
          company_name: data.company,
          contact_name: data.name,
          phone: data.phone,
          service_level: data.serviceLevel,
          specialties: data.specialties,
          city: data.location.city,
          state: data.location.state,
          country: data.location.country
        }
      );

      if (signupError) {
        throw new Error(signupError.message);
      }

      // Redirect to dashboard on success
      window.location.href = '/planner/dashboard';
      
    } catch (error) {
      console.error('Signup error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during signup');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Join Our Wedding Planner Network
          </h1>
          <p className="mt-2 text-gray-600">
            Create your account and start receiving qualified leads today
          </p>
        </div>

        {/* Progress indicator removed for now */}

        {/* Form */}
        <div className="bg-white shadow rounded-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  {...register('name')}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 bg-white"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Company Name
                </label>
                <input
                  type="text"
                  {...register('company')}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 bg-white"
                />
                {errors.company && (
                  <p className="mt-1 text-sm text-red-600">{errors.company.message}</p>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  {...register('email')}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 bg-white"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  {...register('phone')}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 bg-white"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  type="text"
                  {...register('location.city')}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 bg-white"
                />
                {errors.location?.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.city.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  State
                </label>
                <input
                  type="text"
                  {...register('location.state')}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 bg-white"
                />
                {errors.location?.state && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.state.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Country
                </label>
                <input
                  type="text"
                  {...register('location.country')}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 bg-white"
                />
                {errors.location?.country && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.country.message}</p>
                )}
              </div>
            </div>

            {/* Service Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Level
              </label>
              <select
                {...register('serviceLevel')}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 bg-white"
              >
                {Object.entries(SERVICE_LEVELS).map(([key, value]) => (
                  <option key={value} value={value}>
                    {key.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                  </option>
                ))}
              </select>
              {errors.serviceLevel && (
                <p className="mt-1 text-sm text-red-600">{errors.serviceLevel.message}</p>
              )}
            </div>

            {/* Specialties */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Specialties (Choose up to 5)
                </label>
                <span className={`text-sm ${watch('specialties')?.length >= 5 ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                  {watch('specialties')?.length || 0}/5 selected
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(SPECIALTIES).map(([key, value]) => {
                  const selectedCount = watch('specialties')?.length || 0;
                  const isChecked = watch('specialties')?.includes(value);
                  const disabled = selectedCount >= 5 && !isChecked;
                  
                  return (
                    <label 
                      key={value} 
                      className={`flex items-center space-x-2 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <input
                        type="checkbox"
                        value={value}
                        disabled={disabled}
                        {...register('specialties')}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                      <span className="text-sm text-gray-700">
                        {key.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                      </span>
                    </label>
                  );
                })}
              </div>
              {errors.specialties && (
                <p className="mt-1 text-sm text-red-600">{errors.specialties.message}</p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                Choose your top specialties carefully - these will be used to match you with couples looking for your specific expertise.
              </p>
            </div>



            {/* Password */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  {...register('password')}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 bg-white"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  type="password"
                  {...register('confirmPassword')}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 bg-white"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue to Payment
              </button>
            </div>
          </form>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center justify-center p-4 bg-white rounded-lg shadow">
            <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-sm text-gray-600">Secure Payments</span>
          </div>
          <div className="flex items-center justify-center p-4 bg-white rounded-lg shadow">
            <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-gray-600">Instant Access</span>
          </div>
          <div className="flex items-center justify-center p-4 bg-white rounded-lg shadow">
            <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-gray-600">30-Day Guarantee</span>
          </div>
        </div>
      </div>
    </div>
  );
}
