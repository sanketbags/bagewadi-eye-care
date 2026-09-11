import PortalMobileNav from "@/components/PortalMobileNav";

export default function StaffLayout({ children }) {
  return (
    <>
      {children}
      <PortalMobileNav />
    </>
  );
}
