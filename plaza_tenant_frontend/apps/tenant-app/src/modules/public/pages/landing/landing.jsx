import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, Button, Card } from '@bunsay/shared-ui';
import { useTenantAuth } from '../../TenantAuthProvider';

function LandingPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useTenantAuth();

  const handleAuthRedirect = () => {
    if (isLoggedIn) {
      navigate('/tenant/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div data-slot="landing-page" className="page-fade-in bg-mono-50 min-h-dvh font-sans">
      <nav aria-label="Navigasi Beranda" className="landing-navbar h-18 bg-white/80 backdrop-blur-xl border-b border-border/80 sticky top-0 flex items-center justify-center sm:justify-between px-4 sm:px-6 md:px-10 z-40 shadow-xs transition-colors gap-2">
        <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 min-w-0">
          <picture className="shrink-0">
            <source srcSet="/assets/main_logo_transparent_for_light_bg.webp" type="image/webp" />
            <img
              src="/assets/main_logo_transparent_for_light_bg.png"
              alt="Logo Resmi Plaza Kebun Sayur"
              className="h-9 sm:h-11 w-auto object-contain shrink-0"
              width={176}
              height={44}
            />
          </picture>
          <span className="font-extrabold text-base xs:text-lg sm:text-xl md:text-2xl text-red tracking-tight truncate text-center sm:text-left">
            Plaza Kebun Sayur
          </span>
        </div>
      </nav>

      <main id="main-app" className="landing-page-shell max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-10">
        <div className="flex flex-col gap-8 md:gap-10 page-fade-in">
          <Card 
            padding="p-0"
            className="landing-hero-grid mobile-stack grid grid-cols-1 md:grid-cols-2 overflow-hidden items-center shadow-card-elevated border-border/80"
          >
            <div className="p-6 sm:p-8 md:p-10 flex flex-col items-start justify-center h-full gap-6 sm:gap-8">
              <div>
                <span className="label-micro text-red font-extrabold tracking-wider">
                  Pelayanan Resmi
                </span>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text leading-tight mt-2.5 tracking-tight text-balance">
                  Portal Layanan<br className="hidden sm:inline" /> Plaza Kebun Sayur
                </h1>
                <p className="text-text-2 text-sm sm:text-base font-medium mt-3 text-pretty leading-relaxed">
                  Layanan pembayaran sewa kios dan administrasi tenant Plaza Kebun Sayur Balikpapan.
                </p>
              </div>

              <div className="w-full">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="sm:w-auto h-11 px-6 text-sm sm:text-base font-bold gap-2 shadow-xs"
                  onClick={handleAuthRedirect}
                >
                  <span>{isLoggedIn ? 'Buka Dashboard' : 'Masuk Portal'}</span>
                  <Icon icon={isLoggedIn ? "material-symbols:dashboard" : "material-symbols:login"} className="size-5" />
                </Button>
              </div>
            </div>
            
            <div className="h-full min-h-60 md:min-h-80 overflow-hidden bg-mono-100/40 relative">
              <picture>
                <source srcSet="/assets/Photograph_of_plaza_building.webp" type="image/webp" />
                <img
                  src="/assets/Photograph_of_plaza_building.jpg"
                  alt="Gedung Plaza Kebun Sayur Balikpapan"
                  fetchPriority="high"
                  loading="eager"
                  decoding="async"
                  width={800}
                  height={600}
                  className="size-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </picture>
            </div>
          </Card>

          <div className="landing-info-grid mobile-stack grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <Card variant="elevated" className="p-4 sm:p-6 flex flex-col justify-start gap-3 rounded-2xl shadow-xs">
              <div>
                <div className="size-10 rounded-lg bg-mono-100 text-red flex items-center justify-center mb-3 border border-mono-200/60 shadow-xs">
                  <Icon icon="heroicons:clock-20-solid" className="size-5.5" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-text mb-2 text-balance">
                  Jam Operasional
                </h2>
                <p className="text-text-2 text-xs sm:text-sm font-normal leading-relaxed mb-3 text-pretty">
                  Waktu operasional gedung untuk pedagang dan pengunjung:
                </p>
                <div className="text-2xl sm:text-3xl font-bold text-red font-tabular-nums mb-1.5">
                  09.00 - 21.00 WITA
                </div>
                <div className="mt-2.5 flex items-center gap-1.5 text-xs sm:text-sm text-text font-semibold">
                  <Icon icon="heroicons:calendar-days-20-solid" className="size-4 text-red shrink-0" />
                  <span>Senin – Minggu (Setiap Hari)</span>
                </div>
              </div>
            </Card>

            <Card variant="elevated" className="flex flex-col justify-between p-4 sm:p-6 gap-4 rounded-2xl shadow-xs">
              <div>
                <div className="size-10 rounded-lg bg-green-bg text-green flex items-center justify-center mb-3 border border-green/20 shadow-xs">
                  <Icon icon="heroicons:building-office-20-solid" className="size-5.5" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-text mb-2 text-balance">
                  Kontak Pengelola
                </h2>
                
                <div className="space-y-1.5 text-xs sm:text-sm text-text font-medium leading-relaxed mb-3">
                  <p className="text-pretty"><strong>Alamat:</strong> Jl. Letjen Suprapto, Baru Ilir, Balikpapan Barat, Kaltim 76123</p>
                  <p className="text-pretty"><strong>Jam Pelayanan:</strong> 09.00 - 21.00 WITA (Lantai 3)</p>
                  <p className="text-pretty"><strong>Kontak Resmi:</strong> 0542-776 8882 / 0811-5901-119</p>
                </div>

                <div className="w-full h-40 rounded-lg overflow-hidden border border-border shadow-inner">
                  <iframe 
                    title="Peta Lokasi Resmi Plaza Kebun Sayur Balikpapan"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8925621789695!2d116.82155707448267!3d-1.2342929355704761!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x55155145b04a009%3A0xd023fb431afb2027!2sPlaza%20Kebun%20Sayur!5e0!3m2!1sen!2sus!4v1779193878240!5m2!1sen!2sus"
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen="" 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>

              <a
                href="https://wa.me/628115901119"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat WhatsApp Pengelola Plaza Kebun Sayur (buka di tab baru)"
                className="inline-flex items-center justify-center gap-2 bg-green-bg text-green hover:bg-green/10 border border-green h-10.5 rounded-xl text-sm font-bold shadow-xs transition-colors active:scale-[0.98] w-full"
              >
                <Icon icon="ic:baseline-whatsapp" className="size-5" ariaLabel="Ikon WhatsApp" />
                <span>Chat WhatsApp Pengelola</span>
              </a>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LandingPage;
