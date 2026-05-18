import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="auth-wrapper">
      <div className="auth-card-clerk">
        <SignIn />
      </div>
    </div>
  );
}
