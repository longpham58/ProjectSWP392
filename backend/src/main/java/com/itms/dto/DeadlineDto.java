package com.itms.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DeadlineDto {

    private Integer id;

    private String title;

    private String course;

    private LocalDateTime dueDate;

    private Integer daysLeft;

    private String priority;

    private String type;

}
