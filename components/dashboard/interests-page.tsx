"use client";

import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageTitle } from "@/components/dashboard/page-title";
import { TableSkeleton } from "@/components/dashboard/table-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { api, apiErrorMessage } from "@/lib/api";

const fallbackCategories = [
  {
    name: "Lifestyle & Hobbies",
    interests: ["Travel", "Photography", "Cooking & Baking", "Reading", "Writing", "Gardening", "DIY / Crafts"],
  },
  {
    name: "Arts & Entertainment",
    interests: ["Music", "Movies & TV Shows", "Theatre & Performing Arts", "Gaming", "Dancing", "Comedy & Standup"],
  },
  {
    name: "Fitness & Sports",
    interests: ["Gym / Fitness", "Running / Jogging", "Yoga", "Hiking / Trekking", "Swimming", "Football", "Basketball", "Cricket", "Cycling"],
  },
  {
    name: "Food & Drink",
    interests: ["Coffee Lover", "Street Food", "Fine Dining", "Vegan / Vegetarian", "Desserts & Sweets", "Cooking & Recipes"],
  },
  {
    name: "Tech & Learning",
    interests: ["Technology", "Startups", "Science", "History", "Languages", "Self-Improvement"],
  },
  {
    name: "Adventure & Experiences",
    interests: ["Road Trips", "Backpacking", "Adventure Sports", "Beach & Sea", "Mountains & Nature", "Camping"],
  },
  {
    name: "Animals & Nature",
    interests: ["Pets", "Wildlife", "Birdwatching", "Environmental Causes"],
  },
  {
    name: "Lifestyle Preferences",
    interests: ["Fashion", "Beauty & Skincare", "Minimalism", "Meditation", "Volunteering", "Spirituality"],
  },
];

export function InterestsPage() {
  const queryClient = useQueryClient();
  const [categoryId, setCategoryId] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["interests"],
    queryFn: api.getInterests,
  });
  const categories = useMemo(
    () =>
      data?.length
        ? data
        : fallbackCategories.map((category, index) => ({
            _id: `fallback-${index}`,
            name: category.name,
            interests: category.interests.map((name) => ({ name })),
          })),
    [data]
  );

  const addMutation = useMutation({
    mutationFn: async (payload: { interestName: string; categoryId?: string; categoryName?: string }) => {
      if (payload.categoryId === "new") {
        await api.createInterestCategory(payload.categoryName || "");
        const fresh = await api.getInterests();
        const created = fresh.find(
          (category) =>
            category.name.toLowerCase() === payload.categoryName?.toLowerCase()
        );
        return api.addInterestItem({
          categoryId: created?._id,
          categoryName: payload.categoryName,
          interestName: payload.interestName,
        });
      }
      return api.addInterestItem(payload);
    },
    onSuccess: () => {
      toast.success("Interest added");
      queryClient.invalidateQueries({ queryKey: ["interests"] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const interestName = String(form.get("interestName") || "").trim();
    const categoryName = String(form.get("categoryName") || "").trim();
    if (!interestName) return toast.error("Name of interest is required");
    if (!categoryId) return toast.error("Please select a category");
    addMutation.mutate({
      interestName,
      categoryId: categoryId === "new" ? "new" : categoryId,
      categoryName: categoryId === "new" ? categoryName : undefined,
    });
    event.currentTarget.reset();
  }

  return (
    <DashboardShell>
      <div className="relative">
        <PageTitle>Interest</PageTitle>
        <Edit className="absolute right-4 top-0 size-9" />
        {isLoading ? (
          <TableSkeleton rows={8} columns={3} />
        ) : (
          <div className="grid gap-x-16 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <section key={category._id}>
                <h2 className="mb-3 text-2xl font-semibold">{category.name}</h2>
                <ul className="space-y-1 text-xl leading-snug">
                  {category.interests.map((interest, index) => (
                    <li key={`${category._id}-${interest.name}-${index}`}>{interest.name}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
        <form onSubmit={onSubmit} className="mt-14 grid gap-4 lg:grid-cols-[1fr_300px_240px] lg:items-end">
          <label className="block">
            <span className="mb-2 block text-2xl font-semibold">Name of interest</span>
            <Input name="interestName" placeholder="Write here" className="h-14 text-xl" />
          </label>
          <label className="block">
            <span className="mb-2 block text-2xl font-semibold">Name of category</span>
            <Select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className="h-14 text-xl"
            >
              <option value="">Select</option>
              {data?.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
              <option value="new">Create new</option>
            </Select>
          </label>
          {categoryId === "new" && (
            <label className="block lg:col-span-2">
              <span className="mb-2 block text-lg font-semibold">New category</span>
              <Input name="categoryName" placeholder="Category name" />
            </label>
          )}
          <Button type="submit" size="lg" className="h-14 text-2xl" disabled={addMutation.isPending}>
            Add +
          </Button>
        </form>
      </div>
    </DashboardShell>
  );
}
