import "./globals.css";
import LoginPage from "./index-page";

export default async function Page({
  params,
}: {
  params: Promise<Record<string, string>>;
}) {
  const searchParams = await params;

  return <LoginPage params={searchParams} />;
}
