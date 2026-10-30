import { useEffect, useState, type ReactNode } from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  MoreHorizontal,
  Users,
} from 'lucide-react';
import type { HealthResponse } from '@shared';
import { ApiError, apiFetch } from './lib/apiClient';
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Checkbox,
  Dropdown,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
  EmptyState,
  ErrorState,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Pagination,
  ProgressBar,
  Select,
  Skeleton,
  Spinner,
  Table,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  useToast,
  type TableColumn,
} from './design-system';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-2xl text-fg">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-fg-muted">{label}</p>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

type Learner = {
  id: string;
  name: string;
  track: string;
  points: number;
};

const learnerColumns: TableColumn<Learner>[] = [
  { key: 'name', header: 'Name', render: (row) => row.name },
  { key: 'track', header: 'Track', render: (row) => row.track },
  {
    key: 'points',
    header: 'Points',
    align: 'right',
    render: (row) => row.points,
  },
];

const learners: Learner[] = [
  { id: '1', name: 'Alex Morgan', track: 'Operations VA', points: 42 },
  { id: '2', name: 'Jordan Lee', track: 'Executive VA', points: 61 },
  { id: '3', name: 'Sam Rivera', track: 'Social media VA', points: 28 },
];

export function DevGalleryPage() {
  const { toast } = useToast();
  const [data, setData] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSize, setModalSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [page, setPage] = useState(3);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const health = await apiFetch<HealthResponse>('/health');
        if (!cancelled) {
          setData(health);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof ApiError
              ? `${err.code}: ${err.message}`
              : err instanceof Error
                ? err.message
                : 'Unknown error';
          setError(message);
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="border-b border-border bg-surface shadow-sm">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-6">
          <p className="text-sm font-medium uppercase tracking-wide text-brand-700">
            Development gallery — Phase 2A + 2B
          </p>
          <h1 className="font-display text-4xl text-fg">RVA</h1>
          <p className="max-w-2xl text-base text-fg-muted">
            Remote VA&apos;s Academy — design tokens and primitives preview. Not a product page.
          </p>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-12 px-4 py-10">
        <Section title="Button">
          <Row label="Variants">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </Row>
          <Row label="Sizes">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </Row>
          <Row label="Icons">
            <Button leftIcon={<Check className="size-4" aria-hidden />}>Left icon</Button>
            <Button rightIcon={<ArrowRight className="size-4" aria-hidden />}>Right icon</Button>
          </Row>
          <Row label="States">
            <Button disabled>Disabled</Button>
            <Button loading>Loading</Button>
            <Button variant="danger" loading>
              Saving
            </Button>
          </Row>
        </Section>

        <Section title="Input / Textarea / Select">
          <div className="grid gap-6 md:grid-cols-2">
            <Input label="Full name" placeholder="Alex Morgan" hint="As it appears on certificates" />
            <Input label="Email" defaultValue="broken" error="Enter a valid email address" />
            <Input label="Disabled field" defaultValue="Read only" disabled />
            <Select label="Track" hint="Choose your learning path" defaultValue="ops">
              <option value="ops">Operations VA</option>
              <option value="social">Social media VA</option>
              <option value="exec">Executive VA</option>
            </Select>
            <Select label="Cohort" error="Select a cohort to continue" defaultValue="">
              <option value="" disabled>
                Select…
              </option>
              <option value="a">Spring A</option>
              <option value="b">Spring B</option>
            </Select>
            <Select label="Disabled select" disabled defaultValue="ops">
              <option value="ops">Operations VA</option>
            </Select>
            <Textarea
              label="Bio"
              hint="Short introduction for your profile"
              placeholder="I support founders with…"
              rows={4}
            />
            <Textarea label="Notes" error="Notes are required" rows={4} defaultValue="" />
          </div>
        </Section>

        <Section title="Checkbox">
          <Row label="States">
            <Checkbox label="I agree to the academy policies" defaultChecked />
            <Checkbox label="Disabled preference" disabled />
            <Checkbox label="Accept terms to continue" error="You must accept the terms" />
          </Row>
        </Section>

        <Section title="Card">
          <Card className="max-w-lg">
            <CardHeader>
              <h3 className="font-display text-xl">Lesson card</h3>
              <p className="text-sm text-fg-muted">Composition via header, body, and footer.</p>
            </CardHeader>
            <CardBody>
              <p className="text-base text-fg">
                Watch the briefing, complete the quiz, and unlock the next lesson in sequence.
              </p>
            </CardBody>
            <CardFooter>
              <Button size="sm">Continue</Button>
              <Button size="sm" variant="ghost">
                Skip for now
              </Button>
            </CardFooter>
          </Card>
        </Section>

        <Section title="Badge">
          <Row label="Variants · md">
            <Badge variant="neutral">Neutral</Badge>
            <Badge variant="brand">Brand</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
          </Row>
          <Row label="Sizes">
            <Badge size="sm" variant="brand">
              Small
            </Badge>
            <Badge size="md" variant="brand">
              Medium
            </Badge>
          </Row>
        </Section>

        <Section title="Spinner">
          <Row label="Sizes">
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
          </Row>
        </Section>

        <Section title="Modal">
          <Row label="Sizes">
            {(['sm', 'md', 'lg'] as const).map((size) => (
              <Button
                key={size}
                variant="outline"
                onClick={() => {
                  setModalSize(size);
                  setModalOpen(true);
                }}
              >
                Open {size}
              </Button>
            ))}
          </Row>
          <Modal open={modalOpen} onOpenChange={setModalOpen} size={modalSize}>
            <ModalHeader
              title="Reset learner password"
              description="A temporary password will be shown once."
            />
            <ModalBody>
              <p className="text-base text-fg">
                This action issues a new password for the selected learner and requires a change on
                next login.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setModalOpen(false)}>Confirm reset</Button>
            </ModalFooter>
          </Modal>
        </Section>

        <Section title="Dropdown">
          <div className="inline-flex w-fit">
            <Dropdown
              trigger={
                <Button
                  variant="outline"
                  rightIcon={<MoreHorizontal className="size-4" aria-hidden />}
                >
                  Actions
                </Button>
              }
            >
              <DropdownLabel>Learner</DropdownLabel>
              <DropdownItem>View progress</DropdownItem>
              <DropdownItem>Send reminder</DropdownItem>
              <DropdownSeparator />
              <DropdownItem destructive>Deactivate account</DropdownItem>
              <DropdownItem disabled>Archived action</DropdownItem>
            </Dropdown>
          </div>
        </Section>

        <Section title="Tabs">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="lessons">Lessons</TabsTrigger>
              <TabsTrigger value="quiz" disabled>
                Quiz
              </TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <p className="text-base text-fg">Course overview content for RVA learners.</p>
            </TabsContent>
            <TabsContent value="lessons">
              <p className="text-base text-fg">Lesson list would appear here.</p>
            </TabsContent>
            <TabsContent value="quiz">
              <p className="text-base text-fg">Quiz builder tab.</p>
            </TabsContent>
          </Tabs>
        </Section>

        <Section title="Table">
          <Row label="Populated">
            <div className="w-full">
              <Table columns={learnerColumns} rows={learners} caption="Learner leaderboard" />
            </div>
          </Row>
          <Row label="Loading">
            <div className="w-full">
              <Table columns={learnerColumns} rows={[]} loading />
            </div>
          </Row>
          <Row label="Empty">
            <div className="w-full">
              <Table
                columns={learnerColumns}
                rows={[]}
                empty={{
                  icon: <Users className="size-5" aria-hidden />,
                  title: 'No learners yet',
                  description: 'Invite your first remote VA to get started.',
                  action: <Button size="sm">Invite learner</Button>,
                }}
              />
            </div>
          </Row>
        </Section>

        <Section title="Pagination">
          <Pagination page={page} totalPages={12} onPageChange={setPage} />
          <Pagination page={1} totalPages={3} onPageChange={() => undefined} />
        </Section>

        <Section title="Toast">
          <Row label="Variants">
            <Button
              variant="secondary"
              onClick={() =>
                toast({ variant: 'success', title: 'Saved', description: 'Progress updated.' })
              }
            >
              Success
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                toast({ variant: 'error', title: 'Failed', description: 'Could not save changes.' })
              }
            >
              Error
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                toast({ variant: 'info', title: 'Tip', description: 'Complete the video first.' })
              }
            >
              Info
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                toast({
                  variant: 'warning',
                  title: 'Almost there',
                  description: 'Quiz closing in 5 minutes.',
                })
              }
            >
              Warning
            </Button>
          </Row>
        </Section>

        <Section title="Skeleton">
          <Row label="Variants">
            <Skeleton variant="text" width="md" height="sm" />
            <Skeleton variant="rect" width="lg" height="xl" />
            <Skeleton variant="circle" height="lg" />
          </Row>
        </Section>

        <Section title="EmptyState">
          <EmptyState
            icon={<BookOpen className="size-5" aria-hidden />}
            title="No courses published"
            description="Create a course to start training your VA team."
            action={<Button size="sm">Create course</Button>}
          />
        </Section>

        <Section title="ErrorState">
          <ErrorState
            title="Could not load progress"
            description="Check your connection and try again."
            onRetry={() => toast({ variant: 'info', title: 'Retry requested' })}
          />
        </Section>

        <Section title="ProgressBar">
          <div className="flex w-full max-w-lg flex-col gap-4">
            <ProgressBar value={35} size="sm" label="Lesson watch" />
            <ProgressBar value={70} size="md" label="Course completion" />
            <ProgressBar value={100} size="md" label="Quiz score" />
          </div>
        </Section>

        <Section title="Avatar">
          <Row label="Sizes · initials">
            <Avatar name="Alex Morgan" alt="Alex Morgan" size="sm" />
            <Avatar name="Jordan Lee" alt="Jordan Lee" size="md" />
            <Avatar name="Sam Rivera" alt="Sam Rivera" size="lg" />
          </Row>
          <Row label="With image (fallback on error)">
            <Avatar
              name="Alex Morgan"
              alt="Alex Morgan"
              size="lg"
              src="https://invalid.example/avatar.png"
            />
          </Row>
        </Section>

        <aside className="rounded-lg border border-border bg-surface p-4 shadow-sm">
          <h2 className="mb-2 font-display text-lg text-fg">Phase 1 smoke · /api/health</h2>
          {loading && (
            <div className="flex items-center gap-2 text-sm text-fg-muted">
              <Spinner size="sm" />
              Checking API…
            </div>
          )}
          {!loading && error && (
            <pre className="overflow-x-auto rounded-md bg-danger-subtle p-3 text-sm text-danger">
              {error}
            </pre>
          )}
          {!loading && data && (
            <pre className="overflow-x-auto rounded-md bg-neutral-100 p-3 text-sm text-fg">
              {JSON.stringify(data, null, 2)}
            </pre>
          )}
        </aside>
      </main>
    </div>
  );
}
