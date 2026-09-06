import React, { useState } from 'react';
import { Button, Icon, Modal, FormField } from '@bunsay/shared-ui';

/**
 * Modal pengajuan sanggahan untuk pembayaran berstatus Ditolak.
 * Mengirim teks + (opsional) foto bukti perbaikan via multipart POST
 * ke /api/v1/tenant/pembayaran/{id}/sanggah.
 */
function SanggahanModal({ item, onClose, onSubmit, httpClient }) {
  const [teksSanggahan, setTeksSanggahan] = useState('');
  const [buktiSanggahanFile, setBuktiSanggahanFile] = useState(null);
  const [previewBuktiSanggahan, setPreviewBuktiSanggahan] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBuktiSanggahanFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewBuktiSanggahan(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!teksSanggahan.trim()) {
      setError('Penjelasan sanggahan wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('teks_sanggahan', teksSanggahan.trim());
      if (buktiSanggahanFile) {
        formData.append('bukti_sanggahan', buktiSanggahanFile);
      }

      await httpClient.post(`/api/v1/tenant/pembayaran/${item.idReal}/sanggah`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      onClose();
      await onSubmit?.();
    } catch (err) {
      setError(err?.response?.data?.message || 'Gagal mengirim sanggahan. Coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={Boolean(item)}
      onClose={onClose}
      disableBackdropClick={true}
      title="Ajukan Sanggahan Pembayaran"
      size="md"
      footer={
        <div className="flex gap-3 w-full">
          <Button variant="secondary" size="md" fullWidth onClick={onClose}>
            Batal
          </Button>
          <Button
            variant="primary"
            size="md"
            fullWidth
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="bg-amber-500 hover:bg-amber-600 border-none font-extrabold text-white"
          >
            {isSubmitting ? 'Mengirim...' : 'Kirim Sanggahan'}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4 font-sans">
        <div className="bg-red-50 border border-red/30 rounded-xl p-3.5 text-xs text-red leading-relaxed flex gap-2 items-start">
          <Icon icon="heroicons:exclamation-triangle-20-solid" width="20" height="20" className="flex-shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block mb-0.5 text-red">Catatan Penolakan dari Admin:</strong>
            "{item?.catatanAdmin || 'Bukti transfer tidak terbaca / nominal kurang.'}"
          </div>
        </div>

        <FormField label="Alasan Sanggahan" id="teks-sanggahan-field" required error={error}>
          <textarea
            rows={3}
            value={teksSanggahan}
            onChange={(e) => {
              setTeksSanggahan(e.target.value);
              setError('');
            }}
            placeholder="Jelaskan alasan sanggahan (Contoh: Pembayaran sudah sesuai resi / sudah transfer ulang selisih Rp 50.000)."
            className="w-full text-sm p-3 border border-border rounded-xl focus:border-amber-500 focus:outline-none bg-warm-gray/10 font-medium"
          />
        </FormField>

        <FormField label="Foto Bukti Perbaikan (Opsional)" id="bukti-sanggahan-field">
          <input
            id="bukti-sanggahan-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="sr-only"
          />
          <label
            htmlFor="bukti-sanggahan-input"
            className="flex flex-col items-center justify-center gap-1.5 bg-warm-gray/50 border-2 border-dashed border-border rounded-xl p-4 cursor-pointer text-center hover:border-amber-500 transition-all"
          >
            <Icon icon="heroicons:arrow-up-tray-20-solid" className="size-6 text-amber-600" />
            <span className="text-xs font-bold text-text">
              {buktiSanggahanFile ? buktiSanggahanFile.name : 'Upload Foto Bukti Baru'}
            </span>
            <span className="text-xs text-text-3">Format JPG, PNG, atau WEBP (maks. 5MB)</span>
          </label>
          {previewBuktiSanggahan && (
            <div className="mt-2 border border-border rounded-lg p-2 bg-warm-gray/30 flex justify-center">
              <img src={previewBuktiSanggahan} alt="Preview Bukti Sanggahan" loading="lazy" className="max-h-36 rounded object-contain" />
            </div>
          )}
        </FormField>
      </div>
    </Modal>
  );
}

export default SanggahanModal;
