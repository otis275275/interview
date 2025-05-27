import { useEffect } from "react";
import type { AppProps } from "next/app";
import { initDatabase } from "../../models/database";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Error: Not handling async function properly
    initDatabase();
    // Should be:
    // initDatabase().catch(console.error);
  }, []);

  return <Component {...pageProps} />;
}
