'use client';

import { useState } from 'react';
import { Shield, FileText, UserX, ChevronUp } from 'lucide-react';
import Logo from '@/components/Logo';
import './politicas.css';

type Section = 'privacidade' | 'termos' | 'exclusao';

export default function PoliticasPage() {
  const [activeSection, setActiveSection] = useState<Section>('privacidade');

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E5E5] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Logo width={100} color="#181818" />
          <div className="h-8 w-px bg-[#E5E5E5]" />
          <span className="text-sm text-[#666666]">Documentos Legais</span>
        </div>
        {/* Navigation Tabs */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <nav className="flex gap-1 overflow-x-auto scrollbar-hide -mb-px">
            <button
              onClick={() => setActiveSection('privacidade')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeSection === 'privacidade'
                  ? 'border-[#181818] text-[#181818]'
                  : 'border-transparent text-[#666666] hover:text-[#181818] hover:border-[#CCCCCC]'
              }`}
            >
              <Shield size={16} />
              Privacidade
            </button>
            <button
              onClick={() => setActiveSection('termos')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeSection === 'termos'
                  ? 'border-[#181818] text-[#181818]'
                  : 'border-transparent text-[#666666] hover:text-[#181818] hover:border-[#CCCCCC]'
              }`}
            >
              <FileText size={16} />
              Termos de Uso
            </button>
            <button
              onClick={() => setActiveSection('exclusao')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeSection === 'exclusao'
                  ? 'border-[#181818] text-[#181818]'
                  : 'border-transparent text-[#666666] hover:text-[#181818] hover:border-[#CCCCCC]'
              }`}
            >
              <UserX size={16} />
              Exclusão de Conta
            </button>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-lg border border-[#E5E5E5] p-6 sm:p-10">
          {activeSection === 'privacidade' && <PoliticaPrivacidade />}
          {activeSection === 'termos' && <TermosUso />}
          {activeSection === 'exclusao' && <ExclusaoConta />}
        </div>

        {/* Last update */}
        <p className="text-center text-xs text-[#999999] mt-8">
          Última atualização: 24 de fevereiro de 2026
        </p>
      </main>

      {/* Back to top */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 w-10 h-10 bg-[#181818] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#333333] transition-colors"
        aria-label="Voltar ao topo"
      >
        <ChevronUp size={20} />
      </button>
    </div>
  );
}

/* ========== POLÍTICA DE PRIVACIDADE ========== */
function PoliticaPrivacidade() {
  return (
    <article className="prose-custom">
      <h1>Política de Privacidade</h1>
      <p className="lead">
        A <strong>[Nome da Empresa]</strong>, pessoa jurídica de direito privado, com sede em [Endereço],
        inscrita no CNPJ/MF sob o nº [CNPJ], é a controladora dos dados pessoais tratados por meio do
        aplicativo <strong>[Nome do Aplicativo]</strong>.
      </p>
      <p>
        Esta Política de Privacidade descreve como coletamos, utilizamos, armazenamos e protegemos os seus
        dados pessoais, em conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 — LGPD)
        e demais normas aplicáveis.
      </p>

      <h2>1. Dados Pessoais Coletados</h2>
      <p>Podemos coletar as seguintes categorias de dados pessoais:</p>
      <ul>
        <li><strong>Dados de identificação:</strong> nome completo e endereço de e-mail;</li>
        <li><strong>Dados de acesso:</strong> informações de login (e-mail e senha criptografada);</li>
        <li><strong>Dados de uso:</strong> informações sobre como você utiliza o aplicativo, incluindo páginas acessadas, funcionalidades utilizadas e tempo de sessão;</li>
        <li><strong>Dados técnicos:</strong> endereço IP, tipo de dispositivo, sistema operacional, versão do navegador e identificadores únicos do dispositivo.</li>
      </ul>

      <h2>2. Finalidade do Tratamento de Dados</h2>
      <p>Os dados pessoais coletados são utilizados para as seguintes finalidades:</p>
      <ul>
        <li><strong>Funcionamento do serviço:</strong> permitir o cadastro, autenticação e acesso às funcionalidades do aplicativo;</li>
        <li><strong>Melhorias do serviço:</strong> analisar o uso do aplicativo para aprimorar funcionalidades, corrigir erros e otimizar a experiência do usuário;</li>
        <li><strong>Comunicação:</strong> enviar notificações, atualizações e comunicados relevantes sobre o serviço;</li>
        <li><strong>Segurança:</strong> detectar e prevenir atividades fraudulentas, abusos ou violações de segurança;</li>
        <li><strong>Cumprimento legal:</strong> atender obrigações legais, regulatórias e fiscais.</li>
      </ul>

      <h2>3. Base Legal para o Tratamento</h2>
      <p>
        O tratamento de dados pessoais é realizado com base nas seguintes hipóteses legais previstas na LGPD:
      </p>
      <ul>
        <li>Execução de contrato ou de procedimentos preliminares relacionados a contrato (Art. 7º, V);</li>
        <li>Legítimo interesse do controlador (Art. 7º, IX);</li>
        <li>Cumprimento de obrigação legal ou regulatória (Art. 7º, II);</li>
        <li>Consentimento do titular, quando aplicável (Art. 7º, I).</li>
      </ul>

      <h2>4. Compartilhamento de Dados</h2>
      <p>Seus dados pessoais poderão ser compartilhados com:</p>
      <ul>
        <li><strong>Prestadores de serviço:</strong> empresas que auxiliam na operação do aplicativo (hospedagem, análise de dados, envio de e-mails);</li>
        <li><strong>Autoridades públicas:</strong> quando exigido por lei, regulação ou ordem judicial;</li>
        <li><strong>Parceiros comerciais:</strong> somente com o seu consentimento expresso.</li>
      </ul>
      <p>
        Não vendemos, alugamos ou comercializamos seus dados pessoais com terceiros.
      </p>

      <h2>5. Armazenamento e Segurança</h2>
      <p>
        Os dados pessoais são armazenados em servidores seguros, protegidos por medidas técnicas e
        administrativas adequadas, incluindo criptografia, controle de acesso e monitoramento contínuo.
      </p>
      <p>
        Os dados serão mantidos pelo tempo necessário para cumprir as finalidades descritas nesta política
        ou conforme exigido por lei.
      </p>

      <h2>6. Direitos do Titular dos Dados</h2>
      <p>
        Conforme previsto na LGPD, você tem o direito de:
      </p>
      <ul>
        <li>Confirmar a existência de tratamento de dados pessoais;</li>
        <li>Acessar seus dados pessoais;</li>
        <li>Solicitar a correção de dados incompletos, inexatos ou desatualizados;</li>
        <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos;</li>
        <li>Solicitar a portabilidade dos dados;</li>
        <li>Solicitar a eliminação dos dados tratados com consentimento;</li>
        <li>Revogar o consentimento a qualquer momento;</li>
        <li>Obter informações sobre o compartilhamento de dados com terceiros.</li>
      </ul>
      <p>
        Para exercer qualquer um desses direitos, entre em contato pelo e-mail{' '}
        <strong>[E-mail de Contato]</strong>.
      </p>

      <h2>7. Cookies e Tecnologias Semelhantes</h2>
      <p>
        O aplicativo pode utilizar cookies e tecnologias semelhantes para melhorar a experiência de uso,
        coletar dados de navegação e personalizar conteúdo. Você pode gerenciar as preferências de cookies
        nas configurações do seu navegador.
      </p>

      <h2>8. Alterações nesta Política</h2>
      <p>
        Reservamo-nos o direito de modificar esta Política de Privacidade a qualquer momento. Alterações
        significativas serão comunicadas por meio do aplicativo ou por e-mail. O uso continuado do serviço
        após a publicação das alterações constitui aceitação da política atualizada.
      </p>

      <h2>9. Contato</h2>
      <p>
        Em caso de dúvidas, solicitações ou reclamações sobre esta Política de Privacidade ou sobre o
        tratamento de seus dados pessoais, entre em contato:
      </p>
      <ul>
        <li><strong>Empresa:</strong> [Nome da Empresa]</li>
        <li><strong>E-mail:</strong> [E-mail de Contato]</li>
      </ul>
    </article>
  );
}

/* ========== TERMOS DE USO ========== */
function TermosUso() {
  return (
    <article className="prose-custom">
      <h1>Termos de Uso</h1>
      <p className="lead">
        Estes Termos de Uso regulam a utilização do aplicativo <strong>[Nome do Aplicativo]</strong>,
        desenvolvido e mantido por <strong>[Nome da Empresa]</strong>.
      </p>
      <p>
        Ao acessar ou utilizar o aplicativo, você concorda com estes Termos. Caso não concorde com alguma
        disposição, recomendamos que não utilize o serviço.
      </p>

      <h2>1. Aceitação dos Termos</h2>
      <p>
        Ao criar uma conta ou utilizar o aplicativo <strong>[Nome do Aplicativo]</strong>, você declara
        que leu, compreendeu e concorda com estes Termos de Uso e com a nossa Política de Privacidade.
      </p>

      <h2>2. Descrição do Serviço</h2>
      <p>
        O <strong>[Nome do Aplicativo]</strong> é uma plataforma digital que oferece [breve descrição do serviço].
        O acesso ao serviço pode exigir cadastro e autenticação.
      </p>

      <h2>3. Cadastro e Conta do Usuário</h2>
      <p>Para utilizar o aplicativo, você deverá:</p>
      <ul>
        <li>Fornecer informações verdadeiras, completas e atualizadas;</li>
        <li>Manter a confidencialidade de suas credenciais de acesso;</li>
        <li>Notificar imediatamente sobre qualquer uso não autorizado da sua conta.</li>
      </ul>
      <p>
        Você é responsável por todas as atividades realizadas em sua conta.
      </p>

      <h2>4. Regras de Uso</h2>
      <p>Ao utilizar o aplicativo, você se compromete a não:</p>
      <ul>
        <li>Utilizar o serviço para fins ilícitos ou contrários à legislação vigente;</li>
        <li>Violar direitos de propriedade intelectual de terceiros;</li>
        <li>Transmitir vírus, malware ou qualquer código malicioso;</li>
        <li>Tentar acessar áreas restritas do sistema sem autorização;</li>
        <li>Utilizar mecanismos automatizados para extrair dados do aplicativo;</li>
        <li>Fornecer informações falsas ou fraudulentas.</li>
      </ul>

      <h2>5. Propriedade Intelectual</h2>
      <p>
        Todo o conteúdo do aplicativo, incluindo textos, gráficos, logotipos, ícones, imagens, software
        e demais materiais, é de propriedade exclusiva da <strong>[Nome da Empresa]</strong> ou de seus
        licenciadores e está protegido pelas leis de propriedade intelectual.
      </p>
      <p>
        É proibida a reprodução, distribuição, modificação ou utilização do conteúdo sem autorização prévia
        e expressa.
      </p>

      <h2>6. Disponibilidade do Serviço</h2>
      <p>
        A <strong>[Nome da Empresa]</strong> se empenha em manter o aplicativo disponível de forma contínua,
        mas não garante que o serviço será ininterrupto, livre de erros ou seguro em todas as circunstâncias.
      </p>
      <p>
        Podemos, a qualquer momento e sem aviso prévio, suspender, modificar ou descontinuar total ou
        parcialmente o serviço para manutenção, atualização ou por motivos técnicos.
      </p>

      <h2>7. Limitação de Responsabilidade</h2>
      <p>
        Na máxima extensão permitida pela legislação aplicável, a <strong>[Nome da Empresa]</strong> não
        será responsável por:
      </p>
      <ul>
        <li>Danos indiretos, incidentais, especiais ou consequentes decorrentes do uso ou impossibilidade de uso do aplicativo;</li>
        <li>Perdas de dados, lucros cessantes ou interrupção de negócios;</li>
        <li>Conteúdos de terceiros acessados por meio do aplicativo;</li>
        <li>Falhas causadas por eventos de força maior, problemas de conectividade ou ações de terceiros.</li>
      </ul>

      <h2>8. Indenização</h2>
      <p>
        Você concorda em indenizar e isentar a <strong>[Nome da Empresa]</strong>, seus diretores,
        funcionários e parceiros de qualquer reclamação, perda, dano ou despesa (incluindo honorários
        advocatícios) decorrentes do descumprimento destes Termos ou do uso indevido do aplicativo.
      </p>

      <h2>9. Modificação dos Termos</h2>
      <p>
        A <strong>[Nome da Empresa]</strong> reserva-se o direito de alterar estes Termos de Uso a qualquer
        momento. As alterações entrarão em vigor na data de sua publicação no aplicativo.
      </p>
      <p>
        O uso continuado do serviço após as alterações constitui aceitação dos novos termos. Recomendamos
        que você revise periodicamente esta página.
      </p>

      <h2>10. Rescisão</h2>
      <p>
        Podemos suspender ou encerrar o seu acesso ao aplicativo, a nosso critério, caso você viole estes
        Termos de Uso ou por qualquer outro motivo justificado, sem aviso prévio e sem obrigação de
        indenização.
      </p>

      <h2>11. Legislação Aplicável e Foro</h2>
      <p>
        Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da
        comarca de [Cidade/Estado] para dirimir quaisquer controvérsias, com renúncia a qualquer outro, por
        mais privilegiado que seja.
      </p>

      <h2>12. Contato</h2>
      <p>
        Em caso de dúvidas sobre estes Termos de Uso, entre em contato:
      </p>
      <ul>
        <li><strong>Empresa:</strong> [Nome da Empresa]</li>
        <li><strong>E-mail:</strong> [E-mail de Contato]</li>
      </ul>
    </article>
  );
}

/* ========== EXCLUSÃO DE CONTA ========== */
function ExclusaoConta() {
  return (
    <article className="prose-custom">
      <h1>Política de Exclusão de Conta</h1>
      <p className="lead">
        A <strong>[Nome da Empresa]</strong> respeita o seu direito de solicitar a exclusão da sua conta
        e dos seus dados pessoais, conforme previsto na Lei Geral de Proteção de Dados Pessoais (LGPD).
      </p>

      <h2>1. Como Excluir Sua Conta</h2>
      <p>
        Para solicitar a exclusão da sua conta no <strong>[Nome do Aplicativo]</strong>, siga os passos abaixo:
      </p>
      <div className="steps">
        <div className="step">
          <div className="step-number">1</div>
          <div className="step-content">
            <strong>Acesse o aplicativo</strong>
            <p>Faça login com suas credenciais no <strong>[Nome do Aplicativo]</strong>.</p>
          </div>
        </div>
        <div className="step">
          <div className="step-number">2</div>
          <div className="step-content">
            <strong>Vá em &quot;Minha Conta&quot;</strong>
            <p>No menu de navegação, acesse a seção <strong>&quot;Minha Conta&quot;</strong>.</p>
          </div>
        </div>
        <div className="step">
          <div className="step-number">3</div>
          <div className="step-content">
            <strong>Clique em &quot;Excluir Conta&quot;</strong>
            <p>Localize e clique no botão <strong>&quot;Excluir Conta&quot;</strong>.</p>
          </div>
        </div>
        <div className="step">
          <div className="step-number">4</div>
          <div className="step-content">
            <strong>Confirme a solicitação</strong>
            <p>Leia o aviso de confirmação e confirme que deseja prosseguir com a exclusão.</p>
          </div>
        </div>
      </div>

      <div className="alert alert-warning">
        <strong>Atenção:</strong> Você também pode solicitar a exclusão de conta enviando um e-mail para{' '}
        <strong>[E-mail de Contato]</strong> com o assunto &quot;Exclusão de Conta&quot;, informando o e-mail
        cadastrado no aplicativo.
      </div>

      <h2>2. O Que Acontece Após a Exclusão</h2>
      <p>Ao solicitar a exclusão da sua conta:</p>
      <ul>
        <li>Todos os seus dados pessoais serão permanentemente removidos dos nossos sistemas;</li>
        <li>Você perderá o acesso a todas as funcionalidades do aplicativo;</li>
        <li>Histórico de uso, configurações e preferências serão apagados;</li>
        <li>Esta ação é <strong>irreversível</strong> — não será possível recuperar a conta ou os dados após a exclusão.</li>
      </ul>

      <h2>3. Prazo para Exclusão</h2>
      <p>
        A exclusão dos dados será realizada em até <strong>30 (trinta) dias</strong> a partir da
        confirmação da solicitação. Durante este período, sua conta será desativada e você não terá
        acesso ao aplicativo.
      </p>

      <h2>4. Dados Que Podem Ser Retidos</h2>
      <p>
        Conforme previsto na LGPD e em outras legislações aplicáveis, alguns dados poderão ser mantidos
        mesmo após a exclusão da conta, exclusivamente para:
      </p>
      <ul>
        <li><strong>Cumprimento de obrigação legal ou regulatória:</strong> dados fiscais, financeiros ou contábeis que devem ser mantidos por prazo determinado por lei;</li>
        <li><strong>Exercício regular de direitos em processos judiciais, administrativos ou arbitrais;</strong></li>
        <li><strong>Proteção do crédito:</strong> quando permitido pela legislação vigente.</li>
      </ul>
      <p>
        Esses dados serão mantidos de forma anonimizada ou com acesso restrito, pelo prazo estritamente
        necessário, e serão eliminados após o cumprimento da finalidade legal.
      </p>

      <h2>5. Consequências da Exclusão</h2>
      <p>Ao excluir sua conta, você declara estar ciente de que:</p>
      <ul>
        <li>A exclusão é permanente e não pode ser revertida;</li>
        <li>Todos os benefícios, créditos ou saldos associados à conta serão perdidos;</li>
        <li>Para utilizar o serviço novamente, será necessário criar uma nova conta;</li>
        <li>Dados compartilhados com terceiros antes da exclusão poderão permanecer nos sistemas desses terceiros, conforme suas respectivas políticas de privacidade.</li>
      </ul>

      <h2>6. Contato</h2>
      <p>
        Em caso de dúvidas sobre o processo de exclusão de conta, entre em contato:
      </p>
      <ul>
        <li><strong>Empresa:</strong> [Nome da Empresa]</li>
        <li><strong>E-mail:</strong> [E-mail de Contato]</li>
      </ul>
    </article>
  );
}
