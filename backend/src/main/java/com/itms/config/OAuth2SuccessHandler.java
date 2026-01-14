package com.itms.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.itms.dto.auth.LoginResponse;
import com.itms.dto.common.ResponseDto;
import com.itms.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler
        extends SimpleUrlAuthenticationSuccessHandler {

    private final UserService userService;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {

        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();

        ResponseDto<LoginResponse> loginResponse =
                userService.handleGoogleLogin(oauthUser);
        if (loginResponse == null) {
            response.sendRedirect(
                    "http://localhost:5500/login.html?error=account_not_registered"
            );
            return;
        }
        loginResponse.getData().getTokenAndSetCookie(response);

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        new ObjectMapper().writeValue(
                response.getOutputStream(),
                loginResponse
        );
    }
}
