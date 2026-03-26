import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen p-8 bg-light-mint" style={{ color: "var(--color-deep-green)" }}>
      <main className="mx-auto max-w-5xl space-y-10">
        <section className="p-8 card">
          <h1 className="text-4xl font-bold mb-3">Golf Charity Platform</h1>
          <p className="text-lg text-muted mb-6">
            Welcome to the platform. Start by creating a profile, reviewing your dashboard and entering scores.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard" className="btn-primary px-5 py-3 rounded-xl">
              Dashboard
            </Link>
            <Link href="/scores" className="btn-secondary px-5 py-3 rounded-xl">
              My Scores
            </Link>
            <Link href="/admin" className="btn-outline px-5 py-3 rounded-xl">
              Admin
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "Subscription Growth", description: "Monitor active & pending members", link: "/dashboard" },
            { title: "Monthly Draw", description: "Run draws and finalize winners", link: "/admin" },
            { title: "Charity Impact", description: "Track donations per charity", link: "/dashboard" },
          ].map((card) => (
            <article key={card.title} className="card">
              <h2 className="text-2xl font-semibold mb-1">{card.title}</h2>
              <p className="text-muted mb-3">{card.description}</p>
              <Link href={card.link} className="text-emerald hover:underline">
                Open
              </Link>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
