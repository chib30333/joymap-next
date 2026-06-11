"use client";
// useFav — toggle favorites via RPC then refresh server data. Shared by screens.
import { useRouter } from "next/navigation";
import { rpc } from "@/lib/client";

export function useFav() {
  const router = useRouter();
  return (id: string) => { rpc("toggleFav", { serviceId: id }).then(() => router.refresh()); };
}
