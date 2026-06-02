import { Button } from "../ui/button"

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 flex h-[72px] items-center justify-between border-b border-gold/20 bg-carbone px-8">
      <div>
        <div className="font-playfair text-[1.6rem] font-bold tracking-tight text-crema">
          Pizza<span className="text-rosso">Time</span>
        </div>
        <span className="mt-[-4px] block font-dmsans text-[0.65rem] font-light uppercase tracking-[0.18em] text-gold">
          Autentica Pizzeria Italiana
        </span>
      </div>
      <div className="flex items-center gap-6">
        <Button
          size="lg"
          className="rounded-md border-none bg-rosso px-5 py-2 font-dmsans text-[0.85rem] font-medium tracking-wide text-crema transition-colors hover:bg-rosso-dark"
        >
          🛒 Cart
        </Button>
      </div>
    </header>
  )
}
