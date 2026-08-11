package com.mainservice.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "announcement_read_statuses")
public class AnnouncementReadStatus {

    @Id
    private String id;
    private String userEmail;
    private String announcementId;
    private boolean isRead;

    public AnnouncementReadStatus() {
    }

    public AnnouncementReadStatus(String userEmail, String announcementId, boolean isRead) {
        this.userEmail = userEmail;
        this.announcementId = announcementId;
        this.isRead = isRead;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getAnnouncementId() {
        return announcementId;
    }

    public void setAnnouncementId(String announcementId) {
        this.announcementId = announcementId;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
    }
}
