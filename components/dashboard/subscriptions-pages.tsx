"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Plus } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageTitle } from "@/components/dashboard/page-title";
import { TableSkeleton } from "@/components/dashboard/table-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { api, apiErrorMessage, SubscriptionPlan } from "@/lib/api";

export function SubscriptionsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: api.getSubscriptionPlans,
  });
  const plans = data?.length
    ? data
    : [
        {
          _id: "fallback-1",
          title: "Starter Plan",
          price: 10,
          billingFrequency: "per_month" as const,
          benefits: Array.from({ length: 5 }).map(() => "Lorem Ipsum is simply dummy"),
          isCurrentPlan: true,
        },
        {
          _id: "fallback-2",
          title: "Starter Plan",
          price: 10,
          billingFrequency: "per_month" as const,
          benefits: Array.from({ length: 5 }).map(() => "Lorem Ipsum is simply dummy"),
          isCurrentPlan: true,
        },
      ];

  return (
    <DashboardShell>
      <PageTitle>Subscription Update</PageTitle>
      {isLoading ? (
        <TableSkeleton rows={2} columns={2} />
      ) : (
        <div className="mx-auto max-w-[940px] space-y-8">
          {plans.length ? (
            <div className="grid gap-7 md:grid-cols-2">
              {plans.map((plan) => (
                <PlanCard key={plan._id} plan={plan} />
              ))}
            </div>
          ) : (
            <EmptyState message="No subscription plans found." />
          )}
          <Card className="bg-background">
            <CardContent className="py-12 text-center">
              <h2 className="flex items-center justify-center gap-4 text-2xl font-semibold">
                Add Your Subscriptions <Plus className="size-7" />
              </h2>
              <p className="mx-auto mt-5 max-w-[760px] text-xl leading-snug">
                Start by creating a subscription plan for your app. Adjust the pricing,
                configure the billing frequency, and add details.
              </p>
              <Button asChild className="mt-8 h-14 text-xl">
                <Link href="/subscriptions/new">Create a subscription plan</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardShell>
  );
}

export function AddSubscriptionPage() {
  const queryClient = useQueryClient();
  const [benefits, setBenefits] = useState([""]);
  const mutation = useMutation({
    mutationFn: api.createSubscriptionPlan,
    onSuccess: () => {
      toast.success("Subscription plan created");
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") || "").trim();
    const price = Number(form.get("price") || 0);
    const billingFrequency = String(form.get("billingFrequency") || "per_month") as SubscriptionPlan["billingFrequency"];
    const values = benefits
      .map((_, index) => String(form.get(`benefit-${index}`) || "").trim())
      .filter(Boolean);
    if (!title) return toast.error("Plan title is required");
    mutation.mutate({ title, price, billingFrequency, benefits: values });
    event.currentTarget.reset();
    setBenefits([""]);
  }

  return (
    <DashboardShell>
      <PageTitle>Add Subscription</PageTitle>
      <form onSubmit={onSubmit} className="mx-auto max-w-[980px] space-y-12">
        <div className="grid gap-5 md:grid-cols-[170px_1fr] md:items-center">
          <label className="text-2xl font-semibold">Plan Title:</label>
          <Input name="title" className="h-14" />
          <label className="text-2xl font-semibold">Pricing:</label>
          <div className="grid gap-6 md:grid-cols-[1fr_250px]">
            <Input name="price" type="number" min="0" step="0.01" className="h-14" />
            <Select name="billingFrequency" defaultValue="per_month" className="h-14 text-xl">
              <option value="per_month">Per Month</option>
              <option value="per_week">Per Week</option>
              <option value="per_year">Per Year</option>
            </Select>
          </div>
          <label className="text-2xl font-semibold">Plan Benefits</label>
          <div className="space-y-5">
            {benefits.map((_, index) => (
              <Input key={index} name={`benefit-${index}`} className="h-14" />
            ))}
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                className="border-cyan-500 text-xl"
                onClick={() => setBenefits((items) => [...items, ""])}
              >
                Add more <Plus className="size-5" />
              </Button>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <Button type="submit" className="h-16 w-full max-w-[325px] text-2xl" disabled={mutation.isPending}>
            Create plan
          </Button>
        </div>
      </form>
    </DashboardShell>
  );
}

function PlanCard({ plan }: { plan: SubscriptionPlan }) {
  return (
    <Card className="bg-background">
      <CardContent className="p-10">
        <h2 className="text-xl font-medium">{plan.title}</h2>
        <p className="mt-5 text-4xl font-medium">
          ${Number(plan.price || 0).toFixed(2)}
          <span className="text-xl text-muted-foreground">
            /{plan.billingFrequency.replace("per_", "")}
          </span>
        </p>
        <Button variant="muted" className="mt-7 w-full text-xl">
          {plan.isCurrentPlan ? "Current Plan" : "Plan"}
        </Button>
        <ul className="mt-7 space-y-4 text-muted-foreground">
          {(plan.benefits?.length ? plan.benefits : Array.from({ length: 5 }).map(() => "Lorem Ipsum is simply dummy")).map(
            (benefit, index) => (
              <li key={`${benefit}-${index}`} className="flex items-center gap-4">
                <span className="grid size-4 place-items-center rounded-full bg-black text-white">
                  <Check className="size-3" />
                </span>
                {benefit}
              </li>
            )
          )}
        </ul>
      </CardContent>
    </Card>
  );
}
