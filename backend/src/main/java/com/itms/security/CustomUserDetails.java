package com.itms.security;

import com.itms.entity.User;
import com.itms.entity.UserRole;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Getter
public class CustomUserDetails implements UserDetails {

    private final User user;
    private final Integer id;

    public CustomUserDetails(User user) {
        this.id = user.getId();
        this.user = user;
    }

    public Integer getId() {
        return id;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return user.getUserRole().stream()
                .filter(UserRole::getIsActive)                 // only active roles
                .map(userRole ->
                        new SimpleGrantedAuthority(
                                "ROLE_" + userRole.getRole().getRoleCode()
                        )
                )
                .toList();
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getId().toString(); // IMPORTANT: store userId
    }

    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
}
