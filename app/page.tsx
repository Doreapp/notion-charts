"use client";

import "./globals.css";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import SecretInput from "@/components/SecretInput";
import { hasSecret } from "@/utils/secret-storage";
import { getNextUrlFromParams } from "@/utils/login-redirect";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [hasStoredSecret, setHasStoredSecret] = useState(hasSecret());

  useEffect(() => {
    if (hasStoredSecret) {
      const nextUrl = getNextUrlFromParams(searchParams);
      const redirectUrl = nextUrl || "/config";
      router.replace(redirectUrl);
    }
  }, [hasStoredSecret, searchParams, router]);

  const handleSecretStored = () => {
    setHasStoredSecret(true);
  };

  const nextUrl = getNextUrlFromParams(searchParams) || "/config";

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
