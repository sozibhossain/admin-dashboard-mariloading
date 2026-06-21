"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Eye, MapPin, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageTitle } from "@/components/dashboard/page-title";
import { PaginationControls } from "@/components/dashboard/pagination";
import { TableSkeleton } from "@/components/dashboard/table-skeleton";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminUser, api, apiErrorMessage } from "@/lib/api";
import { cn, getName, initials, totalPages } from "@/lib/utils";
import { useState } from "react";

const placeholderUsers = [
  "Darrell",
  "Leslie",
  "Soham",
  "Calvin",
  "Bruce",
  "Guy",
  "Gregory",
  "Ronald",
  "Harold",
];

export function UsersPage() {
  const [page, setPage] = useState(1);
  const limit = 13;
  const { data, isLoading } = useQuery({
    queryKey: ["users", page],
    queryFn: () => api.getUsers({ page, limit }),
  });
  const pages = totalPages(data?.pagination.total, limit);

  return (
    <DashboardShell>
      <div className="relative">
        <PageTitle>User list</PageTitle>
        <Button asChild className="mb-5 w-full md:absolute md:right-0 md:top-0 md:mb-0 md:w-auto">
          <Link href="/users/pending">Pending Verify</Link>
        </Button>
        {isLoading ? (
          <TableSkeleton rows={11} />
        ) : data?.users?.length ? (
          <>
            <div className="overflow-hidden rounded-lg border border-table-line bg-background">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Card status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <Link href={`/users/${user._id}`} className="font-medium hover:underline">
                          {user.name || getName(user)}
                        </Link>
                      </TableCell>
                      <TableCell>{user.age ?? "-"}</TableCell>
                      <TableCell>
                        <a href={`mailto:${user.email}`} className="underline">
                          {user.email}
                        </a>
                      </TableCell>
                      <TableCell>{user.location?.city || user.location?.country || "-"}</TableCell>
                      <TableCell
                        className={cn(
                          "font-medium capitalize",
                          (user.cardStatus || user.accountStatus?.status) === "active"
                            ? "text-green-600"
                            : "text-red-600"
                        )}
                      >
                        {user.cardStatus || user.accountStatus?.status || "Active"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <PaginationControls
              page={page}
              total={data.pagination.total || pages * limit}
              limit={limit}
              onPageChange={setPage}
            />
          </>
        ) : (
          <EmptyState message="No users found." />
        )}
      </div>
    </DashboardShell>
  );
}

export function PendingUsersPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["pending-users"],
    queryFn: api.getPendingUsers,
  });
  const reviewMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "approved" | "rejected" }) =>
      api.reviewUserVerification(id, status),
    onSuccess: () => {
      toast.success("Verification updated");
      queryClient.invalidateQueries({ queryKey: ["pending-users"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const users = data?.length
    ? data
    : placeholderUsers.map((name, index) => ({
        _id: `placeholder-${index}`,
        name,
        email: "abc@bcd.com",
        location: {
          address: "Jenaer Strasse 39, City: Duisburg",
          city: "Duisburg",
          country: "Germany",
        },
        age: 30,
      }));

  return (
    <DashboardShell>
      <PageTitle>Pending Verify</PageTitle>
      {isLoading ? (
        <TableSkeleton rows={9} columns={4} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-separate border-spacing-y-3">
            <thead>
              <tr className="text-left text-xl font-semibold">
                <th className="px-3 pb-4">User Name</th>
                <th className="px-3 pb-4">User Location</th>
                <th className="px-3 pb-4 text-center">Age Range</th>
                <th className="px-3 pb-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-3">
                      <Avatar user={user} />
                      <div>
                        <p className="font-medium">{getName(user)}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {user.location?.address || `${user.location?.city || ""} ${user.location?.country || ""}`}
                  </td>
                  <td className="px-3 py-2 text-center text-slate-700">25-35</td>
                  <td className="px-3 py-2">
                    <div className="flex justify-center gap-5">
                      <Link href={`/users/${user._id}`} aria-label="View user">
                        <Eye className="size-5 text-muted-foreground" />
                      </Link>
                      <button
                        aria-label="Approve user"
                        disabled={user._id.startsWith("placeholder")}
                        onClick={() =>
                          reviewMutation.mutate({ id: user._id, status: "approved" })
                        }
                      >
                        <Check className="size-5 text-green-600" />
                      </button>
                      <button
                        aria-label="Reject user"
                        disabled={user._id.startsWith("placeholder")}
                        onClick={() =>
                          reviewMutation.mutate({ id: user._id, status: "rejected" })
                        }
                      >
                        <Trash2 className="size-5 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardShell>
  );
}

export function UserDetailsPage() {
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery({
    queryKey: ["user", params.id],
    queryFn: () => api.getUser(params.id),
    enabled: Boolean(params.id),
  });
  const statusMutation = useMutation({
    mutationFn: (status: "suspended" | "banned") => api.updateUserStatus(params.id, status),
    onSuccess: (_, status) => {
      toast.success(`User ${status}`);
      queryClient.invalidateQueries({ queryKey: ["user", params.id] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  return (
    <DashboardShell>
      <PageTitle>User details</PageTitle>
      {isLoading ? (
        <TableSkeleton rows={6} columns={2} />
      ) : user ? (
        <div className="">
          <div className="flex flex-col gap-8 md:flex-row md:items-center">
            <Avatar user={user} className="size-40 text-3xl" />
            <div className="flex-1">
              <h2 className="text-3xl font-semibold md:text-4xl">{getName(user)}</h2>
              <p className="mt-2 flex items-center gap-2 text-xl font-semibold text-muted-foreground">
                <MapPin className="size-5" />
                {[user.location?.city, user.location?.country].filter(Boolean).join(", ") ||
                  "Berlin, Germany."}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="destructive"
                onClick={() => statusMutation.mutate("suspended")}
                disabled={statusMutation.isPending}
              >
                Suspend
              </Button>
              <Button
                variant="destructive"
                onClick={() => statusMutation.mutate("banned")}
                disabled={statusMutation.isPending}
              >
                Ban
              </Button>
            </div>
          </div>
          <section className="mt-10">
            <h3 className="mb-4 text-3xl font-semibold">About</h3>
            <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
              <p>
                {user.about ||
                  user.bio ||
                  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book."}
              </p>
              <p>
                {user.bio ||
                  "It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged."}
              </p>
            </div>
          </section>
          <section className="mt-10">
            <h3 className="mb-5 text-3xl font-semibold">Photos</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {(user.profilePhotos?.length
                ? user.profilePhotos
                : Array.from({ length: 5 }).map((_, index) => ({ url: "", publicId: String(index) }))
              ).map((photo, index) =>
                photo.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={photo.publicId || photo.url}
                    src={photo.url}
                    alt={`User photo ${index + 1}`}
                    className="aspect-square rounded object-cover"
                  />
                ) : (
                  <div
                    key={index}
                    className="grid aspect-square place-items-center rounded bg-card text-lg font-semibold text-muted-foreground shadow-soft"
                  >
                    {initials(getName(user))}
                  </div>
                )
              )}
            </div>
          </section>
        </div>
      ) : (
        <EmptyState message="User not found." />
      )}
    </DashboardShell>
  );
}

function Avatar({ user, className }: { user: AdminUser; className?: string }) {
  const name = getName(user);
  const src = user.avatar?.url || user.profilePhotos?.[0]?.url;
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      className={cn("size-10 rounded-full object-cover", className)}
    />
  ) : (
    <div
      className={cn(
        "grid size-10 place-items-center rounded-full bg-primary text-sm font-semibold",
        className
      )}
    >
      {initials(name)}
    </div>
  );
}
