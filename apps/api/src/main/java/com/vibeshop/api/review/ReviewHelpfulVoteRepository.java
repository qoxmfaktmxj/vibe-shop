package com.vibeshop.api.review;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReviewHelpfulVoteRepository extends JpaRepository<ReviewHelpfulVote, Long> {

    boolean existsByReview_IdAndUser_Id(Long reviewId, Long userId);

    long countByReview_Id(Long reviewId);

    Optional<ReviewHelpfulVote> findByReview_IdAndUser_Id(Long reviewId, Long userId);

    @Query("""
        SELECT vote.review.id
        FROM ReviewHelpfulVote vote
        WHERE vote.user.id = :userId
          AND vote.review.id IN :reviewIds
        """)
    List<Long> findReviewIdsByUserIdAndReviewIds(
        @Param("userId") Long userId,
        @Param("reviewIds") Collection<Long> reviewIds
    );
}
