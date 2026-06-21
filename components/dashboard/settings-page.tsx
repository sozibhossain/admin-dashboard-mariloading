"use client";

import { FormEvent, useEffect, useId, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, Eye, EyeOff, Save } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageTitle } from "@/components/dashboard/page-title";
import { TableSkeleton } from "@/components/dashboard/table-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AdminUser, api, apiErrorMessage, ProfilePayload } from "@/lib/api";
import { getName, initials } from "@/lib/utils";

export function SettingsPage() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: api.getProfile,
  });

  const profileMutation = useMutation({
    mutationFn: (payload: ProfilePayload) => api.updateProfile(payload),
    onSuccess: () => {
      toast.success("Profile updated");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  const passwordMutation = useMutation({
    mutationFn: api.changePassword,
    onSuccess: () => {
      toast.success("Password changed");
    },
    onError: (error) => toast.error(apiErrorMessage(error)),
  });

  return (
    <DashboardShell>
      <PageTitle>Settings</PageTitle>
      {isLoading ? (
        <TableSkeleton rows={8} columns={2} />
      ) : (
        <div className="grid gap-8 xl:grid-cols-[1fr_420px]">
          <ProfileForm
            profile={profile}
            loading={profileMutation.isPending}
            onSubmit={(payload) => profileMutation.mutate(payload)}
          />
          <PasswordForm
            loading={passwordMutation.isPending}
            onSubmit={(payload, form) => {
              passwordMutation.mutate(payload, {
                onSuccess: () => form.reset(),
              });
            }}
          />
        </div>
      )}
    </DashboardShell>
  );
}

function ProfileForm({
  profile,
  loading,
  onSubmit,
}: {
  profile?: AdminUser;
  loading: boolean;
  onSubmit: (payload: ProfilePayload) => void;
}) {
  const [avatarPreview, setAvatarPreview] = useState("");
  const avatarInputId = useId();

  useEffect(() => {
    return () => {
      if (avatarPreview.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const avatar = form.get("avatar");
    onSubmit({
      firstName: String(form.get("firstName") || ""),
      lastName: String(form.get("lastName") || ""),
      phone: String(form.get("phone") || ""),
      bio: String(form.get("bio") || ""),
      about: String(form.get("about") || ""),
      locationAddress: String(form.get("locationAddress") || ""),
      locationCity: String(form.get("locationCity") || ""),
      locationCountry: String(form.get("locationCountry") || ""),
      avatar: avatar instanceof File && avatar.size > 0 ? avatar : undefined,
    });
  }

  const avatarUrl = avatarPreview || profile?.avatar?.url;
  const fullName = getName(profile);

  return (
    <Card className="bg-card">
      <CardContent className="p-6 md:p-8">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center">
          <label
            htmlFor={avatarInputId}
            className="group relative size-28 shrink-0 cursor-pointer overflow-hidden rounded-full bg-white"
            title="Upload profile image"
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={fullName} className="size-full object-cover" />
            ) : (
              <div className="grid size-full place-items-center text-3xl font-semibold">
                {initials(fullName)}
              </div>
            )}
            <span className="absolute inset-0 grid place-items-center bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="size-7" />
            </span>
          </label>
          <div>
            <h2 className="text-2xl font-semibold">Profile</h2>
            <p className="mt-1 text-muted-foreground">
              Update your admin profile information.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="mb-2 block font-medium">Avatar</span>
            <label
              htmlFor={avatarInputId}
              className="flex h-12 w-full cursor-pointer items-center justify-between border border-input bg-background px-4 text-muted-foreground"
            >
              <span>Choose profile image</span>
              <Camera className="size-5" />
              <input
                id={avatarInputId}
                name="avatar"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) setAvatarPreview(URL.createObjectURL(file));
                }}
              />
            </label>
          </label>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="First name" name="firstName" defaultValue={profile?.firstName} />
            <Field label="Last name" name="lastName" defaultValue={profile?.lastName} />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Email" name="email" defaultValue={profile?.email} disabled />
            <Field label="Phone" name="phone" defaultValue={profile?.phone} />
          </div>
          <Field
            label="Address"
            name="locationAddress"
            defaultValue={profile?.location?.address}
          />
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="City" name="locationCity" defaultValue={profile?.location?.city} />
            <Field
              label="Country"
              name="locationCountry"
              defaultValue={profile?.location?.country}
            />
          </div>
          <label className="block">
            <span className="mb-2 block font-medium">Bio</span>
            <Textarea name="bio" defaultValue={profile?.bio} className="min-h-24" />
          </label>
          <label className="block">
            <span className="mb-2 block font-medium">About</span>
            <Textarea name="about" defaultValue={profile?.about} className="min-h-32" />
          </label>
          <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={loading}>
            <Save className="size-5" />
            {loading ? "Saving..." : "Update Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function PasswordForm({
  loading,
  onSubmit,
}: {
  loading: boolean;
  onSubmit: (
    payload: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    },
    form: HTMLFormElement
  ) => void;
}) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      currentPassword: String(form.get("currentPassword") || ""),
      newPassword: String(form.get("newPassword") || ""),
      confirmPassword: String(form.get("confirmPassword") || ""),
    };

    if (payload.newPassword !== payload.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    onSubmit(payload, event.currentTarget);
  }

  return (
    <Card className="bg-card">
      <CardContent className="p-6 md:p-8">
        <h2 className="text-2xl font-semibold">Change Password</h2>
        <p className="mt-1 text-muted-foreground">
          Use your current password to set a new password.
        </p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <PasswordField label="Current password" name="currentPassword" />
          <PasswordField label="New password" name="newPassword" />
          <PasswordField label="Confirm password" name="confirmPassword" />
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? "Changing..." : "Change Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  name,
  defaultValue,
  disabled,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-medium">{label}</span>
      <Input name={name} defaultValue={defaultValue || ""} disabled={disabled} />
    </label>
  );
}

function PasswordField({ label, name }: { label: string; name: string }) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="block">
      <span className="mb-2 block font-medium">{label}</span>
      <div className="relative">
        <Input
          name={name}
          type={visible ? "text" : "password"}
          required
          className="pr-12"
        />
        <button
          type="button"
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center text-muted-foreground hover:text-foreground"
          onClick={() => setVisible((value) => !value)}
        >
          {visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
        </button>
      </div>
    </label>
  );
}
