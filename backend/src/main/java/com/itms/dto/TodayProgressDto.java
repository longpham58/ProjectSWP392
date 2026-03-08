package com.itms.dto;

import lombok.Data;

@Data
public class TodayProgressDto {

    private Integer lessonsCompleted;

    private Integer lessonsTarget;

    private Double studyHours;

    private Double studyTarget;

    private Integer quizzesCompleted;

    private Integer quizzesTarget;

}
