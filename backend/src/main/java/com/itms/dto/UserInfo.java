package com.itms.dto;

import com.itms.common.UserRole;
import com.itms.entity.Department;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserInfo {

    private Integer id;
    private String username;
    private String email;
    private String fullName;
    private UserRole role;
    private DepartmentDto department;
}
