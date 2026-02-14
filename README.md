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

De maneira resumida vou dar uma introdução a cada funcionalidade do sistema WhatsApp CRM

<h3 align="left">Dashboard</h3>

O DashBoard é onde o usuário poderá fazer toda a gestão LEADS, as mensagens quando chegam são notificadas e os chats ficam ordenados pela data da última mensagem do mais recente para o mais antigo. Pode-se também etiquetar o chat, fazer disparos de campanha, mensagens de repescagem, agendador de tarefas (envio de texto, foto ou vídeo em data programada), exportação de relatório de conversas, dentre outras funcionalidades.

<p align="center">
    <img src=".github/Fotos FrontEnd/Dashboard.png" alt="Dashboard" width="800px">
</p>

---

<h3 align="left">Chats</h3>

Dentro dos chats podemos mandar mensagens de texto, fotos, vídeos, documentos, figurinhas e áudio. Também temos o botão onde podemos mandar os textos pré-configurados, como veremos na imagem abaixo:

<p align="center">
    <img src=".github/Fotos FrontEnd/Chat 2.png" alt="Dashboard" width="800px">
</p>

Além disso temos também o botão da galeria, onde podemos salvar fotos e vídeos e depois mandar para qualquer outra pessoa:

<p align="center">
    <img src=".github/Fotos FrontEnd/Chat 3.png" alt="Dashboard" width="800px">
</p>

---

<h3 align="left">Etiquetas</h3>

Podemos cadastrar etiquetas para etiquetar os chats, depois que o chat for etiquetado, ele pode ser filtrado no filtro de etiquetas.

<p align="center">
    <img src=".github/Fotos FrontEnd/Gerenciador de Etiquetas.png" alt="Dashboard" width="800px">
</p>

---

<h3 align="left">Disparo de Campanha</h3>

Na funcionalidade Disparo de Campanha, podemos selecionar uma ou mais etiquetas para mandar as mensagens. Nas mensagens poderão conter: texto, fotos e vídeos. A idéia é nichar os chats e quando tiver uma promoção de determinado produto, mandaremos a promoção apenas para o público específico. Lembrando que por ser uma funcionalidade com risco de banimento de número (caso haja mais de 3% de denúncias de spam), teremos primeiro que marcar aquele chat como confiável.

<p align="center">
    <img src=".github/Fotos FrontEnd/Disparo de Campanha.png" alt="Dashboard" width="800px">
</p>

---

<h3 align="left">Galeria</h3>

Quando recebemos fotos ou vídeos dentro dos chats, poderemos clicar nas opções do arquivo e salvar esse arquivo na galeria, onde poderemos enviar para outros contatos posteriormente. No menu do sistema, também poderemos fazer upload de fotos direto do computador.

<p align="center">
    <img src=".github/Fotos FrontEnd/Galeria.png" alt="Dashboard" width="800px">
</p>

---

<h3 align="left">Menu do Sistema</h3>

No menu do sistema é onde poderemos fazer as configurações das seguintes funcionalidades:

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

Aqui é onde podemos mudar o nome do usuário, alterar a senha e alterar o e-mail. Lembrando que para alterar a senha e o e-mail teremos que verificar um código que será enviado no e-mail cadastrado, para confirmar que é realmente você que está alterando essas informações.

<p align="center">
    <img src=".github/Fotos FrontEnd/Info da Conta.png" alt="Dashboard" width="800px">
</p>

---

<h3 align="left">Rotinas Automáticas</h3>

Nas Rotinas automáticas poderemos fazer a repescagem. Para ativar a repescagem, o critério é que a última mensagem do chat deve ser RECEBIDA, e a partir do tempo configurado no painel da repescagem, o sistema mandará a primeira mensagem para o cliente, fazendo isso sucessivamente por até 7 mensagens. Depois que a última mensagem configurada for enviada e não tiver resposta por parte do LEAD, o chat será movido para a coluna "Lead Frio".

<p align="center">
    <img src=".github/Fotos FrontEnd/Rotinas Automáticas.png" alt="Dashboard" width="800px">
</p>

---

<h3 align="left">Textos Pré-Configurados</h3>

Os textos Pré-Configurados, são mensagens padrão que poderão ser salvas no sistema para agilizar na hora de responder clientes.

<p align="center">
    <img src=".github/Fotos FrontEnd/Textos Pré-Configurados.png" alt="Dashboard" width="800px">
</p>

---

<h3 align="left">Opções do Chat</h3>

Dentro de cada chat teremos as opções daquele respectivo chat. Nelas poderemos:

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
