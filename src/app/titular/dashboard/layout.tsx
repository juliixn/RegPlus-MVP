import TitularLayout from '@/components/titular/TitularLayout';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TitularLayout>{children}</TitularLayout>;
}
