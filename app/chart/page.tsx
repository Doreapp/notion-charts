import ChartPage from "./chart-page";

export default async function Page({
  params,
}: {
  params: Promise<Record<string, string>>;
}) {
  const searchParams = await params;

  return <ChartPage params={searchParams} />;
}
