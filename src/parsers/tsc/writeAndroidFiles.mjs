import fs from 'fs';
import path from 'path';

try {
  const pathToAndroidFiles = path.resolve('../AndroidNativeLib');
  const nativeAndroid = path.resolve('./android/app/src/main/java/com/alentoma/Novelo');
  const appFile = path.join(nativeAndroid, 'MainApplication.kt');

  if (!fs.existsSync(pathToAndroidFiles)) {
    throw new Error(`Source folder not found: ${pathToAndroidFiles}`);
  }
  if (!fs.existsSync(appFile)) {
    throw new Error(`MainApplication.kt not found at: ${appFile}`);
  }

  // Helper: recursively collect all files in pathToAndroidFiles
  const getAllFiles = (dir, baseDir = dir) => {
    let results = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results = results.concat(getAllFiles(fullPath, baseDir));
      } else {
        results.push({
          name: entry.name,
          fullPath,
          relativePath: path.relative(baseDir, fullPath),
        });
      }
    }
    return results;
  };

  const allSourceFiles = getAllFiles(pathToAndroidFiles);

  // 1. Copy/overwrite all files (and subfolders) into nativeAndroid
  for (const file of allSourceFiles) {
    const destPath = path.join(nativeAndroid, file.relativePath);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.copyFileSync(file.fullPath, destPath);
    console.log(`Copied: ${file.relativePath}`);
  }

  // 2. Find ALL *Package.java and *Package.kt files
  const packageFiles = allSourceFiles.filter((f) =>
    /Package\.(java|kt)$/.test(f.name)
  );

  let appFileText = fs.readFileSync(appFile, 'utf8');
  const currentAppPkgMatch = appFileText.match(/^package\s+([^\s;]+)/m);
  const currentAppPkg = currentAppPkgMatch ? currentAppPkgMatch[1] : null;

  const registerPackages = (content, pkgs) => {
    const anchor = 'PackageList(this).packages.apply {';
    const anchorIdx = content.indexOf(anchor);
    if (anchorIdx === -1) {
      console.warn('Could not find "PackageList(this).packages.apply {" in MainApplication.kt');
      return content;
    }

    let updated = content;

    for (const pkgFile of pkgs) {
      const pkgClassName = path.parse(pkgFile.name).name; // e.g., BackgroundPlaybackPackage
      const fileContent = fs.readFileSync(pkgFile.fullPath, 'utf8');

      // Check if the package file declares a different namespace and needs an import
      const filePkgMatch = fileContent.match(/^package\s+([^\s;]+)/m);
      const filePkg = filePkgMatch ? filePkgMatch[1] : null;

      if (filePkg && filePkg !== currentAppPkg) {
        const importStatement = `import ${filePkg}.${pkgClassName}`;
        const importRegex = new RegExp(`^import\\s+${filePkg}\\.${pkgClassName}\\b`, 'm');

        if (!importRegex.test(updated)) {
          // Insert right after the top `package ...` line
          updated = updated.replace(
            /(^package\s+[^\r\n]+)/m,
            `$1\n${importStatement}`
          );
          console.log(`Added import: ${importStatement}`);
        } else {
          console.log(`Import already exists: ${importStatement}`);
        }
      }

      // Check if `add(PackageName())` is already registered (ignoring whitespace)
      const addRegex = new RegExp(`add\\(\\s*${pkgClassName}\\s*\\(\\s*\\)\\s*\\)`);
      if (addRegex.test(updated)) {
        console.log(`Package already registered: ${pkgClassName}`);
        continue;
      }

      // Insert `add(PackageName())` right after `PackageList(this).packages.apply {`
      const insertPos = updated.indexOf(anchor) + anchor.length;
      const lineToInsert = `\n                add(${pkgClassName}())`;
      updated = updated.slice(0, insertPos) + lineToInsert + updated.slice(insertPos);
      console.log(`Registered package: ${pkgClassName}`);
    }

    return updated;
  };

  if (packageFiles.length > 0) {
    const updatedAppText = registerPackages(appFileText, packageFiles);
    if (updatedAppText !== appFileText) {
      fs.writeFileSync(appFile, updatedAppText, 'utf8');
      console.log('MainApplication.kt updated successfully.');
    } else {
      console.log('MainApplication.kt already up to date.');
    }
  } else {
    console.log('No *Package.java or *Package.kt files found to register.');
  }
} catch (e) {
  console.error('Error syncing Android native files:', e);
  process.exit(1);
}
