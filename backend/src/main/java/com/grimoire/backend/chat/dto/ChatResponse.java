package com.grimoire.backend.chat.dto;

import java.util.List;
import java.util.Map;

public record ChatResponse(List<Map<String, Object>> blocos) {}
