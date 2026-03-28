package com.alentoma.Novelo;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

import java.io.BufferedOutputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.zip.CRC32;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.turbomodule.core.interfaces.TurboModule;

@ReactModule(name = EpubZipperModule.NAME)
public class EpubZipperModule extends ReactContextBaseJavaModule implements TurboModule {

    public static final String NAME = "EpubZipper";
    public EpubZipperModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return NAME;
    }

    private static final String BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";


    public static boolean isValidBase64Fast(String s) {
    if (s == null || s.isEmpty()) return false;

    int len = s.length();
    int paddingCount = 0;

    // Determine padding by scanning from end
    for (int i = len - 1; i >= 0; i--) {
        char c = s.charAt(i);
        if (c == '#') continue;
        if (c == '=') paddingCount++;
        else break;
    }

    int validLen = 0;
    for (int i = 0; i < len; i++) {
        char c = s.charAt(i);
        if (c == '#') continue;
        if (validLen >= len - paddingCount) { // padding region
            if (c != '=') return false;
        } else {
            if (BASE64_CHARS.indexOf(c) == -1) return false;
        }
        validLen++;
    }

    return validLen % 4 == 0;
}

    // Synchronous method
    @ReactMethod(isBlockingSynchronousMethod = true)
    public boolean isBase64(String str) {
        return isValidBase64Fast(str);
    }

    @ReactMethod
    public void isBase64Async(String str, Promise promise) {
        promise.resolve(isValidBase64Fast(str));
    }

            // Encode string to Base64 asynchronously
    @ReactMethod(isBlockingSynchronousMethod = true)
    public String encode(String input) {
        if (input == null) {
            return null;
        }

        // Run on background thread
            try {
                byte[] bytes = input.getBytes(StandardCharsets.UTF_8);
                String base64 = Base64.getEncoder().encodeToString(bytes);
                return base64;
            } catch (Exception e) {
                return "not valid ENCODE_ERROR";
            }
    }

    // Decode Base64 string to normal string asynchronously
    @ReactMethod(isBlockingSynchronousMethod = true)
    public String decode(String base64Input) {
        if (base64Input == null) {
            return null;
        }

            try {
                byte[] bytes = Base64.getDecoder().decode(base64Input.replace("#", ""));
                String decoded = new String(bytes, StandardCharsets.UTF_8);
                return decoded;
            } catch (Exception e) {
                return ("DECODE_ERROR");
            }
    }


        // Encode string to Base64 asynchronously
    @ReactMethod
    public void encodeAsync(String input, Promise promise) {
        if (input == null) {
            promise.resolve(null);
            return;
        }

        // Run on background thread
        new Thread(() -> {
            try {
                byte[] bytes = input.getBytes(StandardCharsets.UTF_8);
                String base64 = Base64.getEncoder().encodeToString(bytes);
                promise.resolve(base64);
            } catch (Exception e) {
                promise.reject("ENCODE_ERROR", e);
            }
        }).start();
    }

    // Decode Base64 string to normal string asynchronously
    @ReactMethod
    public void decodeAsync(String base64Input, Promise promise) {
        if (base64Input == null) {
            promise.resolve(null);
            return;
        }

        new Thread(() -> {
            try {
                byte[] bytes = Base64.getDecoder().decode(base64Input.replace("#", ""));
                String decoded = new String(bytes, StandardCharsets.UTF_8);
                promise.resolve(decoded);
            } catch (Exception e) {
                promise.reject("DECODE_ERROR", e);
            }
        }).start();
    }

    @ReactMethod
    public void zipEpubFolder(String sourceDirPath, String epubOutputPath, Promise promise) {
        try {
            File sourceDir = new File(sourceDirPath);
            File epubFile = new File(epubOutputPath);
            FileOutputStream fos = new FileOutputStream(epubFile);
            ZipOutputStream zos = new ZipOutputStream(new BufferedOutputStream(fos));
             // Prepare mimetype bytes
              File mimetypeFile = new File(sourceDir, "mimetype");
             byte[] mimeBytes;

            if (mimetypeFile.exists()) {
               mimeBytes = readAllBytes(mimetypeFile);
             } else {
                // Create a default mimetype file
                mimeBytes = "application/epub+zip".getBytes("UTF-8");
              }

                ZipEntry mimetypeEntry = new ZipEntry("mimetype");
                mimetypeEntry.setMethod(ZipEntry.STORED);
                mimetypeEntry.setSize(mimeBytes.length);
                mimetypeEntry.setCompressedSize(mimeBytes.length);
                mimetypeEntry.setCrc(computeCRC(mimeBytes));
                zos.putNextEntry(mimetypeEntry);
                zos.write(mimeBytes);
                zos.closeEntry();

            // Add all other files
            zipDirectoryRecursive(sourceDir, sourceDir, zos);

            zos.close();
            promise.resolve("Zipped to: " + epubFile.getAbsolutePath());
        } catch (Exception e) {
            promise.reject("ZIP_ERROR", e);
        }
    }

    private void zipDirectoryRecursive(File root, File current, ZipOutputStream zos) throws IOException {
        for (File file : current.listFiles()) {
            String relPath = getRelativePath(root, file);
            if (file.isDirectory()) {
                zipDirectoryRecursive(root, file, zos);
            } else if (!relPath.equals("mimetype")) {
                FileInputStream fis = new FileInputStream(file);
                ZipEntry entry = new ZipEntry(relPath);
                zos.putNextEntry(entry);
                byte[] buffer = new byte[4096];
                int len;
                while ((len = fis.read(buffer)) > 0) {
                    zos.write(buffer, 0, len);
                }
                zos.closeEntry();
                fis.close();
            }
        }
    }

    private byte[] readAllBytes(File file) throws IOException {
        FileInputStream fis = new FileInputStream(file);
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        byte[] buffer = new byte[4096];
        int len;
        while ((len = fis.read(buffer)) > 0) {
            bos.write(buffer, 0, len);
        }
        fis.close();
        return bos.toByteArray();
    }

    private long computeCRC(byte[] data) {
        CRC32 crc = new CRC32();
        crc.update(data);
        return crc.getValue();
    }

    private String getRelativePath(File root, File file) {
        return root.toURI().relativize(file.toURI()).getPath();
    }
}
