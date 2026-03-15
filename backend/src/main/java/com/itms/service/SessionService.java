package com.itms.service;

import com.itms.entity.ClassMember;
import com.itms.entity.Session;
import com.itms.repository.ClassMemberRepository;
import com.itms.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final SessionRepository sessionRepository;
    private final ClassMemberRepository classMemberRepository;

    /**
     * Get sessions for the user based on their class memberships
     * First finds all classes the user is a member of, then returns sessions for those classes
     */
    public List<Session> getSessionsForUser(Integer userId) {
        // Get all class memberships for the user
        List<ClassMember> classMembers = classMemberRepository.findByUserId(userId);
        
        // Extract class IDs
        List<Integer> classIds = classMembers.stream()
                .map(cm -> cm.getClassRoom().getId())
                .collect(Collectors.toList());
        
        if (classIds.isEmpty()) {
            return List.of();
        }
        
        // Get all sessions for all classes and combine them
        return classIds.stream()
                .flatMap(classId -> sessionRepository.findByClassRoomIdOrderByDateAsc(classId).stream())
                .distinct()
                .sorted((s1, s2) -> {
                    int dateCompare = s1.getDate().compareTo(s2.getDate());
                    if (dateCompare != 0) return dateCompare;
                    return s1.getTimeStart().compareTo(s2.getTimeStart());
                })
                .collect(Collectors.toList());
    }
}
