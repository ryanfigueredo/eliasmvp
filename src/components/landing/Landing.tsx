'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  ShieldCheck,
  Users,
  FolderTree,
  UploadCloud,
  Lock,
  Palette,
  Database,
  ArrowRight,
} from 'lucide-react'

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-zinc-50 text-zinc-900">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Hero />
        <Features />
        <HowItWorks />
        <Screenshots />
        <Pricing />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}

function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/70 border-b">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="#" className="flex items-center gap-2 font-semibold">
          <Image
            src="/logo.jpeg"
            alt="Evans Proc"
            width={28}
            height={28}
            className="rounded"
          />
          <span>Evans Proc</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-700">
          <a href="#recursos" className="hover:text-zinc-900">
            Recursos
          </a>
          <a href="#como-funciona" className="hover:text-zinc-900">
            Como Funciona
          </a>
          <a href="#screenshots" className="hover:text-zinc-900">
            Screenshots
          </a>
          <a href="#precos" className="hover:text-zinc-900">
            Preços
          </a>
          <a href="#depoimentos" className="hover:text-zinc-900">
            Depoimentos
          </a>
          <a href="#faq" className="hover:text-zinc-900">
            FAQ
          </a>
          <a href="#contato" className="hover:text-zinc-900">
            Contato
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button className="bg-[#9C66FF] hover:bg-[#8450e6] text-white">
              Entrar
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}

function SectionTitle({
  title,
  subtitle,
  id,
}: {
  title: string
  subtitle?: string
  id?: string
}) {
  return (
    <div id={id} className="text-center mb-10">
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h2>
      {subtitle && (
        <p className="mt-2 text-zinc-600 max-w-2xl mx-auto">{subtitle}</p>
      )}
    </div>
  )
}

function Hero() {
  return (
    <section className="pt-16 sm:pt-20 md:pt-24 pb-12">
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            Gestão de Documentos simples, rápida e preparada para White Label.
          </h1>
          <p className="mt-4 text-lg text-zinc-600">
            Organize clientes, lotes e documentos com segurança, permissões por
            perfil e armazenamento em nuvem.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/login">
              <Button className="bg-[#9C66FF] hover:bg-[#8450e6] text-white">
                Entrar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="#recursos">
              <Button variant="outline">Ver Recursos</Button>
            </a>
          </div>
          <p className="mt-4 text-sm text-zinc-500">
            Testado em operações reais.
          </p>
        </div>
        <div className="relative">
          <div className="rounded-2xl shadow-lg border bg-white p-4">
            <Image
              src="/window.svg"
              alt="Preview"
              width={800}
              height={500}
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function Features() {
  const items = [
    {
      icon: Users,
      title: 'Níveis de Acesso',
      desc: 'Master, Admin, Consultor — controle o que cada perfil pode ver e fazer.',
    },
    {
      icon: FolderTree,
      title: 'Clientes, Lotes e Documentos',
      desc: 'Organização por lotes e metadados para buscas rápidas.',
    },
    {
      icon: UploadCloud,
      title: 'Upload Seguro (AWS S3)',
      desc: 'Arquivos em nuvem com boas práticas.',
    },
    {
      icon: ShieldCheck,
      title: 'Autenticação NextAuth',
      desc: 'Login robusto e pronto para escalar.',
    },
    {
      icon: Database,
      title: 'PostgreSQL (Supabase)',
      desc: 'Base sólida para crescer.',
    },
    { icon: Palette, title: 'White Label', desc: 'Seu logo, suas cores.' },
  ]

  return (
    <section id="recursos" className="py-12">
      <SectionTitle
        title="Recursos"
        subtitle="Tudo que você precisa para operar com segurança e escala."
      />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((it, i) => (
          <div
            key={i}
            className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="h-10 w-10 rounded-lg bg-[#9C66FF]/10 text-[#9C66FF] flex items-center justify-center">
              <it.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-semibold">{it.title}</h3>
            <p className="mt-2 text-sm text-zinc-600">{it.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    {
      title: 'Cadastre clientes e permissões.',
      desc: 'Estruture sua equipe por perfis de acesso.',
    },
    {
      title: 'Crie lotes, faça upload e acompanhe status.',
      desc: 'Organize os documentos e acompanhe o progresso.',
    },
    {
      title: 'Compartilhe acesso e mantenha tudo organizado.',
      desc: 'Centralize e colabore com segurança.',
    },
  ]
  return (
    <section id="como-funciona" className="py-12">
      <SectionTitle title="Como Funciona" />
      <div className="grid md:grid-cols-3 gap-6">
        {steps.map((s, i) => (
          <div key={i} className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="text-[#9C66FF] font-bold">Passo {i + 1}</div>
            <h3 className="mt-2 font-semibold">{s.title}</h3>
            <p className="mt-2 text-sm text-zinc-600">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function Screenshots() {
  return (
    <section id="screenshots" className="py-12">
      <SectionTitle
        title="Screenshots"
        subtitle="Uma prévia do que você verá ao entrar."
      />
      <div className="grid md:grid-cols-3 gap-6">
        <Shot src="/window.svg" label="Dashboard" />
        <Shot src="/globe.svg" label="Documentos por Lote" />
        <Shot src="/logo.jpeg" label="Cadastro de Usuários" />
      </div>
    </section>
  )
}

function Shot({ src, label }: { src: string; label: string }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <Image
        src={src}
        alt={label}
        width={600}
        height={380}
        className="w-full h-auto rounded-lg"
      />
      <div className="mt-3 text-sm text-zinc-600">{label}</div>
    </div>
  )
}

function Pricing() {
  return (
    <section id="precos" className="py-12">
      <SectionTitle
        title="Preços"
        subtitle="Valores sob consulta durante o beta."
      />
      <div className="grid md:grid-cols-3 gap-6">
        <Plan
          name="Start"
          desc="Até 3 usuários, 10 GB."
          cta="Falar com especialista"
        />
        <Plan
          name="Pro"
          highlight
          desc="Usuários ilimitados, 200 GB, suporte prioritário."
          cta="Solicitar apresentação"
        />
        <Plan
          name="Enterprise"
          desc="White Label e integrações"
          cta="Solicitar proposta"
        />
      </div>
    </section>
  )
}

function Plan({
  name,
  desc,
  cta,
  highlight,
}: {
  name: string
  desc: string
  cta: string
  highlight?: boolean
}) {
  return (
    <div
      className={`rounded-2xl border p-6 shadow-sm bg-white ${highlight ? 'ring-2 ring-[#9C66FF]' : ''}`}
    >
      <div className="text-sm text-zinc-500">{name}</div>
      <h3 className="mt-1 font-semibold">{desc}</h3>
      <a href="#contato">
        <Button className="mt-4 bg-[#9C66FF] hover:bg-[#8450e6] text-white w-full">
          {cta}
        </Button>
      </a>
    </div>
  )
}

function Testimonials() {
  return (
    <section id="depoimentos" className="py-12">
      <SectionTitle title="Depoimentos" />
      <div className="grid md:grid-cols-2 gap-6">
        <Quote
          text="Organizamos nossa operação em uma semana."
          author="Luciano, KL Facilities"
        />
        <Quote
          text="White label nos permitiu vender o sistema."
          author="Pedro, Quero Parcelado LTDA"
        />
      </div>
    </section>
  )
}

function Quote({ text, author }: { text: string; author: string }) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <p className="text-zinc-800">“{text}”</p>
      <div className="mt-2 text-sm text-zinc-600">— {author}</div>
    </div>
  )
}

function FAQ() {
  const qa = [
    ['Preciso de servidor?', 'Não. É SaaS.'],
    ['Dá pra usar com minha marca?', 'Sim, white label.'],
    ['Exportação?', 'PDF/CSV sob demanda.'],
    ['App?', 'Web responsivo; app pode ser discutido.'],
    ['Integra com bancos?', 'Planejado para etapas futuras.'],
    ['Suporte?', 'Onboarding e suporte conforme plano.'],
  ]
  return (
    <section id="faq" className="py-12">
      <SectionTitle title="FAQ" />
      <div className="grid md:grid-cols-2 gap-6">
        {qa.map(([q, a], i) => (
          <div key={i} className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="font-semibold">{q}</div>
            <div className="mt-2 text-sm text-zinc-600">{a}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function CTA() {
  return (
    <section id="contato" className="py-16">
      <div className="rounded-2xl border bg-white p-8 shadow-sm text-center">
        <h3 className="text-2xl font-bold">
          Pronto para conhecer o Evans Proc?
        </h3>
        <p className="mt-2 text-zinc-600">
          Clique em Entrar para ver o sistema e falar com a equipe.
        </p>
        <Link href="/login">
          <Button className="mt-4 bg-[#9C66FF] hover:bg-[#8450e6] text-white">
            Entrar
          </Button>
        </Link>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="mt-10 border-t bg-white/70">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 text-sm text-zinc-700 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <nav className="flex flex-wrap gap-4">
          <a href="#recursos" className="hover:text-zinc-900">
            Recursos
          </a>
          <a href="#como-funciona" className="hover:text-zinc-900">
            Como Funciona
          </a>
          <a href="#precos" className="hover:text-zinc-900">
            Preços
          </a>
          <a href="#depoimentos" className="hover:text-zinc-900">
            Depoimentos
          </a>
          <a href="#faq" className="hover:text-zinc-900">
            FAQ
          </a>
          <a href="#contato" className="hover:text-zinc-900">
            Contato
          </a>
        </nav>
        <div className="text-zinc-500">© 2025 Evans Proc — DMTN Sistemas</div>
      </div>
    </footer>
  )
}
