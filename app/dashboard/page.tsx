import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

function daysRemaining(expiresAt: string): number {
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: payments } = await supabase
    .from('payments')
    .select(`
      id,
      purchased_at,
      expires_at,
      status,
      templates ( name, slug, thumbnail_url ),
      resume_snapshots ( snapshot_data )
    `)
    .eq('user_id', user!.id)
    .eq('status', 'completed')
    .order('purchased_at', { ascending: false })

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">My resumes</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{user!.email}</p>
        </div>
        <Link
          href="/build"
          className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          + New resume
        </Link>
      </div>

      {!payments?.length ? (
        <div className="text-center py-20 border rounded-xl bg-muted/20">
          <p className="text-muted-foreground mb-4">No purchased resumes yet.</p>
          <Link href="/build" className="text-sm underline underline-offset-2">
            Build your first resume →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {payments.map((payment) => {
            const template = Array.isArray(payment.templates) ? payment.templates[0] : payment.templates
            const days = daysRemaining(payment.expires_at)
            const expired = days === 0
            // Get resume title from snapshot data
            const snapshot = Array.isArray(payment.resume_snapshots) ? payment.resume_snapshots[0] : payment.resume_snapshots
            const name = (snapshot?.snapshot_data as { personalInfo?: { name?: string } } | null)?.personalInfo?.name

            return (
              <div key={payment.id} className="border rounded-xl bg-card overflow-hidden flex flex-col">
                {/* Thumbnail */}
                <div className="h-40 bg-muted flex items-center justify-center text-muted-foreground text-sm">
                  {template?.thumbnail_url
                    ? <img src={template.thumbnail_url} alt={template.name} className="w-full h-full object-cover" />
                    : template?.name ?? 'Resume'}
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col gap-3 flex-1">
                  <div>
                    <p className="font-medium">{name || 'Resume'}</p>
                    <p className="text-xs text-muted-foreground capitalize">{template?.name} template</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {new Date(payment.purchased_at).toLocaleDateString()}
                    </p>
                    {expired
                      ? <Badge variant="destructive">Expired</Badge>
                      : <Badge variant="secondary">{days}d left</Badge>
                    }
                  </div>

                  <div className="flex gap-2 mt-auto">
                    <Link
                      href={`/dashboard/edit/${payment.id}`}
                      className="flex-1 text-center text-sm border rounded-md py-1.5 hover:bg-muted transition-colors"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/dashboard/download/${payment.id}`}
                      className={[
                        'flex-1 text-center text-sm rounded-md py-1.5 transition-colors',
                        expired
                          ? 'bg-muted text-muted-foreground cursor-not-allowed'
                          : 'bg-primary text-primary-foreground hover:opacity-90',
                      ].join(' ')}
                    >
                      Download
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
