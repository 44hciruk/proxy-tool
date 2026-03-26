"use client";

import { useState } from "react";
import SetupForm, { type FormData } from "@/components/SetupForm";
import ScriptPanel from "@/components/ScriptPanel";
import { generateWebarenaScript } from "@/lib/generateScript";

interface GeneratedResult {
  ip: string;
  rootPassword: string;
  proxyUser: string;
  proxyPassword: string;
  proxyPort: number;
  sshPort: number;
  script: string;
}

export default function Home() {
  const [result, setResult] = useState<GeneratedResult | null>(null);

  const handleGenerate = (data: FormData) => {
    const script = generateWebarenaScript({
      proxyUser: data.proxyUser,
      proxyPassword: data.proxyPassword,
      proxyPort: data.proxyPort,
      os: data.os,
    });
    setResult({
      ip: data.ip,
      rootPassword: data.rootPassword,
      proxyUser: data.proxyUser,
      proxyPassword: data.proxyPassword,
      proxyPort: data.proxyPort,
      sshPort: 22,
      script,
    });
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">VPS Proxy Setup Tool</h1>
        <p className="text-gray-400 text-sm mt-2">
          VPS に Squid プロキシを構築するスクリプトを生成します
        </p>
      </div>

      <SetupForm onGenerate={handleGenerate} />

      {result && (
        <div className="mt-8">
          <ScriptPanel
            ip={result.ip}
            rootPassword={result.rootPassword}
            proxyUser={result.proxyUser}
            proxyPassword={result.proxyPassword}
            proxyPort={result.proxyPort}
            sshPort={result.sshPort}
            script={result.script}
          />
        </div>
      )}
    </main>
  );
}
