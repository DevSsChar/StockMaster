'use client'

import { useState } from 'react'
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const AppInput = (props) => {
  const { label, placeholder, icon, ...rest } = props;
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div className="w-full min-w-[200px] relative">
      {label && 
        <label className='block mb-2 text-sm'>
          {label}
        </label>
      }
      <div className="relative w-full">
        <input
          className="peer relative z-10 border-2 border-[var(--color-border)] h-13 w-full rounded-md bg-[var(--color-surface)] px-4 font-thin outline-none drop-shadow-sm transition-all duration-200 ease-in-out focus:bg-[var(--color-bg)] placeholder:font-medium"
          placeholder={placeholder}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          {...rest}
        />
        {isHovering && (
          <>
            <div
              className="absolute pointer-events-none top-0 left-0 right-0 h-[2px] z-20 rounded-t-md overflow-hidden"
              style={{
                background: `radial-gradient(30px circle at ${mousePosition.x}px 0px, var(--color-text-primary) 0%, transparent 70%)`,
              }}
            />
            <div
              className="absolute pointer-events-none bottom-0 left-0 right-0 h-[2px] z-20 rounded-b-md overflow-hidden"
              style={{
                background: `radial-gradient(30px circle at ${mousePosition.x}px 2px, var(--color-text-primary) 0%, transparent 70%)`,
              }}
            />
          </>
        )}
        {icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

const ForgotPasswordPage = () => {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: New Password
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleMouseMove = (e) => {
    const leftSection = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - leftSection.left,
      y: e.clientY - leftSection.top
    });
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setTimeout(() => {
          setStep(2);
          setSuccess('');
        }, 2000);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/verify-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setTimeout(() => {
          setStep(3);
          setSuccess('');
        }, 1000);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-[100%] bg-[var(--color-bg)] flex items-center justify-center p-4">
      <div className='card w-[80%] lg:w-[70%] md:w-[55%] flex justify-between h-[600px]'>
        <div
          className='w-full lg:w-1/2 px-4 lg:px-16 left h-full relative overflow-hidden'
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}>
            <div
              className={`absolute pointer-events-none w-[500px] h-[500px] bg-gradient-to-r from-purple-300/30 via-blue-300/30 to-pink-300/30 rounded-full blur-3xl transition-opacity duration-200 ${
                isHovering ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                transform: `translate(${mousePosition.x - 250}px, ${mousePosition.y - 250}px)`,
                transition: 'transform 0.1s ease-out'
              }}
            />
            <div className="form-container h-full z-10 flex items-center">
              {/* Step 1: Email Input */}
              {step === 1 && (
                <form className='text-center grid gap-4 w-full' onSubmit={handleSendCode}>
                  <div className='grid gap-4 mb-2'>
                    <h1 className='text-3xl md:text-4xl font-extrabold'>Forgot Password</h1>
                    <p className='text-sm text-[var(--color-text-secondary)]'>
                      Enter your email address and we'll send you a reset code
                    </p>
                  </div>

                  {error && (
                    <div className='text-red-500 text-sm bg-red-100 dark:bg-red-900/20 p-2 rounded'>
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className='text-green-500 text-sm bg-green-100 dark:bg-green-900/20 p-2 rounded'>
                      {success}
                    </div>
                  )}

                  <AppInput 
                    placeholder="Email" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />

                  <div className='flex gap-4 justify-center items-center mt-4'>
                    <button 
                      type="button"
                      onClick={() => router.push('/login')}
                      className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                    >
                      Back to Login
                    </button>
                    <button 
                      type="submit"
                      disabled={isLoading}
                      className="group/button relative inline-flex justify-center items-center overflow-hidden rounded-md bg-[var(--color-border)] px-6 py-2 text-sm font-normal text-white transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-[0_10px_25px_-5px_var(--color-text-primary)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="text-sm px-2 py-1">
                        {isLoading ? 'Sending...' : 'Send Code'}
                      </span>
                      <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-100%)] group-hover/button:duration-1000 group-hover/button:[transform:skew(-13deg)_translateX(100%)]">
                        <div className="relative h-full w-8 bg-white/20" />
                      </div>
                    </button>
                  </div>
                </form>
              )}

              {/* Step 2: Code Verification */}
              {step === 2 && (
                <form className='text-center grid gap-4 w-full' onSubmit={handleVerifyCode}>
                  <div className='grid gap-4 mb-2'>
                    <h1 className='text-3xl md:text-4xl font-extrabold'>Enter Reset Code</h1>
                    <p className='text-sm text-[var(--color-text-secondary)]'>
                      We sent a 6-digit code to <span className='text-[var(--color-text-primary)]'>{email}</span>
                    </p>
                  </div>

                  {error && (
                    <div className='text-red-500 text-sm bg-red-100 dark:bg-red-900/20 p-2 rounded'>
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className='text-green-500 text-sm bg-green-100 dark:bg-green-900/20 p-2 rounded'>
                      {success}
                    </div>
                  )}

                  <AppInput 
                    placeholder="6-digit code" 
                    type="text" 
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    maxLength={6}
                    required
                  />

                  <button 
                    type="button"
                    onClick={() => setStep(1)}
                    className='text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors'
                  >
                    Didn't receive code? Try again
                  </button>

                  <div className='flex gap-4 justify-center items-center mt-4'>
                    <button 
                      type="button"
                      onClick={() => router.push('/login')}
                      className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                    >
                      Back to Login
                    </button>
                    <button 
                      type="submit"
                      disabled={isLoading}
                      className="group/button relative inline-flex justify-center items-center overflow-hidden rounded-md bg-[var(--color-border)] px-6 py-2 text-sm font-normal text-white transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-[0_10px_25px_-5px_var(--color-text-primary)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="text-sm px-2 py-1">
                        {isLoading ? 'Verifying...' : 'Verify Code'}
                      </span>
                      <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-100%)] group-hover/button:duration-1000 group-hover/button:[transform:skew(-13deg)_translateX(100%)]">
                        <div className="relative h-full w-8 bg-white/20" />
                      </div>
                    </button>
                  </div>
                </form>
              )}

              {/* Step 3: New Password */}
              {step === 3 && (
                <form className='text-center grid gap-4 w-full' onSubmit={handleResetPassword}>
                  <div className='grid gap-4 mb-2'>
                    <h1 className='text-3xl md:text-4xl font-extrabold'>Create New Password</h1>
                    <p className='text-sm text-[var(--color-text-secondary)]'>
                      Enter your new password below
                    </p>
                  </div>

                  {error && (
                    <div className='text-red-500 text-sm bg-red-100 dark:bg-red-900/20 p-2 rounded'>
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className='text-green-500 text-sm bg-green-100 dark:bg-green-900/20 p-2 rounded'>
                      {success}
                    </div>
                  )}

                  <div className='grid gap-4'>
                    <AppInput 
                      placeholder="New Password" 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <AppInput 
                      placeholder="Confirm New Password" 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className='flex gap-4 justify-center items-center mt-4'>
                    <button 
                      type="button"
                      onClick={() => router.push('/login')}
                      className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                    >
                      Back to Login
                    </button>
                    <button 
                      type="submit"
                      disabled={isLoading}
                      className="group/button relative inline-flex justify-center items-center overflow-hidden rounded-md bg-[var(--color-border)] px-6 py-2 text-sm font-normal text-white transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-[0_10px_25px_-5px_var(--color-text-primary)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="text-sm px-2 py-1">
                        {isLoading ? 'Resetting...' : 'Reset Password'}
                      </span>
                      <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-100%)] group-hover/button:duration-1000 group-hover/button:[transform:skew(-13deg)_translateX(100%)]">
                        <div className="relative h-full w-8 bg-white/20" />
                      </div>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
          <div className='hidden lg:block w-1/2 right h-full overflow-hidden'>
              <Image
                src='https://images.pexels.com/photos/5380642/pexels-photo-5380642.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
                loader={({ src }) => src}
                width={1000}
                height={1000}
                priority
                alt="Forgot password image"
                className="w-full h-full object-cover transition-transform duration-300 opacity-30"
              />
         </div>
        </div>
      </div>
  )
}

export default ForgotPasswordPage