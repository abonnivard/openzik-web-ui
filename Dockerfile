# Dockerfile simple pour React avec serveur de développement
FROM node:18-alpine

# Créer le répertoire de travail
WORKDIR /app

# Copier les fichiers package
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY . .

# Variables d'environnement pour React
ARG REACT_APP_API_BASE_URL=http://localhost:3001/api
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL

# Exposer le port 3000
EXPOSE 3000

# Démarrer le serveur de développement React
CMD ["npm", "start"]
