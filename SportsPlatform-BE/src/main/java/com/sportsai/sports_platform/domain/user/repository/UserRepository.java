// 데이터 저장, 조회 삭제 등 DB작업 담당 -> Repository가 실제로 DB에 저장하는 역할을 함
package com.sportsai.sports_platform.domain.user.repository;

import com.sportsai.sports_platform.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;   // JpaRepository 상속받으면 자동으로 DB에 저장, ID로 조회, 전체 조회, 삭제 기능이 생김

public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByEmail(String email);

    User findByEmail(String email);
}