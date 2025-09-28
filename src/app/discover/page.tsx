import { redirect } from "next/navigation";

export default function DiscoverPage() {
  // Redirect legacy /discover to the functional /discovery page
  redirect("/discovery");
}