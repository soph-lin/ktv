import PlayerView from "@/components/PlayerView";

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <PlayerView code={code.toUpperCase()} />;
}
