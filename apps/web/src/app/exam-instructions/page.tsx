import SystemCheck from "../../components/SystemCheck";
import Link from "next/link";

export default function ExamInstructionsPage() {
  const rules = [
    "You must use the latest version of a supported browser (Chrome / Edge / Firefox).",
    "Close other applications and browser tabs during the exam.",
    "No external devices or second displays are allowed unless explicitly permitted.",
    "Your camera and microphone must remain on for the duration of the exam.",
    "Do not use any unauthorized materials or get assistance from others.",
  ];

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h1 className="text-3xl font-bold">Exam Instructions & System Check</h1>
        <p className="mt-3 text-slate-300">Read these rules carefully before joining an exam and run the system check to verify your setup.</p>

        <section className="mt-8 grid gap-8 lg:grid-cols-2">
          <div>
            <div className="rounded-xl bg-slate-800/40 p-6">
              <h2 className="text-xl font-semibold">Before the Exam</h2>
              <ul className="mt-4 list-inside list-decimal space-y-2 text-slate-300">
                {rules.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Link href={'/test' as any} className="inline-block rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500">Run Quick Pre-Exam Test</Link>
                <Link href={'/dashboard' as any} className="inline-block rounded-md border border-slate-700 px-4 py-2 text-slate-200">Go to Dashboard</Link>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-slate-800/30 p-6">
              <h3 className="text-lg font-semibold">Exam Rules</h3>
              <ol className="mt-3 list-inside list-decimal space-y-2 text-slate-300">
                <li>Do not navigate away from the exam window while the test is in progress.</li>
                <li>Any suspicious activity may be flagged for review by instructors.</li>
                <li>Follow proctor instructions during live proctoring sessions.</li>
              </ol>
            </div>
          </div>

          <div>
            <div className="rounded-xl bg-slate-800/40 p-6">
              <h2 className="text-xl font-semibold">Run System Check</h2>
              <p className="mt-2 text-sm text-slate-300">Use this tool to verify camera, microphone, and basic browser capabilities. Fix any issues before joining an exam.</p>

              <div className="mt-4">
                <SystemCheck />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
