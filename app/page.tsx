import Link from 'next/link'
export default function Home(){
  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <section className="lg:col-span-3 card p-8 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-brand/10 blur-2xl" />
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Switchgear Labels</h1>
        <p className="text-slate-700 mb-6">Two ways to order: design a custom label, or select a predefined set for a specific piece of switchgear and just type your text.</p>
        <div className="flex gap-2">
          <Link className="btn btn-primary" href="/designer">Open Designer</Link>
          <Link className="btn btn-outline" href="/admin">Admin</Link>
        </div>
      </section>
      <section className="lg:col-span-2 card p-8">
        <h2 className="font-semibold mb-3">Modes</h2>
        <ul className="space-y-2 text-sm text-slate-700">
          <li>• <strong>Custom Label:</strong> choose any size, text and options.</li>
          <li>• <strong>Predefined Sets:</strong> pick a switchgear set; fill in text only.</li>
        </ul>
      </section>
    </div>
  )
}
