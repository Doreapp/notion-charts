import "./globals.css";
import LoginPage from "./index-page";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;

  return <LoginPage params={params} />;
}
