"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { MenuCard } from "./MenuCard";
import { MenuCardSkeleton } from "./MenuCardSkeleton";
import { CategoryNav } from "./CategoryNav";
import type { Category } from "@/types/types";
import { useCart } from "@/hooks/useCart";

const SKELETON_COUNT = 6;

export function MenuGrid() {
  const menuList = useQuery(api.menu.getAllMenuItems);
  const isLoading = menuList === undefined;
  const [ activeCategory, setActiveCategory ] = useState<Category>("all");  

  const items = menuList ?? [];
  const filtered =
    activeCategory === "all"
      ? items
      : items.filter((i) => i.category === activeCategory);

  const { handleAdd, cartItems } = useCart();

  return (
    <>
      <CategoryNav
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />
      <section id="menu" className="mx-auto max-w-[1200px] p-8">
        <h2 className="mb-6 font-bold uppercase tracking-[0.18em] text-gold">
          Our Menu
        </h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
          {isLoading
            ? Array.from({ length: SKELETON_COUNT }, (_, index) => (
              <MenuCardSkeleton key={index} />
            ))
            : filtered.length === 0
              ? (
                <p className="col-span-full text-center text-sm text-carbone">
                  No items in this category.
                </p>
              )
              : filtered.map((item) => (
                <MenuCard
                  key={item._id}
                  item={item}
                  cartQuantity={cartItems?.find(c => c.menuItemId === item._id)?.quantity ?? 0}
                  onAdd={(menuItemId, itemName, itemPrice) => handleAdd(menuItemId, 1, itemName, itemPrice)}
                />
              ))}
        </div>
      </section>
    </>
  );
}
