package com.grimoire.backend.shared.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String,Object>> handleException(RecursoNaoEncontradoException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "timesStamp", LocalDateTime.now(),
                "status", 404,
                "mensagem", e.getMessage()
        ));
    }

    @ExceptionHandler
    public ResponseEntity<Map<String,Object>> handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(Map.of(
                "timesStamp", LocalDateTime.now(),
                "status", 402,
                "mensagem", e.getMessage()
        ));
    }

    @ExceptionHandler
    public ResponseEntity<?> handleValidcao(MethodArgumentNotValidException e)  {
        Map<String,Object>  erros = e.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(
                        f -> f.getField(),
                        f -> f.getDefaultMessage(),
                        (a, b) -> a
                ));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "timesStamp", LocalDateTime.now(),
                "status", 402,
                "mensagem", e.getMessage()
        ));
    }
}
