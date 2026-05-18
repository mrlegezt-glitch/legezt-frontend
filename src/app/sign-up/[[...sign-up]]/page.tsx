import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <SignUp
          appearance={{
            elements: {
              card: "bg-[#1a1a2e] border border-rgba(255,255,255,0.06)",
              headerTitle: "text-white",
              headerSubtitle: "text-[#8888a0]",
              socialButtonsBlockButton: "bg-[#12121a] border border-rgba(255,255,255,0.06) text-white hover:bg-[#1a1a2e]",
              formFieldLabel: "text-[#8888a0]",
              formFieldInput: "bg-[#12121a] border border-rgba(255,255,255,0.06) text-white focus:border-[#00d2b4]",
              formButtonPrimary: "bg-gradient-to-r from-[#00d2b4] to-[#6c5ce7] text-white hover:opacity-90",
              footerActionText: "text-[#8888a0]",
              footerActionLink: "text-[#00d2b4] hover:text-[#6c5ce7]",
            },
          }}
        />
      </div>
    </div>
  );
}
