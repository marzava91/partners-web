import { redirect } from "next/navigation";

export default function Page() {
  // Redirect root to the login page (server-side redirect)
  redirect("/login");
}
