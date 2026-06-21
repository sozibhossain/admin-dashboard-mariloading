"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageTitle } from "@/components/dashboard/page-title";
import { PaginationControls } from "@/components/dashboard/pagination";
import { TableSkeleton } from "@/components/dashboard/table-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { api, apiErrorMessage } from "@/lib/api";
import { formatDate, getName } from "@/lib/utils";

export function ReportsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 15;
  const { data, isLoading } = useQuery({
    queryKey: ["reports", page],
    queryFn: () => api.getReports({ page, limit }),
  });
  const deleteMutation = useMutation({
    mutationFn: api.deleteReport,
    onSuccess: () => {
      toast.success("Report deleted");
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  return (
    <DashboardShell>
      <PageTitle>Reports</PageTitle>
      {isLoading ? (
        <TableSkeleton rows={15} columns={4} />
      ) : data?.reports?.length ? (
        <>
          <div className="overflow-hidden rounded-lg bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Report date</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.reports.map((report) => (
                  <TableRow key={report._id}>
                    <TableCell>{getName(report.reporter)}</TableCell>
                    <TableCell>{report.title}</TableCell>
                    <TableCell>{formatDate(report.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex gap-6">
                        <Link href={`/reports/${report._id}`} aria-label="View report">
                          <Eye className="size-5" />
                        </Link>
                        <button
                          aria-label="Delete report"
                          onClick={() => deleteMutation.mutate(report._id)}
                        >
                          <Trash2 className="size-5 text-red-600" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <PaginationControls
            page={page}
            total={data.pagination.total}
            limit={limit}
            onPageChange={setPage}
          />
        </>
      ) : (
        <EmptyState message="No reports found." />
      )}
    </DashboardShell>
  );
}

export function ReportDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [feedback, setFeedback] = useState("");
  const queryClient = useQueryClient();
  const { data: report, isLoading } = useQuery({
    queryKey: ["report", params.id],
    queryFn: () => api.getReport(params.id),
    enabled: Boolean(params.id),
  });
  const handleMutation = useMutation({
    mutationFn: (status: "resolved" | "ignored") =>
      api.handleReport(params.id, { status, adminFeedback: feedback }),
    onSuccess: (_, status) => {
      toast.success(status === "resolved" ? "Feedback sent" : "Report ignored");
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["report", params.id] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  return (
    <DashboardShell>
      <button
        aria-label="Go back"
        className="mb-5 rounded p-2 hover:bg-accent"
        onClick={() => router.back()}
      >
        <ArrowLeft className="size-9" />
      </button>
      <PageTitle className="-mt-16">Report Details</PageTitle>
      {isLoading ? (
        <TableSkeleton rows={6} columns={2} />
      ) : report ? (
        <div className="space-y-10">
          <div className="grid gap-5 md:grid-cols-[180px_1fr] md:items-start">
            <label className="pt-3 text-lg font-semibold">Report Title:</label>
            <Input value={report.title} readOnly />
            <label className="pt-3 text-lg font-semibold">Report Description:</label>
            <Textarea value={report.description} readOnly className="min-h-[420px] p-8" />
          </div>
          <hr className="border-table-line" />
          <div className="grid gap-5 md:grid-cols-[180px_1fr] md:items-start">
            <label className="pt-3 text-lg font-semibold">Feedback</label>
            <Textarea
              placeholder="Write here"
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
              className="min-h-[360px] p-6 text-xl"
            />
          </div>
          <div className="flex flex-col justify-end gap-3 sm:flex-row">
            <Button
              variant="default"
              className="bg-[#a9cee4] text-xl text-muted-foreground"
              disabled={handleMutation.isPending}
              onClick={() => handleMutation.mutate("resolved")}
            >
              Send Feedback
            </Button>
            <Button
              variant="destructive"
              className="text-xl"
              disabled={handleMutation.isPending}
              onClick={() => handleMutation.mutate("ignored")}
            >
              Ignore
            </Button>
          </div>
        </div>
      ) : (
        <EmptyState message="Report not found." />
      )}
    </DashboardShell>
  );
}
