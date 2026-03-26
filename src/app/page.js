import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen font-sans" style={{ background: "linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%)" }}>
      
      {/* Navigation Bar */}
      <nav className="flex justify-between items-center px-8 py-6 max-w-6xl mx-auto">
        <div className="text-white font-bold text-2xl tracking-tighter">
          ⛳ DigitalHeroes
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/login" className="text-white hover:text-green-200 font-medium transition">
            Login
          </Link>
          <Link href="/register" className="bg-white text-emerald px-4 py-2 rounded-full font-bold shadow hover:bg-gray-100 transition" style={{ color: "#2d6a4f" }}>
            Register
          </Link>
          <div className="h-6 w-px bg-white/30 mx-2 hidden sm:block"></div>
          <Link href="/login" className="text-emerald bg-emerald-900/30 px-3 py-1.5 rounded text-sm font-semibold border border-emerald/50 hover:bg-emerald/50 transition hidden sm:block" style={{ color: "#a7c957" }}>
            Admin Login
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="px-8 py-12 sm:py-20 max-w-6xl mx-auto">
        <div className="text-center text-white space-y-6 mb-16">
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-tight">
            Play Golf. <br />
            <span style={{ color: "#a7c957" }}>Impact the World.</span>
          </h1>
          <p className="text-xl sm:text-2xl opacity-90 max-w-2xl mx-auto font-light">
            Track your scores, compete in monthly draws, and seamlessly donate to the charities you believe in.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link 
              href="/register" 
              className="px-8 py-4 text-lg font-bold rounded-full inline-block text-center shadow-lg hover:scale-105 transition transform"
              style={{ background: "#52b788", color: "white" }}
            >
              Start Your Journey
            </Link>
            <Link 
              href="/login" 
              className="px-8 py-4 text-lg font-bold rounded-full inline-block text-center hover:bg-white/10 transition"
              style={{ border: "2px solid white", color: "white" }}
            >
              Member Sign In
            </Link>
          </div>
          <div className="pt-6 sm:hidden">
            <Link href="/login" className="text-sm border-b border-white/50 text-white/80 pb-1">Admin Login</Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-white px-8 py-20 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16 text-gray-800">Why Join Digital Heroes?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-xl transition text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-2xl shadow-md" style={{ background: "linear-gradient(135deg, #52b788, #2d6a4f)" }}>
                ⛳
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Track Performance</h3>
              <p className="text-gray-600 mb-6">Log your scores, monitor your handicap, and securely record your rounds in the digital vault.</p>
              <Link href="/register" className="text-emerald font-bold hover:underline" style={{ color: "#2d6a4f" }}>Sign Up &rarr;</Link>
            </div>

            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-xl transition text-center scale-105 shadow-md">
              <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-2xl shadow-md" style={{ background: "linear-gradient(135deg, #52b788, #2d6a4f)" }}>
                🏆
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Win Monthly Draws</h3>
              <p className="text-gray-600 mb-6">Your scores serve as tickets. Match numbers to enter massive prize pools with rollover bonuses.</p>
              <Link href="/register" className="text-emerald font-bold hover:underline" style={{ color: "#2d6a4f" }}>Play Now &rarr;</Link>
            </div>

            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-xl transition text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-2xl shadow-md" style={{ background: "linear-gradient(135deg, #52b788, #2d6a4f)" }}>
                ❤️
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Charity Impact</h3>
              <p className="text-gray-600 mb-6">A specific percentage of your winnings is directly wired to the Charity of your choice automatically.</p>
              <Link href="/register" className="text-emerald font-bold hover:underline" style={{ color: "#2d6a4f" }}>Make an Impact &rarr;</Link>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="px-8 py-20 bg-gray-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16 text-gray-800">Four Steps to Greatness</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { number: "1", title: "Create Profile", description: "Register, securely add your location, and pick a password." },
              { number: "2", title: "Subscribe & Choose", description: "Select your monthly tier and link your favorite Charity." },
              { number: "3", title: "Submit Scores", description: "Play real rounds of golf and input your verified scores." },
              { number: "4", title: "Win & Donate", description: "Match the draw, win prize money, & auto-donate." }
            ].map((step, i) => (
              <div key={i} className="text-center relative">
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-white font-black text-3xl mx-auto mb-6 shadow-lg z-10 relative" style={{ background: "linear-gradient(135deg, #52b788, #2d6a4f)" }}>
                  {step.number}
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-8 py-20 bg-white">
        <div className="max-w-3xl mx-auto text-center border-2 border-emerald rounded-3xl p-12 bg-green-50">
          <h2 className="text-4xl font-extrabold mb-6 text-gray-900">Ready to Make an Impact?</h2>
          <p className="text-gray-700 mb-10 text-lg">Join our premium golf community today. Empower your game while funding charities that change the world.</p>
          <Link 
            href="/register" 
            className="px-10 py-4 text-xl font-bold rounded-full inline-block shadow-xl hover:-translate-y-1 transition text-white"
            style={{ background: "#2d6a4f" }}
          >
            Create Your Account Today
          </Link>
        </div>
      </div>
    </div>
  );
}
