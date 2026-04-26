package com.grimoire.backend.shared.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // 404 — recurso de negócio não encontrado (ex: cliente 99 não existe)
    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ResponseEntity<Map<String, Object>> handleNaoEncontrado(
            RecursoNaoEncontradoException e, HttpServletRequest req) {
        log.warn("Recurso não encontrado [{}]: {}", req.getRequestURI(), e.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "timestamp", LocalDateTime.now(),
                "status", 404,
                "mensagem", e.getMessage()
        ));
    }

    // 404 — rota que não existe (ex: GET /api/xyz)
    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<Map<String, Object>> handleRotaNaoEncontrada(
            NoHandlerFoundException e, HttpServletRequest req) {
        log.warn("Rota não encontrada: {} {}", req.getMethod(), req.getRequestURI());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "timestamp", LocalDateTime.now(),
                "status", 404,
                "mensagem", "Rota não encontrada: " + req.getMethod() + " " + req.getRequestURI()
        ));
    }

    // 405 — método HTTP errado (ex: POST em rota que só aceita GET)
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<Map<String, Object>> handleMetodoNaoPermitido(
            HttpRequestMethodNotSupportedException e, HttpServletRequest req) {
        log.warn("Método não permitido: {} {}", req.getMethod(), req.getRequestURI());
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(Map.of(
                "timestamp", LocalDateTime.now(),
                "status", 405,
                "mensagem", "Método " + req.getMethod() + " não permitido para esta rota"
        ));
    }

    // 422 — regra de negócio violada (ex: fiado sem cliente, CPF duplicado)
    @ExceptionHandler(RegraNegocioException.class)
    public ResponseEntity<Map<String, Object>> handleRegraNegocio(
            RegraNegocioException e, HttpServletRequest req) {
        log.warn("Regra de negócio violada [{}]: {}", req.getRequestURI(), e.getMessage());
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(Map.of(
                "timestamp", LocalDateTime.now(),
                "status", 422,
                "mensagem", e.getMessage()
        ));
    }

    // 400 — falha de validação de campos (@NotBlank, @Pattern, etc.)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidacao(
            MethodArgumentNotValidException e, HttpServletRequest req) {
        Map<String, String> erros = e.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(
                        f -> f.getField(),
                        f -> f.getDefaultMessage(),
                        (a, b) -> a
                ));
        log.warn("Validação falhou [{}]: {}", req.getRequestURI(), erros);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "timestamp", LocalDateTime.now(),
                "status", 400,
                "erros", erros
        ));
    }

    // 500 — qualquer erro inesperado (nunca expõe detalhes internos ao cliente)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenerico(
            Exception e, HttpServletRequest req) {
        log.error("Erro inesperado [{} {}]: {}", req.getMethod(), req.getRequestURI(), e.getMessage(), e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "timestamp", LocalDateTime.now(),
                "status", 500,
                "mensagem", "Erro interno — contate o suporte"
        ));
    }
}
