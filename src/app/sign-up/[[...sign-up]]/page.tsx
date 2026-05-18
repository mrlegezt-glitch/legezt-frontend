import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="auth-wrapper">
      <div className="auth-card-clerk">
        <SignUp />
      </div>
    </div>
  );
}
