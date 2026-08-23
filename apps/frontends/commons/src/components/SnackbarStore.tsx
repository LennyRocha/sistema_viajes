import React from "react";
import { Snack } from "../types/SnackbarProps";

type Listener = () => void;

const listeners = new Set<Listener>();

let snacks: Snack[] = [];

export function subscribe(listener: Listener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function emit() {
  listeners.forEach((l) => l());
}

function nextId() {
  return crypto.randomUUID();
}

export function addSnack(snack: Snack) {
  snacks.push({
    ...snack,
    id: snack.id ?? nextId(),
  });

  emit();
}

export function removeSnack(id: string) {
  snacks = snacks.filter((s) => s.id !== id);

  emit();
}

export function getSnacks() {
  return snacks;
}
