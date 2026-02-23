<h1 align="center" style="font-weight: bold;">WhatsApp CRM 💻 - FrontEnd</h1>

<p align="center">
 <a href="#technologies">Tecnologias</a> • 
 <a href="#started">Telas e Funcionalidades</a> • 
 <a href="#config">Configurando o Projeto</a> • 
 <a href="#contribute">Contribuir</a>
</p>

<p align="center">
    <b>Plataforma de CRM integrada à API do WhatsApp que automatiza toda a gestão e nutrição de leads, otimizando o atendimento e aumentando a conversão de clientes para empresas.</b>
</p>

<h2 id="layout">🎨 Layout</h2>

<p align="center">
    <img src=".github/Fotos FrontEnd/Dashboard.png" alt="Dashboard" width="800px">
    <img src=".github/Fotos FrontEnd/Dashboard 2.png" alt="Dashboard" width="800px">
</p>

---

<h2 id="technologies">💻 Tecnologias</h2>

- React 18 - Biblioteca principal para UI (usando react-dom/client)
- TypeScript - Linguagem de programação tipada
- Vite - Build tool e bundler
- VS Code

<h3 align="left">Estilização</h3>

- Tailwind CSS - Framework CSS utilitário
- CSS Modules - Arquivos .css customizados
- Shadcn/ui - Biblioteca de componentes UI (inclui componentes como Card, Button, Input, Badge, DropdownMenu, Toast, Tooltip, Sonner)

<h3 align="left">Comunicação com Backend</h3>

- Fetch API - Requisições HTTP nativas
- Server-Sent Events (SSE) - Notificações em tempo real
- EventSource - Para conexão SSE

<h3 align="left">Autenticação & Segurança</h3>

- JWT (JSON Web Tokens) - Sistema de autenticação com refresh automático
- LocalStorage - Armazenamento de tokens e dados locais

<h3 align="left">Notificações</h3>

- Toast Notifications - Sistema de notificações toast (Shadcn/ui Toaster + Sonner)
- Real-time Notifications - Via SSE

<h3 align="left">Recursos Específicos</h3>

- Emoji Picker - Seletor de emojis customizado
- QR Code - Conexão via QR Code
- Audio/Video Players - Players customizados para mídia
- Document Viewer - Visualizador de documentos
- Gallery Modal - Galeria de imagens/vídeos
- Tag System - Sistema de tags coloridas
- Task Manager - Gerenciador de tarefas
- Routines - Sistema de rotinas/automações
- Campaign Manager - Gerenciador de campanhas
- Pre-configured Texts - Textos pré-configurados

---

<h2 id="started">Telas e Funcionalidades</h2>

Conheça um panorama das funcionalidades estratégicas do WhatsApp CRM, projetadas para transformar a comunicação com clientes em uma experiência ágil, inteligente e altamente eficiente.

<h3 align="center">Dashboard</h3>

O Dashboard é o centro de comando do sistema, onde o usuário gerencia toda a operação de leads de forma estratégica e intuitiva. As mensagens recebidas são notificadas em tempo real, enquanto os chats são organizados automaticamente do mais recente ao mais antigo, garantindo agilidade no atendimento. A plataforma também oferece recursos avançados como etiquetagem de conversas, disparo de campanhas, mensagens de reengajamento, agendamento inteligente de envios (texto, imagem ou vídeo), exportação de relatórios detalhados de interações e diversas outras funcionalidades projetadas para maximizar produtividade e resultados.

<p align="center">
    <img src=".github/Fotos FrontEnd/Dashboard.png" alt="Dashboard" width="800px">
</p>

---

<h3 align="left">Chats</h3>

Dentro dos chats, o usuário conta com uma experiência completa de comunicação, podendo enviar mensagens de texto, imagens, vídeos, documentos, emojis e áudios de forma rápida e integrada. Além disso, a plataforma disponibiliza um botão exclusivo para envio de respostas pré-configuradas, permitindo agilizar atendimentos, padronizar comunicações e aumentar a eficiência operacional — como ilustrado na imagem abaixo.

<p align="center">
    <img src=".github/Fotos FrontEnd/Chat 2.png" alt="Dashboard" width="800px">
</p>

Além disso, a plataforma conta com um botão de Galeria, que permite armazenar fotos e vídeos para reutilização sempre que necessário, possibilitando o envio rápido desses arquivos para qualquer contato. Esse recurso otimiza o tempo de atendimento, facilita o compartilhamento de conteúdos e garante mais praticidade na comunicação.

<p align="center">
    <img src=".github/Fotos FrontEnd/Chat 3.png" alt="Dashboard" width="800px">
</p>

---

<h3 align="left">Etiquetas</h3>

O sistema também permite cadastrar etiquetas personalizadas para organizar os chats de forma estratégica. Após etiquetar uma conversa, ela pode ser facilmente localizada por meio do filtro de etiquetas, proporcionando mais controle, agilidade na gestão e uma visão segmentada dos atendimentos.

<p align="center">
    <img src=".github/Fotos FrontEnd/Gerenciador de Etiquetas.png" alt="Dashboard" width="800px">
</p>

---

<h3 align="left">Disparo de Campanha</h3>

Na funcionalidade Disparo de Campanha, é possível selecionar uma ou múltiplas etiquetas para enviar mensagens segmentadas, que podem incluir texto, imagens e vídeos. Esse recurso permite direcionar promoções e comunicações apenas para públicos específicos, aumentando a relevância das campanhas e as chances de conversão. Para garantir segurança e conformidade com boas práticas de uso — já que taxas elevadas de denúncias de spam podem gerar restrições — o sistema exige que o contato seja previamente marcado como confiável antes do envio, assegurando campanhas mais seguras e eficientes.

<p align="center">
    <img src=".github/Fotos FrontEnd/Disparo de Campanha.png" alt="Dashboard" width="800px">
</p>

---

<h3 align="left">Galeria</h3>

Sempre que fotos ou vídeos são recebidos nos chats, o usuário pode salvá-los diretamente na Galeria por meio das opções do próprio arquivo, permitindo reutilizar e encaminhar esse conteúdo para outros contatos de forma rápida e prática. Além disso, o sistema também possibilita o upload de mídias diretamente do computador pelo menu principal, ampliando a flexibilidade e agilizando o compartilhamento de materiais.

<p align="center">
    <img src=".github/Fotos FrontEnd/Galeria.png" alt="Dashboard" width="800px">
</p>

---

<h3 align="left">Menu do Sistema</h3>

O menu do sistema reúne todas as configurações essenciais da plataforma, permitindo personalizar e gerenciar de forma centralizada as seguintes funcionalidades:

- Gerenciar Etiquetas
- Rotinas Automáticas
- Textos Pré-Configurados
- Galeria
- Disparo de Campanha
- Configurações
- Sair

<p align="center">
    <img src=".github/Fotos FrontEnd/Menu.png" alt="Dashboard" width="800px">
</p>

---

<h3 align="left">Informações da Conta</h3>

Nesta seção, o usuário pode atualizar seus dados de acesso com total segurança, incluindo alteração de nome, senha e e-mail. Para mudanças sensíveis como senha e endereço de e-mail, o sistema realiza uma verificação por código enviado ao e-mail cadastrado, garantindo autenticação do solicitante e proteção adicional contra acessos não autorizados.

<p align="center">
    <img src=".github/Fotos FrontEnd/Info da Conta.png" alt="Dashboard" width="800px">
</p>

---

<h3 align="left">Rotinas Automáticas</h3>

Na funcionalidade de Rotinas Automáticas, é possível configurar a repescagem de leads de forma inteligente e estratégica. O sistema identifica automaticamente conversas cuja última mensagem foi recebida e, após o intervalo definido no painel, inicia o envio sequencial de mensagens programadas — podendo chegar a até 7 tentativas de reengajamento. Caso não haja resposta após a última mensagem configurada, o chat é automaticamente movido para a coluna “Lead Frio”, mantendo o funil organizado e permitindo que a equipe foque nos contatos com maior potencial de conversão.

<p align="center">
    <img src=".github/Fotos FrontEnd/Rotinas Automáticas.png" alt="Dashboard" width="800px">
</p>

---

<h3 align="left">Textos Pré-Configurados</h3>

Os Textos Pré-Configurados permitem salvar mensagens padrão diretamente no sistema, agilizando respostas, padronizando a comunicação e garantindo mais produtividade no atendimento ao cliente.

<p align="center">
    <img src=".github/Fotos FrontEnd/Textos Pré-Configurados.png" alt="Dashboard" width="800px">
</p>

---

<h3 align="left">Opções do Chat</h3>

Dentro de cada chat, o usuário tem acesso a um painel de ações exclusivas da conversa, onde é possível executar diversas operações estratégicas, como:

- Etiquetar o respectivo chat. (com 1 ou mais etiquetas)
- Agendar uma tarefa para aquele chat. (Enviar uma mensagem, foto ou vídeo em uma determinada data).
- Resetar as rotinas automáticas
- Ocultar o Chat
- Marcar o chat como confiável. (Requisito para a funcionalidade de disparo de campanha).
- E, por último, mover o chat para uma das colunas existentes. (Lembrando que as colunas "Repescagem" e "Tarefa" são exclusivas do sistema.

<p align="center">
    <img src=".github/Fotos FrontEnd/Tab.png" alt="Dashboard" width="800px">
</p>

---

<h2 id="config">🚀 Configurando o Projeto</h2>

<h3>Pré-Requisitos</h3>

- [NodeJS](https://nodejs.org/en/download)
- Para usar o NPM dentro do VsCode, execute o seguinte comando no CMD da IDE:

```bash
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

<h3>Clonando</h3>

Código para clonar o Projeto:

```bash
git clone git@github.com:BrunoBoreli33/clinichub-front.git
```

<h3>Iniciando o Projeto no VsCode</h3>

Execute o seguinte comando no CMD do VsCode:

```bash
npm run dev
```


<h2 id="contribute">📫 Contribuir</h2>

1. `git clone git@github.com:BrunoBoreli33/clinichub-front.git`
2. Crie uma branch para cada funcionalidade ou correção nova
3. Siga os padrões de commit
4. Abra um Pull Request explicando o problema resolvido ou a funcionalidade implementada, se houver, anexe uma captura de tela das modificações visuais e aguarde a revisão!
