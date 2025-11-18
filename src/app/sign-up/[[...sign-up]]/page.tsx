import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
      <SignUp 
        fallbackRedirectUrl="/onboarding"
        afterSignUpUrl="/onboarding"
      />
    </div>
  );
}