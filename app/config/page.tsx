import ConfigPage from "./config-page";

export default async function Page({
  params,
}: {
  params: Promise<Record<string, string>>;
}) {
  const searchParams = await params;

  return <ConfigPage params={searchParams} />;
}
