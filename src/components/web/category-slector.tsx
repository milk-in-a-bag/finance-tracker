"use client";

import { useState } from "react";
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
}: {
  transactionId: string;
  categories: Category[];
}) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(categoryId: string | null) {
    if (!categoryId) return; // ignore clears/nulls, we only act on an actual selection

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
      setError("Failed to save, try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <Select onValueChange={handleChange} disabled={isSaving}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Categorize..." />
        </SelectTrigger>
        <SelectContent>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
