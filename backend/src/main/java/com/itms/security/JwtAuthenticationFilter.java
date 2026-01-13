package com.itms.security;

import com.itms.entity.User;
import com.itms.repository.UserRepository;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtTokenUtil jwtTokenUtil;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (StringUtils.hasText(header)) {
            String token = header.startsWith("Bearer ") ? header.substring(7) : header;
            // 2️⃣ If no token in header, try to get it from cookie
            if (token == null && request.getCookies() != null) {
                Optional<Cookie> jwtCookie =
                        List.of(request.getCookies())
                                .stream()
                                .filter(c -> "JWT_TOKEN".equals(c.getName()))
                                .findFirst();

                if (jwtCookie.isPresent()) {
                    token = jwtCookie.get().getValue();
                }
            }
            if(token != null) {
                try {
                    if (jwtTokenUtil.validateToken(token)) {
                        String username = jwtTokenUtil.getUsernameFromToken(token).trim().toLowerCase();
                        User user = userRepository.findByUsername(username)
                                .orElse(null);
                        System.out.println("User found: " + (user != null));
                        if (user != null) {
                            System.out.println("Account ID: " + user.getId());
                            System.out.println("Account username: [" + user.getUsername() + "]");
                        }
                        System.out.println("============================");
                        if (user != null && user.getRole() != null) {
                            List<SimpleGrantedAuthority> authorities =
                                    List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole()));

                            UsernamePasswordAuthenticationToken authentication =
                                    new UsernamePasswordAuthenticationToken(user, null, authorities);
                            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                            SecurityContextHolder.getContext().setAuthentication(authentication);
                        } else if (user != null) {
                            UsernamePasswordAuthenticationToken authentication =
                                    new UsernamePasswordAuthenticationToken(user, null, Collections.emptyList());
                            SecurityContextHolder.getContext().setAuthentication(authentication);
                        }
                    }

                } catch (JwtException ex) {
                    System.out.println("JWT invalid: " + ex.getMessage());
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}
