# 🔴 J.A.R.V.I.S. Web — Neural HUD Operational System

[![License: MIT](https://img.shields.io/badge/License-MIT-red.svg)](https://opensource.org/licenses/MIT)
[![Node: >=20](https://img.shields.io/badge/Node-%3E%3D20-black.svg?logo=node.js&color=red)](https://nodejs.org/)
[![Framework: Next.js 16](https://img.shields.io/badge/Framework-Next.js%2016-black.svg?logo=next.js&color=red)](https://nextjs.org/)
[![UI: Red/Black HUD](https://img.shields.io/badge/UI-Futuristic%20HUD-red.svg)](https://react.dev/)

> **Just A Rather Very Intelligent System** — Uma assistente virtual de inteligência artificial futurista de alta fidelidade visual, com voz em tempo real, rede neural responsiva interativa e processador híbrido de comandos offline e online.

---

## 🌌 Visão Geral

O **JarvisWeb** foi totalmente redesenhado para evoluir de um chat comum de IA para uma **Neural HUD (Heads-Up Display)** profissional e minimalista inspirada nas interfaces de ficção científica da Stark Industries. 

A interface foca em um ambiente imersivo, com uma **paleta de cores Crimson & Deep Black** (`#050505` a `#ff2b2b`), scanner lines sutis, tipografia monocompilada de alta leitura e uma **Rede Neural viva em Canvas 3D** localizada no coração do sistema que pulsa, reage à sua voz e reflete os estados operacionais da IA em tempo real.

---

## ⚡ Funcionalidades de Destaque

*   🧠 **Rede Neural Interativa (Canvas)**: Animação fluida e de altíssima performance que interage em tempo real. Aumenta o brilho e treme na captura de voz (`isListening`), pulsa em ritmos orgânicos na fala (`isSpeaking`), e mantém-se viva no modo standby.
*   🛡️ **Sistema Híbrido de Comandos Offline**: Processamento sem custo e instantâneo no cliente para abrir aplicativos ou sites (ex: *"abrir spotify"*, *"tocar música"*, *"abrir canvas da puc"*). Comandos básicos não consomem OpenAI.
*   💻 **Abertura Inteligente de Apps (Native & Web)**: Detecta se um aplicativo está instalado localmente no seu computador (via `which`). Se instalado, executa a aplicação nativa; caso contrário, realiza o fallback transparente para a versão Web correspondente.
*   🎧 **Voz e Texto Sincronizados**: A assistente fala e escreve ao mesmo tempo, dividindo e reproduzindo as sentenças dinamicamente à medida que as partes da resposta são recebidas do stream.
*   ⏳ **Controle Anti-Rate-Limit Profissional**:
    *   **Retry com Backoff Exponencial**: Lida graciosamente com limites da OpenAI (erros 429) no servidor.
    *   **Fila de Requisições**: Garante que múltiplos comandos não se atropelem.
    *   **Cache Inteligente**: Armazena respostas frequentes localmente para economizar tokens e tempo de carregamento.
*   🕶️ **Estética Monocromática Sci-Fi**: Interface limpa de terminal-log que substitui balões de conversa clichês por logs técnicos operacionais detalhados.

---

## 🛠️ Stack Tecnológica

*   **Frontend**: Next.js 16 (App Router), React, TypeScript, TailwindCSS, Framer Motion, Zustand
*   **Engine Visual**: HTML5 Canvas, HSL Particle Mesh
*   **Voz & Captura**: Web Speech API (`SpeechRecognition` & `SpeechSynthesis`)
*   **Backend**: Next.js Serverless API Routes, Child Process Exec Bridge
*   **IA & Pesquisa**: OpenAI SDK (gpt-4o-mini com fallback /v1/responses), Brave Search API

---

## 📂 Arquitetura do Sistema

```
JarvisWeb/
├── app/                        # Roteamento e Estrutura App Router
│   ├── layout.tsx              # Componente principal do Layout
│   ├── page.tsx                # Página principal (Interface JarvisHUD)
│   └── api/
│       ├── chat/route.ts       # Endpoint seguro para Chat OpenAI e Streaming
│       ├── command/route.ts    # Ponte operacional segura para execução local
│       └── search/route.ts     # Proxy seguro da Brave Search API
├── components/
│   ├── chat/
│   │   ├── ChatArea.tsx        # Container central dos Logs de Terminal
│   │   ├── MessageBubble.tsx   # Logs operacionais da IA
│   │   ├── TypingIndicator.tsx # Indicador de processamento vermelho pulsante
│   │   └── WelcomeScreen.tsx   # Painel minimalista de standby inicial
│   ├── input/
│   │   ├── ChatInput.tsx       # Prompt de terminal elegante com atalhos
│   │   └── VoiceButton.tsx     # Botão do microfone com anéis de pulso vermelhos
│   ├── layout/
│   │   ├── Header.tsx          # Cabeçalho operacional
│   │   ├── Sidebar.tsx         # Histórico minimalista de comandos em painel
│   │   └── StatusIndicator.tsx # Indicadores de status ativos (listening, etc.)
│   ├── voice/
│   │   ├── AudioVisualizer.tsx # Osciloscópio dinâmico
│   │   └── VoiceSettings.tsx   # Painel de parâmetros de sintetização de voz
│   └── ui/
│       ├── AnimatedBackground.tsx # Grid de varredura sci-fi em background
│       ├── ApiKeyBanner.tsx    # Alerta vermelho elegante para erro de chave
│       ├── NeonButton.tsx      # Botões customizados em crimson glow
│       └── NeuralNetwork.tsx   # Canvas dinâmico de partículas
├── hooks/
│   ├── useChat.ts              # Orquestrador da IA, voz, cache e chamadas
│   ├── useSpeechRecognition.ts # Reconhecimento de voz do navegador
│   └── useSpeechSynthesis.ts   # Sintetizador de voz nativo do sistema
├── lib/
│   ├── commandParser.ts        # Parser híbrido offline / Whitelist de segurança
│   ├── requestQueue.ts         # Orquestrador de Backoff, Retry e Fila
│   ├── responseCache.ts        # Gerenciador de cache local com expiração
│   └── utils.ts                # Utilitários de classe
└── scripts/
    └── security-check.js       # Script de auditoria pré-commit
```

---

## ⚙️ Configuração e Instalação

### 1. Clonar o Repositório
```bash
git clone https://github.com/Ogasawara23/JarivisWeb.git
cd JarivisWeb
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto. Você pode copiar as variáveis do arquivo `.env.example`:
```bash
cp .env.example .env.local
```

Abra o arquivo `.env.local` e configure suas chaves de API com segurança (este arquivo é ignorado pelo Git):
```env
OPENAI_API_KEY=sk-proj-VjVi...  # Sua chave da OpenAI
OPENAI_MODEL=gpt-4o-mini        # Modelo principal
BRAVE_SEARCH_API_KEY=BSA...     # Opcional (Brave Search API)
```

---

## 🚀 Execução

### Modo de Desenvolvimento
```bash
npm run dev
```
Abra o endereço [http://localhost:3000](http://localhost:3000) no seu navegador Chrome ou Edge (recomendados para Web Speech).

### Build e Produção
```bash
npm run build
npm run start
```

### 🔍 Auditoria de Segurança Local
Antes de realizar qualquer commit ou push, execute o check automatizado para garantir que nenhuma chave real ou arquivo sensível esteja sendo exposto:
```bash
npm run security-check
```

---

## 🛡️ Segurança e Whitelist

*   **API Keys no Servidor**: O frontend nunca recebe as chaves de API. Toda a comunicação com a OpenAI ou Brave Search passa exclusivamente pelas API Routes (`/api/chat`, `/api/search`).
*   **Sanitização & Whitelist**: O endpoint `/api/command` valida todas as URLs e comandos contra uma whitelist restrita (com mais de 40 domínios autorizados como `open.spotify.com`, `claude.ai` e `canvas.pucpr.br`). Ações arbitrárias ou injeções de shell são totalmente bloqueadas na origem.

---

## 📄 Licença

Este projeto é open-source e está licenciado sob a [Licença MIT](LICENSE).
