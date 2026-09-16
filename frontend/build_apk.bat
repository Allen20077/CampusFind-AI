@echo off
title CampusFind AI - APK Builder

echo.
echo ==========================================
echo       CAMPUSFIND AI APK BUILDER
echo ==========================================
echo.

cd /d "%~dp0"

echo [1/4] Checking Android Studio Java...

if exist "%ProgramFiles%\Android\Android Studio\jbr\bin\java.exe" (
    set "JAVA_HOME=%ProgramFiles%\Android\Android Studio\jbr"
    goto JAVA_FOUND
)

if exist "%LOCALAPPDATA%\Programs\Android Studio\jbr\bin\java.exe" (
    set "JAVA_HOME=%LOCALAPPDATA%\Programs\Android Studio\jbr"
    goto JAVA_FOUND
)

if exist "C:\Program Files\Android\Android Studio\jbr\bin\java.exe" (
    set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
    goto JAVA_FOUND
)

echo.
echo ERROR: Android Studio Java was not found.
echo.
echo Please make sure Android Studio is installed.
echo.
pause
exit /b 1

:JAVA_FOUND

echo Java found:
echo %JAVA_HOME%
echo.

"%JAVA_HOME%\bin\java.exe" -version

echo.
echo ==========================================
echo [2/4] Building React application...
echo ==========================================
echo.

call npm run build

if errorlevel 1 (
    echo.
    echo ERROR: React build failed.
    pause
    exit /b 1
)

echo.
echo ==========================================
echo [3/4] Syncing Capacitor Android...
echo ==========================================
echo.

call npx cap sync android

if errorlevel 1 (
    echo.
    echo ERROR: Capacitor sync failed.
    pause
    exit /b 1
)

echo.
echo ==========================================
echo [4/4] Building Android APK...
echo ==========================================
echo.

cd android

call gradlew.bat assembleDebug

if errorlevel 1 (
    echo.
    echo ==========================================
    echo       APK BUILD FAILED
    echo ==========================================
    echo.
    pause
    exit /b 1
)

echo.
echo ==========================================
echo       APK BUILD SUCCESSFUL!
echo ==========================================
echo.

echo APK location:
echo.
echo %CD%\app\build\outputs\apk\debug\app-debug.apk
echo.

if exist "%CD%\app\build\outputs\apk\debug\app-debug.apk" (
    echo Opening APK folder...
    explorer "%CD%\app\build\outputs\apk\debug"
)

echo.
pause