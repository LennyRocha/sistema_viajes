"use client";
import { useEffect } from "react";
import { initFederation } from "../lib/federation";

export default function FederationInit() {
  useEffect(() => {
    initFederation();
  }, []);
  return null;
}
