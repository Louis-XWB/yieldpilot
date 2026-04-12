"use client";

import { useState, useEffect } from "react";
import { PortfolioResponse } from "@/lib/types";

export function usePortfolio(address: string | undefined) {
  const [data, setData] = useState<PortfolioResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setData(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    fetch(`/api/portfolio/${address}`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [address]);

  return { data, isLoading, error };
}
