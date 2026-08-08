# Imagen base oficial de Node.js en su versión LTS ligera
FROM node:20-alpine

# Definir el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiar archivos de gestión de dependencias
COPY package*.json ./

# Instalación limpia de dependencias de producción
RUN npm ci --only=production

# Copiar el código fuente de la aplicación
COPY . .

# Exponer el puerto configurado del servidor Express
EXPOSE 3000

# Variables de entorno por defecto dentro del contenedor
ENV PORT=3000
ENV NODE_ENV=production

# Comando de arranque del servidor
CMD ["node", "server.js"]