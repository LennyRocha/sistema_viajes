# Ejemplo

```bash
docker build \
  --build-arg NEXT_PUBLIC_MF_CATALOGOS=http://TU_ELASTIC_IP:3002/_next/static/chunks/remoteEntry.js \
  --build-arg NEXT_PUBLIC_MF_AUTH=http://TU_ELASTIC_IP:3001/_next/static/chunks/remoteEntry.js \
  --build-arg NEXT_PUBLIC_MF_OPERACIONES=http://TU_ELASTIC_IP:3004/_next/static/chunks/remoteEntry.js \
  --build-arg NEXT_PUBLIC_MF_DASHBOARD=http://TU_ELASTIC_IP:3003/_next/static/chunks/remoteEntry.js \
  -t shell-front .
```
