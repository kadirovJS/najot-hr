import Image from 'next/image';

const partners = [
  { name: "IT Park", logo: "https://it-park.uz/storage/images/logos/logo.png" },
  { name: "Epam", logo: "https://www.epam.com/content/dam/epam/logos/epam_logo_light.svg" },
  { name: "PayMe", logo: "https://payme.uz/assets/images/payme-logo.svg" },
  { name: "Click", logo: "https://click.uz/static/img/logo.svg" },
  { name: "Ucell", logo: "https://ucell.uz/img/logo.png" },
  { name: "Beeline", logo: "https://beeline.uz/favicon.ico" },
];

export default function Partners() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-dark">Bizning hamkorlar</h2>
          <p className="text-gray-500 mt-4">Biz bilan birga ishlovchi yetakchi kompaniyalar</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center">
          {partners.map((partner, idx) => (
            <div key={idx} className="grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100 flex items-center justify-center p-4 bg-white rounded-xl shadow-sm w-full h-24">
              {/* Logolar uchun placeholder matn ishlatamiz agar rasm bo'lmasa */}
              <span className="font-bold text-gray-400 text-xl">{partner.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
