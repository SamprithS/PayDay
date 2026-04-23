package com.app.payday.service;

import com.google.api.client.http.ByteArrayContent;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.File;
import com.google.api.services.drive.model.FileList;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.AccessToken;
import com.google.auth.oauth2.GoogleCredentials;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.List;

@Slf4j
@Service
public class GoogleDriveService {

    private static final String FOLDER_MIME = "application/vnd.google-apps.folder";
    private static final String FOLDER_NAME = "bills_payday";

    /**
     * Creates the bills_payday folder in the user's Drive if it doesn't exist.
     * Returns the folder ID.
     */
    public String getOrCreateBillsFolder(String accessToken) {
        try {
            Drive drive = buildDrive(accessToken);

            // Check if folder already exists
            FileList result = drive.files().list()
                    .setQ("mimeType='" + FOLDER_MIME + "' and name='" + FOLDER_NAME + "' and trashed=false")
                    .setSpaces("drive")
                    .setFields("files(id, name)")
                    .execute();

            if (!result.getFiles().isEmpty()) {
                String existingId = result.getFiles().get(0).getId();
                log.info("Found existing bills_payday folder: {}", existingId);
                return existingId;
            }

            // Create the folder
            File folderMetadata = new File();
            folderMetadata.setName(FOLDER_NAME);
            folderMetadata.setMimeType(FOLDER_MIME);

            File folder = drive.files().create(folderMetadata)
                    .setFields("id")
                    .execute();

            log.info("Created bills_payday folder: {}", folder.getId());
            return folder.getId();

        } catch (Exception e) {
            log.error("Failed to create Drive folder: {}", e.getMessage());
            throw new RuntimeException("Could not create Google Drive folder: " + e.getMessage());
        }
    }

    /**
     * Uploads a bill file to the bills_payday folder.
     * Returns the Drive file ID.
     */
    public String uploadBill(String accessToken, String folderId,
                             String fileName, MultipartFile file) {
        try {
            Drive drive = buildDrive(accessToken);

            File fileMetadata = new File();
            fileMetadata.setName(fileName);
            fileMetadata.setParents(Collections.singletonList(folderId));

            ByteArrayContent content = new ByteArrayContent(
                    file.getContentType(), file.getBytes());

            File uploaded = drive.files().create(fileMetadata, content)
                    .setFields("id, name, webViewLink")
                    .execute();

            log.info("Uploaded bill to Drive: {}", uploaded.getId());
            return uploaded.getId();

        } catch (Exception e) {
            log.error("Failed to upload bill: {}", e.getMessage());
            throw new RuntimeException("Could not upload bill to Google Drive");
        }
    }

    private Drive buildDrive(String accessToken) {
        GoogleCredentials credentials = GoogleCredentials.create(
                new AccessToken(accessToken, null));
        HttpCredentialsAdapter adapter = new HttpCredentialsAdapter(credentials);
        return new Drive.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance(), adapter)
                .setApplicationName("PayDay")
                .build();
    }
}