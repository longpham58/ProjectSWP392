package com.itms.config;

import org.apache.catalina.session.StandardManager;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TomcatSessionConfig {

    @Bean
    public WebServerFactoryCustomizer<TomcatServletWebServerFactory> disableTomcatSessionPersistence() {
        return factory -> factory.addContextCustomizers(context -> {
            if (context.getManager() instanceof StandardManager manager) {
                // Disable SESSIONS.ser load/save to avoid stale session deserialization errors on restart.
                manager.setPathname(null);
            }
        });
    }
}
