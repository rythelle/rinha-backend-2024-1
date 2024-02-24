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

CREATE TABLE IF NOT EXISTS RESULTADO(
    "id" INTEGER PRIMARY KEY,
    "informacao" VARCHAR(10)
);

CREATE TABLE IF NOT EXISTS TRANSACAO_PENDENTE (
	"id" SERIAL PRIMARY KEY,
	"tipo" VARCHAR(1) NOT NULL,
	"descricao" VARCHAR(10) NOT NULL,
	"valor" INTEGER NOT NULL,
	"id_cliente" INTEGER NOT NULL
);

-- Veriicar os casos de cliente que não existe, acho que vai ser barrado na aplicação
CREATE TABLE IF NOT EXISTS PROCESSANDO (
	"id_cliente" SERIAL PRIMARY KEY,
	"em_processamento" BOOLEAN 
);

INSERT INTO PROCESSANDO ("id_cliente", "em_processamento") VALUES (1, FALSE);
INSERT INTO PROCESSANDO ("id_cliente", "em_processamento") VALUES (2, FALSE);
INSERT INTO PROCESSANDO ("id_cliente", "em_processamento") VALUES (3, FALSE);
INSERT INTO PROCESSANDO ("id_cliente", "em_processamento") VALUES (4, FALSE);
INSERT INTO PROCESSANDO ("id_cliente", "em_processamento") VALUES (5, FALSE);


CREATE OR REPLACE FUNCTION processar_transacao(
    p_id_cliente INTEGER,
    p_tipo VARCHAR(1),
    p_valor INTEGER,
    p_descricao VARCHAR(10),
    p_id_transacao_pendente INTEGER
) returns void
LANGUAGE plpgsql
as $function$
DECLARE
    v_saldo_atual INTEGER;
    v_cliente_existe BOOLEAN;
    v_limite INTEGER;
    v_data VARCHAR(50);
   	v_teste_lock BOOLEAN;
begin
	--select true into v_teste_lock  from PROCESSANDO where id_cliente = p_id_cliente for UPDATE;
	select timeofday() into v_data; 
	RAISE NOTICE '-------------------- Inicio %',v_data;
	RAISE NOTICE 'p_id_clienteCliente: %, p_tipo: %, p_valor: %, p_descricao: %, p_id_transacao_pendente: %', p_id_cliente, p_tipo, p_valor, p_descricao, p_id_transacao_pendente;
    -- Obter o saldo atual do usuário
    SELECT saldo, limite INTO v_saldo_atual, v_limite FROM USUARIO WHERE id_cliente = p_id_cliente;
    -- TODO: parei aqui! por algum motivo da erro no saldo
   	RAISE NOTICE 'ID Cliente: %, Saldo Atual: %, Limite: %', p_id_cliente, v_saldo_atual, v_limite;
   
    -- Verificar se o usuário existe
    IF v_saldo_atual IS NOT NULL THEN
        v_cliente_existe := TRUE;
    ELSE
        -- Se o cliente não existir, registrar na tabela RESULTADO com informação 404
        INSERT INTO RESULTADO (id, informacao) VALUES (p_id_transacao_pendente, '404');
        RETURN;
    END IF;

    -- Atualizar o saldo se o tipo de transação for "c"
    IF p_tipo = 'c' THEN
        UPDATE USUARIO set limite = v_limite, saldo = v_saldo_atual + p_valor WHERE id_cliente = p_id_cliente;
    ELSE
        -- Realizar a subtração do v_saldo_atual com o p_valor
        v_saldo_atual := v_saldo_atual - p_valor;

        -- Verificar se o saldo é menor que 0
        IF v_saldo_atual + v_limite < 0 THEN
            -- Salvar um registro na tabela de RESULTADO com 422 na coluna de informacao
            INSERT INTO RESULTADO (id,informacao) VALUES (p_id_transacao_pendente,'422');
            RETURN;
        ELSE
            -- Atualizar o saldo na tabela de USUARIO com o novo valor
            UPDATE USUARIO set limite = v_limite, saldo = v_saldo_atual WHERE id_cliente = p_id_cliente;
        END IF;
    END IF;

    -- Adicionar informações na tabela TRANSACAO
    INSERT INTO TRANSACAO (tipo, descricao, valor, id_cliente)
    VALUES ( p_tipo, p_descricao, p_valor, p_id_cliente);
   
   	INSERT INTO RESULTADO (id,informacao) VALUES (p_id_transacao_pendente,'200');
    
    -- Atualizar o status em_processamento na tabela PROCESSANDO
   -- executando duas vezes por causa disso aqui embaixo

    UPDATE PROCESSANDO SET em_processamento = FALSE WHERE id_cliente = p_id_cliente;
END;
$function$;

-- Função para criar a transação pendente
-- Irá usar o ID dessa transação pendente como ID do resultado
CREATE OR REPLACE FUNCTION criar_transacao_pendente(
    p_tipo VARCHAR(1),
    p_descricao VARCHAR(10),
    p_valor INTEGER,
    p_id_cliente INTEGER
) RETURNS INTEGER AS $$
DECLARE
    v_novo_id INTEGER;
BEGIN
    INSERT INTO TRANSACAO_PENDENTE (tipo, descricao, valor, id_cliente)
    VALUES (p_tipo, p_descricao, p_valor, p_id_cliente)
    RETURNING id INTO v_novo_id;

    RETURN v_novo_id;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION processar_transacao_pendente()
RETURNS TRIGGER AS $$
DECLARE
    v_id_cliente INTEGER;
    v_menor_id_transacao_pendente INTEGER;
    v_tipo VARCHAR(1);
    v_descricao VARCHAR(10);
    v_valor INTEGER;
	v_id_trancacao integer;
BEGIN
    -- Obter o id_cliente da tabela PROCESSANDO
    v_id_cliente := NEW.id_cliente;

   	    SELECT id, tipo, descricao, valor
	    INTO v_menor_id_transacao_pendente, v_tipo, v_descricao, v_valor
	    FROM TRANSACAO_PENDENTE
	    WHERE id_cliente = v_id_cliente
	    ORDER BY id
	    LIMIT 1;
   
   	IF NEW.em_processamento = false and v_menor_id_transacao_pendente is not null THEN
	    -- Pesquisar o menor ID na tabela TRANSACAO_PENDENTE para o mesmo id_cliente

	
	   	delete from TRANSACAO_PENDENTE where id = v_menor_id_transacao_pendente;
	   	update processando set em_processamento = true where id_cliente = v_id_cliente;
	    -- Executar a função processar_transacao com as informações adquiridas
	   PERFORM processar_transacao(v_id_cliente, v_tipo, v_valor, v_descricao, v_menor_id_transacao_pendente);
	END if;
	   
    RETURN NEW;
    
END;
$$ LANGUAGE plpgsql;

CREATE trigger  processando_trigger
AFTER UPDATE ON PROCESSANDO
FOR EACH ROW EXECUTE FUNCTION processar_transacao_pendente();

CREATE OR REPLACE FUNCTION processar_transacao_pendente_insert()
RETURNS TRIGGER AS $$
DECLARE
    v_id_cliente INTEGER;
    v_menor_id_transacao_pendente INTEGER;
    v_tipo VARCHAR(1);
    v_descricao VARCHAR(10);
    v_valor INTEGER;
	v_id_trancacao integer;
	v_em_processamento boolean;
BEGIN
    -- Obter o id_cliente da tabela PROCESSANDO
    v_id_cliente := NEW.id_cliente;
   
   select em_processamento into v_em_processamento from processando where id_cliente = v_id_cliente;

  		SELECT id, tipo, descricao, valor
	    INTO v_menor_id_transacao_pendente, v_tipo, v_descricao, v_valor
	    FROM TRANSACAO_PENDENTE
	    WHERE id_cliente = v_id_cliente
	    ORDER BY id
	    LIMIT 1;
  
   	IF v_em_processamento = false and v_menor_id_transacao_pendente is not null THEN
	    -- Pesquisar o menor ID na tabela TRANSACAO_PENDENTE para o mesmo id_cliente
	    SELECT id, tipo, descricao, valor
	    INTO v_menor_id_transacao_pendente, v_tipo, v_descricao, v_valor
	    FROM TRANSACAO_PENDENTE
	    WHERE id_cliente = v_id_cliente
	    ORDER BY id
	    LIMIT 1;
	
	   	delete from TRANSACAO_PENDENTE where id = v_menor_id_transacao_pendente;
	   	update processando set em_processamento = true where id_cliente = v_id_cliente;
	    -- Executar a função processar_transacao com as informações adquiridas
	   PERFORM processar_transacao(v_id_cliente, v_tipo, v_valor, v_descricao, v_menor_id_transacao_pendente);
	END if;
	   
    RETURN NEW;
    
END;
$$ LANGUAGE plpgsql;

CREATE trigger  processando_trigger_insert_transacao_pendente
AFTER INSERT ON transacao_pendente
FOR EACH ROW EXECUTE FUNCTION processar_transacao_pendente_insert();