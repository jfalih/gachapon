import { ProfileSettingsForm } from "../profile-settings-form";

export function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account details.</p>
      </div>
      <ProfileSettingsForm />
    </div>
  );
}
