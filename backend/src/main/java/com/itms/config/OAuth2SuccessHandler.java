package com.itms.config;


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
    private static final String FRONTEND_URL = "http://localhost:5173";

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {

        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();

        ResponseDto<LoginResponse> loginResponse =
                userService.handleGoogleLogin(oauthUser, request);
        if (!loginResponse.isSuccess()) {
            response.sendRedirect(
                    FRONTEND_URL + "/login?error=" + loginResponse.getMessage()
            );
            return;
        }
        // ✅ Session already created
        response.sendRedirect(FRONTEND_URL + "/");
    }
}
