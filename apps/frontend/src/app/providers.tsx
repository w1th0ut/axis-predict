"use client";

import React from "react";
import { DAppKitProvider } from "@mysten/dapp-kit-react";
import { dAppKit } from "./dapp-kit";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DAppKitProvider dAppKit={dAppKit}>{children}</DAppKitProvider>;
}
