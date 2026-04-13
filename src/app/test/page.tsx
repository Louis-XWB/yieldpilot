"use client";

import { useAccount, useWalletClient, useSendTransaction } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import { parseEther } from "viem";

export default function TestPage() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { sendTransactionAsync } = useSendTransaction();
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLog((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  // Test 1: Simple ETH transfer via sendTransactionAsync
  const testSendTransaction = async () => {
    if (!address) return;
    addLog("Testing sendTransactionAsync...");
    try {
      const hash = await sendTransactionAsync({
        to: address,
        value: BigInt(0),
        chainId: 8453,
      });
      addLog(`Success! Hash: ${hash}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog(`Error: ${msg}`);
    }
  };

  // Test 2: Simple ETH transfer via walletClient
  const testWalletClient = async () => {
    if (!walletClient || !address) return;
    addLog("Testing walletClient.sendTransaction...");
    try {
      const hash = await walletClient.sendTransaction({
        to: address,
        value: BigInt(0),
        chain: walletClient.chain,
        account: address,
      });
      addLog(`Success! Hash: ${hash}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog(`Error: ${msg}`);
    }
  };

  // Test 3: Direct window.ethereum
  const testWindowEthereum = async () => {
    addLog("Testing window.ethereum...");
    const eth = (window as unknown as { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown>; isMetaMask?: boolean } }).ethereum;
    if (!eth) {
      addLog("window.ethereum is UNDEFINED - no wallet injected!");
      return;
    }
    addLog(`window.ethereum exists. isMetaMask: ${eth.isMetaMask}`);
    try {
      const accounts = await eth.request({ method: "eth_accounts" }) as string[];
      addLog(`Accounts: ${JSON.stringify(accounts)}`);

      const result = await eth.request({
        method: "eth_sendTransaction",
        params: [{
          from: accounts[0],
          to: accounts[0],
          value: "0x0",
        }],
      });
      addLog(`Success! Result: ${JSON.stringify(result)}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog(`Error: ${msg}`);
    }
  };

  return (
    <div style={{ padding: 40, background: "#0A0A0F", color: "#F8FAFC", minHeight: "100vh", fontFamily: "monospace" }}>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>Wallet Transaction Test</h1>

      <ConnectButton />

      {isConnected && (
        <div style={{ marginTop: 20 }}>
          <p>Address: {address}</p>
          <p>WalletClient: {walletClient ? "ready" : "not ready"}</p>

          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button onClick={testSendTransaction} style={{ padding: "10px 20px", background: "#6366F1", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}>
              Test sendTransactionAsync
            </button>
            <button onClick={testWalletClient} style={{ padding: "10px 20px", background: "#10B981", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}>
              Test walletClient
            </button>
            <button onClick={testWindowEthereum} style={{ padding: "10px 20px", background: "#F59E0B", color: "black", border: "none", borderRadius: 8, cursor: "pointer" }}>
              Test window.ethereum
            </button>
          </div>

          <div style={{ marginTop: 20, padding: 16, background: "#1A1A2E", borderRadius: 8 }}>
            <h3>Log:</h3>
            {log.map((l, i) => (
              <div key={i} style={{ fontSize: 12, marginBottom: 4, wordBreak: "break-all" }}>{l}</div>
            ))}
            {log.length === 0 && <div style={{ color: "#64748B" }}>Click a button to test...</div>}
          </div>
        </div>
      )}
    </div>
  );
}
