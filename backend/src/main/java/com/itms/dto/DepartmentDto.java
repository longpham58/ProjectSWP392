package com.itms.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DepartmentDto {
    private Integer id;
    private String name;
}
