package com.itms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HrEmployeeDto {
    private Integer id;
    private String userId;
    private String fullname;
    private String email;
    private String role;
    private String status;
}
