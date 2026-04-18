# ⏱️ Pontuará

![Status do Projeto](https://img.shields.io/badge/Status-Em%20Desenvolvimento-purple)
![Stack](https://img.shields.io/badge/Stack-Web-blue)
![License](https://img.shields.io/badge/License-MIT-green)

Este repositório contém o projeto **Pontuará**, um sistema web voltado para o gerenciamento de ponto eletrônico de funcionários, permitindo o registro, controle e acompanhamento de jornadas de trabalho de forma eficiente e centralizada.

## 📄 Sobre o projeto

O **Pontuará** tem como objetivo fornecer uma solução digital para registro e gestão de ponto eletrônico, facilitando o controle de entradas, saídas, pausas e horas trabalhadas, tanto para funcionários quanto para gestores.

O sistema contempla funcionalidades de autenticação, controle de acesso, cadastro de usuários e gerenciamento de registros de ponto, com foco em usabilidade e confiabilidade dos dados.

<p align="center">
  <img src="https://github.com/user-attachments/assets/6e4ad579-9b09-4b8e-ae73-055255b0915d" width="108" />
</p>

<p align="center">
  <em>Logotipo do sistema</em>
</p>


## 🎯 Objetivos específicos

- Permitir autenticação segura (incluindo login com Google).
- Realizar cadastro e gerenciamento de usuários (funcionários).
- Registrar marcações de ponto (entrada, saída, pausas).
- Gerenciar projetos e trabalhos vinculados ao tempo registrado.
- Validar vínculo de funcionários com a organização.
- Disponibilizar histórico de registros de ponto.
- Garantir controle de permissões por tipo de usuário.
- Visualização de gráficos e informativos.

## 🚀 Funcionalidades principais

### 🔐 Autenticação de usuários
- Login com e-mail e senha  
- Login com conta Google  
- Recuperação de senha  

### 👤 Gestão de usuários
- Cadastro de funcionários  
- Validação de vínculo  
- Controle de permissões  

### ⏱️ Registro de ponto
- Marcação de entrada e saída  
- Controle de pausas  
- Histórico de registros  

### 📊 Gestão de atividades
- Dashboard com dados quantitativos do desempenho geral da organização
- Monitoramento de trabalhos

## 🚀 Como executar

### Pré-requisitos

- Node.js / Python
- Gerenciador de pacotes (npm, pip, etc.)

### Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/pontuara.git
   cd pontuara
   ```
2. Instale as dependências
3. Execute o projeto

### Configuração do backend com Supabase

1. Crie o arquivo `backend/.env` com base em `backend/.env.example`.
2. Preencha pelo menos:
   ```env
   SUPABASE_URL=https://seu-projeto.supabase.co
   SUPABASE_KEY=sua-chave-do-supabase
   ```
3. Se os nomes das tabelas no Supabase forem diferentes, ajuste:
   ```env
   SUPABASE_USUARIOS_TABLE=usuarios
   SUPABASE_TRABALHOS_TABLE=trabalhos
   SUPABASE_EXPEDIENTES_TABLE=expedientes
   ```
4. Suba o backend normalmente. Os endpoints de `usuarios`, `trabalhos` e `expedientes` passam a usar a API REST do Supabase.

As tabelas do Supabase precisam conter colunas compatíveis com os schemas atuais da API:

- `usuarios`: `id`, `criado_em`, `nome`, `sobrenome`, `email`, `telefone`, `tipo_usuario`, `senha`
- `trabalhos`: `id`, `criado_em`, `empregador_id`, `titulo`, `descricao`, `categoria`, `projeto`
- `expedientes`: `id`, `funcionario_id`, `data_hora_inicio`, `data_hora_fim`

## 📂 Estrutura do repositório

  ```
📂 pontuara/
├── 📂 frontend/ # Interface do usuário
├── 📂 backend/ # API e regras de negócio
├── 📂 database/ # Scripts e modelos de dados
├── 📄 README.md # Documentação do projeto
└── 📄 LICENSE # Licença
  ```

## ⚠️ Avisos importantes

> [!IMPORTANT]
> **Controle de dados sensíveis:** O sistema lida com dados de jornada de trabalho. É essencial garantir práticas adequadas de segurança, como criptografia, autenticação robusta e controle de acesso.

> [!NOTE]
> **Conformidade legal:** Sistemas de ponto eletrônico devem seguir regulamentações trabalhistas vigentes. Este projeto pode necessitar de adequações para uso em ambientes produtivos.

## 📝 Licença

Este projeto está sob a licença MIT. Consulte o arquivo `LICENSE` para mais detalhes.
