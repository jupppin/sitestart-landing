'use client';

import { useState, FormEvent, ChangeEvent } from 'react';

interface IntakeFormData {
  fullName: string;
  email: string;
  phone?: string;
  businessName: string;
  industryType: string;
  currentWebsite?: string;
  hasNoWebsite: boolean;
  features: string[];
  otherFeatures?: string;
  budgetRange: string;
  timeline: string;
  additionalInfo?: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  businessName?: string;
  industryType?: string;
  budgetRange?: string;
  timeline?: string;
}

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

const INDUSTRY_OPTIONS = [
  { value: '', label: 'Select your industry' },
  { value: 'retail', label: 'Retail' },
  { value: 'restaurant', label: 'Restaurant / Food Service' },
  { value: 'professional', label: 'Professional Services' },
  { value: 'health', label: 'Health & Wellness' },
  { value: 'home-services', label: 'Home Services' },
  { value: 'other', label: 'Other' },
];

const FEATURE_OPTIONS = [
  { value: 'ecommerce', label: 'Online store / E-commerce' },
  { value: 'booking', label: 'Appointment booking' },
  { value: 'contact', label: 'Contact form' },
  { value: 'gallery', label: 'Photo gallery' },
  { value: 'blog', label: 'Blog' },
  { value: 'menu', label: 'Menu / Services list' },
  { value: 'reviews', label: 'Customer reviews' },
  { value: 'other', label: 'Other' },
];

const BUDGET_OPTIONS = [
  { value: '', label: 'Select your budget' },
  { value: 'under-500', label: 'Under $500' },
  { value: '500-1000', label: '$500 - $1,000' },
  { value: '1000-2500', label: '$1,000 - $2,500' },
  { value: '2500-plus', label: '$2,500+' },
  { value: 'not-sure', label: 'Not sure yet' },
];

const TIMELINE_OPTIONS = [
  { value: '', label: 'Select your timeline' },
  { value: 'asap', label: 'ASAP (within 2 weeks)' },
  { value: '1-2-months', label: '1-2 months' },
  { value: '3-plus-months', label: '3+ months' },
  { value: 'exploring', label: 'Just exploring' },
];

const initialFormData: IntakeFormData = {
  fullName: '',
  email: '',
  phone: '',
  businessName: '',
  industryType: '',
  currentWebsite: '',
  hasNoWebsite: false,
  features: [],
  otherFeatures: '',
  budgetRange: '',
  timeline: '',
  additionalInfo: '',
};

export default function IntakeForm() {
  const [formData, setFormData] = useState<IntakeFormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<FormStatus>('idle');
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    if (!phone) return true; // Phone is optional
    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'fullName':
        if (!value.trim()) return 'Full name is required';
        break;
      case 'email':
        if (!value.trim()) return 'Email address is required';
        if (!validateEmail(value)) return 'Please enter a valid email address';
        break;
      case 'phone':
        if (value && !validatePhone(value)) return 'Please enter a valid phone number';
        break;
      case 'businessName':
        if (!value.trim()) return 'Business name is required';
        break;
      case 'industryType':
        if (!value) return 'Please select an industry';
        break;
      case 'budgetRange':
        if (!value) return 'Please select a budget range';
        break;
      case 'timeline':
        if (!value) return 'Please select a timeline';
        break;
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const fullNameError = validateField('fullName', formData.fullName);
    if (fullNameError) newErrors.fullName = fullNameError;

    const emailError = validateField('email', formData.email);
    if (emailError) newErrors.email = emailError;

    const phoneError = validateField('phone', formData.phone || '');
    if (phoneError) newErrors.phone = phoneError;

    const businessNameError = validateField('businessName', formData.businessName);
    if (businessNameError) newErrors.businessName = businessNameError;

    const industryTypeError = validateField('industryType', formData.industryType);
    if (industryTypeError) newErrors.industryType = industryTypeError;

    const budgetRangeError = validateField('budgetRange', formData.budgetRange);
    if (budgetRangeError) newErrors.budgetRange = budgetRangeError;

    const timelineError = validateField('timeline', formData.timeline);
    if (timelineError) newErrors.timeline = timelineError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBlur = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => new Set(prev).add(name));

    const error = validateField(name, value);
    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleFeatureChange = (value: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      features: checked
        ? [...prev.features, value]
        : prev.features.filter((f) => f !== value),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched(new Set([
      'fullName', 'email', 'phone', 'businessName',
      'industryType', 'budgetRange', 'timeline'
    ]));

    if (!validateForm()) {
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch('/api/intake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      setStatus('success');
      setFormData(initialFormData);
      setTouched(new Set());
    } catch {
      setStatus('error');
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setErrors({});
  };

  // Success state
  if (status === 'success') {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm md:p-12">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
            <svg
              className="h-8 w-8 text-teal-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="mt-6 text-2xl font-bold text-gray-900">
            Thank you!
          </h3>
          <p className="mt-3 text-lg text-gray-600">
            We will be in touch within 24 hours.
          </p>
          <button
            onClick={handleReset}
            className="mt-8 inline-flex items-center justify-center rounded-full border-2 border-gray-200 bg-white px-6 py-3 text-base font-semibold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50"
          >
            Submit another response
          </button>
        </div>
      </div>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm md:p-12">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h3 className="mt-6 text-2xl font-bold text-gray-900">
            Something went wrong
          </h3>
          <p className="mt-3 text-lg text-gray-600">
            Please try again or contact us directly.
          </p>
          <button
            onClick={handleReset}
            className="mt-8 inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const showError = (field: keyof FormErrors) => touched.has(field) && errors[field];

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8"
      noValidate
    >
      {/* Section 1: Contact Information */}
      <fieldset className="mb-10">
        <legend className="mb-6 flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
            1
          </span>
          <span className="text-lg font-semibold text-gray-900">
            Contact Information
          </span>
        </legend>

        <div className="space-y-5">
          {/* Full Name */}
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-700"
            >
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              required
              autoComplete="name"
              value={formData.fullName}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`mt-1.5 block w-full rounded-lg border px-4 py-3 text-gray-900 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                showError('fullName')
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              }`}
              aria-invalid={showError('fullName') ? 'true' : 'false'}
              aria-describedby={showError('fullName') ? 'fullName-error' : undefined}
            />
            {showError('fullName') && (
              <p id="fullName-error" className="mt-1.5 text-sm text-red-600">
                {errors.fullName}
              </p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              autoComplete="email"
              value={formData.email}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`mt-1.5 block w-full rounded-lg border px-4 py-3 text-gray-900 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                showError('email')
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              }`}
              aria-invalid={showError('email') ? 'true' : 'false'}
              aria-describedby={showError('email') ? 'email-error' : undefined}
            />
            {showError('email') && (
              <p id="email-error" className="mt-1.5 text-sm text-red-600">
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Phone Number{' '}
              <span className="font-normal text-gray-500">(optional)</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              autoComplete="tel"
              value={formData.phone}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`mt-1.5 block w-full rounded-lg border px-4 py-3 text-gray-900 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                showError('phone')
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              }`}
              aria-invalid={showError('phone') ? 'true' : 'false'}
              aria-describedby={showError('phone') ? 'phone-error' : undefined}
            />
            {showError('phone') && (
              <p id="phone-error" className="mt-1.5 text-sm text-red-600">
                {errors.phone}
              </p>
            )}
          </div>
        </div>
      </fieldset>

      {/* Section 2: Business Details */}
      <fieldset className="mb-10">
        <legend className="mb-6 flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
            2
          </span>
          <span className="text-lg font-semibold text-gray-900">
            Business Details
          </span>
        </legend>

        <div className="space-y-5">
          {/* Business Name */}
          <div>
            <label
              htmlFor="businessName"
              className="block text-sm font-medium text-gray-700"
            >
              Business Name
            </label>
            <input
              type="text"
              id="businessName"
              name="businessName"
              required
              autoComplete="organization"
              value={formData.businessName}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`mt-1.5 block w-full rounded-lg border px-4 py-3 text-gray-900 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                showError('businessName')
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              }`}
              aria-invalid={showError('businessName') ? 'true' : 'false'}
              aria-describedby={showError('businessName') ? 'businessName-error' : undefined}
            />
            {showError('businessName') && (
              <p id="businessName-error" className="mt-1.5 text-sm text-red-600">
                {errors.businessName}
              </p>
            )}
          </div>

          {/* Industry Type */}
          <div>
            <label
              htmlFor="industryType"
              className="block text-sm font-medium text-gray-700"
            >
              Industry / Business Type
            </label>
            <select
              id="industryType"
              name="industryType"
              required
              value={formData.industryType}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`mt-1.5 block w-full rounded-lg border px-4 py-3 text-gray-900 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                showError('industryType')
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              }`}
              aria-invalid={showError('industryType') ? 'true' : 'false'}
              aria-describedby={showError('industryType') ? 'industryType-error' : undefined}
            >
              {INDUSTRY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {showError('industryType') && (
              <p id="industryType-error" className="mt-1.5 text-sm text-red-600">
                {errors.industryType}
              </p>
            )}
          </div>

          {/* Current Website */}
          <div>
            <label
              htmlFor="currentWebsite"
              className="block text-sm font-medium text-gray-700"
            >
              Current Website URL{' '}
              <span className="font-normal text-gray-500">(optional)</span>
            </label>
            <input
              type="url"
              id="currentWebsite"
              name="currentWebsite"
              autoComplete="url"
              placeholder="https://example.com"
              disabled={formData.hasNoWebsite}
              value={formData.currentWebsite}
              onChange={handleInputChange}
              className={`mt-1.5 block w-full rounded-lg border px-4 py-3 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formData.hasNoWebsite
                  ? 'border-gray-200 bg-gray-100 text-gray-400'
                  : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
              }`}
            />
            <div className="mt-3 flex items-center gap-2">
              <input
                type="checkbox"
                id="hasNoWebsite"
                name="hasNoWebsite"
                checked={formData.hasNoWebsite}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <label
                htmlFor="hasNoWebsite"
                className="text-sm text-gray-600"
              >
                I don&apos;t have a website yet
              </label>
            </div>
          </div>
        </div>
      </fieldset>

      {/* Section 3: Project Requirements */}
      <fieldset className="mb-10">
        <legend className="mb-6 flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
            3
          </span>
          <span className="text-lg font-semibold text-gray-900">
            Project Requirements
          </span>
        </legend>

        <div className="space-y-6">
          {/* Features */}
          <div>
            <span className="block text-sm font-medium text-gray-700">
              What features do you need?{' '}
              <span className="font-normal text-gray-500">(select all that apply)</span>
            </span>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {FEATURE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:border-gray-300 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={formData.features.includes(option.value)}
                    onChange={(e) =>
                      handleFeatureChange(option.value, e.target.checked)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>

            {/* Other Features Text Input */}
            {formData.features.includes('other') && (
              <div className="mt-3">
                <label
                  htmlFor="otherFeatures"
                  className="sr-only"
                >
                  Please describe other features
                </label>
                <input
                  type="text"
                  id="otherFeatures"
                  name="otherFeatures"
                  placeholder="Please describe the other features you need..."
                  value={formData.otherFeatures}
                  onChange={handleInputChange}
                  className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm transition-colors hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* Budget Range */}
          <div>
            <label
              htmlFor="budgetRange"
              className="block text-sm font-medium text-gray-700"
            >
              Budget Range
            </label>
            <select
              id="budgetRange"
              name="budgetRange"
              required
              value={formData.budgetRange}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`mt-1.5 block w-full rounded-lg border px-4 py-3 text-gray-900 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                showError('budgetRange')
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              }`}
              aria-invalid={showError('budgetRange') ? 'true' : 'false'}
              aria-describedby={showError('budgetRange') ? 'budgetRange-error' : undefined}
            >
              {BUDGET_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {showError('budgetRange') && (
              <p id="budgetRange-error" className="mt-1.5 text-sm text-red-600">
                {errors.budgetRange}
              </p>
            )}
          </div>

          {/* Timeline */}
          <div>
            <label
              htmlFor="timeline"
              className="block text-sm font-medium text-gray-700"
            >
              Timeline
            </label>
            <select
              id="timeline"
              name="timeline"
              required
              value={formData.timeline}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`mt-1.5 block w-full rounded-lg border px-4 py-3 text-gray-900 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                showError('timeline')
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              }`}
              aria-invalid={showError('timeline') ? 'true' : 'false'}
              aria-describedby={showError('timeline') ? 'timeline-error' : undefined}
            >
              {TIMELINE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {showError('timeline') && (
              <p id="timeline-error" className="mt-1.5 text-sm text-red-600">
                {errors.timeline}
              </p>
            )}
          </div>

          {/* Additional Information */}
          <div>
            <label
              htmlFor="additionalInfo"
              className="block text-sm font-medium text-gray-700"
            >
              Additional Information{' '}
              <span className="font-normal text-gray-500">(optional)</span>
            </label>
            <textarea
              id="additionalInfo"
              name="additionalInfo"
              rows={4}
              placeholder="Tell us anything else about your business or website needs..."
              value={formData.additionalInfo}
              onChange={handleInputChange}
              className="mt-1.5 block w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm transition-colors hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </fieldset>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={status === 'loading'}
          className="inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none sm:w-auto"
        >
          {status === 'loading' ? (
            <>
              <svg
                className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Submitting...
            </>
          ) : (
            <>
              Get Started
              <svg
                className="ml-2 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
