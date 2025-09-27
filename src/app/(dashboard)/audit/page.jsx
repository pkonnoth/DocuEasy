import AuditLogViewer from '@/components/admin/AuditLogViewer';
import { getUserWithProfile } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AuditPage() {
  const { user, profile, isAdmin } = await getUserWithProfile();

  // Redirect if not admin (additional check - middleware also handles this)
  if (!isAdmin) {
    redirect('/patients');
  }

  return <AuditLogViewer user={user} profile={profile} />;
}
