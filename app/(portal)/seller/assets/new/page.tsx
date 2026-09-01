import { requireUser } from "@/lib/auth";
import { AssetForm } from "./asset-form";

export default async function NewAssetPage() {
  await requireUser({ role: "SELLER" });

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-xl font-semibold">Publish a new asset</h1>
      <div className="mt-6">
        <AssetForm />
      </div>
    </div>
  );
}
