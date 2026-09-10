import { createFileRoute } from "@tanstack/react-router";
import { GardenApp } from "@/components/GardenApp";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <GardenApp />;
}
