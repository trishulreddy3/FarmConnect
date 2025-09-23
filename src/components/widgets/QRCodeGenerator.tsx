import React, { useState } from 'react';
import QRCode from 'qrcode';
import { X, Download, Share2 } from 'lucide-react';

interface QRCodeGeneratorProps {
  data: string;
  title: string;
  subtitle?: string;
  isOpen: boolean;
  onClose: () => void;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  data,
  title,
  subtitle,
  isOpen,
  onClose
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  React.useEffect(() => {
    if (isOpen && data) {
      generateQRCode();
    }
  }, [isOpen, data]);

  const generateQRCode = async () => {
    try {
      const url = await QRCode.toDataURL(data, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(url);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.download = `${title.replace(/\s+/g, '_')}_qr_code.png`;
      link.href = qrCodeUrl;
      link.click();
    }
  };

  const shareQRCode = async () => {
    if (qrCodeUrl && navigator.share) {
      try {
        // Convert data URL to blob
        const response = await fetch(qrCodeUrl);
        const blob = await response.blob();
        const file = new File([blob], `${title}_qr_code.png`, { type: 'image/png' });

        await navigator.share({
          title: `${title} QR Code`,
          text: `Check out this ${title} QR Code!`,
          files: [file]
        });
      } catch (error) {
        console.error('Error sharing QR code:', error);
        // Fallback to copy to clipboard
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(data).then(() => {
      alert('QR Code data copied to clipboard!');
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-green-600 text-sm">📱</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-sm text-gray-600 mb-4">{subtitle}</p>
        )}

        {/* QR Code */}
        <div className="flex justify-center mb-6">
          <div className="p-4 border-2 border-gray-200 rounded-xl">
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
            ) : (
              <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={downloadQRCode}
            disabled={!qrCodeUrl}
            className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </button>
          <button
            onClick={shareQRCode}
            disabled={!qrCodeUrl}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
