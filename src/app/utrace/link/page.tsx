import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import ProductLinkCard from "@/components/utrace/ProductLinkCard";

export default async function UtraceLinkPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string; callback_url?: string }>;
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const { state, callback_url } = await searchParams;

  if (!state || !callback_url) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
        <p className="text-sm text-[rgba(244,244,245,0.40)]">
          Missing required parameters.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
      <ProductLinkCard
        user={currentUser}
        state={state}
        callbackUrl={callback_url}
      />
    </div>
  );
}
