import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../contexts/AuthContext';

const validationSchema = Yup.object({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .required('Password is required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), undefined], 'Passwords must match')
        .required('Confirm password is required'),
});

export function RegisterPage() {
    const navigate = useNavigate();
    const { login } = useAuth(); // We might want to auto-login after registration

    const formik = useFormik({
        initialValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                await authService.register({
                    firstName: values.firstName,
                    lastName: values.lastName,
                    email: values.email,
                    password: values.password,
                });
                toast.success('Registration successful! Please sign in.');
                navigate('/login');
            } catch (error: any) {
                console.error('Registration error:', error);
                toast.error(error.response?.data?.message || 'Registration failed');
            }
        },
    });

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Or{' '}
                        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                            sign in to your existing account
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="firstName" className="sr-only">
                                First Name
                            </label>
                            <input
                                id="firstName"
                                name="firstName"
                                type="text"
                                autoComplete="given-name"
                                required
                                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${formik.touched.firstName && formik.errors.firstName ? 'border-red-300' : 'border-gray-300'
                                    } placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                                placeholder="First Name"
                                value={formik.values.firstName}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                        </div>
                        <div>
                            <label htmlFor="lastName" className="sr-only">
                                Last Name
                            </label>
                            <input
                                id="lastName"
                                name="lastName"
                                type="text"
                                autoComplete="family-name"
                                required
                                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${formik.touched.lastName && formik.errors.lastName ? 'border-red-300' : 'border-gray-300'
                                    } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                                placeholder="Last Name"
                                value={formik.values.lastName}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                        </div>
                        <div>
                            <label htmlFor="email-address" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${formik.touched.email && formik.errors.email ? 'border-red-300' : 'border-gray-300'
                                    } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                                placeholder="Email address"
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${formik.touched.password && formik.errors.password ? 'border-red-300' : 'border-gray-300'
                                    } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                                placeholder="Password"
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="sr-only">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                                    } placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                                placeholder="Confirm Password"
                                value={formik.values.confirmPassword}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                        </div>
                    </div>

                    {(formik.touched.firstName && formik.errors.firstName) ||
                        (formik.touched.lastName && formik.errors.lastName) ||
                        (formik.touched.email && formik.errors.email) ||
                        (formik.touched.password && formik.errors.password) ||
                        (formik.touched.confirmPassword && formik.errors.confirmPassword) ? (
                        <div className="text-red-500 text-sm text-center">
                            {formik.errors.firstName ||
                                formik.errors.lastName ||
                                formik.errors.email ||
                                formik.errors.password ||
                                formik.errors.confirmPassword}
                        </div>
                    ) : null}

                    <div>
                        <button
                            type="submit"
                            disabled={formik.isSubmitting}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {formik.isSubmitting ? 'Creating account...' : 'Create account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
