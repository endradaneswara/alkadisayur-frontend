import { ProfileAddressManager } from "@/components/profile-address-manager";
import { StoreAccountNav } from "@/components/store-account-nav";
import { StorePageShell } from "@/components/store-page-shell";

export default function AddressesPage() {
  return (
    <StorePageShell>
      <div className="w-full">
        <StoreAccountNav
          title="Alamat Pengiriman"
          description="Kelola alamat yang dapat dipilih saat checkout pesanan Anda."
        />
        <ProfileAddressManager />
      </div>
    </StorePageShell>
  );
}
