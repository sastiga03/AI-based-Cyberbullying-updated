package com.mainservice.util;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

public class DocumentTextExtractor {

    public static String extractText(InputStream inputStream, String fileName) {
        if (fileName == null) return "";
        String lower = fileName.toLowerCase();

        try {
            // Read entire input stream into byte array so we can safely read it or fall back
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            byte[] buf = new byte[1024];
            int len;
            while ((len = inputStream.read(buf)) != -1) {
                bos.write(buf, 0, len);
            }
            byte[] bytes = bos.toByteArray();

            if (lower.endsWith(".txt") || lower.endsWith(".csv") || lower.endsWith(".json")) {
                return new String(bytes, StandardCharsets.UTF_8);
            } else if (lower.endsWith(".docx")) {
                // Verify ZIP file signature (PK..)
                if (bytes.length >= 4 && bytes[0] == 0x50 && bytes[1] == 0x4B && bytes[2] == 0x03 && bytes[3] == 0x04) {
                    java.io.ByteArrayInputStream bais = new java.io.ByteArrayInputStream(bytes);
                    ZipInputStream zipStream = new ZipInputStream(bais);
                    ZipEntry entry;
                    while ((entry = zipStream.getNextEntry()) != null) {
                        if ("word/document.xml".equals(entry.getName())) {
                            ByteArrayOutputStream result = new ByteArrayOutputStream();
                            byte[] buffer = new byte[1024];
                            int length;
                            while ((length = zipStream.read(buffer)) != -1) {
                                result.write(buffer, 0, length);
                            }
                            String xml = result.toString(StandardCharsets.UTF_8);
                            
                            // Extract text within <w:t>...</w:t> tags
                            StringBuilder sb = new StringBuilder();
                            Pattern p = Pattern.compile("<w:t[^>]*>(.*?)</w:t>");
                            Matcher m = p.matcher(xml);
                            while (m.find()) {
                                sb.append(m.group(1)).append(" ");
                            }
                            return sb.toString().trim();
                        }
                    }
                } else {
                    // Fall back to reading raw text if it is not a valid ZIP/DOCX structure
                    return new String(bytes, StandardCharsets.UTF_8);
                }
            }
        } catch (Exception e) {
            System.err.println("Error extracting text from file " + fileName + ": " + e.getMessage());
        }
        return "";
    }
}
