package com.kce.safeguard.repository;

import com.kce.safeguard.entity.StudentMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StudentMessageRepository extends JpaRepository<StudentMessage, Long> {

    List<StudentMessage> findAllByOrderByIdDesc();
}
