import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Image, Upload, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  label: string;
  currentImage: string | null;
  onUpload: (file: File) => Promise<void>;
}

export function ImageUpload({ label, currentImage, onUpload }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const getImageUrl = (url: string) => {
    if (!url) return null;
    if (url.startsWith('/uploads')) {
      return `https://painelquick.vmagenciadigital.com/painelquick${url}`;
    }
    return url;
  };
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage ? getImageUrl(currentImage) : null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      
      // Criar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Fazer upload
      await onUpload(file);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Label>{label}</Label>
      
      <div className="flex items-center gap-4">
        {/* Preview da imagem */}
        <div className="relative w-32 h-32 border rounded-lg overflow-hidden bg-gray-100">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={label}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Image className="w-8 h-8" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
            id={`upload-${label}`}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isUploading}
            onClick={() => document.getElementById(`upload-${label}`)?.click()}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                <span>Escolher Imagem</span>
              </>
            )}
          </Button>
          <p className="text-sm text-gray-500 mt-2">
            Formatos aceitos: JPG, PNG ou GIF. Tamanho máximo: 5MB
          </p>
        </div>
      </div>
    </div>
  );
} 