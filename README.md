# 🚍 ConectaBus Backend

O **ConectaBus Backend** é o núcleo do sistema ConectaBus --- uma
solução de **Internet das Coisas (IoT)** que integra placas ESP32
físicas e simulações no Wokwi para monitoramento de acessibilidade em
paradas de ônibus inteligentes.

O backend recebe dados enviados para o **ThingSpeak** por dois botões
instalados nas placas IoT: - 🔵 Botão azul --- Registro para
**deficiência visual** - 🟡 Botão amarelo --- Registro para
**deficiência física**

Quando acionados, as placas: - Enviam dados ao ThingSpeak\
- Disparam um sinal sonoro na parada indicando: - Ônibus chegando em 5
minutos\
- Instruções de embarque acessível

Todos os registros são armazenados no **MongoDB Atlas**, permitindo
integração direta com o frontend do ConectaBus.

------------------------------------------------------------------------

## 📁 Estrutura do Projeto

    CONECTABACKEND/
    ├── src/
    │   ├── config/
    │   │   └── db.js                # Conexão com MongoDB Atlas
    │   ├── controllers/
    │   │   └── userController.js    # Lógica principal de autenticação e cadastro
    │   ├── middlewares/
    │   │   └── errorHandler.js      # Middleware global de erros
    │   ├── models/
    │   │   └── User.js              # Schema de usuário
    │   ├── routes/
    │   │   └── userRoutes.js        # Rotas de autenticação e MFA
    ├── app.js                       # Configuração principal do Express
    ├── server.js                    # Inicialização do servidor
    ├── package.json                 # Dependências e scripts NPM
    └── README.md                    # Este arquivo

------------------------------------------------------------------------

## ⚙️ Tecnologias Utilizadas

-   **Node.js** + **Express**
-   **MongoDB Atlas** + **Mongoose**
-   **dotenv**
-   **bcryptjs**
-   **jsonwebtoken**
-   **otplib / speakeasy** -- Códigos MFA
-   **CORS**
-   **ThingSpeak API**

------------------------------------------------------------------------

## 🔐 Rotas Principais

  Método   Endpoint                  Descrição
  -------- ------------------------- -------------------------------------
  `POST`   `/api/users/signup`       Cria um novo usuário
  `POST`   `/api/users/login`        Validação inicial e solicitação MFA
  `POST`   `/api/users/verify-mfa`   Valida o token MFA
  `GET`    `/api/users`              Lista usuários

------------------------------------------------------------------------

## 🌐 Integração com o Frontend

Backend hospedado no **Render**:

    https://conectabackendv2.onrender.com

Usado no frontend:

``` js
export const API_URL = "https://conectabackendv2.onrender.com";
```

------------------------------------------------------------------------

## 🚀 Como Rodar Localmente

### 1️⃣ Clone o repositório

``` bash
git clone https://github.com/SEU_USUARIO/ConectaBackend.git
cd ConectaBackend
```

### 2️⃣ Instale dependências

``` bash
npm install
```

### 3️⃣ Configure o `.env`

``` env
PORT=5000
MONGO_URI=sua_string_mongodb
JWT_SECRET=sua_chave_segura
```

### 4️⃣ Inicie o servidor

``` bash
npm start
```

Servidor:

    http://localhost:5000

------------------------------------------------------------------------

## 🔥 Deploy no Render

Configure como Web Service:

    Build: npm install
    Start: node server.js

Adicione variáveis: `PORT`, `MONGO_URI`, `JWT_SECRET`.

------------------------------------------------------------------------
## 👩‍💻 Equipe ConectaBus

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/LouisyRodrigues" target="_blank">
        <img src="https://avatars.githubusercontent.com/u/181038308?v=4" width="100px;" alt="Louisy Rodrigues Picture"/><br>
        <sub>
          <b>Louisy Rodrigues</b>
        </sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/RihanCabral" target="_blank">
        <img src="https://avatars.githubusercontent.com/u/163031225?v=4" width="100px;" alt="Rihan Cabral Picture"/><br>
        <sub>
          <b>Rihan Cabral</b>
        </sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/VictorLavor" target="_blank">
        <img src="https://avatars.githubusercontent.com/u/150476865?v=4" width="100px;" alt="Victor Lavor Picture"/><br>
        <sub>
          <b>Victor Lavor</b>
        </sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/guilherme-jacques" target="_blank">
        <img src="https://avatars.githubusercontent.com/u/163030792?v=4" width="100px;" alt="Guilherme Jacques Picture"/><br>
        <sub>
          <b>Guilherme Jacques</b>
        </sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/oedumelo" target="_blank">
        <img src="https://avatars.githubusercontent.com/u/161795563?v=4" width="100px;" alt="Eduardo Melo Picture"/><br>
        <sub>
          <b>Eduardo Melo</b>
        </sub>
      </a>
    </td>
  </tr>
</table>
