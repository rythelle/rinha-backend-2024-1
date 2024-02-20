CREATE TABLE IF NOT EXISTS TRANSACAO (
	"id" SERIAL PRIMARY KEY,
	"realizada_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	"tipo" VARCHAR(1) NOT NULL,
	"descricao" VARCHAR(10) NOT NULL,
	"valor" INTEGER NOT NULL,
	"id_cliente" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS USUARIO (
	"id_cliente" INTEGER PRIMARY KEY,
	"limite" INTEGER NOT NULL,
	"saldo" INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE TRANSACAO ADD CONSTRAINT "transacao_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES USUARIO("id_cliente");

INSERT INTO USUARIO ("id_cliente", "limite", "saldo") VALUES (1, 100000, 0);
INSERT INTO USUARIO ("id_cliente", "limite", "saldo") VALUES (2, 80000, 0);
INSERT INTO USUARIO ("id_cliente", "limite", "saldo") VALUES (3, 1000000, 0);
INSERT INTO USUARIO ("id_cliente", "limite", "saldo") VALUES (4, 10000000, 0);
INSERT INTO USUARIO ("id_cliente", "limite", "saldo") VALUES (5, 500000, 0);