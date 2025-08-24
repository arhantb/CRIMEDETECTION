import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left: Brand Welcome (simple, clean) */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#04cf84] to-[#04b7cf] items-center justify-center p-10">
        <div className="text-white max-w-md text-center">
          <span className="text-3xl font-extrabold tracking-tight block mb-4">
            RetailVerse
          </span>
          <h1 className="text-4xl font-bold mb-2">Welcome to RetailVerse</h1>
          <p className="text-lg font-medium opacity-90">
            Smart shopping, simplified.
          </p>
        </div>
      </div>
      {/* Right: Sign In Form */}
      <div className="flex flex-1 items-center justify-center bg-white py-12 px-4 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 md:hidden flex flex-col items-center">
            <span className="text-3xl font-extrabold tracking-tight text-[#04b7cf]">
              RetailVerse
            </span>
            <h1 className="text-2xl font-bold mt-2 mb-1 text-gray-900">
              Welcome to RetailVerse
            </h1>
            <p className="text-base text-gray-600">
              Smart shopping, simplified.
            </p>
          </div>
          <SignIn
            appearance={{
              variables: {
                colorPrimary: "#04cf84",
                colorText: "#222",
                colorBackground: "#fff",
                colorInputBackground: "#f3f4f6",
                colorInputText: "#222",
                borderRadius: "0.75rem",
                fontSize: "1rem",
              },
              elements: {
                card: "rounded-2xl shadow-2xl border border-gray-100 p-6 bg-white",
                headerTitle: "text-2xl font-bold text-gray-900 mb-2",
                headerSubtitle: "text-base text-gray-600 mb-4",
                formButtonPrimary:
                  "bg-[#04cf84] hover:bg-[#04b7cf] text-white font-bold rounded-lg py-2 px-4 transition-colors",
                socialButtonsBlockButton:
                  "bg-[#04b7cf] hover:bg-[#04cf84] text-white font-semibold rounded-lg py-2 px-4 transition-colors",
                formFieldInput:
                  "rounded-lg border border-[#04b7cf] bg-[#f3f4f6] text-gray-900 focus:ring-2 focus:ring-[#04cf84] focus:border-[#04cf84]",
                footerAction: "text-sm text-gray-600 mt-6",
                formFieldLabel: "font-semibold text-gray-700 mb-1",
                formFieldInputShowPasswordButton: "text-[#04b7cf]",
                identityPreviewText: "text-[#04b7cf] font-semibold",
              },
            }}
            routing="path"
            path={undefined}
          />
        </div>
      </div>
    </div>
  );
}