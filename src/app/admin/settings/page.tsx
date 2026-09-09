import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Commercial defaults. Free sittings cap at 20 questions unless an exam overrides that limit.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Access</CardTitle>
          <CardDescription>
            ADMIN has full access. EDITOR can manage exams, questions, papers, and PDFs, but not
            payments, users, or admin accounts. USER cannot open /admin.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Every admin API is gated on the server. Hiding a nav link is not the security boundary.
          Premium PDFs are stored outside public/static and streamed only after purchase verification.
        </CardContent>
      </Card>
    </div>
  );
}
