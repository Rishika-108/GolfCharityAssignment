import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%)" }}>
      {/* Hero Section */}
      <div className="px-8 py-16 sm:py-24 max-w-6xl mx-auto">
        <div className="text-center text-white space-y-6 mb-16">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
            Golf Charity Platform
          </h1>
          <p className="text-xl sm:text-2xl opacity-90 max-w-2xl mx-auto">
            Track your scores, compete in monthly draws, and impact charities you believe in
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link 
              href="/dashboard" 
              className="btn-primary px-8 py-4 text-lg font-semibold rounded-full inline-block text-center"
              style={{ background: "white", color: "#2d6a4f" }}
            >
              Enter Dashboard
            </Link>
            <Link 
              href="/scores" 
              className="btn-secondary px-8 py-4 text-lg font-semibold rounded-full inline-block text-center"
              style={{ borderColor: "white", color: "white" }}
            >
              View Scores
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-white px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="heading-2 text-center mb-12">Platform Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Subscription Card */}
            <div className="card card-impact">
              <div className="mb-4">
                <div style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #52b788, #2d6a4f)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "24px",
                  fontWeight: "bold"
                }}>
                  📊
                </div>
              </div>
              <h3 className="heading-3 mb-2">Subscription Growth</h3>
              <p className="body-text mb-4">Monitor active & pending members. Track subscription statuses and manage membership tiers seamlessly.</p>
              <Link 
                href="/dashboard" 
                className="text-emerald font-semibold hover:underline inline-block"
                style={{ color: "#2d6a4f" }}
              >
                Open Dashboard →
              </Link>
            </div>

            {/* Draw Card */}
            <div className="card card-impact">
              <div className="mb-4">
                <div style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #52b788, #2d6a4f)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "24px",
                  fontWeight: "bold"
                }}>
                  🎲
                </div>
              </div>
              <h3 className="heading-3 mb-2">Monthly Draws</h3>
              <p className="body-text mb-4">Run draws and finalize winners. Allocate prize pools efficiently with transparent distribution rules.</p>
              <Link 
                href="/admin" 
                className="text-emerald font-semibold hover:underline inline-block"
                style={{ color: "#2d6a4f" }}
              >
                Manage Draws →
              </Link>
            </div>

            {/* Impact Card */}
            <div className="card card-impact">
              <div className="mb-4">
                <div style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #52b788, #2d6a4f)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "24px",
                  fontWeight: "bold"
                }}>
                  ❤️
                </div>
              </div>
              <h3 className="heading-3 mb-2">Charity Impact</h3>
              <p className="body-text mb-4">Track donations per charity. Every subscription contributes to causes that matter to our community.</p>
              <Link 
                href="/dashboard" 
                className="text-emerald font-semibold hover:underline inline-block"
                style={{ color: "#2d6a4f" }}
              >
                View Impact →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="px-8 py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="heading-2 text-center mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { number: "1", title: "Create Profile", description: "Sign up and select your preferred charity" },
              { number: "2", title: "Subscribe", description: "Choose monthly or yearly premium membership" },
              { number: "3", title: "Track Scores", description: "Enter your golf scores to participate in draws" },
              { number: "4", title: "Win & Give", description: "Win monthly draws while supporting charities" }
            ].map((step, i) => (
              <div key={i} className="card text-center">
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #52b788, #2d6a4f)",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "24px",
                  margin: "0 auto 16px"
                }}>
                  {step.number}
                </div>
                <h3 className="heading-3 mb-2">{step.title}</h3>
                <p className="subtitle">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-8 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="heading-2 mb-6">Ready to Make an Impact?</h2>
          <p className="body-text mb-8 text-lg">Join our premium golf community today and start earning while supporting the charities you care about.</p>
          <Link 
            href="/dashboard" 
            className="btn-primary px-8 py-4 text-lg font-semibold rounded-full inline-block"
          >
            Get Started Now
          </Link>
        </div>
      </div>
    </div>
  );
}
