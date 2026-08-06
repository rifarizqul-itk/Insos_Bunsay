import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, Button, Card } from '@bunsay/shared-ui';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="page-fade-in bg-cream min-h-dvh font-sans">
      <nav className="landing-navbar h-[72px] bg-white border-b border-border sticky top-0 flex items-center justify-between px-6 md:px-10 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <picture>
            <source srcSet="/assets/main_logo_transparent_for_light_bg.webp" type="image/webp" />
            <img
              src="/assets/main_logo_transparent_for_light_bg.png"
              alt="Logo Resmi Plaza Kebun Sayur"
              className="h-11 w-auto object-contain"
              width={176}
              height={44}
            />
          </picture>
          <span className="font-extrabold text-xl md:text-2xl text-red tracking-tight text-balance">
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
                <h1 className="text-3xl sm:text-4xl md:text-[42px] font-extrabold text-text leading-tight mt-2.5 tracking-tight text-balance">
                  Selamat Datang<br className="hidden sm:inline" /> di Portal Plaza Bunsay
                </h1>
              </div>

              <div className="w-full">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="sm:w-auto h-13 px-8 text-base font-extrabold gap-2.5 shadow-md"
                  onClick={() => navigate('/auth')}
                >
                  LOGIN PORTAL
                  <Icon icon="material-symbols:login" width="22" height="22" />
                </Button>
              </div>
            </div>
            
            <div className="h-full min-h-[280px] md:min-h-[400px] overflow-hidden bg-warm-gray/30 relative">
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
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </picture>
            </div>
          </Card>

          <div className="landing-info-grid mobile-stack grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <Card variant="elevated" className="p-6 sm:p-8 flex flex-col justify-start gap-4">
              <div>
                <div className="size-12 rounded-xl bg-red-50 text-red flex items-center justify-center mb-4">
                  <Icon icon="heroicons:clock-20-solid" width="26" height="26" />
                </div>
                <h3 className="text-xl font-extrabold text-text mb-3 tracking-tight text-balance">
                  Jam Operasional Gedung
                </h3>
                <p className="text-text-2 text-base font-medium leading-relaxed mb-4 text-pretty">
                  Gedung Plaza Kebun Sayur buka setiap hari melayani pedagang dan pengunjung pada jam:
                </p>
                <div className="text-3xl sm:text-4xl font-extrabold text-red font-tabular-nums mb-2">
                  09.00 - 21.00 WITA
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm text-text font-bold">
                  <Icon icon="heroicons:calendar-days-20-solid" width="18" height="18" className="text-red flex-shrink-0" />
                  <span>Hari Senin s/d Hari Minggu (Buka Setiap Hari)</span>
                </div>
              </div>
            </Card>

            <Card variant="elevated" className="flex flex-col justify-between p-6 sm:p-8 gap-5">
              <div>
                <div className="size-12 rounded-xl bg-green-bg text-green flex items-center justify-center mb-4">
                  <Icon icon="heroicons:building-office-20-solid" width="26" height="26" />
                </div>
                <h3 className="text-xl font-extrabold text-text mb-3 tracking-tight text-balance">
                  Informasi Kontak Kantor Pengelola
                </h3>
                
                <div className="space-y-2 text-sm sm:text-base text-text font-medium leading-relaxed mb-4">
                  <p className="text-pretty"><strong>Alamat:</strong> Jl. Letjen Suprapto, Baru Ilir, Balikpapan Barat, Kaltim 76123</p>
                  <p className="text-pretty"><strong>Jam Pelayanan Kantor:</strong> 09.00 - 21.00 WITA (Lantai 3)</p>
                  <p className="text-pretty"><strong>Kontak Resmi:</strong> 0542-776 8882 / 0811-5901-119</p>
                </div>

                <div className="w-full h-48 rounded-xl overflow-hidden border border-border shadow-inner focus-within:ring-2 focus-within:ring-red">
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
                className="inline-flex items-center justify-center gap-2 bg-green-bg text-green hover:bg-green/10 border-2 border-green h-12 rounded-xl text-base font-extrabold text-decoration-none shadow-sm hover:shadow-md transition-all active:scale-[0.98] w-full"
              >
                <Icon icon="ic:baseline-whatsapp" width="22" height="22" ariaLabel="Ikon WhatsApp" />
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
