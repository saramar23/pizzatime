"use client";

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
    <nav className="flex justify-center gap-2 overflow-x-auto border-b border-crema/6 bg-carbone p-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {categories.map((cat) => {
        const isActive = activeCategory === cat.value;

        return (
          <button
            key={cat.value}
            type="button"
            onClick={() => onCategoryChange(cat.value)}
            className={cn(
              "shrink-0 cursor-pointer rounded-full border px-[1.1rem] py-1.5 font-dmsans text-[0.82rem] whitespace-nowrap transition-all duration-150",
              isActive
                ? "border-rosso bg-rosso font-medium text-crema"
                : "border-crema/12 text-crema/55 hover:border-crema/30 hover:text-crema",
            )}
          >
            {cat.emoji} {cat.label}
          </button>
        );
      })}
    </nav>
  );
}
