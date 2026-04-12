const EARN_API_BASE = "https://earn.li.fi";

export async function fetchVaults(params?: {
  chainId?: number;
  cursor?: string;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.chainId) searchParams.set("chainId", String(params.chainId));
  if (params?.cursor) searchParams.set("cursor", params.cursor);
  if (params?.limit) searchParams.set("limit", String(params.limit));

  const url = `${EARN_API_BASE}/v1/earn/vaults?${searchParams}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Earn API error: ${res.status}`);
  return res.json();
}

export async function fetchAllVaults(chainId?: number) {
  const allVaults: unknown[] = [];
  let cursor: string | undefined;

  do {
    const res = await fetchVaults({ chainId, cursor, limit: 100 });
    allVaults.push(...res.data);
    cursor = res.nextCursor || undefined;
  } while (cursor && allVaults.length < 500);

  return allVaults;
}

export async function fetchVaultDetail(network: string, address: string) {
  const url = `${EARN_API_BASE}/v1/earn/vaults/${network}/${address}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Earn API error: ${res.status}`);
  return res.json();
}

export async function fetchChains() {
  const url = `${EARN_API_BASE}/v1/earn/chains`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Earn API error: ${res.status}`);
  return res.json();
}

export async function fetchProtocols() {
  const url = `${EARN_API_BASE}/v1/earn/protocols`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Earn API error: ${res.status}`);
  return res.json();
}

export async function fetchPortfolio(address: string) {
  const url = `${EARN_API_BASE}/v1/earn/portfolio/${address}/positions`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Earn API error: ${res.status}`);
  return res.json();
}
