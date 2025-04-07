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

public class EpubZipperModule extends ReactContextBaseJavaModule {

    public EpubZipperModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "EpubZipper";
    }

    @ReactMethod
    public void zipEpubFolder(String sourceDirPath, String epubOutputPath, Promise promise) {
        try {
            File sourceDir = new File(sourceDirPath);
            File epubFile = new File(epubOutputPath);
            FileOutputStream fos = new FileOutputStream(epubFile);
            ZipOutputStream zos = new ZipOutputStream(new BufferedOutputStream(fos));

            // Write mimetype first and uncompressed
            File mimetypeFile = new File(sourceDir, "mimetype");
            if (mimetypeFile.exists()) {
                byte[] mimeBytes = readAllBytes(mimetypeFile);
                ZipEntry mimetypeEntry = new ZipEntry("mimetype");
                mimetypeEntry.setMethod(ZipEntry.STORED);
                mimetypeEntry.setSize(mimeBytes.length);
                mimetypeEntry.setCompressedSize(mimeBytes.length);
                mimetypeEntry.setCrc(computeCRC(mimeBytes));
                zos.putNextEntry(mimetypeEntry);
                zos.write(mimeBytes);
                zos.closeEntry();
            } else {
                promise.reject("NO_MIMETYPE", "mimetype file not found in source directory.");
                return;
            }

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
