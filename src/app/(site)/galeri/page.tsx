import type { Metadata } from "next";
import PageHeader from "@/components/site/PageHeader";
import GalleryGrid from "@/components/site/GalleryGrid";

export const metadata: Metadata = {
  title: "Galeri",
  description:
    "Reina Spa Ataşehir'in fotoğraf ve video galerisi. Mekânımızı, masaj odalarımızı ve ritüellerimizi keşfedin.",
};

export default function GalleryPage() {
  return (
    <>
      <PageHeader
        eyebrow="Galeri"
        title={
          <>
            Mekânımızdan <span className="text-gradient-rose">kareler</span>
          </>
        }
        description="Loş ışıklar, sıcak dokular ve huzur veren detaylar. Reina Spa'yı gelmeden önce keşfedin."
      />
      <GalleryGrid />
    </>
  );
}
