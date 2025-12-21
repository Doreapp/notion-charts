import ConfigPage from "./config-page";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;

  return <ConfigPage params={params} />;
}
