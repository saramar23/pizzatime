"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { categories, type Category } from "@/types/types";

type CategoryNavProps = {
  activeCategory: Category;
  onCategoryChange: (category: Category) => void;
};

export function CategoryNav({
  activeCategory,
  onCategoryChange,
}: CategoryNavProps) {
  return (
    <nav
      aria-label="Menu categories"
      className="flex flex-wrap justify-center gap-2 overflow-x-auto border-b border-crema/10 bg-carbone p-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {categories.map((cat) => {
        const isActive = activeCategory === cat.value;

        return (
          <Button
            key={cat.value}
            type="button"
            variant="ghost"
            aria-pressed={isActive}
            onClick={() => onCategoryChange(cat.value)}
            className={cn(
              "h-auto shrink-0 rounded-full border px-[1.1rem] py-1.5 font-dmsans text-[0.82rem] whitespace-nowrap",
              isActive
                ? "border-rosso bg-rosso font-medium text-crema hover:bg-rosso-dark hover:text-crema"
                : "border-crema/15 bg-transparent text-crema/55 hover:border-crema/30 hover:bg-crema/5 hover:text-crema",
            )}
          >
            <span aria-hidden="true">{cat.emoji}</span> {cat.label}
          </Button>
        );
      })}
    </nav>
  );
}
