export function Hero() {
  return (
    <section
      className="relative overflow-hidden border-b border-gold/15 bg-[linear-gradient(135deg,var(--carbone)_0%,#2A1508_50%,var(--carbone)_100%)] px-8 pb-12 pt-16 text-center before:pointer-events-none before:absolute before:inset-0 before:content-[''] before:bg-[radial-gradient(ellipse_80%_60%_at_50%_100%,rgba(196,30,30,0.12)_0%,transparent_70%)]"
    >
      <div className="relative z-10">
        <div className="mb-5 inline-block rounded-full border border-gold/40 px-4 py-1.5 text-xs text-gold font-medium uppercase tracking-[0.2em]">
          📍 Vancouver · Open Now
        </div>
        <h1 className="mb-4 font-playfair text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-tight text-crema">
          Authentic Italian Pizza,
          <br />
          <em className="text-rosso italic">Slice by Slice.</em>
        </h1>
        <p className="mx-auto mb-8 max-w-[480px] text-base font-light leading-relaxed text-crema/60">
          Handcrafted Neapolitan pizzas, imported ingredients, and a passion for
          tradition.
        </p>
        <div className="mx-auto flex h-1.5 w-12 overflow-hidden rounded-sm">
          <div className="h-full w-1/3 bg-verde" />
          <div className="h-full w-1/3 bg-crema" />
          <div className="h-full w-1/3 bg-rosso" />
        </div>
      </div>
    </section>
  )
}
