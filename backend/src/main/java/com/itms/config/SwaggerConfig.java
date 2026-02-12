package com.itms.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI itmsOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("ITMS API")
                        .description("Internal Training Management System API")
                        .version("1.0.0")
                );
    }
}
