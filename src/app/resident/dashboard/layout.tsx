import ResidentLayout from '@/components/resident/ResidentLayout';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ResidentLayout>{children}</ResidentLayout>;
}
