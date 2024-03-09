# Rinha de Backend - 2024/Q1

![Imagem da rinha](https://raw.githubusercontent.com/zanfranceschi/rinha-de-backend-2024-q1/main/misc/arte.jpg)

## To do

- [x] Implementação básica do Hyper-Express.
- [x] Criar todas as rotas do desafio.
- [x] Montar schema do banco de dados.
- [x] Definir qual banco de dados irá usar (Postregres ou MongoDB).
- [x] Implementar regras de negócio do desafio (Service ou useCase).
- [x] Adicionar manipulação de erros conforme o desafio.
- [x] Arrumar a infra para rodar a aplicação.
- [x] Implementar cluster nodejs.
- [x] Implementar cache.
- [x] Melhorar query's do banco.
- [x] Otimizar aplicação.
- [x] Configurar limites de memória e cpu.

## Como rodar aplicação

- docker compose up -d --build
- Aplicação fica disponível em http://localhost:9999/

## Como rodar teste de carga

- Na raiz do projeto, execute:

* Para Linux: ./executar-teste-local.sh
* Para Windows ./executar-teste-local.ps1

## Gráficos para análise dos containers

- docker run \
  --volume=/:/rootfs:ro \
  --volume=/var/run:/var/run:ro \
  --volume=/sys:/sys:ro \
  --volume=/var/lib/docker/:/var/lib/docker:ro \
  --volume=/dev/disk/:/dev/disk:ro \
  --publish=8080:8080 \
  --detach=true \
  --name=cadvisor \
  google/cadvisor:latest

- Disponível em http://localhost:8080/docker

## Repositório do desafio

https://github.com/zanfranceschi/rinha-de-backend-2024-q1

## Subir para o docker hub

- docker buildx create --name cgb-rinha-nodejs --platform linux/amd64
- docker buildx build -t redvelvetdev/cgb-rinha-nodejs-q1-2024:latest --builder cgb-rinha-nodejs --push --platform linux/amd64 .