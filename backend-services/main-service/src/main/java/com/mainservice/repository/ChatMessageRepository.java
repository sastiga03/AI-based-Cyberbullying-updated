package com.mainservice.repository;

import com.mainservice.entity.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {
    List<ChatMessage> findBySenderNameAndRecipientNameOrSenderNameAndRecipientNameOrderByTimeStampAsc(
            String sender1, String recipient1, String sender2, String recipient2);
}
