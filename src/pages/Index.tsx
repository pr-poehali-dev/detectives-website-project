import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/icon';

const LOGO_URL = "https://cdn.poehali.dev/projects/5a89d1ed-e4db-4e4f-9685-ae5d2d73a189/files/3c6a5cfc-c350-4319-bcf1-85098389464d.jpg";
const HERO_BG = "https://cdn.poehali.dev/projects/5a89d1ed-e4db-4e4f-9685-ae5d2d73a189/files/23f9c18b-113c-4905-bf9a-839866e351af.jpg";

const SEARCH_TYPES = [
  { key: 'inn', label: 'По ИНН', placeholder: 'Введите ИНН (10 или 12 цифр)...', icon: 'Building2' },
  { key: 'auto', label: 'По авто', placeholder: 'Номер авто (А001АА777)...', icon: 'Car' },
  { key: 'address', label: 'По адресу', placeholder: 'Введите адрес...', icon: 'MapPin' },
  { key: 'phone', label: 'По телефону', placeholder: '+7 (___) ___-__-__', icon: 'Phone' },
  { key: 'name', label: 'По ФИО', placeholder: 'Фамилия Имя Отчество...', icon: 'User' },
  { key: 'passport', label: 'По паспорту', placeholder: 'Серия и номер паспорта...', icon: 'FileText' },
];

const SERVICES = [
  { icon: 'Search', title: 'OSINT-разведка', desc: 'Сбор информации из открытых источников: соцсети, базы данных, реестры.' },
  { icon: 'Eye', title: 'Наружное наблюдение', desc: 'Профессиональная слежка и фиксация перемещений объекта наблюдения.' },
  { icon: 'Shield', title: 'Корпоративная безопасность', desc: 'Проверка сотрудников, партнёров, контрагентов и деловых связей.' },
  { icon: 'FileSearch', title: 'Розыск лиц', desc: 'Поиск пропавших людей, должников, свидетелей и скрывающихся лиц.' },
  { icon: 'Lock', title: 'Контрразведка', desc: 'Выявление слежки, прослушивания, промышленного шпионажа.' },
  { icon: 'Database', title: 'Проверка данных', desc: 'Верификация документов, биографии, сведений о собственности.' },
];

const Index = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchType, setSearchType] = useState('inn');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({ name: '', telegram: '', message: '' });
  const [contactSent, setContactSent] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  const navItems = [
    { id: 'home', label: 'Главная' },
    { id: 'osint', label: 'OSINT Инструмент' },
    { id: 'about', label: 'О нас' },
    { id: 'services', label: 'Услуги' },
    { id: 'contact', label: 'Контакты' },
  ];

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setActiveSection(id);
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = [...navItems].map(n => n.id);
      for (const id of sections.reverse()) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 120) {
          setActiveSection(id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchResult(null);
    setSearchError(null);
    try {
      const res = await fetch('https://functions.poehali.dev/427d5177-67b2-4f0b-808b-3ebc56f0b4e5', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: searchType, query: searchQuery.trim() }),
      });
      const data = await res.json();
      if (data.result) setSearchResult(data.result);
      else setSearchError(data.error || 'Данные не найдены');
    } catch {
      setSearchError('Ошибка соединения с сервером');
    }
    setIsSearching(false);
  };

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.message) return;
    setContactLoading(true);
    setContactError(null);
    try {
      const res = await fetch('https://functions.poehali.dev/222c382b-9804-4eca-800a-2cff04c36d47', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      const data = await res.json();
      if (data.ok) {
        setContactSent(true);
      } else {
        setContactError('Ошибка отправки. Попробуйте снова.');
      }
    } catch {
      setContactError('Ошибка соединения');
    }
    setContactLoading(false);
  };

  const currentSearchType = SEARCH_TYPES.find(t => t.key === searchType)!;

  return (
    <div className="min-h-screen" style={{ background: 'var(--dark)', color: 'var(--cream)' }}>

      {/* NAV */}
      <nav style={{ background: 'rgba(13,13,13,0.95)', borderBottom: '1px solid rgba(201,168,76,0.15)' }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollTo('home')}>
            <div className="w-10 h-10 rounded-full overflow-hidden" style={{ border: '1px solid rgba(201,168,76,0.4)' }}>
              <img src={LOGO_URL} alt="Detective Adapter" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="font-playfair text-sm font-bold leading-none" style={{ color: 'var(--gold)' }}>
                DETECTIVE
              </div>
              <div className="font-cormorant text-xs tracking-widest" style={{ color: 'var(--cream-dim)' }}>
                ADAPTER
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map(item => (
              <button key={item.id} onClick={() => scrollTo(item.id)}
                className="nav-link"
                style={{ color: activeSection === item.id ? 'var(--gold)' : 'var(--cream-dim)' }}>
                {item.label}
              </button>
            ))}
          </div>

          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ color: 'var(--gold)' }}>
            <Icon name={mobileMenuOpen ? 'X' : 'Menu'} size={22} />
          </button>
        </div>

        {mobileMenuOpen && (
          <div style={{ background: 'var(--dark-2)', borderTop: '1px solid rgba(201,168,76,0.1)' }}
            className="md:hidden px-6 py-4 space-y-3">
            {navItems.map(item => (
              <button key={item.id} onClick={() => scrollTo(item.id)}
                className="block nav-link py-2"
                style={{ color: activeSection === item.id ? 'var(--gold)' : 'var(--cream-dim)' }}>
                {item.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* HERO */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_BG} alt="" className="w-full h-full object-cover" style={{ opacity: 0.25 }} />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to bottom, rgba(13,13,13,0.7) 0%, rgba(13,13,13,0.5) 50%, rgba(13,13,13,1) 100%)'
          }} />
        </div>

        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(201,168,76,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.3) 1px, transparent 1px)',
          backgroundSize: '80px 80px'
        }} />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className="animate-fade-in-up">
            <div className="text-xs tracking-[0.4em] mb-6 font-cormorant" style={{ color: 'var(--gold)' }}>
              — ПРОФЕССИОНАЛЬНОЕ ДЕТЕКТИВНОЕ БЮРО —
            </div>
            <div className="w-24 h-24 mx-auto mb-8 rounded-full overflow-hidden"
              style={{ border: '2px solid rgba(201,168,76,0.5)', boxShadow: '0 0 40px rgba(201,168,76,0.15)' }}>
              <img src={LOGO_URL} alt="Detective Adapter" className="w-full h-full object-cover" />
            </div>
          </div>

          <h1 className="animate-fade-in-up delay-200 font-playfair mb-4"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 900, lineHeight: 1.1, color: 'var(--cream)' }}>
            Detective
            <span style={{ color: 'var(--gold)', fontStyle: 'italic' }}> Adapter</span>
          </h1>

          <div className="gold-line max-w-xs mx-auto my-6 animate-fade-in-up delay-300" />

          <p className="animate-fade-in-up delay-500 font-cormorant mb-10"
            style={{ fontSize: '1.3rem', color: 'var(--cream-dim)', maxWidth: '540px', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            Истина скрыта — мы её находим. Конфиденциальные расследования,
            OSINT-разведка и профессиональный сыск.
          </p>

          <div className="animate-fade-in-up delay-700 flex flex-wrap gap-4 justify-center mt-8">
            <button className="btn-gold" onClick={() => scrollTo('osint')}>
              Начать поиск
            </button>
            <button className="btn-gold" onClick={() => scrollTo('contact')}>
              Связаться с нами
            </button>
          </div>

          <div className="mt-16 flex justify-center gap-12 animate-fade-in delay-700">
            {[['15+', 'лет опыта'], ['1200+', 'дел закрыто'], ['99%', 'конфиденциальность']].map(([num, label]) => (
              <div key={label} className="text-center">
                <div className="font-playfair text-2xl font-bold" style={{ color: 'var(--gold)' }}>{num}</div>
                <div className="font-cormorant text-xs tracking-widest uppercase" style={{ color: 'var(--cream-dim)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce" style={{ color: 'var(--gold)', opacity: 0.5 }}>
          <Icon name="ChevronDown" size={20} />
        </div>
      </section>

      {/* OSINT */}
      <section id="osint" className="py-24 relative" style={{ background: 'var(--dark-2)' }}>
        <div className="absolute top-0 left-0 right-0 gold-line" />
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="text-xs tracking-[0.4em] mb-3 font-cormorant" style={{ color: 'var(--gold)' }}>
              — ИНСТРУМЕНТ РАССЛЕДОВАНИЯ —
            </div>
            <h2 className="section-title">OSINT Поиск</h2>
            <p className="font-cormorant mt-4" style={{ color: 'var(--cream-dim)', fontSize: '1.1rem' }}>
              Профессиональный инструмент разведки по открытым источникам
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            {SEARCH_TYPES.map(type => (
              <button key={type.key}
                onClick={() => { setSearchType(type.key); setSearchResult(null); setSearchError(null); setSearchQuery(''); }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-cormorant tracking-wide transition-all"
                style={{
                  background: searchType === type.key ? 'var(--gold)' : 'rgba(201,168,76,0.08)',
                  color: searchType === type.key ? 'var(--dark)' : 'var(--cream-dim)',
                  border: `1px solid ${searchType === type.key ? 'var(--gold)' : 'rgba(201,168,76,0.2)'}`,
                  fontWeight: searchType === type.key ? 600 : 400,
                }}>
                <Icon name={type.icon} fallback="Search" size={14} />
                {type.label}
              </button>
            ))}
          </div>

          <div className="vintage-border p-8" style={{ background: 'var(--dark)', border: '1px solid rgba(201,168,76,0.2)' }}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-8 h-8 flex items-center justify-center" style={{ color: 'var(--gold)' }}>
                <Icon name={currentSearchType.icon} fallback="Search" size={20} />
              </div>
              <div className="font-cormorant font-semibold text-lg" style={{ color: 'var(--cream)' }}>
                {currentSearchType.label}
              </div>
            </div>

            <div className="flex gap-3">
              <input
                className="detective-input flex-1"
                placeholder={currentSearchType.placeholder}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
              <button className="btn-gold flex items-center gap-2 whitespace-nowrap" onClick={handleSearch} disabled={isSearching}>
                {isSearching ? (
                  <span className="flex gap-1">
                    <span className="loading-dot" />
                    <span className="loading-dot" />
                    <span className="loading-dot" />
                  </span>
                ) : (
                  <>
                    <Icon name="Search" size={16} />
                    Найти
                  </>
                )}
              </button>
            </div>

            {searchResult && (
              <div className="mt-6 p-4" style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.2)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="FileSearch" size={16} style={{ color: 'var(--gold)' }} />
                  <span className="font-cormorant font-semibold text-sm tracking-widest uppercase" style={{ color: 'var(--gold)' }}>
                    Результаты расследования
                  </span>
                </div>
                <pre className="font-cormorant text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--cream)' }}>
                  {searchResult}
                </pre>
              </div>
            )}

            {searchError && (
              <div className="mt-4 flex items-center gap-2 font-cormorant" style={{ color: '#e57373' }}>
                <Icon name="AlertCircle" size={16} />
                {searchError}
              </div>
            )}

            <div className="mt-4 flex items-start gap-2">
              <Icon name="Lock" size={13} />
              <p className="font-cormorant text-xs" style={{ color: 'var(--cream-dim)', opacity: 0.6 }}>
                Все запросы защищены. Информация используется исключительно в законных целях.
              </p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 gold-line" />
      </section>

      {/* ABOUT */}
      <section id="about" className="py-24 relative" style={{ background: 'var(--dark)' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-xs tracking-[0.4em] mb-3 font-cormorant" style={{ color: 'var(--gold)' }}>
                — НАША ИСТОРИЯ —
              </div>
              <h2 className="font-playfair text-4xl font-bold mb-0" style={{ color: 'var(--cream)' }}>О нас</h2>
              <div style={{ width: '60px', height: '2px', background: 'var(--gold)', margin: '12px 0 24px' }} />
              <div className="space-y-5 font-cormorant" style={{ fontSize: '1.15rem', lineHeight: 1.8, color: 'var(--cream-dim)' }}>
                <p>
                  <span style={{ color: 'var(--gold)', fontStyle: 'italic', fontSize: '1.3rem' }}>Detective Adapter</span> —
                  команда профессионалов с опытом в сфере безопасности, разведки и расследований.
                  Мы работаем там, где обычные инструменты бессильны.
                </p>
                <p>
                  Наш подход сочетает классические методы детективной работы с
                  современными OSINT-технологиями. Каждое дело — конфиденциально,
                  законно и с гарантией результата.
                </p>
                <p>
                  Мы в Telegram:{' '}
                  <a href="https://t.me/DetectiveAdapter" target="_blank" rel="noopener noreferrer"
                    className="transition-colors hover:underline" style={{ color: 'var(--gold)' }}>
                    @DetectiveAdapter
                  </a>
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="vintage-border p-6" style={{ background: 'var(--dark-2)', border: '1px solid rgba(201,168,76,0.15)' }}>
                <img src={HERO_BG} alt="Detective Office" className="w-full h-64 object-cover" style={{ opacity: 0.6, filter: 'grayscale(40%)' }} />
                <div className="mt-6 space-y-3">
                  {[
                    ['Опыт работы', '15+ лет'],
                    ['Закрытых дел', '1200+'],
                    ['Конфиденциальность', '100%'],
                    ['Telegram', '@DetectiveAdapter'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between items-center py-2"
                      style={{ borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
                      <span className="font-cormorant text-sm" style={{ color: 'var(--cream-dim)' }}>{label}</span>
                      <span className="font-playfair text-sm font-bold" style={{ color: 'var(--gold)' }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-24 relative" style={{ background: 'var(--dark-2)' }}>
        <div className="absolute top-0 left-0 right-0 gold-line" />
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="text-xs tracking-[0.4em] mb-3 font-cormorant" style={{ color: 'var(--gold)' }}>
              — ЧТО МЫ ДЕЛАЕМ —
            </div>
            <h2 className="section-title">Услуги</h2>
            <p className="font-cormorant mt-4" style={{ color: 'var(--cream-dim)', fontSize: '1.1rem' }}>
              Полный спектр детективных и разведывательных услуг
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service, i) => (
              <div key={i} className="detective-card p-6 group">
                <div className="w-12 h-12 flex items-center justify-center mb-4"
                  style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}>
                  <Icon name={service.icon} fallback="Search" size={22} style={{ color: 'var(--gold)' }} />
                </div>
                <h3 className="font-playfair text-lg mb-3" style={{ color: 'var(--cream)' }}>{service.title}</h3>
                <p className="font-cormorant" style={{ color: 'var(--cream-dim)', lineHeight: 1.7, fontSize: '1.05rem' }}>
                  {service.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 gold-line" />
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-24" style={{ background: 'var(--dark)' }}>
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="text-xs tracking-[0.4em] mb-3 font-cormorant" style={{ color: 'var(--gold)' }}>
              — НАЧАТЬ РАБОТУ —
            </div>
            <h2 className="section-title">Контакты</h2>
            <p className="font-cormorant mt-4" style={{ color: 'var(--cream-dim)', fontSize: '1.1rem' }}>
              Опишите ваш вопрос — мы свяжемся с вами конфиденциально
            </p>
          </div>

          {contactSent ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 flex items-center justify-center mx-auto mb-6"
                style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid var(--gold)', borderRadius: '50%' }}>
                <Icon name="CheckCircle" size={30} style={{ color: 'var(--gold)' }} />
              </div>
              <h3 className="font-playfair text-2xl mb-3" style={{ color: 'var(--cream)' }}>Дело принято</h3>
              <p className="font-cormorant" style={{ color: 'var(--cream-dim)', fontSize: '1.1rem' }}>
                Ваше сообщение отправлено. Мы свяжемся с вами в ближайшее время.
              </p>
            </div>
          ) : (
            <form onSubmit={handleContact}>
              <div className="vintage-border p-8" style={{ background: 'var(--dark-2)', border: '1px solid rgba(201,168,76,0.2)' }}>
                <div className="space-y-5">
                  <div>
                    <label className="block font-cormorant text-sm tracking-widest uppercase mb-2" style={{ color: 'var(--gold)' }}>
                      Ваше имя *
                    </label>
                    <input className="detective-input"
                      placeholder="Как к вам обращаться..."
                      value={contactForm.name}
                      onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
                      required />
                  </div>
                  <div>
                    <label className="block font-cormorant text-sm tracking-widest uppercase mb-2" style={{ color: 'var(--gold)' }}>
                      Telegram
                    </label>
                    <input className="detective-input"
                      placeholder="@username"
                      value={contactForm.telegram}
                      onChange={e => setContactForm(f => ({ ...f, telegram: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block font-cormorant text-sm tracking-widest uppercase mb-2" style={{ color: 'var(--gold)' }}>
                      Опишите ваш вопрос *
                    </label>
                    <textarea className="detective-input resize-none"
                      rows={5}
                      placeholder="Расскажите о вашем деле..."
                      value={contactForm.message}
                      onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                      required />
                  </div>
                  {contactError && (
                    <div className="flex items-center gap-2 font-cormorant" style={{ color: '#e57373' }}>
                      <Icon name="AlertCircle" size={15} />
                      {contactError}
                    </div>
                  )}
                  <button type="submit" className="btn-gold w-full flex items-center justify-center gap-2" disabled={contactLoading}>
                    {contactLoading ? (
                      <span className="flex gap-1">
                        <span className="loading-dot" /><span className="loading-dot" /><span className="loading-dot" />
                      </span>
                    ) : (
                      <>
                        <Icon name="Send" size={16} />
                        Отправить заявку
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="mt-10 flex flex-wrap justify-center gap-8">
            <a href="https://t.me/DetectiveAdapter" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 font-cormorant transition-opacity hover:opacity-80"
              style={{ color: 'var(--cream-dim)', fontSize: '1rem' }}>
              <Icon name="Send" size={16} style={{ color: 'var(--gold)' }} />
              @DetectiveAdapter
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: 'var(--dark-3)', borderTop: '1px solid rgba(201,168,76,0.2)' }}>
        <div className="gold-line" />
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <div className="text-xs tracking-[0.5em] mb-4 font-cormorant" style={{ color: 'var(--gold)', opacity: 0.7 }}>
            — ДЕВИЗ —
          </div>
          <blockquote className="font-playfair"
            style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)', fontStyle: 'italic', color: 'var(--cream)', lineHeight: 1.3 }}>
            «Ваша безопасность — это наше дело»
          </blockquote>
          <div className="gold-line max-w-xs mx-auto my-8" />
          <div className="flex items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden" style={{ border: '1px solid rgba(201,168,76,0.3)' }}>
              <img src={LOGO_URL} alt="" className="w-full h-full object-cover" />
            </div>
            <span className="font-cormorant text-sm tracking-widest" style={{ color: 'var(--cream-dim)' }}>
              DETECTIVE ADAPTER © 2026
            </span>
          </div>
        </div>
        <div className="gold-line" />
        <div className="py-4 text-center font-cormorant text-xs" style={{ color: 'var(--cream-dim)', opacity: 0.3 }}>
          Все расследования проводятся строго в рамках закона РФ
        </div>
      </footer>
    </div>
  );
};

export default Index;