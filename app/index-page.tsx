"use client";

import "./globals.css";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import SecretInput from "@/components/SecretInput";
import { hasSecret } from "@/utils/secret-storage";
import { getNextUrlFromParams } from "@/utils/login-redirect";

export default function LoginPage({
  params,
}: {
  params: Record<string, string>;
}) {
  const router = useRouter();
  const [hasStoredSecret, setHasStoredSecret] = useState<boolean | null>(() =>
    hasSecret()
  );

  useEffect(() => {
    if (hasStoredSecret) {
      const nextUrl = getNextUrlFromParams(new URLSearchParams(params));
      const redirectUrl = nextUrl || "/config";
      router.replace(redirectUrl);
    }
  }, [hasStoredSecret, params, router]);

  const handleSecretStored = () => {
    setHasStoredSecret(true);
  };

  if (hasStoredSecret === null) {
    return null;
  }

  const nextUrl =
    getNextUrlFromParams(new URLSearchParams(params)) || "/config";

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        p: 2,
        boxSizing: "border-box",
        overflow: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <SecretInput onSecretStored={handleSecretStored} nextUrl={nextUrl} />
    </Box>
  );
}
