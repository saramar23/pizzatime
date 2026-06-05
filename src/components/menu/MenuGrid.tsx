"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { MenuCard } from "./MenuCard";
import { MenuCardSkeleton } from "./MenuCardSkeleton";
import { CategoryNav } from "./CategoryNav";
import type { Category } from "@/types/types";
import { useSessionId } from "@/hooks/useSessionId";
import { Id } from "../../../convex/_generated/dataModel";

const SKELETON_COUNT = 6;

export function MenuGrid() {
  const menuList = useQuery(api.menu.getAllMenuItems);
  const isLoading = menuList === undefined;
  const [activeCategory, setActiveCategory] = useState<Category>("all");

  const items = menuList ?? [];
  const filtered =
    activeCategory === "all"
      ? items
      : items.filter((i) => i.category === activeCategory);

  const addToCart = useMutation(api.cart.addToCart);
  const sessionId = useSessionId();

  const handleAddToCart = async (menuItemId: Id<"menu_items">, itemName: string, itemPrice: number) => {
    if (!sessionId) return
    await addToCart({ sessionId, menuItemId, quantity: 1, itemName, itemPrice })
  }

  return (
    <>
      <CategoryNav
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />
      <section className="mx-auto max-w-[1200px] p-8">
        <p className="mb-6 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-gold">
          Our Menu
        </p>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
          {isLoading
            ? Array.from({ length: SKELETON_COUNT }, (_, index) => (
              <MenuCardSkeleton key={index} />
            ))
            : filtered.length === 0
              ? (
                <p className="col-span-full text-center text-sm text-crema/50">
                  No items in this category.
                </p>
              )
              : filtered.map((item) => (
                <MenuCard
                  key={item._id}
                  item={item}
                  onAdd={handleAddToCart} 
                />
              ))}
        </div>
      </section>
    </>
  );
}
