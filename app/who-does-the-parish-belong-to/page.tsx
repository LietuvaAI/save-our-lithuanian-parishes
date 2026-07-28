import { redirect } from "next/navigation";

// Long-form interpretation belongs in Židinys. Keep the historical route so
// existing links reach the canonical essay rather than a second local copy.
export default function OwnershipEssayRedirect() {
  redirect(
    "https://blog.saveourlithuanianparishes.org/p/who-does-the-parish-belong-to",
  );
}
