package com.vibeshop.api.auth;

import java.time.OffsetDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserSessionRepository extends JpaRepository<UserSession, Long> {

    @EntityGraph(attributePaths = "user")
    Optional<UserSession> findBySessionTokenHash(String sessionTokenHash);

    void deleteBySessionTokenHash(String sessionTokenHash);

    void deleteAllByExpiresAtBefore(OffsetDateTime cutoff);
}
