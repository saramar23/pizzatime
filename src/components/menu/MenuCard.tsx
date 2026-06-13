import { Doc, Id } from "../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

function categoryEmoji(category: Doc<"menu_items">["category"]) {
  switch (category) {
    case "pizza":
      return "🍕";
    case "beer":
      return "🍺";
    case "drink":
      return "🥤";
    case "dessert":
      return "🍮";
    default:
      return "⭐";
  }
}

interface MenuCardProps {
  item: Doc<"menu_items">
  onAdd: (menuItemId: Id<"menu_items">, itemName: string, itemPrice: number) => void
  cartQuantity: number;
}

export function MenuCard({ item, onAdd, cartQuantity }: MenuCardProps) {

  return (
    <article className="group relative cursor-pointer overflow-hidden shadow-lg rounded-xl border border-crema/7 bg-crema-dark transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-gold/35">
      {item.isFeatured && (
        <span className="absolute top-2.5 right-2.5 z-10 rounded-full bg-gold px-2.5 py-0.5 text-[0.65rem] font-semibold tracking-wide text-carbone uppercase">
          Today&apos;s Pick
        </span>
      )}
      <div className="flex h-[140px] items-center justify-center border-b border-crema/5 bg-[linear-gradient(135deg,#2A1508,#1A1008)]">
        <span className="text-5xl">{categoryEmoji(item.category)}</span>
      </div>
      <div className="p-4 flex flex-col h-36">
        <div className="mb-1.5 flex items-start justify-between gap-2 ">
          <h3 className="font-playfair text-base leading-snug font-bold text-carbone">
            {item.name}
          </h3>
          <span className="font-dmsans text-base font-medium whitespace-nowrap text-gold">
            ${item.price.toFixed(2)}
          </span>
        </div>
        <p className="mb-3 text-[0.8rem] leading-normal text-carbone">
          {item.description}
        </p>
        <div className="flex mt-auto items-center justify-between">
          <span className="text-[0.72rem] font-light text-carbone">
            {item.calories} kcal
          </span>
          <div className="relative">
            {cartQuantity > 0 && (
              <span className="absolute -top-2 -right-2 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-gold/80 text-[0.8rem] font-bold text-carbone">
                {cartQuantity}
              </span>
            )}
            <Button
              size="sm"
              className={cn(
                "h-auto rounded-md border-none bg-rosso px-3 py-1 text-[0.78rem] font-medium text-crema transition-colors hover:bg-rosso-dark",
              )}
              onClick={() => onAdd(item._id, item.name, item.price)}
            >
              + Add
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
