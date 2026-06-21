"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronDown, MessageSquareText, UserRound, UserRoundCheck } from "lucide-react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

const fallbackChart = [
  730, 850, 865, 780, 80, 170, 200, 500, 170, 495, 155, 810, 20, 175, 205,
].map((visitors, index) => ({
  label: `Sept ${index + 1}`,
  visitors,
}));

export function DashboardHome() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: () => api.getDashboardOverview("15d"),
  });

  const chartData =
    data?.signupsChart?.length
      ? data.signupsChart.map((item) => ({
          label: `${item._id.month}/${item._id.day}`,
          visitors: item.count,
        }))
      : fallbackChart;

  return (
    <div className="space-y-12">
      <Card className="bg-card">
        <CardContent className="p-7 md:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-3xl font-semibold md:text-4xl">Overview</h1>
            <button className="flex items-center gap-2 text-sm text-muted-foreground">
              This month <ChevronDown className="size-4" />
            </button>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <MetricCard
              icon={UserRound}
              label="Total Users"
              value={data?.metrics.totalUsers}
              loading={isLoading}
            />
            <MetricCard
              icon={UserRoundCheck}
              label="Active users"
              value={data?.metrics.activeUsers}
              loading={isLoading}
            />
            <MetricCard
              icon={UserRoundCheck}
              label="New Signups"
              value={data?.metrics.newSignups}
              loading={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardContent className="p-7 md:p-20">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-semibold">Visitor</h2>
            <button className="flex items-center gap-2 text-sm text-muted-foreground">
              Last 15 days <ChevronDown className="size-4" />
            </button>
          </div>
          {isLoading ? (
            <Skeleton className="h-[320px] w-full" />
          ) : (
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
                  <CartesianGrid stroke="#bfbfbf" />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#050505" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#050505" }} />
                  <Tooltip />
                  <Line
                    type="linear"
                    dataKey="visitors"
                    stroke="#171044"
                    strokeWidth={1.5}
                    dot={{ r: 4, stroke: "#171044", fill: "#f2fdff" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_315px]">
        <Card className="bg-card">
          <CardContent className="p-7 md:p-16">
            <h2 className="text-3xl font-semibold">User Map</h2>
            <p className="mt-3 text-sm">
              Stay updated with real-time locations and activity status of users on the map.
            </p>
            <div className="mt-8 grid gap-8 md:grid-cols-[1fr_250px]">
              <MiniMap />
              <div className="space-y-6 self-center">
                {(data?.userMap?.length
                  ? data.userMap
                  : [
                      { country: "Austria", users: 1227 },
                      { country: "Belgium", users: 524 },
                      { country: "China", users: 124 },
                      { country: "Hungary", users: 24 },
                    ]
                ).map((item, index) => (
                  <div key={item.country} className="flex items-center gap-5">
                    <span
                      className={cn(
                        "size-4 rounded-full",
                        ["bg-red-600", "bg-blue-700", "bg-fuchsia-500", "bg-green-700"][index % 4]
                      )}
                    />
                    <span
                      className={cn(
                        "w-24",
                        ["text-red-600", "text-blue-700", "text-fuchsia-500", "text-green-700"][
                          index % 4
                        ]
                      )}
                    >
                      {item.country}
                    </span>
                    <span>{item.users} User</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-5">
            <h2 className="mb-6 text-2xl font-semibold">Chat Request</h2>
            <div className="divide-y divide-border">
              {(data?.chatRequests?.length
                ? data.chatRequests
                : Array.from({ length: 5 }).map((_, index) => ({
                    _id: String(index),
                    name: "Olivia Rhye",
                    email: "example@example.com",
                    status: "pending",
                  }))
              ).map((request) => (
                <div key={request._id} className="flex items-center gap-3 py-4">
                  <div className="grid size-8 place-items-center rounded-full bg-primary text-xs">
                    OR
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{request.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{request.email}</p>
                  </div>
                  <MessageSquareText className="size-5" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: typeof UserRound;
  label: string;
  value?: number;
  loading: boolean;
}) {
  return (
    <div className="flex min-h-[145px] items-center gap-8 rounded-lg bg-card p-7 shadow-dashboard">
      <Icon className="size-16 stroke-[1.6]" />
      <div>
        <p className="text-lg font-medium">{label}</p>
        {loading ? (
          <Skeleton className="mt-4 h-10 w-24" />
        ) : (
          <p className="text-4xl font-semibold">{value ?? 0}</p>
        )}
      </div>
    </div>
  );
}

function MiniMap() {
  return (
    <div className="relative mx-auto h-[260px] w-full max-w-[360px]">
      <svg viewBox="0 0 360 260" className="h-full w-full" aria-hidden="true">
        <path
          d="M87 96c33-41 87-64 141-50 47 13 77 47 91 80-25 9-42 28-51 56-35-6-73 8-96 36-33-21-72-21-103-6-20-41-12-82 18-116Z"
          fill="none"
          stroke="#111"
          strokeWidth="1"
        />
        <path
          d="M113 68c26 7 58 11 86 18M76 137c44-15 88-12 125 0M91 189c52-20 103-16 153 5M147 55c-14 54-16 105-3 154M214 73c8 43 7 90-4 142"
          fill="none"
          stroke="#777"
          strokeWidth="0.8"
        />
      </svg>
      {[
        ["left-[22%] top-[38%] bg-blue-700"],
        ["left-[54%] top-[22%] bg-blue-700"],
        ["left-[42%] top-[28%] bg-fuchsia-500"],
        ["left-[33%] top-[34%] bg-green-700"],
        ["left-[46%] top-[64%] bg-red-600"],
        ["left-[60%] top-[69%] bg-red-600"],
        ["left-[27%] top-[78%] bg-green-700"],
      ].map(([className], index) => (
        <span
          key={index}
          className={cn(
            "absolute size-4 rounded-full border-2 border-white shadow-soft",
            className
          )}
        />
      ))}
    </div>
  );
}
