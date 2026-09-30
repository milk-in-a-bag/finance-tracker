"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Category = { id: string; name: string };

export function CategorySelector({
  transactionId,
  categories,
  currentCategoryId,
}: {
  transactionId: string;
  categories: Category[];
  currentCategoryId?: string | null;
}) {
  const router = useRouter();
  const [value, setValue] = useState(currentCategoryId ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValue(currentCategoryId ?? "");
  }, [currentCategoryId]);

  const selectedName = categories.find((c) => c.id === value)?.name;

  async function handleChange(categoryId: string | null) {
    if (!categoryId) return;

    const previous = value;
    setValue(categoryId);
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/transactions/${transactionId}/categorize`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId }),
      });
      if (!res.ok) throw new Error("Request failed");
      router.refresh();
    } catch {
      setValue(previous);
      setError("Failed to save");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <Select value={value} onValueChange={handleChange} disabled={isSaving}>
        <SelectTrigger
          className={`h-7 text-xs w-[140px] border transition-colors ${
            !value
              ? "border-destructive/60 text-destructive bg-destructive/5"
              : "border-border/60 bg-transparent hover:border-border"
          } ${isSaving ? "opacity-60" : ""}`}
        >
          <SelectValue placeholder="Categorize…">{selectedName}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id} className="text-xs">
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}
