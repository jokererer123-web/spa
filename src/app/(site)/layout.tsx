import AnimatedBackground from "@/components/AnimatedBackground";
import Footer from "@/components/site/Footer";
import Navbar from "@/components/site/Navbar";
import FloatingCall from "@/components/site/FloatingCall";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <AnimatedBackground />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingCall />
    </>
  );
}
