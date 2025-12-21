import ChartPage from "./chart-page";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;

  return <ChartPage params={params} />;
}
