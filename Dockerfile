# Local / Compose image: Next.js app (UI + API routes that deploy as Vercel Functions).
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
# Skip husky prepare inside the image (no .git in the build context).
RUN npm ci --ignore-scripts

COPY . .

ENV HOSTNAME=0.0.0.0
ENV PORT=3000
EXPOSE 3000

# Bind to 0.0.0.0 so the container is reachable from the host.
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "3000"]
