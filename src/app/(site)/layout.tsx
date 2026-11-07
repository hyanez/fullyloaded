import { Footer } from "@/components/footer/footer";
import { Navbar } from "@/components/navigation/navbar";

/** Every page behind the age gate, plus the legal pages: site navbar and footer. */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
