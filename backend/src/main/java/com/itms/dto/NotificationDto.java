package com.itms.dto;

import com.itms.common.ReferenceType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NotificationDto {

    private Integer id;
    private String title;
    private String message;
    private LocalDateTime date;
    private Boolean read;

    // mapped from backend type/priority
    private String type; // info | warning | success

    private ReferenceType referenceType;
    private Integer referenceId;
    private String detail_content;
}
