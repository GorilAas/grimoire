package com.grimoire.backend.chat;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.grimoire.backend.chat.dto.ChatRequest;
import com.grimoire.backend.chat.dto.ChatResponse;
import com.grimoire.backend.chat.dto.MensagemHistorico;
import com.grimoire.backend.cliente.ClienteRepository;
import com.grimoire.backend.funcionario.FuncionarioRepository;
import com.grimoire.backend.produto.ProdutoRepository;
import com.grimoire.backend.venda.VendaRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class ChatService {

    private static final String GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
    private static final int MAX_ITERACOES = 4;

    @Value("${groq.api-key}")
    private String groqApiKey;

    @Value("${groq.modelo}")
    private String groqModelo;

    private final VendaRepository vendaRepository;
    private final ProdutoRepository produtoRepository;
    private final ClienteRepository clienteRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final ObjectMapper mapper;
    private final HttpClient httpClient;

    public ChatService(VendaRepository vendaRepository,
                       ProdutoRepository produtoRepository,
                       ClienteRepository clienteRepository,
                       FuncionarioRepository funcionarioRepository,
                       ObjectMapper mapper) {
        this.vendaRepository = vendaRepository;
        this.produtoRepository = produtoRepository;
        this.clienteRepository = clienteRepository;
        this.funcionarioRepository = funcionarioRepository;
        this.mapper = mapper;
        this.httpClient = HttpClient.newHttpClient();
    }

    public ChatResponse processar(ChatRequest request) {
        List<Map<String, Object>> mensagens = construirMensagens(request);
        List<Map<String, Object>> ferramentas = definirFerramentas();

        for (int i = 0; i < MAX_ITERACOES; i++) {
            JsonNode resposta = chamarGroq(mensagens, ferramentas);
            JsonNode escolha = resposta.path("choices").path(0).path("message");

            JsonNode chamadas = escolha.path("tool_calls");
            if (chamadas.isArray() && !chamadas.isEmpty()) {
                mensagens.add(nodeParaMapa(escolha));
                for (JsonNode chamada : chamadas) {
                    String nome = chamada.path("function").path("name").asText();
                    String id   = chamada.path("id").asText();
                    String args = chamada.path("function").path("arguments").asText();
                    Object resultado = executarFerramenta(nome, args);
                    mensagens.add(Map.of(
                        "role",         "tool",
                        "tool_call_id", id,
                        "content",      serializarJson(resultado)
                    ));
                }
                continue;
            }

            String conteudo = escolha.path("content").asText("");
            return parsearBlocos(conteudo);
        }

        return resposta(Map.of("tipo", "texto", "conteudo", "Nao consegui processar sua solicitacao. Tente novamente."));
    }

    private List<Map<String, Object>> construirMensagens(ChatRequest request) {
        List<Map<String, Object>> mensagens = new ArrayList<>();
        mensagens.add(Map.of("role", "system", "content", promptSistema()));

        if (request.historico() != null) {
            for (MensagemHistorico h : request.historico()) {
                String role = "usuario".equals(h.papel()) ? "user" : "assistant";
                mensagens.add(Map.of("role", role, "content", h.conteudo()));
            }
        }

        mensagens.add(Map.of("role", "user", "content", request.mensagem()));
        return mensagens;
    }

    private JsonNode chamarGroq(List<Map<String, Object>> mensagens, List<Map<String, Object>> ferramentas) {
        try {
            Map<String, Object> corpo = new LinkedHashMap<>();
            corpo.put("model",       groqModelo);
            corpo.put("messages",    mensagens);
            corpo.put("tools",       ferramentas);
            corpo.put("tool_choice", "auto");
            corpo.put("temperature", 0.2);
            corpo.put("max_tokens",  2048);

            HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(GROQ_URL))
                .header("Authorization", "Bearer " + groqApiKey)
                .header("Content-Type",  "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(corpo)))
                .build();

            HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
            return mapper.readTree(resp.body());
        } catch (Exception e) {
            throw new RuntimeException("Erro ao chamar Groq: " + e.getMessage(), e);
        }
    }

    private Object executarFerramenta(String nome, String argsJson) {
        try {
            JsonNode args = mapper.readTree(argsJson.isBlank() ? "{}" : argsJson);
            return switch (nome) {
                case "buscar_resumo_hoje"            -> resumoHoje();
                case "buscar_vendas_periodo"         -> vendasPeriodo(
                    args.path("data_inicio").asText(),
                    args.path("data_fim").asText());
                case "buscar_produtos_estoque"       -> produtosEstoque();
                case "buscar_produtos_abaixo_minimo" -> produtosAbaixoMinimo();
                case "buscar_clientes_fiado"         -> clientesFiado();
                case "buscar_funcionarios"           -> funcionariosAtivos();
                default -> Map.of("erro", "Ferramenta desconhecida: " + nome);
            };
        } catch (Exception e) {
            return Map.of("erro", e.getMessage());
        }
    }

    private Object resumoHoje() {
        LocalDateTime inicio = LocalDate.now().atStartOfDay();
        LocalDateTime fim    = LocalDate.now().atTime(23, 59, 59);
        var vendas = vendaRepository.listarPorPeriodo(inicio, fim).stream()
            .filter(v -> !"CANCELADA".equals(v.getStatus())).toList();

        double receita = vendas.stream().mapToDouble(v -> v.getValorTotal().doubleValue()).sum();
        int tickets = vendas.size();

        Map<String, Double> porForma = new LinkedHashMap<>();
        for (var v : vendas) {
            String forma = v.getFormaPagamento().name();
            porForma.merge(forma, v.getValorTotal().doubleValue(), Double::sum);
        }

        return Map.of(
            "receita_total",        String.format("%.2f", receita),
            "total_vendas",         tickets,
            "ticket_medio",         tickets > 0 ? String.format("%.2f", receita / tickets) : "0.00",
            "por_forma_pagamento",  porForma
        );
    }

    private Object vendasPeriodo(String inicio, String fim) {
        LocalDateTime dtInicio = LocalDate.parse(inicio).atStartOfDay();
        LocalDateTime dtFim    = LocalDate.parse(fim).atTime(23, 59, 59);
        var vendas = vendaRepository.listarPorPeriodo(dtInicio, dtFim).stream()
            .filter(v -> !"CANCELADA".equals(v.getStatus())).toList();

        double receita = vendas.stream().mapToDouble(v -> v.getValorTotal().doubleValue()).sum();

        List<Map<String, Object>> lista = vendas.stream().map(v -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("data",    v.getDataVenda().toLocalDate().toString());
            m.put("cliente", v.getCliente() != null ? v.getCliente().getNome() : "-");
            m.put("forma",   v.getFormaPagamento().name());
            m.put("total",   v.getValorTotal().doubleValue());
            return m;
        }).toList();

        return Map.of(
            "periodo",       inicio + " a " + fim,
            "total_receita", String.format("%.2f", receita),
            "total_vendas",  vendas.size(),
            "vendas",        lista
        );
    }

    private Object produtosEstoque() {
        return produtoRepository.findAll().stream()
            .filter(p -> p.isAtivo())
            .map(p -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("nome",           p.getNome());
                m.put("categoria",      p.getCategoria() != null ? p.getCategoria().getNome() : null);
                m.put("estoque",        p.getQuantidadeEstoque().doubleValue());
                m.put("estoque_minimo", p.getEstoqueMinimo().doubleValue());
                m.put("preco_venda",    p.getPrecoUnitario().doubleValue());
                m.put("preco_custo",    p.getPrecoCusto() != null ? p.getPrecoCusto().doubleValue() : null);
                m.put("abaixo_minimo",  p.getQuantidadeEstoque().compareTo(p.getEstoqueMinimo()) < 0);
                return m;
            }).toList();
    }

    private Object produtosAbaixoMinimo() {
        return produtoRepository.findAll().stream()
            .filter(p -> p.isAtivo()
                && p.getQuantidadeEstoque().compareTo(p.getEstoqueMinimo()) < 0)
            .map(p -> Map.of(
                "nome",           p.getNome(),
                "estoque_atual",  p.getQuantidadeEstoque().doubleValue(),
                "estoque_minimo", p.getEstoqueMinimo().doubleValue()
            )).toList();
    }

    private Object clientesFiado() {
        return clienteRepository.findAll().stream()
            .filter(c -> Boolean.TRUE.equals(c.getAtivo())
                && c.getSaldoDevedor().doubleValue() > 0)
            .map(c -> Map.of(
                "nome",          c.getNome(),
                "cpf",           c.getCpf(),
                "saldo_devedor", c.getSaldoDevedor().doubleValue(),
                "negativado",    Boolean.TRUE.equals(c.getNegativado())
            )).toList();
    }

    private Object funcionariosAtivos() {
        return funcionarioRepository.findAll().stream()
            .filter(f -> Boolean.TRUE.equals(f.getAtivo()))
            .map(f -> Map.of(
                "nome",                 f.getNome(),
                "cargo",                f.getCargo(),
                "carga_horaria_diaria", f.getCargaHorariaDiaria().doubleValue()
            )).toList();
    }

    private ChatResponse parsearBlocos(String conteudo) {
        String json = extrairJson(conteudo);
        try {
            JsonNode raiz = mapper.readTree(json);
            JsonNode blocosNode = raiz.path("blocos");
            if (blocosNode.isArray()) {
                List<Map<String, Object>> blocos = mapper.convertValue(blocosNode, new TypeReference<>() {});
                return new ChatResponse(blocos);
            }
        } catch (Exception ignorado) {}
        return resposta(Map.of("tipo", "texto", "conteudo", conteudo.isBlank() ? "Sem resposta." : conteudo));
    }

    private String extrairJson(String texto) {
        int ini = texto.indexOf('{');
        int fim = texto.lastIndexOf('}');
        if (ini >= 0 && fim > ini) return texto.substring(ini, fim + 1);
        return texto;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> nodeParaMapa(JsonNode node) {
        try {
            return mapper.convertValue(node, Map.class);
        } catch (Exception e) {
            return Map.of("role", "assistant", "content", "");
        }
    }

    private String serializarJson(Object obj) {
        try {
            return mapper.writeValueAsString(obj);
        } catch (Exception e) {
            return "{}";
        }
    }

    private ChatResponse resposta(Map<String, Object> bloco) {
        return new ChatResponse(List.of(bloco));
    }

    private String promptSistema() {
        String hoje = LocalDate.now().toString();
        return """
            Voce e o Assistente FresQUIM, analista de dados da padaria Pao FresQUIM. Responda em portugues do Brasil, de forma direta e objetiva.
            Data de hoje: """ + hoje + """

            Voce tem ferramentas para consultar dados reais. Use-as quando a pergunta exigir dados especificos.
            Nunca invente numeros que nao vieram das ferramentas.

            Sempre retorne um JSON valido com esta estrutura exata (sem texto fora do JSON):
            {
              "blocos": [
                { "tipo": "texto", "conteudo": "texto com **negrito** suportado" },
                { "tipo": "kpis", "itens": [{ "rotulo": "Receita", "valor": "R$ 0,00", "delta": 0, "rotuloReferencia": "hoje" }] },
                { "tipo": "tabela", "colunas": ["Col1", "Col2"], "linhas": [["v1", "v2"]] },
                { "tipo": "grafico_barras", "titulo": "Titulo", "dados": [{ "rotulo": "Label", "valor": 0 }] },
                { "tipo": "grafico_area",   "titulo": "Titulo", "dados": [{ "x": "Label", "y": 0 }] },
                { "tipo": "grafico_pizza",  "titulo": "Titulo", "dados": [{ "rotulo": "Label", "valor": 0 }] }
              ]
            }

            Regras:
            - Retorne somente JSON, nunca texto fora
            - Use no maximo 3 blocos por resposta
            - Valores monetarios: "R$ 1.234,56"
            - delta e numero: positivo para alta, negativo para queda
            - Prefira kpis para metricas, tabela para listas, graficos para tendencias
            - grafico_pizza para distribuicao proporcional (formas de pagamento, etc.)
            """;
    }

    private List<Map<String, Object>> definirFerramentas() {
        return List.of(
            ferramenta("buscar_resumo_hoje",
                "Resumo de vendas de hoje: receita total, quantidade, ticket medio e distribuicao por forma de pagamento",
                Map.of("type", "object", "properties", Map.of())),
            ferramenta("buscar_vendas_periodo",
                "Vendas em um periodo especifico",
                Map.of("type", "object",
                    "properties", Map.of(
                        "data_inicio", Map.of("type", "string", "description", "YYYY-MM-DD"),
                        "data_fim",    Map.of("type", "string", "description", "YYYY-MM-DD")),
                    "required", List.of("data_inicio", "data_fim"))),
            ferramenta("buscar_produtos_estoque",
                "Lista produtos ativos com estoque, preco de venda, custo e categoria",
                Map.of("type", "object", "properties", Map.of())),
            ferramenta("buscar_produtos_abaixo_minimo",
                "Lista produtos com estoque abaixo do minimo",
                Map.of("type", "object", "properties", Map.of())),
            ferramenta("buscar_clientes_fiado",
                "Lista clientes com saldo devedor em fiado em aberto",
                Map.of("type", "object", "properties", Map.of())),
            ferramenta("buscar_funcionarios",
                "Lista funcionarios ativos com nome, cargo e carga horaria",
                Map.of("type", "object", "properties", Map.of()))
        );
    }

    private Map<String, Object> ferramenta(String nome, String descricao, Map<String, Object> params) {
        return Map.of(
            "type", "function",
            "function", Map.of("name", nome, "description", descricao, "parameters", params)
        );
    }
}
