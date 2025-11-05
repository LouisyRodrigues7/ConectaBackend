# 🚍 ConectaBus Backend

Backend oficial do **ConectaBus**, responsável por autenticação de usuários, verificação MFA (Multi-Factor Authentication), e integração com o frontend hospedado no Netlify.

---

## 📁 Estrutura do Projeto

```
CONECTABACKEND/
├── src/
│   ├── config/
│   │   └── db.js                # Conexão com banco de dados (MongoDB ou similar)
│   ├── controllers/
│   │   └── userController.js    # Lógica principal de autenticação e cadastro
│   ├── middlewares/
│   │   └── errorHandler.js      # Middleware de tratamento global de erros
│   ├── models/
│   │   └── User.js              # Modelo de usuário (schema)
│   ├── routes/
│   │   └── userRoutes.js        # Rotas de autenticação e MFA
├── app.js                       # Configuração principal do Express
├── server.js                    # Inicialização do servidor
├── package.json                 # Dependências e scripts NPM
└── README.md                    # Este arquivo
```

---

## ⚙️ Tecnologias Utilizadas

- **Node.js** + **Express** – Servidor web principal  
- **MongoDB** + **Mongoose** – Banco de dados e ODM  
- **dotenv** – Gerenciamento de variáveis de ambiente  
- **bcryptjs** – Criptografia de senhas  
- **jsonwebtoken** – Geração e verificação de tokens JWT  
- **Speakeasy / otplib** – Geração e validação de códigos MFA  
- **CORS** – Comunicação segura com o frontend  

---

## 🔐 Rotas Principais

| Método | Endpoint | Descrição |
|:--:|:--|:--|
| `POST` | `/api/users/signup` | Cria um novo usuário |
| `POST` | `/api/users/login` | Valida credenciais e solicita MFA |
| `POST` | `/api/users/verify-mfa` | Verifica o código MFA e conclui o login |
| `GET` | `/api/users` | Lista usuários (opcional, para debug/admin) |

---

## 🌐 Integração com o Frontend

O backend está hospedado no **Render** e acessível por:

```
https://conectabackendv2.onrender.com
```

No frontend (Netlify), o endpoint base é importado no arquivo:
```js
// js/api.js
export const API_URL = "https://conectabackendv2.onrender.com";
```

---

## 🚀 Como Rodar Localmente

### 1️⃣ Clone o repositório
```bash
git clone https://github.com/SEU_USUARIO/ConectaBackend.git
cd ConectaBackend
```

### 2️⃣ Instale as dependências
```bash
npm install
```

### 3️⃣ Configure o arquivo `.env`
```env
PORT=5000
MONGO_URI=sua_string_de_conexao_mongodb
JWT_SECRET=sua_chave_segura
```

### 4️⃣ Execute o servidor
```bash
npm start
```
ou em modo de desenvolvimento:
```bash
npm run dev
```

Servidor rodará em:
```
http://localhost:5000
```

---

## 🧠 Fluxo de Autenticação

1. Usuário envia e-mail e senha → rota `/login`  
2. Backend valida credenciais e envia `requireToken = true`  
3. Frontend exibe campo MFA e envia `/verify-mfa`  
4. Se o código for válido → backend retorna `{ success: true }` e o usuário é redirecionado para o dashboard.  

---

## 🔥 Deploy no Render

1. Crie um novo **Web Service** no [Render](https://render.com)  
2. Conecte o repositório do backend  
3. Configure o build e start command:
   ```bash
   Build Command: npm install
   Start Command: node server.js
   ```
4. Adicione variáveis de ambiente (`PORT`, `MONGO_URI`, `JWT_SECRET`)  
5. Após o deploy, copie a URL pública e substitua no frontend (`api.js`)

---

## 🧰 Boas Práticas

- Use HTTPS em produção  
- Nunca exponha o `.env`  
- Valide todas as entradas do usuário  
- Utilize tokens curtos e seguros para MFA  
- Faça logs de erro no servidor, mas não retorne detalhes sensíveis ao cliente  

---

## 👩‍💻 Autor

**Louisy Rodrigues**  
💼 Projeto acadêmico: *ConectaBus*  
🌎 Frontend: [https://conectabuspe.netlify.app](https://conectabuspe.netlify.app)  
🖥️ Backend: [https://conectabackendv2.onrender.com](https://conectabackendv2.onrender.com)

---

© 2025 ConectaBus – Todos os direitos reservados.