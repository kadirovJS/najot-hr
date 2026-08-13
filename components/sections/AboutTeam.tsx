import Link from 'next/link';
import { ArrowUpRight, BookOpenCheck, BrainCircuit, HandHeart, MessagesSquare, MoveUpRight, UsersRound } from 'lucide-react';

const paths = [
  { icon: BriefIcon, label: 'Ish izlayapman', title: 'Kuchli jamoaga qo‘shiling', text: 'O‘zingizga mos rolni toping va ta’lim kelajagiga hissa qo‘shing.', href: '/vacancies', cta: 'Vakansiyalarni ko‘rish' },
  { icon: BrainCircuit, label: 'O‘zimni sinayman', title: 'Bilimingizni tekshiring', text: 'Qisqa test orqali kuchli tomonlaringiz va rivojlanish nuqtalarini biling.', href: '/skills-check', cta: 'Testni boshlash' },
  { icon: UsersRound, label: 'Bizni taniyman', title: 'Muhitni his qiling', text: 'Bizni birlashtiradigan qadriyatlar, insonlar va ish uslubi bilan tanishing.', href: '#values', cta: 'Jamoani kashf etish' },
];

const values = [
  { icon: BookOpenCheck, title: 'O‘rganish — odat', text: 'Har bir tajriba biz uchun yangi bilim. O‘sishni ish jarayonining bir qismi qilamiz.' },
  { icon: MessagesSquare, title: 'Ochiq muloqot', text: 'Fikrni yashirmaymiz, tinglaymiz va aniqlik bilan birga yechimga kelamiz.' },
  { icon: HandHeart, title: 'Inson markazda', text: 'Qarorlarimiz o‘quvchi, ustoz va jamoaga qanday ta’sir qilishidan boshlanadi.' },
  { icon: MoveUpRight, title: 'Natijaga egalik', text: 'Tashabbus ko‘rsatamiz, va’damizga javob beramiz va natijani o‘lchaymiz.' },
];

function BriefIcon(props: React.ComponentProps<'svg'>) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"/></svg>;
}

export default function AboutTeam() {
  return (
    <>
      <section id="pathways" className="pathways-section">
        <div className="site-container">
          <div data-reveal className="section-heading split-heading"><div><span className="eyebrow">Platformadan boshlang</span><h2>Sizga kerakli yo‘l — bir qadam narida.</h2></div><p>Bu yerda faqat vakansiya emas: Najot Ta’lim jamoasida o‘zingizni sinash, jamoani tanish va yangi imkoniyatni boshlash mumkin.</p></div>
          <div data-stagger className="path-grid">
            {paths.map(({ icon: Icon, ...path }, index) => (
              <Link href={path.href} className={`path-card path-${index + 1}`} key={path.title}>
                <div className="path-top"><span className="path-index">0{index + 1}</span><Icon className="path-icon" /></div>
                <span className="path-label">{path.label}</span><h3>{path.title}</h3><p>{path.text}</p>
                <span className="path-link">{path.cta}<ArrowUpRight size={18} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="about-section">
        <div className="site-container about-layout">
          <div data-reveal className="about-statement"><span className="eyebrow eyebrow-light">Biz haqimizda</span><h2>Ta’limni o‘zgartirish — avvalo, <em>kuchli muhit</em> yaratishdan boshlanadi.</h2></div>
          <div data-reveal className="about-detail"><p>Najot Ta’lim — dasturlash, dizayn va marketing kabi zamonaviy kasblar o‘rgatiladigan markaz. Biz odamlarning kelajakka ishonchini amaliy bilim orqali mustahkamlaymiz.</p><p>Bugun Najot Ta’lim’da 350+ kishilik jamoamiz bir maqsad atrofida ishlaydi: O‘zbekistonda sifatli ta’limni yanada kengroq va ta’sirliroq qilish.</p><Link href="/vacancies">Biz bilan ishlash <ArrowUpRight size={18} /></Link></div>
        </div>
        <div className="marquee" aria-hidden="true"><div>O‘RGANAMIZ · ULASHAMIZ · O‘STIRAMIZ · O‘RGANAMIZ · ULASHAMIZ · O‘STIRAMIZ ·</div></div>
      </section>

      <section id="values" className="values-section">
        <div className="site-container values-layout">
          <div data-reveal className="values-intro"><span className="eyebrow">Bizni birlashtiradi</span><h2>Qadriyat — devordagi so‘z emas. Har kungi tanlov.</h2><p>Qanday gaplashishimizdan qanday natija chiqarishimizgacha — shu to‘rtta tamoyil yo‘limizni belgilaydi.</p></div>
          <div data-stagger className="values-list">
            {values.map(({ icon: Icon, title, text }, index) => <article key={title} className="value-row"><span>0{index + 1}</span><Icon /><div><h3>{title}</h3><p>{text}</p></div></article>)}
          </div>
        </div>
      </section>
    </>
  );
}
