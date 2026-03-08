package com.itms.service;

import com.itms.repository.AttendanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class LearningStreakService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    public int getCurrentStreak(Integer userId) {

        List<LocalDate> dates = attendanceRepository.findLearningDates(userId);

        if (dates.isEmpty()) {
            return 0;
        }

        int streak = 0;
        LocalDate expectedDate = LocalDate.now();

        for (LocalDate date : dates) {

            if (date.equals(expectedDate)) {
                streak++;
                expectedDate = expectedDate.minusDays(1);
            }
            else if (date.equals(expectedDate.minusDays(1))) {
                streak++;
                expectedDate = date.minusDays(1);
            }
            else {
                break;
            }
        }

        return streak;
    }
}
