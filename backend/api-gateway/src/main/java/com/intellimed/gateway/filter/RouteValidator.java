package com.intellimed.gateway.filter;

import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.function.Predicate;

@Component
public class RouteValidator {

    public static final List<String> OPEN_ENDPOINTS = List.of(
            "/api/auth/register",
            "/api/auth/login",
            "/api/doctors/specialties",
            "/api/payments/webhook",
            "/eureka"
    );

    // Endpoints open only for GET (doctor search, doctor by ID)
    public static final List<String> OPEN_GET_PREFIXES = List.of(
            "/api/doctors"
    );

    public boolean isOpenEndpoint(ServerHttpRequest request) {
        String path = request.getURI().getPath();
        String method = request.getMethod().name();

        if (OPEN_ENDPOINTS.stream().anyMatch(path::equals)) {
            return true;
        }

        if ("GET".equals(method) && OPEN_GET_PREFIXES.stream().anyMatch(path::startsWith)) {
            return true;
        }

        return path.startsWith("/eureka");
    }
}
