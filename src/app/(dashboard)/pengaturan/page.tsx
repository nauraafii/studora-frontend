import type { Metadata } from "next";
import { SettingsScreen } from "@/components/screens/SettingsScreen";
export default function Page() { return <SettingsScreen />; }

export const metadata: Metadata = { title: "Pengaturan" };
