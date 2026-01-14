package com.itms.security;

import com.itms.common.UserRole;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

@Component
public class JwtTokenUtil {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expirationMs}")
    private long jwtExpirationMs;

    // ======================
    // SIGNING KEY
    // ======================
    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // ======================
    // ACCESS TOKEN (JWT)
    // ======================
    public String generateToken(int userId, String username, UserRole role) {
        Date now = new Date();

        return Jwts.builder()
                .setSubject(String.valueOf(userId))   // ✅ IMMUTABLE
                .claim("username", username)          // optional
                .claim("role", role.name())
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + jwtExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // ======================
    // DEVICE TOKEN (REMEMBER DEVICE)
    // ======================
    public String generateDeviceToken(int userId) {
        return Jwts.builder()
                .setSubject(String.valueOf(userId))
                .setIssuedAt(new Date())
                .setExpiration(
                        Date.from(Instant.now().plus(30, ChronoUnit.DAYS))
                )
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validateDeviceToken(String token, int userId) {
        try {
            return extractUserId(token) == userId;
        } catch (JwtException e) {
            return false;
        }
    }

    // ======================
    // EXTRACTION
    // ======================
    public int extractUserId(String token) {
        String subject = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();

        return Integer.parseInt(subject);
    }

    public String extractUsername(String token) {
        return (String) Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("username");
    }

    public UserRole extractRole(String token) {
        String role = (String) Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("role");

        return UserRole.valueOf(role);
    }

    // ======================
    // VALIDATION
    // ======================
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
