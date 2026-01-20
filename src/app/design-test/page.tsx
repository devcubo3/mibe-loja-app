import { Logo } from '@/components/Logo';

export default function DesignTestPage() {
  return (
    <div className="page-container max-w-4xl mx-auto">
      <h1 className="text-header mb-xl">Design System Test</h1>

      {/* Logo */}
      <section className="mb-xl">
        <h2 className="section-title mb-md">Logo</h2>
        <div className="flex items-center gap-lg">
          <Logo width={165} />
          <Logo width={100} color="#666666" />
          <div className="bg-primary p-4 rounded-md">
            <Logo width={120} color="#FFFFFF" />
          </div>
        </div>
      </section>

      {/* Cores */}
      <section className="mb-xl">
        <h2 className="section-title mb-md">Cores</h2>
        <div className="grid grid-cols-4 gap-md">
          <div className="text-center">
            <div className="w-full h-16 bg-primary rounded-md mb-2" />
            <span className="text-caption">Primary</span>
          </div>
          <div className="text-center">
            <div className="w-full h-16 bg-secondary rounded-md mb-2" />
            <span className="text-caption">Secondary</span>
          </div>
          <div className="text-center">
            <div className="w-full h-16 bg-success rounded-md mb-2" />
            <span className="text-caption">Success</span>
          </div>
          <div className="text-center">
            <div className="w-full h-16 bg-error rounded-md mb-2" />
            <span className="text-caption">Error</span>
          </div>
          <div className="text-center">
            <div className="w-full h-16 bg-warning rounded-md mb-2" />
            <span className="text-caption">Warning</span>
          </div>
          <div className="text-center">
            <div className="w-full h-16 bg-input-bg border border-input-border rounded-md mb-2" />
            <span className="text-caption">Input BG</span>
          </div>
        </div>
      </section>

      {/* Tipografia */}
      <section className="mb-xl">
        <h2 className="section-title mb-md">Tipografia</h2>
        <div className="space-y-md">
          <p className="text-header">Header (32px Bold)</p>
          <p className="text-title">Title (24px Bold)</p>
          <p className="text-subtitle">Subtitle (18px Semibold)</p>
          <p className="text-body-lg">Body Large (16px)</p>
          <p className="text-body">Body (14px)</p>
          <p className="text-caption text-text-secondary">Caption (12px)</p>
        </div>
      </section>

      {/* Botões */}
      <section className="mb-xl">
        <h2 className="section-title mb-md">Botões</h2>
        <div className="flex flex-wrap gap-md">
          <button className="btn-primary">Primary</button>
          <button className="btn-secondary">Secondary</button>
          <button className="btn-danger">Danger</button>
          <button className="btn-ghost">Ghost</button>
          <button className="btn-primary" disabled>Disabled</button>
        </div>
        <div className="flex flex-wrap gap-md mt-md">
          <button className="btn-primary btn-sm">Small Primary</button>
          <button className="btn-secondary btn-sm">Small Secondary</button>
        </div>
      </section>

      {/* Inputs */}
      <section className="mb-xl">
        <h2 className="section-title mb-md">Inputs</h2>
        <div className="space-y-md max-w-md">
          <div>
            <label className="label-default">Email</label>
            <input type="email" className="input-default" placeholder="seu@email.com" />
          </div>
          <div>
            <label className="label-default">Com erro</label>
            <input type="text" className="input-default input-error" placeholder="Texto" />
            <span className="error-message">Este campo é obrigatório</span>
          </div>
          <div>
            <label className="label-default">Desabilitado</label>
            <input type="text" className="input-default" placeholder="Texto" disabled />
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="mb-xl">
        <h2 className="section-title mb-md">Cards</h2>
        <div className="grid grid-cols-3 gap-md">
          <div className="card-default">
            <p className="font-semibold">Card Default</p>
            <p className="text-caption text-text-secondary">Com borda</p>
          </div>
          <div className="card-filled">
            <p className="font-semibold">Card Filled</p>
            <p className="text-caption text-text-secondary">Com fundo</p>
          </div>
          <div className="card-highlight">
            <p className="font-semibold">Card Highlight</p>
            <p className="text-caption text-white/70">Fundo preto</p>
          </div>
        </div>
      </section>

      {/* Badges */}
      <section className="mb-xl">
        <h2 className="section-title mb-md">Badges</h2>
        <div className="flex flex-wrap gap-md">
          <span className="badge-dark">Dark</span>
          <span className="badge-success">Success</span>
          <span className="badge-error">Error</span>
          <span className="badge-warning">Warning</span>
          <span className="badge-light">Light</span>
        </div>
      </section>

      {/* Chips */}
      <section className="mb-xl">
        <h2 className="section-title mb-md">Chips/Filters</h2>
        <div className="flex flex-wrap gap-sm">
          <span className="chip">Todos</span>
          <span className="chip-active">Este mês</span>
          <span className="chip">Esta semana</span>
          <span className="chip">Hoje</span>
        </div>
      </section>
    </div>
  );
}
