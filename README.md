# Rinha de Backend - 2024/Q1

![Imagem da rinha](https://raw.githubusercontent.com/zanfranceschi/rinha-de-backend-2024-q1/main/misc/arte.jpg)

## Ideias

- Pensei em usar o Hyper-Express, por causa desse artigo aqui:
  https://medium.com/deno-the-complete-reference/node-js-the-fastest-web-framework-in-2024-fa11e513fa75
  Vi que ele tem suporte pra coisas que precisamos (servidor HTTP e middleware)

## To do

- [x] Implementação básica do Hyper-Express.
- [x] Criar todas as rotas do desafio.
- [x] Montar schema do banco de dados.
- [x] Definir qual banco de dados irá usar (Postregres ou MongoDB).
- [x] Implementar regras de negócio do desafio (Service ou useCase).
- [ ] Implementar testes unitários.
- [x] Adicionar manipulação de erros conforme o desafio.
- [x] Arrumar a infra para rodar a aplicação.
- [x] Implementar cluster nodejs.
- [x] Implementar cache ???.
- [x] Melhorar query do banco.
- [ ] Otimizar aplicação.
- [x] Configurar limites de memória e cpu.

## Como rodar aplicação

### Levantar aplicação
- docker compose up -d --build
- Aplicação fica disponível em http://localhost:9999/

### Derrubar aplicação
- docker compose down

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

## Links

https://dzone.com/articles/how-to-install-gatling-on-ubuntu
https://medium.com/@pierre.viara/install-java-on-windows-10-linux-subsystem-875f1f286ee8
https://www.blazemeter.com/blog/gatling-installation
https://www.digitalocean.com/community/tutorials/how-to-build-and-deploy-a-node-js-application-to-digitalocean-kubernetes-using-semaphore-continuous-integration-and-delivery
https://vitest.dev/guide/
https://medium.com/thefreshwrites/advisory-locks-in-postgres-1f993647d061
http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_http_version
https://medium.com/@soulaimaneyh/nginx-internal-architecture-b94b013bc365