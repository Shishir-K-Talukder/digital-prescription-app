import { supabase } from "@/integrations/supabase/client";

export const savePrescriptionPdf = async (userId: string, prescriptionId: string): Promise<string | null> => {
  try {
    // Use html2canvas to capture the print preview content
    const { default: html2canvas } = await import("html2canvas");
    
    const previewEl = document.getElementById("prescription-preview");
    if (!previewEl) return null;

    const canvas = await html2canvas(previewEl, { scale: 2, useCORS: true });
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) return null;

    const path = `${userId}/${prescriptionId}.png`;
    const { error } = await supabase.storage.from("prescription-pdfs").upload(path, blob, { upsert: true });

    if (error) {
      console.error("PDF upload error:", error);
      return null;
    }

    const { data } = await supabase.storage.from("prescription-pdfs").createSignedUrl(path, 86400);
    return data?.signedUrl ?? null;
  } catch (err) {
    console.error("Failed to save prescription image:", err);
    return null;
  }
};
