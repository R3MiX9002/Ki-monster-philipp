import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FilePlus, UploadCloud, Loader2, Download, Share2 } from "lucide-react";

export default function ShowroomUploader() {
  const [loading, setLoading] = useState(false);
  const [convertedModel, setConvertedModel] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleOpenFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleConvert = async () => {
    if (!uploadedFile) return;
    setLoading(true);
    // Simulierte Konvertierung: PNG ➝ OBJ ➝ X-File (Placeholder)
    setTimeout(() => {
      setConvertedModel("/converted-model/theodor-von-haft.x");
      setLoading(false);
    }, 3000);
  };

  const handleDownload = () => {
    if (convertedModel) {
      const link = document.createElement("a");
      link.href = convertedModel;
      link.download = "converted-model.x";
      link.click();
    }
  };

  const handleShare = () => {
    if (navigator.share && convertedModel) {
      navigator.share({
        title: "3D Modell",
        text: "Hier ist mein konvertiertes 3D-Modell im .x Format",
        url: window.location.origin + convertedModel
      });
    } else {
      alert("Teilen wird auf diesem Gerät nicht unterstützt.");
    }
  };

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="p-4">
        <CardContent>
          <h2 className="text-xl font-bold mb-2">3D-Konverter</h2>
          <p className="mb-4">Lade dein PNG- oder OBJ-Modell hoch und konvertiere es in eine X-File.</p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.obj"
            onChange={handleFileUpload}
            className="hidden"
          />

          <Button onClick={handleOpenFileDialog} className="mb-2">
            <FilePlus className="mr-2" /> Datei auswählen
          </Button>

          <Button onClick={handleConvert} disabled={loading || !uploadedFile} className="mr-2">
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" /> Wird konvertiert…
              </>
            ) : (
              <>
                <UploadCloud className="mr-2" /> Konvertieren
              </>
            )}
          </Button>

          <Button onClick={handleDownload} disabled={!convertedModel} variant="secondary" className="mr-2">
            <Download className="mr-2" /> Download
          </Button>

          <Button onClick={handleShare} disabled={!convertedModel} variant="outline">
            <Share2 className="mr-2" /> Teilen
          </Button>
        </CardContent>
      </Card>

      <Card className="p-4">
        <CardContent>
          <h2 className="text-xl font-bold mb-2">3D Showroom</h2>
          <p className="mb-4">Vorschau deiner konvertierten Datei als X-File-Modell.</p>

          {convertedModel ? (
            <iframe
              src="https://3dviewer.net/"
              title="3D Showroom"
              width="100%"
              height="400"
              className="rounded-xl shadow"
            ></iframe>
          ) : (
            <div className="text-sm text-muted-foreground">
              Noch kein Modell geladen.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
