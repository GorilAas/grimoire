package com.grimoire.backend.chat.dto;

import java.util.List;

public record ChatRequest(String mensagem, List<MensagemHistorico> historico) {}
