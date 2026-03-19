package com.itms.security;

import com.itms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) {
        // username here = userId (string) as stored by CustomUserDetails.getUsername()
        try {
            int userId = Integer.parseInt(username);
            return userRepository.findById(userId)
                    .flatMap(u -> userRepository.findByUsernameWithRole(u.getUsername()))
                    .map(CustomUserDetails::new)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        } catch (NumberFormatException e) {
            // fallback: treat as actual username string
            return userRepository.findByUsernameWithRole(username)
                    .map(CustomUserDetails::new)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        }
    }
}
