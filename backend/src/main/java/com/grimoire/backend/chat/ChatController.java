package com.grimoire.backend.chat;

import com.grimoire.backend.chat.dto.ChatRequest;
import com.grimoire.backend.chat.dto.ChatResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/mensagem")
    public ResponseEntity<ChatResponse> enviar(@RequestBody ChatRequest request) {
        return ResponseEntity.ok(chatService.processar(request));
    }
}
