import React, { useState, useRef } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Icon } from './Icon';
import { useToast } from './Toast';

export function UploadBuktiSusulanModal({
  isOpen,
  onClose,
  pembayaran,
  uploadEndpoint,
  onSuccess,
  httpClient,
}) {
  const { addToast } = useToast();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen || !pembayaran) return null;

  const rawId = String(pembayaran.idRaw || pembayaran.id || pembayaran.Id_Pembayaran || '').trim();
  const trxLabel = rawId
    ? (rawId.toUpperCase().startsWith('TRX-') ? rawId.toUpperCase() : `TRX-${rawId}`)
    : 'TRX-PAYMENT';

  const cleanNumericId = rawId.replace(/[^0-9]/g, '');

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setErrorMessage('Format berkas tidak didukung. Gunakan JPG, PNG, atau WEBP.');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setErrorMessage('Ukuran berkas maksimal 5 MB.');
      return;
    }

    setErrorMessage('');
    setFile(selectedFile);
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleReset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setErrorMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCloseModal = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage('Pilih berkas foto bukti pembayaran terlebih dahulu.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const targetEndpoint = uploadEndpoint || `/api/v1/tenant/pembayaran/${cleanNumericId}/bukti`;

      const formData = new FormData();
      formData.append('bukti', file);

      let data;
      if (httpClient) {
        const res = await httpClient.post(targetEndpoint, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        data = res.data;
      } else {
        const res = await fetch(targetEndpoint, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
          body: formData,
        });

        data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Gagal mengunggah foto bukti pembayaran.');
        }
      }

      const successMessage = data?.message || `Foto bukti fisik untuk transaksi ${trxLabel} berhasil disimpan.`;
      addToast(successMessage, 'success');

      if (onSuccess) {
        onSuccess(data);
      }
      handleCloseModal();
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Terjadi kesalahan saat mengunggah berkas.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseModal}
      title="Unggah Foto Bukti Susulan"
      subtitle={`Transaksi: ${trxLabel}`}
      size="md"
      footer={
        <div className="flex items-center justify-end w-full gap-2.5">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleCloseModal}
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={!file || loading}
            className="gap-1.5"
          >
            {loading ? (
              <>
                <Icon icon="heroicons:arrow-path-20-solid" className="size-4 animate-spin" />
                <span>Mengunggah...</span>
              </>
            ) : (
              <>
                <Icon icon="heroicons:arrow-up-tray-20-solid" className="size-4" />
                <span>Simpan Bukti Foto</span>
              </>
            )}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4 font-sans text-xs">
        <div className="bg-mono-50 border border-border/80 rounded-lg p-3 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-text-3 font-medium">Metode Pembayaran</span>
            <span className="font-bold text-text">{pembayaran.metode || pembayaran.Metode_Bayar || 'Tunai Loket'}</span>
          </div>
          {pembayaran.nominal && (
            <div className="flex items-center justify-between">
              <span className="text-text-3 font-medium">Nominal Transaksi</span>
              <span className="font-extrabold text-red font-tabular-nums">
                {typeof pembayaran.nominal === 'number'
                  ? `Rp ${pembayaran.nominal.toLocaleString('id-ID')}`
                  : pembayaran.nominal}
              </span>
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red/20 rounded-lg text-red text-xs flex items-center gap-2">
            <Icon icon="heroicons:exclamation-circle-20-solid" className="size-4.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {previewUrl ? (
          <div className="flex flex-col gap-2">
            <div className="relative border border-border/80 rounded-xl overflow-hidden bg-mono-100/60 max-h-72 flex items-center justify-center p-2">
              <img
                src={previewUrl}
                alt="Pratinjau Foto Bukti"
                className="max-h-64 object-contain rounded-lg shadow-xs"
              />
              <button
                type="button"
                onClick={handleReset}
                title="Ganti Foto"
                className="absolute top-3 right-3 size-8 rounded-full bg-black/60 text-white hover:bg-black/80 flex items-center justify-center shadow-md transition-colors"
              >
                <Icon icon="heroicons:x-mark-20-solid" className="size-4.5" />
              </button>
            </div>
            <div className="flex items-center justify-between text-2xs text-text-3 px-1">
              <span className="truncate max-w-[200px] font-medium">{file?.name}</span>
              <span className="font-tabular-nums">{(file?.size / (1024 * 1024)).toFixed(2)} MB</span>
            </div>
          </div>
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
              isDragging
                ? 'border-red bg-red-50/50'
                : 'border-border/80 hover:border-red/40 bg-white hover:bg-warm-gray/10'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />
            <div className="size-12 rounded-full bg-red-50 text-red flex items-center justify-center">
              <Icon icon="heroicons:camera-20-solid" className="size-6" />
            </div>
            <div className="text-center">
              <p className="font-bold text-text">
                Klik untuk ambil foto atau pilih berkas
              </p>
              <p className="text-text-3 text-2xs mt-1">
                Format: JPG, PNG, atau WEBP (Maksimal 5 MB)
              </p>
            </div>
          </div>
        )}

        <div className="text-2xs text-text-3 bg-amber-50/60 border border-amber-200/60 rounded-lg p-2.5 flex items-start gap-2">
          <Icon icon="heroicons:information-circle-20-solid" className="size-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Lampirkan foto fisik struk transaksi loket atau slip bukti setoran dari kasir Plaza Kebun Sayur untuk melengkapi arsip pembayaran.
          </p>
        </div>
      </div>
    </Modal>
  );
}

export default UploadBuktiSusulanModal;
