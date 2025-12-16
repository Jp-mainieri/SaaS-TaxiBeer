import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminIndexPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!session) {
    redirect('/login');
  }

  if (user?.role === 'SUPER_ADMIN') {
    redirect('/super-admin');
  }

  if (user?.establishmentSlug) {
    redirect(`/admin/${user.establishmentSlug}`);
  }

  redirect('/login');
}
