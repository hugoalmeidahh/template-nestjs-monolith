# Template Api Monolith

## 📌 Sobre o Projeto

O **Template Api Monolith** foi desenvolvido utilizando **NestJS** e possui um sistema de autenticação e autorização baseado em **Basic Auth**. Além disso, todas as operações são registradas em logs transacionais para garantir rastreabilidade e segurança.

## 🚀 Tecnologias Utilizadas

- **NestJS** - Framework para Node.js
- **Prisma ORM** - Gerenciamento de banco de dados
- **Pino** - Biblioteca para logging
- **Swagger** - Documentação interativa da API

## 🚀 Documentação técnica
👉 [Documentação Técnica](https://hugopsfinance.atlassian.net/wiki/spaces/adv/pages/28966914/Especifica+o+T+cnica)

## 📜 Documentação da API

A API possui uma documentação interativa configurada no Swagger, acessível através da seguinte rota:

```
/docs
```
Se necessário, é possível consumir o json do Swagger no seguinte caminho:
```
/docs-json
```

## 📦 Dependências do projeto
- Postgres
- AWS S3
- RabbitMQ

## 📦 Configuração do Ambiente
Antes de rodar o projeto, é necessário configurar as variáveis de ambiente no arquivo `.env`. Utilize como base o arquivo `.env.example`.

## 🛠️ Executando o Projeto

1. Instale as dependências:

   ```sh
   npm install
   ```

2. Crie o client do Prisma:
   ```sh
   npm run prisma:generate
   ```
3. Aplique as migrations do Prisma:

   ```sh
   npm run prisma:migrate-dev
   ```

4. Inicie o projeto:
   ```sh
   npm run start:dev
   ```
5. **Executando e Debugando com VS Code:**

   Também é possível executar e debugar o projeto diretamente pelo VS Code. Siga os passos abaixo:

   - Certifique-se de que a variável `NODE_EXECUTABLE` está configurada no arquivo `.env`.
   - Abra o projeto no VS Code.
   - Vá até a aba de execução e depuração (ícone de play ou use o atalho `Ctrl + Shift + D`).
   - Conforme declarado no arquivo `.vscode/launch.json`, utilize a configuração `Run Local` para Node.js.
   - Clique em "Iniciar Depuração" para rodar o projeto em modo de depuração.


Opcionalmente é possível rodar a aplicação via Docker, conforme os seguintes passos:

1. Crie a imagem do docker:

   ```sh
   docker build -t template-api-monolith .
   ```

2. Crie o container do projeto:

   ```sh
   docker container create --name template-api-monolith -p 3777:3777 template-api-monolith
   ```

3. Rode o container:

   ```sh
   docker start template-api-monolith
   ```

4. Quando precisar parar:
   ```sh
   docker stop template-api-monolith
   ```

## 🔐 Segurança e Controle de Acesso

- O sistema utiliza **JWT** para autenticação dos usuários.
- As operações possuem **níveis de permissão**, e a API valida essas permissões antes de processar qualquer requisição.
- Todas as chamadas realizadas são registradas em **logs transacionais** para garantir transparência e rastreabilidade.
