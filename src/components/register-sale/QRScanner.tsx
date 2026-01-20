'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { Camera, CameraOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface QRScannerProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startScanner = async () => {
    try {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleScan(decodedText);
        },
        () => {
          // Ignore scan errors
        }
      );

      setIsScanning(true);
      setHasPermission(true);
      setError(null);
    } catch (err: any) {
      console.error('Erro ao iniciar scanner:', err);

      if (err.message?.includes('Permission')) {
        setHasPermission(false);
        setError('Permissão de câmera negada');
      } else {
        setError('Erro ao acessar a câmera');
      }

      onError?.(err.message);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === Html5QrcodeScannerState.SCANNING) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (err) {
        console.error('Erro ao parar scanner:', err);
      }
    }
    setIsScanning(false);
  };

  const handleScan = async (data: string) => {
    await stopScanner();
    onScan(data);
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="w-full">
      {/* Scanner Area */}
      <div
        className={cn(
          'relative w-full aspect-square max-w-sm mx-auto rounded-lg overflow-hidden',
          'bg-input-bg border-2 border-dashed border-input-border',
          isScanning && 'border-solid border-primary'
        )}
      >
        <div id="qr-reader" className="w-full h-full" />

        {/* Overlay quando não está escaneando */}
        {!isScanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-lg">
            {hasPermission === false ? (
              <>
                <CameraOff className="w-12 h-12 text-text-muted mb-md" />
                <p className="text-body text-text-secondary text-center mb-md">
                  Permissão de câmera necessária
                </p>
              </>
            ) : error ? (
              <>
                <AlertCircle className="w-12 h-12 text-error mb-md" />
                <p className="text-body text-error text-center mb-md">{error}</p>
              </>
            ) : (
              <>
                <Camera className="w-12 h-12 text-text-muted mb-md" />
                <p className="text-body text-text-secondary text-center mb-md">
                  Aponte a câmera para o QR Code do cliente
                </p>
              </>
            )}

            <Button onClick={startScanner} variant="secondary" size="sm">
              {hasPermission === false ? 'Tentar novamente' : 'Ativar câmera'}
            </Button>
          </div>
        )}

        {/* Scanning indicator */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 border-2 border-primary rounded-lg">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stop button */}
      {isScanning && (
        <div className="mt-md text-center">
          <Button onClick={stopScanner} variant="ghost" size="sm">
            Parar scanner
          </Button>
        </div>
      )}
    </div>
  );
}
