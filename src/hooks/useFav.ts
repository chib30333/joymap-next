"use client";

import { useRouter } from "next/navigation";
import { rpc } from "@/lib/client";

export function useFav() {
  const router = useRouter();
  return (id: string) => {
    rpc("toggleFav", { serviceId: id }).then(() => router.refresh());
  };
}
