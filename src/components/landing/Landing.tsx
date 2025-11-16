'use client'

import Link from 'next/link'
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
  Layers,
  CheckCircle2,
  Cog,
} from 'lucide-react'

export default function Landing() {
  return (
    <div className="min-h-screen bg-[radial-gradient(1000px_600px_at_10%_-10%,rgba(212,175,55,0.06),transparent_60%),radial-gradient(800px_500px_at_90%_-20%,rgba(16,16,16,0.05),transparent_60%)] bg-white text-zinc-900">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Hero />
        <Features />
        <HowItWorks />
        <Screenshots />
        <Pricing />
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
          <Layers className="h-6 w-6 text-[var(--brand-primary)]" />
          <span className="tracking-tight">Evans Proc</span>
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
          <a href="#contato" className="hover:text-zinc-900">
            Contato
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button>
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
      <div className="max-w-3xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
          Gestão de Documentos simples, rápida e preparada para White Label.
        </h1>
        <p className="mt-4 text-lg text-zinc-600">
          Organize clientes, lotes e documentos com segurança, permissões por
          perfil e armazenamento em nuvem. Sem distrações — foco total na sua operação.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/login">
            <Button>
              Entrar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <a href="#recursos">
            <Button variant="outline">Ver Recursos</Button>
          </a>
        </div>
        <div className="mt-6 flex flex-wrap gap-6 text-sm text-zinc-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[var(--brand-primary)]" />
            Segurança e controle de acesso
          </div>
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-[var(--brand-primary)]" />
            Base sólida em PostgreSQL
          </div>
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-[var(--brand-primary)]" />
            White label pronto
          </div>
        </div>
        <p className="mt-4 text-sm text-zinc-500">Testado em operações reais.</p>
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
            <div className="h-10 w-10 rounded-lg bg-[color-mix(in_oklab,var(--brand-primary)_12%,transparent)] text-[var(--brand-primary)] flex items-center justify-center">
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
            <div className="text-[var(--brand-primary)] font-bold">Passo {i + 1}</div>
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
        title="Visão Geral"
        subtitle="Sem imagens por enquanto — aqui está o que você encontrará ao acessar."
      />
      <div className="grid md:grid-cols-3 gap-6">
        <TextShot icon={Layers} title="Dashboard">
          Resumo de documentos, lotes, status e indicadores em tempo real.
        </TextShot>
        <TextShot icon={FolderTree} title="Documentos por Lote">
          Organização por clientes e lotes com filtros rápidos e exportações.
        </TextShot>
        <TextShot icon={Users} title="Gestão de Usuários">
          Convide a equipe, controle permissões e acompanhe atividades.
        </TextShot>
      </div>
    </section>
  )
}

function TextShot({
  icon: Icon,
  title,
  children,
}: {
  icon: any
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-[color-mix(in_oklab,var(--brand-primary)_12%,transparent)] text-[var(--brand-primary)] flex items-center justify-center">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="font-semibold">{title}</div>
          <div className="mt-1 text-sm text-zinc-600">{children}</div>
        </div>
      </div>
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
      className={`rounded-2xl border p-6 shadow-sm bg-white ${highlight ? 'ring-2 ring-[var(--brand-primary)]' : ''}`}
    >
      <div className="text-sm text-zinc-500">{name}</div>
      <h3 className="mt-1 font-semibold">{desc}</h3>
      <a href="#contato">
        <Button className="mt-4 w-full">
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
        <h3 className="text-2xl font-bold">Pronto para conhecer o Evans Proc?</h3>
        <p className="mt-2 text-zinc-600">
          Fale com nosso especialista para tirar dúvidas e receber uma apresentação.
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          Especialista em restauração de crédito, CADIN, BACEN e limpa nome.
        </p>
        <a
          href="https://wa.me/554488318897?text=Ol%C3%A1%2C%20vim%20do%20site%20Evans%20Proc%20e%20gostaria%20de%20conhecer%20a%20plataforma."
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button className="mt-4">
            Falar no WhatsApp
          </Button>
        </a>
        <div className="mt-3 text-xs text-zinc-500">
          ou{' '}
          <Link href="/login" className="underline">
            entrar no sistema
          </Link>
        </div>
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
